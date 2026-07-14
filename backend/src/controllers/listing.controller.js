const { Listing } = require("../models/Listing");
const { User } = require("../models/User"); 
const cloudinary = require("../utils/cloudinary");
const { upload, uploadToCloudinary } = require("../middleware/upload.middleware");
const wrapAsync = require("../utils/wrapAsync");
const mongoose = require("mongoose");


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
const createListing = wrapAsync(async (req, res)=>{
    // Since middleware intercepts first, the images, whether limited to 4 or not are already uploaded to cloudinary. We need to handle that.
    // no less than 4 image is allowed.
        // Extracted from frontend form. These are text_based.
        const { title, description, price, category, count, location } = req.body;

        // Upload all images to Cloudinary from memory
        const uploadedImages = await Promise.all(
            req.files.map((file) => uploadToCloudinary(file.buffer, file.mimetype))
        );

        // db stores image urls only, so we map the req.files array to get the path of each file and store it in the images array.f
        const images = uploadedImages.map((result) => result.secure_url);

        // Creating a new listing to fill in the listing schema with new document
        const listing = await Listing.create({
            category,
            seller: req.user._id,
            sellerYear: req.user.year,
            sellerName: req.user.username,
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
});

// Get listings route
const getListings = wrapAsync(async (req, res) => {
    const { category, status, search, page = 1, limit = 10, after } = req.query;
    
    const pipeline = [];

    // 1. Atlas Search MUST be the very first stage in the pipeline
    if (search) {
        pipeline.unshift({
            $search: {
                index: "default", 
                compound: {
                    should: [
                        { text: { query: search, path: "category", score: { boost: { value: 5 } } } },
                        { text: { query: search, path: "title", score: { boost: { value: 3 } } } },
                        { text: { query: search, path: "sellerDepartment", score: { boost: { value: 2 } } } },
                        { text: { query: search, path: "description", score: { boost: { value: 1 } } } },
                        { text: { query: search, path: "sellerName", score: { boost: { value: 1 } } } }
                    ]
                }
            }
        });
    }

    // 2. Standard Filters
    const matchStage = { status: status || "Listed" };
    if (category) matchStage.category = category;
    if (after) matchStage._id = { $lt: new mongoose.Types.ObjectId(after) };

    pipeline.push({ $match: matchStage });

    // 3. Sorting & Pagination
    // If searching, Atlas Search already sorts by relevance score automatically! 
    // We only sort by _id (newest) if we are NOT doing a text search.
    if (!search) {
        pipeline.push({ $sort: { _id: -1 } });
    }
    pipeline.push({ $limit: Number(limit) });

    // 4. Populate Seller Info (Using Aggregation $lookup)
    pipeline.push({
        $lookup: {
            from: "users", // MongoDB collections are lowercase and plural
            localField: "seller",
            foreignField: "_id",
            as: "seller"
        }
    });
    pipeline.push({ $unwind: "$seller" });
    
    // Hide sensitive seller info in the search feed
    pipeline.push({
        $project: {
            "seller.password": 0,
            "seller.wishlist": 0,
            "seller.myListings": 0,
            "seller.email": 0,
            "seller.contactInfo": 0
        }
    });

    const listings = await Listing.aggregate(pipeline);

    // Get total count (for pagination)
    let total = 0;
    if (search) {
        // If searching, we count the aggregation results
        const totalPipeline = [...pipeline];
        totalPipeline.splice(-4); // Remove limit, lookup, unwind, project to just get count
        totalPipeline.push({ $count: "total" });
        const totalResult = await Listing.aggregate(totalPipeline);
        total = totalResult.length > 0 ? totalResult[0].total : 0;
    } else {
        // If not searching, standard count is much faster
        total = await Listing.countDocuments(matchStage);
    }

    res.status(200).json({
        listings,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            hasMore: listings.length === Number(limit),
            nextCursor: listings.length > 0 ? listings[listings.length - 1]._id : null,
        },
    });
});

const getSuggestedListings = wrapAsync(async (req, res) => {
    const { year, department, _id } = req.user;

    const suggested = await Listing.find({
        status: "Listed",
        seller: { $ne: _id },
        $or: [{ sellerYear: year }, { sellerDepartment: department }],
    })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("seller", "name username year department");

    res.status(200).json({ listings: suggested });
});

const getListingById = wrapAsync(async (req, res) => {
        const listing = await Listing.findById(req.params.id)
            .populate("seller", "name username email contactInfo isContactDisplayable year department")
            .populate("comments.user", "name username");

        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        res.status(200).json({ listing });
});

// Update

const updateListing = wrapAsync(async (req, res) => {
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
});


// Delete

const deleteListing = wrapAsync(async (req, res) => {
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
});

// Update Listing Status

const updateListingStatus = wrapAsync(async (req, res) => {
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
});

module.exports={ createListing, getListings, getSuggestedListings, updateListing, deleteListing, getListingById, updateListingStatus };