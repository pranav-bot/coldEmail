import type { LanguageModelV1 } from "ai";
import { Template } from "./enums";
import { generateObject } from "ai";
import contentAnalyzer from "./contentAnalyzer";
import { z } from "zod";

type JobProfile = {
    personalInfo: string;
    summary: string;
    experience: Array<{
        company: string;
        position: string;
        duration: string;
        description: string;
    }>;
    education: Array<{
        institution: string;
        degree: string;
        year: string;
        details?: string;
    }>;
    skills: string[];
    intent: string;
    targetRoles: string[];
    preferredIndustries: string[];
    locationPreferences: string[];
    salaryExpectations?: string;
    additionalSections?: Record<string, string>;
    communicationStyle: {
        tone: string;
        keyPoints: string[];
        painPoints: string[];
        valueProposition: string;
        callToAction: string;
    };
    personalBranding: {
        strengths: string[];
        uniqueValue: string;
        careerStory: string;
        achievements: string[];
    };
};

type FreelanceProfile = {
    personalInfo: string;
    summary: string;
    servicesOffered: {
        primary: string;
        secondary: string[];
        description: string;
    };
    expertise: {
        skills: string[];
        specializations: string[];
        tools: string[];
        yearsExperience: string;
    };
    portfolioHighlights: Array<{
        projectName: string;
        clientName?: string;
        description: string;
        outcomes: string[];
    }>;
    clientBenefits: string[];
    uniqueSellingPoints: string[];
    pricingInfo: {
        rateStructure: string;
        valueProposition: string;
        roi: string;
    };
    marketContext: {
        industry: string;
        targetClients: string[];
        trends: string[];
    };
    processOverview: {
        workflow: string[];
        timeline: string;
        deliverables: string[];
    };
    socialProof: {
        testimonials: string[];
        caseStudies: string[];
        results: Record<string, string>;
    };
    callToAction: {
        nextSteps: string[];
        contactInfo: string;
    };
    intent: string;
    targetClients: string[];
    competitiveAdvantages: string[];
    businessObjectives: string[];
    communicationStrategy: {
        tone: string;
        keyMessages: string[];
        painPoints: string[];
        valueProposition: string;
        objectionHandling: string[];
        callToAction: string;
    };
    positioning: {
        uniqueValue: string;
        differentiators: string[];
        marketNiche: string[];
        successStories: string[];
    };
};

type FundingProfile = {
    startupInfo: {
        name: string;
        tagline: string;
        stage: string; // e.g., seed, series A, etc.
        foundingDate: string;
        location: string;
    };
    summary: string;
    vision: string;
    problem: {
        description: string;
        marketSize: string;
        targetCustomers: string[];
    };
    solution: {
        value: string;
        uniqueness: string;
        techDetails: string;
    };
    traction: {
        metrics: Record<string, string>; // e.g., users: "10,000", revenue: "$50k MRR"
        growth: string;
        milestones: string[];
    };
    businessModel: {
        revenueStreams: string[];
        pricing: string;
        customerAcquisition: string;
    };
    market: {
        size: string;
        trends: string[];
        competition: string[];
    };
    team: Array<{
        name: string;
        role: string;
        background: string;
    }>;
    financials: {
        currentRunway: string;
        pastFunding: string;
        projections: string;
    };
    ask: {
        amount: string;
        use: string[];
        timeline: string;
    };
    intent: string;
    targetInvestors: string[];
    pitchStrategy: {
        hook: string;
        keyPoints: string[];
        valueProposition: string;
        proofPoints: string[];
        callToAction: string;
    };
    communicationStyle: {
        tone: string;
        persuasionTactics: string[];
        objectionHandling: string[];
    };
};

export type { JobProfile, FreelanceProfile, FundingProfile };

const jobSearchAdditionalInfoSchema = z.object({
    targetRoles: z.array(z.string()),
    preferredIndustries: z.array(z.string()),
    locationPreferences: z.array(z.string()),
    salaryExpectations: z.string().optional(),
    additionalPreferences: z.record(z.string()).optional(),
    communicationStyle: z.object({
        tone: z.string(),
        keyPoints: z.array(z.string()),
        painPoints: z.array(z.string()),
        valueProposition: z.string(),
        callToAction: z.string()
    }),
    personalBranding: z.object({
        strengths: z.array(z.string()),
        uniqueValue: z.string(),
        careerStory: z.string(),
        achievements: z.array(z.string())
    })
});

const freelanceAdditionalInfoSchema = z.object({
    targetClients: z.array(z.string()),
    competitiveAdvantages: z.array(z.string()),
    businessObjectives: z.array(z.string()),
    marketPositioning: z.string(),
    additionalConsiderations: z.record(z.string()).optional(),
    communicationStrategy: z.object({
        tone: z.string(),
        keyMessages: z.array(z.string()),
        painPoints: z.array(z.string()),
        valueProposition: z.string(),
        objectionHandling: z.array(z.string()),
        callToAction: z.string()
    }),
});

const fundingAdditionalInfoSchema = z.object({
    targetInvestors: z.array(z.string()),
    investorFit: z.array(z.string()),
    fundingGoals: z.array(z.string()),
    marketOpportunity: z.string(),
    additionalConsiderations: z.record(z.string()).optional(),
    pitchStrategy: z.object({
        hook: z.string(),
        keyPoints: z.array(z.string()),
        valueProposition: z.string(),
        proofPoints: z.array(z.string()),
        callToAction: z.string()
    }),
    communicationStyle: z.object({
        tone: z.string(),
        persuasionTactics: z.array(z.string()),
        objectionHandling: z.array(z.string())
    }),
    positioning: z.object({
        uniqueValue: z.string(),
        differentiators: z.array(z.string()),
        marketNiche: z.array(z.string()),
        successStories: z.array(z.string())
    })
});

