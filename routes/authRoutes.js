const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Login route
router.post('/', authController.login);

module.exports = router;