const express = require("express");
const morgan = require("morgan");
const app = express();
const listingRoutes = require("./src/routes/listing.routes");
const cors = require("cors");
const cookieParser = require("cookie-parser");


app.use(cors({
    origin:process.env.CLIENT_URL,
    credentials:true
}));
app.use(cookieParser());
app.use(express.json());

if(process.env.NODE_ENV=="development")
{
    app.use(morgan("dev"));
}


// Routes
app.use("/api/auth",require("./src/routes/auth.routes.js"));




app.get("/api/test",(req,res)=>{
    res.json({message:"Campus MarketPlace API is Running Perfectly"});
});




// Last Unfound Route Handler
app.use((req,res)=>{
    res.status(404).json({message:"Route Not Found"});
});

// Global Error Handler
app.use((err,req,res,next)=>{
    res.status(err.statusCode || 500).json({message:err.message || "Internal Server Error Occured!"});
})

module.exports = app;