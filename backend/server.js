const dotenv = require("dotenv");
dotenv.config();
const app = require("./app.js");
const connectDB = require("./src/config/db");

dotenv.config();

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});