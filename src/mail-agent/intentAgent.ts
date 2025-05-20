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

    const freelancePrompt = `
    You are an expert freelance consultant and pitch writing assistant. Your task is to understand and enhance the user's freelance pitch intent to create more effective client outreach.

    Original User Prompt: "${userPrompt}"

    Please analyze the user's intent and provide an enhanced version that:
    1. Maintains their core freelance service offerings and goals
    2. Adds relevant expertise and unique value proposition
    3. Clarifies their target client profile and industry niche
    4. Structures their thoughts in a clear, professional manner
    5. Emphasizes the benefits and outcomes for potential clients
    6. Includes relevant portfolio highlights or past success metrics

    Focus on understanding their true intent and enhancing it, rather than just extracting information.
    Your response should be a natural, well-structured paragraph that captures their freelance service offering in a compelling way.
    `;

    const fundingPrompt = `
    You are an expert startup advisor and investor pitch assistant. Your task is to understand and enhance the founder's funding intent to create more effective investor outreach.

    Original User Prompt: "${userPrompt}"

    Please analyze the founder's intent and provide an enhanced version that:
    1. Maintains their core vision, funding goals, and startup story
    2. Adds relevant traction, market opportunity, and team strengths
    3. Clarifies the funding ask, use of funds, and investor fit
    4. Structures their thoughts in a clear, compelling, and professional manner
    5. Emphasizes the unique value proposition and why now is the right time
    6. Includes any implicit but important details for investors

    Focus on understanding their true intent and enhancing it, rather than just extracting information.
    Your response should be a natural, well-structured paragraph that captures their funding story in a compelling way.
    `;

    let prompt;
    if (template === Template.JobSearch) {
        prompt = jobSearchPrompt;
    } else if (template === Template.Freelance) {
        prompt = freelancePrompt;
    } else {
        prompt = fundingPrompt;
    }

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
