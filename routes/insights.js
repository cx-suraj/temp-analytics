const express = require('express');
const router = express.Router();

const {
	instagramProfile,
} = require('../controllers/insights');

router.post('/profile/ig', instagramProfile);

module.exports = router;
