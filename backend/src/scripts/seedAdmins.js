const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "../../.env") }); // adjust if your .env lives elsewhere

const mongoose = require("mongoose");
const { User } = require("../models/User");

const ADMIN_EMAIL = process.argv[2];
const ADMIN_NAME = process.argv[3];

if (!ADMIN_EMAIL || !ADMIN_NAME) {
  console.error('Usage: node src/scripts/seedAdmins.js "email@students.iiests.ac.in" "Full Name"');
  process.exit(1);
}

(async () => {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is undefined — check that your .env file exists and the path in dotenv.config() is correct.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  let user = await User.findOne({ email: ADMIN_EMAIL });

  if (user) {
    user.role = "admin";
    await user.save();
    console.log(`Existing user ${ADMIN_EMAIL} promoted to admin.`);
  } else {
    const base = ADMIN_EMAIL.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").slice(0, 20) || "admin";
    let username = base;
    let suffix = 0;
    while (await User.findOne({ username })) {
      suffix += 1;
      username = `${base}${suffix}`;
    }

    user = await User.create({
      name: ADMIN_NAME,
      username,
      email: ADMIN_EMAIL,
      authProvider: "google",
      role: "admin",
    });
    console.log(`New admin account created: ${ADMIN_EMAIL}`);
  }

  await mongoose.disconnect();
})();