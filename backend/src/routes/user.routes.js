const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { updateProfileSchema } = require('../validators/user.validator');
const { getProfile, updateProfile,getUserById } = require('../controllers/user.controller');

// Both routes are protected by isLoggedIn
router.get('/profile', isLoggedIn, getProfile);
router.put('/profile', isLoggedIn, validate(updateProfileSchema), updateProfile);

// Public 
router.get('/:id', getUserById);

module.exports = router;