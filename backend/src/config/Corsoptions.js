// Extracted from app.js so the exact same origin-checking logic can be reused
// for the Socket.io CORS config in server.js. Socket.io does its own CORS
// handshake separately from Express's `cors` middleware, so both need to
// agree or the socket connection (and the httpOnly auth cookie riding on it)
// will silently fail to establish.

const allowedOrigins = [
  "http://localhost:5173", // For local development
  process.env.CLIENT_URL, // Primary Vercel domain
  "https://campus-hive-gamma.vercel.app",
  "https://campus-hive-git-final-nddassuvro2005-4772s-projects.vercel.app", // Branch domain
  "https://campus-hive-ji0cd01ff-nddassuvro2005-4772s-projects.vercel.app", // Current hash domain
];

// Signature matches what the `cors` package expects: (origin, callback)
function corsOriginCheck(origin, callback) {
  // Allow requests with no origin (mobile apps, curl, server-to-server)
  if (!origin) return callback(null, true);

  if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith(".vercel.app")) {
    callback(null, true);
  } else {
    callback(new Error("Not allowed by CORS"));
  }
}

module.exports = { allowedOrigins, corsOriginCheck };   