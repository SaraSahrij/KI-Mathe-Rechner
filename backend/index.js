const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://localhost:4200',  // Allow only this origin
    credentials: true
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB...', err));

// User Schema and Model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// User Interaction Schema and Model
const userInteractionSchema = new mongoose.Schema({
    userId: String,
    interactions: [{
        problem: String,
        solution: String,
        date: { type: Date, default: Date.now }
    }]
});

const UserInteraction = mongoose.model('UserInteraction', userInteractionSchema);

// Middleware to Protect Routes
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

// Register Route
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'User already exists' });

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ error: 'Registration failed' });
    }
});

// Login Route
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        // Create and assign a token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, userId: user._id });
    } catch (error) {
        console.error('Login failed:', error.message);  // Add detailed error logging
        res.status(500).json({ error: 'An internal server error occurred' });
    }
});


// API Endpoint to Solve Math Problems
app.post('/api/solve', authenticateToken, async (req, res) => {
    const { problem, context } = req.body;
    const userId = req.user.id;

    if (!problem) {
        return res.status(400).json({ error: 'Problem is required' });
    }

    const messages = [
        {
            role: 'system', content: 'You are a math assistant. Provide clear, well-structured, ' +
                'and neatly formatted step-by-step solutions to math problems. ' +
                'Ensure each step is on a new line and easy to read.'
        },
        ...(context || []),
        { role: 'user', content: `Please solve this math problem step by step: ${problem}` }
    ];

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages,
            max_tokens: 500
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            }
        });

        let solution = response.data.choices[0].message.content.trim();

        // Replace common LaTeX syntax with Unicode equivalents
        solution = solution
            .replace(/\\pm/g, '±')
            .replace(/\\sqrt/g, '√')
            .replace(/\\times/g, '×')
            .replace(/\\div/g, '÷')
            .replace(/\\frac\{([^}]+)}\{([^}]+)}/g, '$1/$2')
            .replace(/\\left\(/g, '(')
            .replace(/\\right\)/g, ')')
            .replace(/\\/g, '')
            .replace(/[{}]/g, '');

        // Save the interaction in the database
        const userInteraction = await UserInteraction.findOne({ userId });
        if (userInteraction) {
            userInteraction.interactions.push({ problem, solution });
            await userInteraction.save();
        } else {
            await new UserInteraction({ userId, interactions: [{ problem, solution }] }).save();
        }

        res.json({
            solution: solution,
            context: [...messages, { role: 'assistant', content: solution }]
        });

    } catch (error) {
        console.error('Error from OpenAI API:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'An error occurred while solving the problem' });
    }
});

// API Endpoint for Personalized Recommendations
app.post('/api/recommend', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const userInteraction = await UserInteraction.findOne({ userId });
        if (!userInteraction) {
            return res.status(404).json({ error: 'User not found' });
        }

        const progress = analyzeUserProgress(userInteraction.interactions);

        res.json({
            message: 'Here are some tips based on your recent activity:',
            strengths: progress.strengths,
            weaknesses: progress.weaknesses,
            recentProblems: progress.recentProblems
        });

    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'An error occurred while generating recommendations' });
    }
});

function analyzeUserProgress(userInteractions) {
    const progress = {
        strengths: [],
        weaknesses: [],
        recentProblems: userInteractions.slice(-5) // Example: last 5 problems
    };

    userInteractions.forEach(interaction => {
        // Analyze the interaction for common errors or successes
        if (interaction.problem.includes('specific pattern')) {
            progress.weaknesses.push(interaction.problem);
        } else {
            progress.strengths.push(interaction.problem);
        }
    });

    return progress;
}

// Start the Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
