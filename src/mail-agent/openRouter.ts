import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not defined in environment variables");
}

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
})

export default openrouter;

