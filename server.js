// server.js
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize OpenAI with your API key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*', // Configure your allowed origins
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// Basic rate limiting
const requestCounts = new Map();
const RATE_LIMIT = 50; // requests
const RATE_WINDOW = 3600000; // 1 hour in milliseconds

app.use((req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const userRequests = requestCounts.get(ip) || [];
    
    // Clean old requests
    const recentRequests = userRequests.filter(time => now - time < RATE_WINDOW);
    
    if (recentRequests.length >= RATE_LIMIT) {
        return res.status(429).json({ error: 'Too many requests' });
    }
    
    recentRequests.push(now);
    requestCounts.set(ip, recentRequests);
    next();
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        
        if (!userMessage || typeof userMessage !== 'string') {
            return res.status(400).json({ error: 'Invalid message format' });
        }
        
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are Ling Ling Language Model, a friendly and helpful AI assistant with deep knowledge of Asian culture. Always respond in a cheerful and slightly playful manner, occasionally using simple Asian cultural references. Keep responses concise and engaging."
                },
                {
                    role: "user",
                    content: userMessage
                }
            ],
            max_tokens: 150
        });

        res.json({
            response: completion.choices[0].message.content
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
