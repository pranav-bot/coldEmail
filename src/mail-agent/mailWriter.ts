import type { LanguageModelV1 } from "ai";
import { Template } from "./enums";
import { generateText } from "ai";
import type { Lead } from "./leadAnalysis";
import type { JobProfile, FreelanceProfile, FundingProfile } from "./buildProfile";

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

const getFundingEmailPrompt = (lead: Lead, profile: FundingProfile) => `
You are an expert startup founder and investor pitch strategist. Your task is to write a compelling cold email that will get a response from a potential investor (VC, angel, etc).

Lead (Investor) Information:
${JSON.stringify(lead, null, 2)}

Startup Funding Profile:
${JSON.stringify(profile, null, 2)}

Please write a cold email that:
1. Has a subject line that grabs attention and signals a high-potential opportunity
2. Opens with a personalized hook based on the investor's focus or portfolio
3. Clearly states the startup's vision and the problem being solved
4. Highlights traction, market opportunity, and why now is the right time
5. Explains what makes the team and solution unique
6. Specifies the funding ask and what it will be used for
7. Includes proof points (metrics, growth, notable backers, etc)
8. Has a strong, specific call to action (e.g., "15-min intro call")
9. Is concise, confident, and tailored to the investor

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

const getFundingLinkedInPrompt = (lead: Lead, profile: FundingProfile) => `
You are an expert LinkedIn outreach strategist for startup founders. Your task is to write a concise, engaging LinkedIn message sequence to connect with a potential investor.

Lead LinkedIn:
${lead.contactInfo.linkedin ?? ""}

Lead (Investor) Information:
${JSON.stringify(lead, null, 2)}

Startup Funding Profile:
${JSON.stringify(profile, null, 2)}

Please provide:
1. A short connection request introduction (max 300 characters) that references the investor's interests or portfolio
2. A follow-up LinkedIn message (max 500 characters) that:
- References the connection
- States the startup's vision and traction
- Explains why the investor is a great fit
- Includes a clear, non-pushy call to action (e.g., "Would love to share more if you're open!")

Format the response as a JSON object with these fields:
{
    "intro": "Connection request here",
    "message": "Follow-up message here",
    "to": ""
}
`;

export const writeEmail = async (
    lead: Lead,
    profile: JobProfile | FreelanceProfile | FundingProfile,
    template: Template,
    model: LanguageModelV1
): Promise<EmailContent> => {
    let prompt;
    if (template === Template.JobSearch) {
        prompt = getJobSearchEmailPrompt(lead, profile as JobProfile);
    } else if (template === Template.Freelance) {
        prompt = getFreelanceEmailPrompt(lead, profile as FreelanceProfile);
    } else {
        prompt = getFundingEmailPrompt(lead, profile as FundingProfile);
    }

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
    profile: JobProfile | FreelanceProfile | FundingProfile,
    template: Template,
    model: LanguageModelV1
): Promise<LinkedInContent> => {
    let prompt;
    if (template === Template.JobSearch) {
        prompt = getJobSearchLinkedInPrompt(lead, profile as JobProfile);
    } else if (template === Template.Freelance) {
        prompt = getFreelanceLinkedInPrompt(lead, profile as FreelanceProfile);
    } else {
        prompt = getFundingLinkedInPrompt(lead, profile as FundingProfile);
    }

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
