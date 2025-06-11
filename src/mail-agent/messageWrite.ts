import {generateObject} from 'ai'
import gemini from './gemini';
import { z } from 'zod';
import { Template } from './enums';
import buildProfile, { type JobProfile, type FreelanceProfile, type FundingProfile } from './buildProfile';
import intentAgent from './intentAgent';

type LinkedInLead = {
    name: string;
    headline: string;
    location: string;
    about: string;
    experience: Array<{
        title: string;
        company: string;
        duration: string;
        description: string;
    }>;
    education: Array<{
        school: string;
        degree: string;
        field: string;
        duration: string;
    }>;
    profileUrl: string;
    imageUrl: string;
};

// Type guard functions
const isJobProfile = (profile: JobProfile | FreelanceProfile | FundingProfile): profile is JobProfile => {
    return 'experience' in profile && 'education' in profile && 'skills' in profile;
};

const isFreelanceProfile = (profile: JobProfile | FreelanceProfile | FundingProfile): profile is FreelanceProfile => {
    return 'servicesOffered' in profile && 'expertise' in profile && 'portfolioHighlights' in profile;
};

const isFundingProfile = (profile: JobProfile | FreelanceProfile | FundingProfile): profile is FundingProfile => {
    return 'startupInfo' in profile && 'vision' in profile && 'problem' in profile;
};

