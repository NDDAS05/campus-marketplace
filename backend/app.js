const express = require("express");

const app = express();
const listingRoutes = require("./src/routes/listing.routes");
app.use(express.json());

app.use("/api/listings", listingRoutes);

app.get("/api",(req,res)=>{
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