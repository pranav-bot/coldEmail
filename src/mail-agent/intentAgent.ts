import { generateText, type LanguageModelV1 } from "ai";
import { Template } from "./enums";

const intentAgent = async (userPrompt: string, template: Template, model: LanguageModelV1) => {
    const jobSearchPrompt = `
    You are an expert career coach and email writing assistant. Your task is to understand and enhance the user's job search intent to create more effective communication.

    Original User Prompt: "${userPrompt}"

    Please analyze the user's intent and provide an enhanced version that:
    1. Maintains their core goals and preferences
    2. Adds relevant professional context and motivation
    3. Clarifies any ambiguous requirements
    4. Structures their thoughts in a clear, professional manner
    5. Emphasizes their unique value proposition
    6. Includes any implicit but important details

    Focus on understanding their true intent and enhancing it, rather than just extracting information.
    Your response should be a natural, well-structured paragraph that captures their intent in a more compelling way.
    `;

    const salesPrompt = `
    You are an expert sales strategist and email writing assistant. Your task is to understand and enhance the user's sales intent to create more effective communication.

    Original User Prompt: "${userPrompt}"

    Please analyze the user's intent and provide an enhanced version that:
    1. Maintains their core sales objectives
    2. Adds relevant business context and value proposition
    3. Clarifies any ambiguous requirements
    4. Structures their thoughts in a clear, professional manner
    5. Emphasizes the benefits for the prospect
    6. Includes any implicit but important details

    Focus on understanding their true intent and enhancing it, rather than just extracting information.
    Your response should be a natural, well-structured paragraph that captures their intent in a more compelling way.
    `;

    const prompt = template === Template.JobSearch ? jobSearchPrompt : salesPrompt;

    try {
        const result = await generateText({
            model: model,
            prompt: prompt,
        });
        return result.text;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to analyze intent");
    }
}

export default intentAgent;
