const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/api/solve', async (req, res) => {
    const { problem } = req.body;

    // Validate input
    if (!problem) {
        return res.status(400).json({ error: 'Problem is required' });
    }

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: `Solve this math problem: ${problem}` }
            ],
            max_tokens: 100
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            }
        });

        const solution = response.data.choices[0].message.content.trim();
        res.json({ solution });
    } catch (error) {
        console.error('Error from OpenAI API:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'An error occurred while solving the problem' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
