const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    username: {
        type:String,
        required: true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password: {
        type: String,
        required: function () {
            return this.authProvider === "local"; // only required for email/password users
        },
    },
    authProvider: {
        type: String,
        enum: ["local", "google"],
        default: "local",
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true, 
    },
    // role:{
    //     type:String,
    //     enum:["user","admin"],
    //     default:"user",
    // },
    college:{
        type:String,
        default:"IIEST Shibpur",
        required:true,
    },
    stream:{
        type:String,
        enum:["B.Tech","B.Arch","M.Tech","PHD"],
    },
    department:{
        type:String,
    },
    year:{
        type:String,
        enum:["1st Year","2nd Year","3rd Year","4th Year","5th Year","Graduated"],
    },
    contactInfo:{
        type:String,
    },
    isContactDisplayable:{
        type:Boolean,
        default: false,
    },
    myListings: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Listing",
        }
    ],
    wishlist:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Listing",
        }
    ]},{
    timestamps: true
});

const User = mongoose.model("User",userSchema);
module.exports = {User};
