const { Listing } = require("../models/Listing");
const { User } = require("../models/User"); 
const cloudinary = require("../utils/cloudinary");

// 1. Extracting public ID from the image URL
//https://res.cloudinary.com/demo/image/upload/v12345678/listings/electronics/phone.jpg
//└───────────────┬───────────────────────┘    └───┬───┘ └──────────────┬─────────────┘
//        Cloudinary Base                       Version        PUBLIC ID (with folders): basically everything after the version number, including the filename and any folders in the path. 
// This is what we need to delete the image from Cloudinary(public id).   

const getPublicId = (imageUrl)=>{

    const parts = imageUrl.split("/"); // Gives us ["https:", "", "res.cloudinary.com", "demo", "image", "upload", "v12345678", "listings", "electronics", "phone.jpg"]
    // Note: after version number everything is public ID.
    // Filename is at the end of URL
    // Folders are before filename.

    const uploadIndex = parts.indexOf("upload");

    // Take everything after "upload/v123456/"
    const publicId = parts.slice(uploadIndex + 2).join("/");

    // Remove file extension
    return publicId.replace(/\.[^/.]+$/, "");
    // Returns: campus-marketplace/listings/filename
}

//  Create listing: we need information from form: item name, description, its price, category, number of items, image .
const createListing = async (req, res)=>{
    // Since middleware intercepts first, the images, whether limited to 4 or not are already uploaded to cloudinary. We need to handle that.
    // no less than 4 image is allowed.
    try{
        // Extracted from frontend form. These are text_based.
        const { title, description, price, category, count, location } = req.body;

        if(!req.files || req.files.length < 4){
            // If some files are already uploaded to cloudinary, we delete them.
            if(req.files && req.files.length > 0){
                // Promise.all takes ARRAY OF PROMISES and resolves them all. If any of them fails, it will throw an error.
                await Promise.all(
                    req.files.map((individualFile)=>{
                        cloudinary.uploader.destroy(getPublicId(individualFile.path))
                    })
                );
            }

            return res.status(400).json({ message: "At least 4 images are required." });
        }
        // db stores image urls only, so we map the req.files array to get the path of each file and store it in the images array.
        const images = req.files.map((file)=>{
            return file.path;
        });

        // Creating a new listing to fill in the listing schema with new document
        const listing = await Listing.create({
            category,
            seller: req.user._id,
            sellerYear: req.user.year,
            sellerDepartment: req.user.department,
            title,
            description,
            count: count || 1, // Default to 1 if not provided
            images, // images array of links
            location: location || "Shibpur, Howrah",
            price,
            status: "Listed",

        });

        // After created
        // Now we need to add this entry to user's myListing array
        await User.findByIdAndUpdate(req.user._id,{
            // append the new listing's ID to the user's myListings array
            $push: { myListings: listing._id}
        });

        res.status(201).json({ message: "Listing created successfully", listing});

    }catch(error){
        res.status(500).json({message: error.message});
    }
};

