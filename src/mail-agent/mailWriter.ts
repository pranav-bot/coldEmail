import type { LanguageModelV1 } from "ai";
import { Template } from "./enums";
import { generateText } from "ai";
import type { Lead } from "./leadAnalysis";
import type { JobProfile, SalesProfile } from "./buildProfile";

type EmailContent = {
    subject: string;
    body: string;
    to: string;
};

type LinkedInContent = {
    intro: string;
    message: string;
    to: string;
};

// Email prompts
const getJobSearchEmailPrompt = (lead: Lead, profile: JobProfile) => `
You are an expert job search email strategist. Your task is to write a compelling cold email that will get a response from the hiring manager or recruiter.

Lead Information:
${JSON.stringify(lead, null, 2)}

Candidate Profile:
${JSON.stringify(profile, null, 2)}

Please write a cold email that:
1. Has a compelling subject line that stands out and creates curiosity
2. Opens with a personalized hook based on the company/role
3. Demonstrates understanding of the company's needs and challenges
4. Highlights relevant experience and achievements that match their requirements
5. Shows how the candidate's skills solve their pain points
6. Includes a clear call to action
7. Maintains a professional yet engaging tone
8. Is concise and easy to read

Format the response as a JSON object with these fields:
{
    "subject": "Compelling subject line here",
    "body": "Well-crafted email body here",
    "to": ""
}
`;

const getSalesEmailPrompt = (lead: Lead, profile: SalesProfile) => `
You are an expert sales email strategist. Your task is to write a compelling cold email that will get a response from the potential customer.

Lead Information:
${JSON.stringify(lead, null, 2)}

Product/Service Profile:
${JSON.stringify(profile, null, 2)}

Please write a cold email that:
1. Has a compelling subject line that creates urgency or curiosity
2. Opens with a personalized hook based on their industry/role
3. Demonstrates understanding of their business challenges
4. Highlights how your solution addresses their specific pain points
5. Includes relevant social proof or success stories
6. Provides a clear value proposition
7. Includes a strong call to action
8. Maintains a professional yet engaging tone
9. Is concise and easy to read

Format the response as a JSON object with these fields:
{
    "subject": "Compelling subject line here",
    "body": "Well-crafted email body here",
    "to": ""
}
`;

// LinkedIn prompts
const getJobSearchLinkedInPrompt = (lead: Lead, profile: JobProfile) => `
You are an expert LinkedIn outreach strategist for job seekers. Your task is to write a concise, engaging LinkedIn message sequence to connect with the hiring manager or recruiter.

Lead LinkedIn:
${lead.contactInfo.linkedin ?? ""}

Lead Information:
${JSON.stringify(lead, null, 2)}

Candidate Profile:
${JSON.stringify(profile, null, 2)}

Please provide:
1. A short connection request introduction (no more than 300 characters).
2. A follow-up LinkedIn message (no more than 500 characters) that:
   - References the connection
   - Shows understanding of their needs
   - Highlights a key achievement
   - Includes a clear call to action

Format the response as a JSON object with these fields:
{
    "intro": "Connection request here",
    "message": "Follow-up message here",
    "to": ""
}
`;

const getSalesLinkedInPrompt = (lead: Lead, profile: SalesProfile) => `
You are an expert LinkedIn outreach strategist for sales. Your task is to write a concise, engaging LinkedIn message sequence to connect with a potential customer.

Lead LinkedIn:
${lead.contactInfo.linkedin ?? ""}

Lead Information:
${JSON.stringify(lead, null, 2)}

Product/Service Profile:
${JSON.stringify(profile, null, 2)}

Please provide:
1. A short connection request introduction (no more than 300 characters).
2. A follow-up LinkedIn message (no more than 500 characters) that:
   - References the connection
   - Demonstrates understanding of their business challenges
   - Highlights a key benefit or success story
   - Includes a clear call to action

Format the response as a JSON object with these fields:
{
    "intro": "Connection request here",
    "message": "Follow-up message here",
    "to": ""
}
`;

// Function to write email
export const writeEmail = async (
    lead: Lead,
    profile: JobProfile | SalesProfile,
    template: Template,
    model: LanguageModelV1
): Promise<EmailContent> => {
    const prompt = template === Template.JobSearch 
        ? getJobSearchEmailPrompt(lead, profile as JobProfile)
        : getSalesEmailPrompt(lead, profile as SalesProfile);

    try {
        const result = await generateText({ model, prompt });
        const content = JSON.parse(result.text) as EmailContent;

        if (!content.subject || !content.body) {
            throw new Error('Invalid email content generated');
        }

        // Populate 'to' with email if available
        content.to = lead.contactInfo.email || '';
        return content;
    } catch (error) {
        console.error('Error writing email:', error);
        throw new Error(`Failed to write email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

// Function to write LinkedIn message
export const writeLinkedInMessage = async (
    lead: Lead,
    profile: JobProfile | SalesProfile,
    template: Template,
    model: LanguageModelV1
): Promise<LinkedInContent> => {
    const prompt = template === Template.JobSearch
        ? getJobSearchLinkedInPrompt(lead, profile as JobProfile)
        : getSalesLinkedInPrompt(lead, profile as SalesProfile);

    try {
        const result = await generateText({ model, prompt });
        const content = JSON.parse(result.text) as LinkedInContent;

        if (!content.intro || !content.message) {
            throw new Error('Invalid LinkedIn content generated');
        }

        // Populate 'to' with LinkedIn URL if available
        content.to = lead.contactInfo.linkedin ?? '';
        return content;
    } catch (error) {
        console.error('Error writing LinkedIn message:', error);
        throw new Error(`Failed to write LinkedIn message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
