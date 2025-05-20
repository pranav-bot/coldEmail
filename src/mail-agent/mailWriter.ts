import type { LanguageModelV1 } from "ai";
import { Template } from "./enums";
import { generateText } from "ai";
import type { Lead } from "./leadAnalysis";
import type { JobProfile, FreelanceProfile } from "./buildProfile";

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

const getFreelanceEmailPrompt = (lead: Lead, profile: FreelanceProfile) => `
You are an expert freelancer pitch email strategist. Your task is to write a compelling cold email that will get a response from the potential client.

Lead Information:
${JSON.stringify(lead, null, 2)}

Freelancer Profile:
${JSON.stringify(profile, null, 2)}

Please write a cold email that:
1. Has a compelling subject line that creates interest or addresses a specific need
2. Opens with a personalized hook based on their industry/role/challenges
3. Demonstrates understanding of their business needs or opportunities
4. Highlights how your services can solve their problems or achieve their goals
5. Includes relevant portfolio examples or success stories with similar clients
6. Provides a clear value proposition focusing on results, not just services
7. Includes a non-pushy call to action for a quick consultation or discussion
8. Maintains a professional, confident yet approachable tone
9. Is concise and easy to read with a focus on their benefits, not just your capabilities

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

const getFreelanceLinkedInPrompt = (lead: Lead, profile: FreelanceProfile) => `
You are an expert LinkedIn outreach strategist for freelancers. Your task is to write a concise, engaging LinkedIn message sequence to connect with a potential client.

Lead LinkedIn:
${lead.contactInfo.linkedin ?? ""}

Lead Information:
${JSON.stringify(lead, null, 2)}

Freelancer Profile:
${JSON.stringify(profile, null, 2)}

Please provide:
1. A short connection request introduction (no more than 300 characters).
2. A follow-up LinkedIn message (no more than 500 characters) that:
- References the connection
- Demonstrates understanding of their specific needs or goals
- Highlights a relevant skill or successful project outcome
- Includes a clear but soft call to action (like a quick 15-minute chat)

Format the response as a JSON object with these fields:
{
    "intro": "Connection request here",
    "message": "Follow-up message here",
    "to": ""
}
`;

export const writeEmail = async (
    lead: Lead,
    profile: JobProfile | FreelanceProfile,
    template: Template,
    model: LanguageModelV1
): Promise<EmailContent> => {
    const prompt = template === Template.JobSearch 
        ? getJobSearchEmailPrompt(lead, profile as JobProfile)
        : getFreelanceEmailPrompt(lead, profile as FreelanceProfile);

    try {
        const result = await generateText({ model, prompt });
        // Clean up the response by removing backticks and extra whitespace
        const cleanResult = result.text.replace(/```json\n|```/g, '').trim();
        let content: EmailContent;
        
        try {
            content = JSON.parse(cleanResult) as EmailContent;
        } catch (error) {
            console.error('Failed to parse email content:', cleanResult);
            throw new Error('Invalid email content generated');
        }

        // Ensure required fields are present
        if (!content.subject || !content.body) {
            throw new Error('Missing required fields in email content');
        }

        // Populate 'to' field with email if available
        content.to = lead.contactInfo.email || 'mail not available';
        
        return content;
    } catch (error) {
        console.error('Error writing email:', error);
        throw new Error(`Failed to write email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const writeLinkedInMessage = async (
    lead: Lead,
    profile: JobProfile | FreelanceProfile,
    template: Template,
    model: LanguageModelV1
): Promise<LinkedInContent> => {
    const prompt = template === Template.JobSearch
        ? getJobSearchLinkedInPrompt(lead, profile as JobProfile)
        : getFreelanceLinkedInPrompt(lead, profile as FreelanceProfile);

    try {
        const result = await generateText({ model, prompt });
        // Clean up the response by removing backticks and extra whitespace
        const cleanResult = result.text.replace(/```json\n|```/g, '').trim();
        let content: LinkedInContent;
        
        try {
            content = JSON.parse(cleanResult) as LinkedInContent;
        } catch (error) {
            console.error('Failed to parse LinkedIn content:', cleanResult);
            throw new Error('Invalid LinkedIn content generated');
        }

        // Ensure required fields are present
        if (!content.intro || !content.message) {
            throw new Error('Missing required fields in LinkedIn content');
        }

        // Populate 'to' field with LinkedIn URL if available
        content.to = lead.contactInfo.linkedin ?? '';
        
        return content;
    } catch (error) {
        console.error('Error writing LinkedIn message:', error);
        throw new Error(`Failed to write LinkedIn message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
