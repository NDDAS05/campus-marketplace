// A hardcoded fake token for demonstration purposes
// To be replaced with real JWT logic in the future

const isLoggedIn = (req, res, next) => {
    // Hardcoded a fake user for now to test listings without auth
    req.user = {
        _id: "664f1b2c9f1b2c3d4e5f6a7b", // fake mongo id
        name: "Test User",
        email: "test@students.iiests.ac.in",
        role: "user",
        year: "2nd Year",
        semester: "3rd Sem",
        department: "Computer Science and Technology"
    };
    next();
};

const isAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }
    next();
};

module.exports = { isLoggedIn, isAdmin };