const buildProfile = async (
    userIntent: string,
    file: string,
    template: Template,
    model: LanguageModelV1
): Promise<JobProfile | FreelanceProfile> => {
    // First analyze the content
    const content = await contentAnalyzer(file, template, model);

    const jobSearchPrompt = `
    You are an expert career coach and communication strategist. Your task is to build a comprehensive job search profile that will be used to write effective cold emails for job applications.

    User's Intent: "${userIntent}"

    Resume Analysis:
    ${JSON.stringify(content, null, 2)}

    Please analyze this information and provide a comprehensive profile that includes:

    1. Career Targeting:
       - Target roles that match their experience and intent
       - Preferred industries based on their background
       - Location preferences (if mentioned in intent)
       - Salary expectations (if mentioned in intent)
       - Any additional preferences or requirements

    2. Communication Style (for cold emails):
       - Professional tone that matches their experience level
       - Key points to highlight in initial outreach
       - Pain points they can address for potential employers
       - Clear value proposition
       - Effective call to action

    3. Personal Branding:
       - Key strengths to emphasize
       - Unique value proposition
       - Compelling career story
       - Notable achievements to highlight
    `;

    const freelancePrompt = `
    You are an expert freelance consultant and pitch strategist. Your task is to build a comprehensive freelancer profile that will be used to write effective cold emails for pitching services to potential clients.

    Freelance Intent: "${userIntent}"

    Content Analysis:
    ${JSON.stringify(content, null, 2)}

    Please analyze this information and provide a comprehensive profile that includes:

    1. Market Analysis:
       - Target markets that would benefit most from this product/service
       - Competitive advantages based on the features and benefits
       - Specific sales objectives and goals
       - Market positioning strategy
       - Any additional sales considerations

    2. Communication Strategy (for cold emails):
       - Professional tone that matches the product/service
       - Key messages to convey in initial outreach
       - Pain points the product/service solves
       - Clear value proposition
       - Common objections and how to address them
       - Effective call to action

    3. Market Positioning:
       - Unique value proposition
       - Key differentiators from competitors
       - Market gaps the product/service fills
       - Success stories and case studies to reference
    `;
    
    const fundingPrompt = `
    You are an expert startup advisor and investor pitch strategist. Your task is to build a comprehensive funding profile that will be used to write effective cold emails for pitching to potential investors.

    Funding Intent: "${userIntent}"

    Pitch Deck/Business Plan Analysis:
    ${JSON.stringify(content, null, 2)}

    Please analyze this information and provide a comprehensive profile that includes:

    1. Investor Targeting:
       - Types of investors that would be ideal for this startup
       - Why these investors would be a good fit
       - Specific funding goals and timeline
       - Market opportunity that will attract investors
       - Any additional considerations for investor outreach

    2. Pitch Strategy (for cold emails):
       - Compelling hook that grabs attention
       - Key points to highlight in initial outreach
       - Value proposition that resonates with investors
       - Proof points that demonstrate traction and potential
       - Effective call to action for next steps

    3. Communication Style:
       - Professional tone appropriate for investor outreach
       - Persuasion tactics that work well with investors
       - Common objections investors might have and how to address them
    `;

    try {
        let prompt;
        let schema;
        
        if (template === Template.JobSearch) {
            prompt = jobSearchPrompt;
            schema = jobSearchAdditionalInfoSchema;
        } else if (template === Template.Freelance) {
            prompt = freelancePrompt;
            schema = freelanceAdditionalInfoSchema;
        } else {
            // Funding template
            prompt = fundingPrompt;
            schema = fundingAdditionalInfoSchema;
        }

        // Use generateObject instead of generateText
        const result = await generateObject({
            model: model,
            prompt: prompt,
            schema: schema
        });

        if (template === Template.JobSearch) {
            return {
                ...(content as JobProfile),
                intent: userIntent,
                targetRoles: result.object.targetRoles,
                preferredIndustries: result.object.preferredIndustries,
                locationPreferences: result.object.locationPreferences,
                salaryExpectations: result.object.salaryExpectations,
                additionalSections: result.object.additionalPreferences,
                communicationStyle: result.object.communicationStyle,
                personalBranding: result.object.personalBranding
            };
        } else if (template === Template.Freelance) {
            return {
                ...(content as FreelanceProfile),
                intent: userIntent,
                targetClients: result.object.targetClients,
                competitiveAdvantages: result.object.competitiveAdvantages,
                businessObjectives: result.object.businessObjectives,
                marketContext: {
                    ...(content as FreelanceProfile).marketContext,
                    position: result.object.marketPositioning
                },
                communicationStrategy: result.object.communicationStrategy,
                positioning: result.object.positioning
            };
        } else {
            // Funding template
            return {
                ...(content as FundingProfile),
                intent: userIntent,
                targetInvestors: result.object.targetInvestors,
                investorFit: result.object.investorFit,
                fundingGoals: result.object.fundingGoals,
                marketOpportunity: result.object.marketOpportunity,
                pitchStrategy: result.object.pitchStrategy,
                communicationStyle: result.object.communicationStyle
            };
        }
    } catch (error) {
        console.error('Error building profile:', error);
        throw new Error(`Failed to build profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export default buildProfile;