const express = require('express');
const {register, login, getUserInfo} = require('../controllers/authController');
const authenticateToken = require('../sevices/authenticateToken');

const router = express.Router();


// Public routes
router.post('/register', register);


router.post('/login', login);

// Protected route to get user info
router.get('/userinfo', authenticateToken, getUserInfo);

module.exports = router;
