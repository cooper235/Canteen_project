import axios from 'axios';
import Canteen from '../models/Canteen.js';
import Dish from '../models/Dish.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Validate API key is set
if (!GEMINI_API_KEY) {
    console.error('⚠️  GEMINI_API_KEY is not set in environment variables. Chatbot will not work.');
}

// In-memory conversation history (in production, use Redis or database)
const conversationHistory = new Map();

/**
 * Build smart context based on user query
 */
async function buildContext(query, userId) {
    const context = {};
    const queryLower = query.toLowerCase();

    try {
        // Always include basic canteen info
        const canteens = await Canteen.find()
            .select('name location operatingHours cuisineTypes')
            .limit(10)
            .lean();
        context.canteens = canteens;

        // Smart context selection based on query
        if (queryLower.includes('veg') || queryLower.includes('vegetarian')) {
            const dishes = await Dish.find({ isVegetarian: true, availability: true })
                .select('name description category price canteen')
                .populate('canteen', 'name')
                .limit(20)
                .lean();
            context.dishes = dishes;
            context.filterApplied = 'vegetarian';
        }
        else if (queryLower.includes('cheap') || queryLower.includes('budget') || queryLower.includes('affordable')) {
            const dishes = await Dish.find({ availability: true })
                .select('name description category price canteen')
                .populate('canteen', 'name')
                .sort({ price: 1 })
                .limit(15)
                .lean();
            context.dishes = dishes;
            context.filterApplied = 'cheapest';
        }
        else if (queryLower.includes('spicy') || queryLower.includes('spice')) {
            const dishes = await Dish.find({ isSpicy: true, availability: true })
                .select('name description category price canteen')
                .populate('canteen', 'name')
                .limit(20)
                .lean();
            context.dishes = dishes;
            context.filterApplied = 'spicy';
        }
        else if (queryLower.includes('recommend') || queryLower.includes('suggestion') || queryLower.includes('popular')) {
            // Get popular dishes based on order count
            const dishes = await Dish.find({ availability: true })
                .select('name description category price canteen popularity ratings')
                .populate('canteen', 'name')
                .sort({ 'popularity.orderCount': -1 })
                .limit(15)
                .lean();
            context.dishes = dishes;
            context.filterApplied = 'recommended/popular';
        }
        else if (queryLower.includes('breakfast') || queryLower.includes('lunch') || queryLower.includes('dinner') || queryLower.includes('snack')) {
            let category = 'lunch';
            if (queryLower.includes('breakfast')) category = 'breakfast';
            else if (queryLower.includes('dinner')) category = 'dinner';
            else if (queryLower.includes('snack')) category = 'snacks';

            const dishes = await Dish.find({ category, availability: true })
                .select('name description category price canteen')
                .populate('canteen', 'name')
                .limit(20)
                .lean();
            context.dishes = dishes;
            context.filterApplied = category;
        }
        else {
            // Default: send popular available dishes
            const dishes = await Dish.find({ availability: true })
                .select('name description category price canteen ratings')
                .populate('canteen', 'name')
                .sort({ 'ratings.averageRating': -1 })
                .limit(20)
                .lean();
            context.dishes = dishes;
        }

        // Try to get ML recommendations if userId is provided
        if (userId) {
            try {
                const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';
                const mlResponse = await axios.get(`${ML_SERVICE_URL}/recommendations/user/${userId}`, {
                    params: { limit: 5 },
                    timeout: 3000
                });

                if (mlResponse.data && mlResponse.data.recommendations) {
                    context.mlRecommendations = mlResponse.data.recommendations;
                }
            } catch (mlError) {
                console.log('ML recommendations not available:', mlError.message);
                // Continue without ML recommendations
            }
        }

        context.currentTime = new Date().toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Kolkata'
        });

    } catch (error) {
        console.error('Error building context:', error);
        // Return minimal context on error
        context.error = 'Limited information available';
    }

    return context;
}

/**
 * Call Gemini API
 */
async function callGeminiAPI(systemPrompt, userMessage, conversationHistory = []) {
    try {
        // Build conversation context
        const messages = [];

        // Add conversation history
        conversationHistory.forEach(msg => {
            messages.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            });
        });

        // Add current message
        const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}`;

        const response = await axios.post(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{ text: fullPrompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 500,
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );

        if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            return response.data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Invalid response from Gemini API');
        }
    } catch (error) {
        console.error('Gemini API error:', error.response?.data || error.message);
        throw new Error('Failed to get AI response. Please try again.');
    }
}

/**
 * Main chatbot endpoint
 */
export const chatWithGemini = async (req, res) => {
    try {
        const { message, userId, conversationId } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Generate or use conversation ID
        const convId = conversationId || `${userId || 'anonymous'}_${Date.now()}`;

        // Get or initialize conversation history
        let history = conversationHistory.get(convId) || [];

        // Build context based on query
        const context = await buildContext(message, userId);

        // Create system prompt with context
        const systemPrompt = `You are a friendly and helpful AI assistant for a college canteen food ordering system. Your name is CanteenBot.

**Your Role:**
- Help users discover dishes, canteens, and menu options
- Answer questions about food availability, prices, and features
- Provide personalized recommendations
- Be conversational, friendly, and concise

**Current Context:**
${JSON.stringify(context, null, 2)}

**Important Rules:**
1. ONLY mention dishes that are in the context above
2. Always include prices in ₹ (Indian Rupees) when mentioning dishes
3. If a dish is not available (availability: false), don't recommend it
4. Be concise - keep responses under 100 words unless asked for details
5. Use emojis sparingly to be friendly (🍽️, 🌟, 💰, etc.)
6. If asked about something not in your context, politely say you don't have that information
7. When recommending dishes, mention which canteen they're from
8. If ML recommendations are available, prioritize mentioning those

**Response Format:**
- Use bullet points for lists
- Be conversational, not robotic
- End with a helpful question or suggestion when appropriate`;

        // Get AI response
        const aiResponse = await callGeminiAPI(systemPrompt, message, history);

        // Update conversation history (keep last 5 exchanges)
        history.push({ role: 'user', content: message });
        history.push({ role: 'assistant', content: aiResponse });

        if (history.length > 10) {
            history = history.slice(-10); // Keep last 5 exchanges (10 messages)
        }

        conversationHistory.set(convId, history);

        // Clean up old conversations (older than 1 hour)
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        for (const [key, value] of conversationHistory.entries()) {
            if (key.includes('_') && parseInt(key.split('_')[1]) < oneHourAgo) {
                conversationHistory.delete(key);
            }
        }

        res.json({
            success: true,
            reply: aiResponse,
            conversationId: convId,
            contextUsed: {
                canteensCount: context.canteens?.length || 0,
                dishesCount: context.dishes?.length || 0,
                hasMLRecommendations: !!context.mlRecommendations,
                filterApplied: context.filterApplied || 'none'
            }
        });

    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'An error occurred while processing your request',
            reply: "I'm sorry, I'm having trouble right now. Please try again in a moment! 🙏"
        });
    }
};
