const mongoose = require("mongoose");


const commentSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    text:{
        type:String,
        required:true,
    },
    isDeleted:{
        type:Boolean,
        default:false,
    },
},{
    timestamps:true,
});




const listingSchema = new mongoose.Schema({
    category:{
        type:String,
        required:true,
        enum:["Item","Service"],
    },
    seller:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    title:{
        type:String,
        required:true,
    },
    description: {
        type:String,
    },
    count:{
        type:Number,
        default:1,
    },
    images:[{
        type:String,
    }],
    location:{
        type:String,
        default:"Shibpur,Howrah",
    },
    status: { 
        type: String, 
        enum: ['Listed', 'Sold'], 
        default: 'Listed' 
    },
    comments: [commentSchema]},{
        timestamps:true
});

const Comments = mongoose.model("Comments",commentSchema);
const Listing = mongoose.model("Listing",listingSchema);
module.exports = {Listing,Comments};
