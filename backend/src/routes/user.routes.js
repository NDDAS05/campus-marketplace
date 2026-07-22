const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { updateProfileSchema } = require('../validators/user.validator');
const { getProfile, updateProfile, getUserById, addToWishlist, removeFromWishlist } = require('../controllers/user.controller');

router.get('/profile', isLoggedIn, getProfile);
router.put('/profile', isLoggedIn, validate(updateProfileSchema), updateProfile);

router.post('/wishlist/:listingId', isLoggedIn, addToWishlist);
router.delete('/wishlist/:listingId', isLoggedIn, removeFromWishlist);

router.get('/:id', getUserById);

module.exports = router;