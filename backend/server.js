const dotenv = require("dotenv");
dotenv.config();
const app = require("./app.js");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode and Database Connected!`);
  });
}).catch((err) => {
  console.error("Failed to connect to DB:", err.message);
  process.exit(1);
});