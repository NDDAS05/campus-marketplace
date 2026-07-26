const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const app = express();

// Required on Render (and most PaaS hosts): they sit behind a reverse proxy,
// so without this, Express doesn't know the original request was HTTPS and
// `secure: true` cookies silently fail to be set.
app.set("trust proxy", 1);

const listingRoutes = require("./src/routes/listing.routes");
const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.routes");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const adminRoutes = require("./src/routes/admin.routes");

app.use(helmet());

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

// Auth endpoints are unauthenticated by definition (login/register/Google
// login), so they're the obvious target for credential-stuffing / brute
// force. Cap each IP at 20 attempts per 15 min across both auth surfaces.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again later." },
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/users", userRoutes);
// Rate-limit only the admin auth sub-path (login/google), then mount the
// full admin router exactly once — mounting the router itself twice would
// double-register every admin route and break path matching.
app.use("/api/admin/auth", authLimiter);
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