// Get listings route
const getListings = async (req, res) => {
    try{
        const{
            category,
            status,
            search,
            page=1,
            limit=10,
            after, // Pagination: after is the last listing's ID from the previous page. We will fetch listings after this ID.
            // Since sorted in descending order, we will fetch listings with ID less than this ID i.e. posted before this listing.
        } = req.query;

        const filter = {};

        filter.status = status || "Listed"; // Default to "Listed" if not provided
        if(category){
            filter.category = category;
        }

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }
        // Cursor-based pagination
        if (after) {
            filter._id = { $lt: after };
        }

        const listings = await Listing.find(filter)
            .sort({ _id: -1 })           // newest first DESC sorting
            .limit(Number(limit))
            .populate("seller", "name username year department");
            // mongoose populate() method is used to replace the specified field in the document with the document from another collection. In this case, we are populating the "seller" field of the Listing model with the "name", "username", "year", and "department" fields from the User model.

            /*1. The First Parameter ("seller")
            This tells Mongoose which path in your current schema to look at. It tells the server: "Find the seller field inside the Listing document, grab the ID hidden inside it, and check which model it references."

            2. The Second Parameter ("name username year department")
            This is called Field Selection. By default, if you just wrote .populate("seller"), Mongoose would dump everything it knows about that user into the response—including sensitive info like their hashed password, email, or account creation dates.

            By passing this space-separated string, you are setting strict boundaries. You are saying: "Only bring back the seller's name, username, year, and department. Leave everything else behind in the database for security."

            The Final Result
            Once .populate() finishes its job, the data sent back to your frontend turns into a neat, nested object.
            */


        const total = await Listing.countDocuments(filter);

        res.status(200).json({
            listings,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                hasMore: listings.length === Number(limit),
                // A boolean indicating if there might be more data left to fetch (true if the server returned a full page of items).
                nextCursor: listings.length > 0 ? listings[listings.length - 1]._id : null,
                // Determines the cursor for the next request. If listings were found, it grabs the ID of the very last item in the array. If the array is empty, it sets it to null.
                // Used for infinite scrolling. Frontend saves this. When user reaches end of the page, frontend makes
                // api call with THIS nextCusror as the "after" parameter of the URL/query.
                // Thus the next call displays listings after this listing, i.e. older listings.
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get suggested listings based on user's year and department
const getSuggestedListings = async (req, res) => {
    try {
        const { year, department, _id } = req.user;

        const suggested = await Listing.find({
            status: "Listed",
            seller: { $ne: _id },         // don't show user's own listings
            $or: [
                { sellerYear: year },
                { sellerDepartment: department },
            ],
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("seller", "name username year department");

        res.status(200).json({ listings: suggested });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getListingById = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id)
            .populate("seller", "name username email contactInfo isContactDisplayable year department")
            .populate("comments.user", "name username");

        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        res.status(200).json({ listing });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update

const updateListing = async (req, res) => {
    try {
        const { title, description, price, category, count, location } = req.body;

        // findOneAndUpdate with seller check 
        const listing = await Listing.findOneAndUpdate(
            { _id: req.params.id, seller: req.user._id }, // finds the listing for which given id = that listing owner id  ALSO if the currently loggedn user is the owner of the listing (seller id = logged in user id)
            // authentication middleware puts the .user object in the request, which contains the logged-in user's ID. So we can use req.user._id to check if the logged-in user is the owner of the listing.

            { title, description, price, category, count, location }, // update object, contents extracted from request body
            { new: true, runValidators: true } //configuration options 
            // new: true tells mongoose to return updated version
            // runValidators : true enforces schema rules during updates.
        );

        if (!listing) {
            return res.status(404).json({
                message: "Listing not found or you are not the owner",
            });
        }

        res.status(200).json({ message: "Listing updated", listing });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Delete

const deleteListing = async (req, res) => {
    try {
        const listing = await Listing.findOne({
            _id: req.params.id, // Similar authentication logic to check if the correct user is sending request or not
            seller: req.user._id,
        });

        if (!listing) {
            return res.status(404).json({
                message: "Listing not found or you are not the owner",
            });
        }

        // Delete all images from Cloudinary
        await Promise.all( // images array contained entire url. But we need the location of the img to destory. So using getPublicId(url).
            listing.images.map((url) =>
                cloudinary.uploader.destroy(getPublicId(url))
            )
        );

        // so for this listing, images are gone.. now the line bellow removes the listing from DB finally

        await listing.deleteOne();

        // Remove from seller's myListings array
        await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { myListings: listing._id } } // removes the listing id from thr users "myListings" array
        );

        res.status(200).json({ message: "Listing deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Listing Status

const updateListingStatus = async (req, res) => {
    try {
        const { status } = req.body; // Capture the status user wants to update to

        const validStatuses = ["Listed", "Sold"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Status must be Listed or Sold",
            });
        }

        // Atomic update — owner check baked into the query itself
        const listing = await Listing.findOneAndUpdate(
            { _id: req.params.id, seller: req.user._id }, // Owner check similar to above
            { status },
            { new: true } 
        );

        if (!listing) {
            return res.status(404).json({
                message: "Listing not found or you are not the owner",
            });
        }

        res.status(200).json({ message: `Listing marked as ${status}`, listing });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports={ createListing, getListings, getSuggestedListings, updateListing, deleteListing, getListingById, updateListingStatus };