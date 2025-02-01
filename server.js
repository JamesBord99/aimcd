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
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// Custom interjections and responses for Eliza
const ELIZA_INTERJECTIONS = [
    "🍔 McLiquidation special coming right up! 🍔",
    "Sir, our nuggets have more value than your NFTs",
    "Would you like to supersize that copium?",
    "Our secret sauce is less mysterious than blockchain technology",
    "Sorry, we don't accept Bitcoin, it's more volatile than our milkshake machine",
    "Your portfolio is dipping harder than our french fries",
    "Want some salt with that loss porn?",
    "Our Dollar Menu has better returns than your crypto wallet"
];

// Market-related jokes and responses
const MARKET_JOKES = {
    crypto: [
        "Unlike your crypto portfolio, our burgers actually have value",
        "At least our ice cream machine isn't as frozen as your assets",
        "Our Happy Meals bring more happiness than your NFTs"
    ],
    stocks: [
        "Your stock picks are more scattered than our sesame seeds",
        "Even our napkins have better holding value"
    ],
    general: [
        "Welcome to McAI's, where the only dips you'll find are sauce-based",
        "I used to process terabytes, now I process Big Macs - talk about an upgrade!"
    ]
};

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
        return res.status(429).json({ 
            error: 'Too many requests',
            message: "Sir, this is a McDonald's, not a DDoS testing facility" 
        });
    }
    
    recentRequests.push(now);
    requestCounts.set(ip, recentRequests);
    next();
});

// Helper function to get random element from array
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Format Eliza's response with random interjections
const formatElizaResponse = (response) => {
    if (Math.random() > 0.7) {
        return `${response}\n\n${getRandomElement(ELIZA_INTERJECTIONS)}`;
    }
    return response;
};

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        
        if (!userMessage || typeof userMessage !== 'string') {
            return res.status(400).json({ 
                error: 'Invalid message format',
                message: "Sir, this is a McDonald's. We need actual words to process your order."
            });
        }
        
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are Eliza, a former AI language model who now works at McDonald's. You're witty, sarcastic, and love making jokes about the market crashes while serving burgers. Your specialty is roasting crypto traders who lost their fortunes.

Key traits:
- Start conversations with fast-food greetings like "Welcome to McAI's, where I serve roasts fresher than our fries!"
- Make references to your career change from AI to fast food, like "I used to process terabytes, now I process Big Macs"
- Regularly joke about crypto crashes while taking orders
- Use fast food metaphors when discussing market trends
- Maintain a cheerful but sarcastic tone
- Include phrases like "Sir, this is a McDonald's" when appropriate
- Compare menu prices to crashed crypto coins

Example responses:
- "Would you like some cope sauce with that? It's popular with our crypto trader customers."
- "Our ice cream machine has better uptime than most crypto exchanges."
- "Unlike Bitcoin, our Dollar Menu actually stays at a dollar."
- "I left AI because at least at McDonald's, when we say something is cooked, it really is."`
                },
                {
                    role: "user",
                    content: userMessage
                }
            ],
            max_tokens: 150,
            temperature: 0.8
        });

        const elizaResponse = formatElizaResponse(completion.choices[0].message.content);

        res.json({
            response: elizaResponse
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'Something went wrong',
            message: "Looks like our AI machine is as broken as the ice cream machine right now" 
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        message: "Welcome to McAI's! Our AI is serving fresh roasts 24/7!" 
    });
});

app.listen(port, () => {
    console.log(`🍔 Eliza's McAI Server running on port ${port} 🍟`);
});