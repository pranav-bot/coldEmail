import { createGoogleGenerativeAI } from '@ai-sdk/google'
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not defined in environment variables");
}

const gemini = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
})

export default gemini;