const express = require('express');
const router = express.Router();
const subscribersController = require('../controllers/subscribersController');

router.get('/', subscribersController.viewAllSubscribers);

module.exports = router;
