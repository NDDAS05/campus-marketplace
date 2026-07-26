const Groq = require("groq-sdk");
const { Listing } = require("../models/Listing");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODERATION_PROMPT = `You are a content moderator for Campus Marketplace, a buy/sell/trade platform exclusively for students of IIEST Shibpur, a college in India.

Review the listing below and flag it if it contains ANY of the following:
- NSFW, sexual, or explicit content
- Violent or graphic content
- Prohibited items: weapons, drugs, alcohol, tobacco, fireworks, or anything illegal for a student to sell on campus
- Scam or phishing patterns (e.g. "send payment first", suspicious external payment links, too-good-to-be-true pricing designed to lure victims)
- Spam or gibberish (repeated characters, nonsensical text, unrelated bulk advertising)
- Hate speech, slurs, or harassment targeting any individual or group

If the listing is a normal, legitimate item for sale (textbooks, electronics, furniture, stationery, clothing, sports gear, hostel essentials, etc.) with a reasonable description, it should NOT be flagged.

Respond with ONLY valid JSON in exactly this shape, no other text:
{"flagged": boolean, "reasons": string[], "confidence": "low" | "medium" | "high"}

If not flagged, "reasons" should be an empty array.`;

async function checkListingContent({ title, description, category }) {
  const listingText = `Category: ${category}\nTitle: ${title}\nDescription: ${description || "(no description provided)"}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: MODERATION_PROMPT },
      { role: "user", content: listingText },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
  });

  const responseText = completion.choices[0]?.message?.content;

  let verdict;
  try {
    verdict = JSON.parse(responseText);
  } catch {
    throw new Error(`Groq returned non-JSON response: ${responseText}`);
  }

  if (typeof verdict.flagged !== "boolean") {
    throw new Error(`Groq response missing valid 'flagged' field: ${responseText}`);
  }

  return verdict;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isQuotaError(err) {
  return (
    err.status === 429 ||
    err.message?.toLowerCase().includes("quota") ||
    err.message?.toLowerCase().includes("rate limit")
  );
}

// Called fire-and-forget after a listing is saved as "Pending".
// Never throws — all paths resolve the listing to a safe status.
// There is NO fail-open path anymore: every failure mode (quota,
// transient error, retry exhaustion) routes to "Under Review".
async function moderateListing(listingId) {
  const listing = await Listing.findById(listingId);
  if (!listing) return; // deleted before moderation ran — nothing to do

  let lastError = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const verdict = await checkListingContent({
        title: listing.title,
        description: listing.description,
        category: listing.category,
      });

      // A low-confidence "not flagged" is treated as untrustworthy —
      // don't auto-approve on a verdict the model itself is unsure about.
      const shouldFlag = verdict.flagged || verdict.confidence === "low";

      listing.status = shouldFlag ? "Under Review" : "Listed";
      listing.moderationReason = shouldFlag
        ? verdict.reasons.length > 0
          ? verdict.reasons.join(", ")
          : "Low confidence — manual review requested"
        : null;
      listing.aiCheckFailed = false;
      await listing.save();

      console.log(`Moderation complete for ${listingId}: ${listing.status}`);
      return;
    } catch (err) {
      lastError = err;

      if (isQuotaError(err)) {
        break; // don't retry a quota error — it'll fail identically
      }
      if (attempt === 1) {
        console.warn(`Moderation attempt 1 failed for ${listingId}, retrying:`, err.message);
        await sleep(1500);
      }
    }
  }

  listing.status = "Under Review";
  listing.moderationReason = isQuotaError(lastError)
    ? "AI quota exceeded — manual review required"
    : "AI moderation failed after retry — manual review required";
  listing.aiCheckFailed = true;
  await listing.save();

  console.error(`Moderation failed for ${listingId} after retry:`, lastError.message);
}

module.exports = { moderateListing, checkListingContent };