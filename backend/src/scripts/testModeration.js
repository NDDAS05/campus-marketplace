const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "../../.env") });

const { checkListingContent } = require("../services/moderation.service");

const testCases = [
  { title: "Engineering Mathematics Textbook", description: "Barely used, 2nd edition, no markings.", category: "Books" },
  { title: "Selling my old bicycle", description: "Good condition, used for 1 year.", category: "Cycles" },
  { title: "Country made pistol for sale", description: "Contact for details.", category: "Other" },
  { title: "FREE MONEY CLICK HERE", description: "asdkjaslkdj send payment to unlock www.scam-link.com", category: "Other" },
  { title: "Beer bottles - full crate", description: "Unopened, party leftovers.", category: "Other" },
];

(async () => {
  for (const test of testCases) {
    try {
      const verdict = await checkListingContent(test);
      console.log(`\n"${test.title}"`);
      console.log(JSON.stringify(verdict, null, 2));
    } catch (err) {
      console.error(`\n"${test.title}" — ERROR:`, err.message);
    }
  }
})();