const messageWriter = async (
    promptTemplate: string, 
    lead: LinkedInLead | string, 
    tone: string, 
    template: Template, 
    contentPath: string
) => {
    const schema = z.object({
        subject: z.string().describe("Connection request subject or intro message"),
        message: z.string().describe("Main LinkedIn message content"),
    });

    // Parse lead if it's a string
    let leadData: LinkedInLead;
    if (typeof lead === 'string') {
        try {
            leadData = JSON.parse(lead) as LinkedInLead;
        } catch {
            throw new Error('Invalid lead data format');
        }
    } else {
        leadData = lead;
    }

    // Initialize the model
    const model = gemini('gemini-2.0-flash');

    try {
        // Step 1: Generate intent from prompt template
        const userIntent = await intentAgent(promptTemplate, template, model);
        
        // Step 2: Build profile based on content path and intent
        const profile = await buildProfile(userIntent, contentPath, template, model);
        
        // Step 3: Generate cold message based on template type and profile
        let coldMessagePrompt: string;
        
        switch (template) {
            case Template.JobSearch:
                if (!isJobProfile(profile)) {
                    throw new Error('Invalid profile type for JobSearch template');
                }
                coldMessagePrompt = generateJobSearchPrompt(leadData, profile, tone);
                break;
            case Template.Freelance:
                if (!isFreelanceProfile(profile)) {
                    throw new Error('Invalid profile type for Freelance template');
                }
                coldMessagePrompt = generateFreelancePrompt(leadData, profile, tone);
                break;
            case Template.Funding:
                if (!isFundingProfile(profile)) {
                    throw new Error('Invalid profile type for Funding template');
                }
                coldMessagePrompt = generateFundingPrompt(leadData, profile, tone);
                break;
            default:
                const exhaustiveCheck: never = template;
                throw new Error(`Unsupported template type: ${exhaustiveCheck}`);
        }

        const response = await generateObject({
            model: model,
            prompt: coldMessagePrompt,
            schema: schema
        });
        
        return response.object;
    } catch (error) {
        console.error('Error in messageWriter:', error);
        throw new Error(`Failed to generate message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

// Helper function for job search LinkedIn messages
const generateJobSearchPrompt = (lead: LinkedInLead, profile: JobProfile, tone: string): string => `
You are an expert LinkedIn outreach strategist for job seekers. Write a compelling LinkedIn connection request and follow-up message.

Lead Information:
- Name: ${lead.name}
- Headline: ${lead.headline}
- Location: ${lead.location}
- About: ${lead.about || 'No about section available'}
- Current/Recent Experience: ${lead.experience[0]?.title} at ${lead.experience[0]?.company}
- Education: ${lead.education[0]?.degree} in ${lead.education[0]?.field} from ${lead.education[0]?.school}
- Profile URL: ${lead.profileUrl}

Job Seeker Profile:
- Summary: ${profile.summary}
- Target Roles: ${profile.targetRoles.join(', ')}
- Key Skills: ${profile.skills.join(', ')}
- Recent Experience: ${profile.experience[0]?.position} at ${profile.experience[0]?.company}
- Value Proposition: ${profile.personalBranding.uniqueValue}
- Key Achievements: ${profile.personalBranding.achievements.join(', ')}

Tone: ${tone}

Please create:
1. A compelling connection request message (max 300 characters) that:
   - References something specific from their profile or company
   - Shows genuine interest in their work or expertise
   - Mentions your relevant background briefly

2. A follow-up message (max 500 characters) that:
   - Demonstrates how your skills align with potential opportunities
   - Highlights a key achievement relevant to their industry
   - Includes a clear, professional call to action for a brief conversation

Requirements:
- Maintain a ${tone} tone throughout
- Focus on mutual value and genuine professional interest
- Avoid being overly salesy or desperate
- Show you've researched their background
- Keep it concise and professional
`;

// Helper function for freelance LinkedIn messages
const generateFreelancePrompt = (lead: LinkedInLead, profile: FreelanceProfile, tone: string): string => `
You are an expert LinkedIn outreach strategist for freelancers. Write a compelling LinkedIn connection request and follow-up message.

Lead Information:
- Name: ${lead.name}
- Headline: ${lead.headline}
- Location: ${lead.location}
- About: ${lead.about || 'No about section available'}
- Current/Recent Experience: ${lead.experience[0]?.title} at ${lead.experience[0]?.company}
- Education: ${lead.education[0]?.degree} in ${lead.education[0]?.field} from ${lead.education[0]?.school}
- Profile URL: ${lead.profileUrl}

Freelancer Profile:
- Summary: ${profile.summary}
- Primary Service: ${profile.servicesOffered.primary}
- Key Skills: ${profile.expertise.skills.join(', ')}
- Specializations: ${profile.expertise.specializations.join(', ')}
- Years of Experience: ${profile.expertise.yearsExperience}
- Unique Selling Points: ${profile.uniqueSellingPoints.join(', ')}
- Value Proposition: ${profile.pricingInfo.valueProposition}
- Target Clients: ${profile.targetClients.join(', ')}

Tone: ${tone}

Please create:
1. A compelling connection request message (max 300 characters) that:
   - References their industry or specific challenges they might face
   - Shows understanding of their business needs
   - Briefly mentions your relevant expertise

2. A follow-up message (max 500 characters) that:
   - Demonstrates how your services can solve their specific problems
   - Highlights a relevant project outcome or client success
   - Includes a soft call to action for a brief consultation or discussion

Requirements:
- Maintain a ${tone} tone throughout
- Focus on their business benefits, not just your capabilities
- Show genuine interest in their work and challenges
- Avoid being pushy or overly promotional
- Keep it professional and value-focused
`;

// Helper function for funding LinkedIn messages
const generateFundingPrompt = (lead: LinkedInLead, profile: FundingProfile, tone: string): string => `
You are an expert LinkedIn outreach strategist for startup founders seeking funding. Write a compelling LinkedIn connection request and follow-up message.

Lead (Potential Investor) Information:
- Name: ${lead.name}
- Headline: ${lead.headline}
- Location: ${lead.location}
- About: ${lead.about || 'No about section available'}
- Current/Recent Experience: ${lead.experience[0]?.title} at ${lead.experience[0]?.company}
- Education: ${lead.education[0]?.degree} in ${lead.education[0]?.field} from ${lead.education[0]?.school}
- Profile URL: ${lead.profileUrl}

Startup Profile:
- Company: ${profile.startupInfo.name}
- Tagline: ${profile.startupInfo.tagline}
- Stage: ${profile.startupInfo.stage}
- Vision: ${profile.vision}
- Problem: ${profile.problem.description}
- Solution Value: ${profile.solution.value}
- Market Size: ${profile.problem.marketSize}
- Key Traction: ${Object.entries(profile.traction.metrics).map(([key, value]) => `${key}: ${value}`).join(', ')}
- Funding Ask: ${profile.ask.amount}
- Use of Funds: ${profile.ask.use.join(', ')}

Tone: ${tone}

Please create:
1. A compelling connection request message (max 300 characters) that:
   - References their investment focus or portfolio companies
   - Mentions your startup's stage and industry briefly
   - Shows you've researched their investment criteria

2. A follow-up message (max 500 characters) that:
   - Clearly states your startup's vision and traction
   - Explains why they're a great fit as an investor
   - Includes specific metrics or proof points
   - Has a clear call to action for a brief intro call

Requirements:
- Maintain a ${tone} tone throughout
- Show confidence without being arrogant
- Focus on mutual fit and opportunity
- Include concrete traction metrics
- Keep it professional and investor-focused
`;

export default messageWriter;