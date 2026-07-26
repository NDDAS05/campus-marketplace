const express = require("express");
const morgan = require("morgan");
const app = express();
const listingRoutes = require("./src/routes/listing.routes");
const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.routes");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const adminRoutes = require("./src/routes/admin.routes");
// Define an array of allowed origins
   const allowedOrigins = [
     'http://localhost:5173', // For local development
     process.env.CLIENT_URL,  // Your primary Vercel domain
     'https://campus-hive-git-final-nddassuvro2005-4772s-projects.vercel.app', // Branch domain
     'https://campus-hive-ji0cd01ff-nddassuvro2005-4772s-projects.vercel.app'  // Current hash domain
   ];

app.use(cors({
     origin: function (origin, callback) {
       // Allow requests with no origin (like mobile apps or curl requests)
       if (!origin) return callback(null, true);
       
       if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
         // The origin.endsWith check allows ANY Vercel preview branch to work!
         callback(null, true);
       } else {
         callback(new Error('Not allowed by CORS'));
       }
     },
  credentials: true
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
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

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