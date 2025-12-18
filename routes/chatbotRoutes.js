import express from 'express';
import { chatWithGemini } from '../controllers/chatbotController.js';

const router = express.Router();

// POST /api/chatbot - Main chatbot endpoint
router.post('/', chatWithGemini);

export default router;
