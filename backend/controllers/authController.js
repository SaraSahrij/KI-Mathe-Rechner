const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Registration
exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ error: 'Registration failed' });
    }
};

// Login
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, userId: user._id });
    } catch (error) {
        console.error('Login failed:', error.message);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};

// Get user info
exports.getUserInfo = async (req, res) => {
    try {
        const userId = req.user.id;  // Extract the user ID from the JWT token
        const user = await User.findById(userId).select('username email');  // Query the database

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Return the user information
        res.json({ username: user.username, email: user.email });
    } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
