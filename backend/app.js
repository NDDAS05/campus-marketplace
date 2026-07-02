const express = require("express");

const app = express();

app.use(express.json());

app.get("/api",(req,res)=>{
    res.json({message:"Campus MarketPlace API is Running Perfectly"});
});

module.exports = app;