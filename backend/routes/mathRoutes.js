const express = require('express');
const { solveMathProblem } = require('../controllers/mathController');
const authenticateToken = require('../sevices/authenticateToken');

const router = express.Router();

// Route for solving math problems
router.post('/solve', authenticateToken, solveMathProblem);

module.exports = router;
