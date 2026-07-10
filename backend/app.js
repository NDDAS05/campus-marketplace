const express = require("express");
const morgan = require("morgan");
const app = express();
const listingRoutes = require("./src/routes/listing.routes");
const authRoutes = require("./src/routes/auth.routes");
const cors = require("cors");
const cookieParser = require("cookie-parser");

app.use(cors({
    origin:process.env.CLIENT_URL,
    credentials:true
}));

app.use(cookieParser());
app.use(express.json()); // For json payload
app.use(express.urlencoded({ extended: true })); // For HTML forms

if(process.env.NODE_ENV=="development")
{
    app.use(morgan("dev"));
}

app.use("/api/auth",authRoutes);
app.use("/api/listings", listingRoutes);

app.get("/api/test",(req,res)=>{
    res.json({message:"Campus MarketPlace API is Running Perfectly"});
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});


app.use((err, req, res, next) => {
  console.error("ERROR MESSAGE:", err.message);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});
module.exports = app;