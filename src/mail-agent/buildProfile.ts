import type { LanguageModelV1 } from "ai";
import { Template } from "./enums";
import { generateText } from "ai";
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

type SalesProfile = {
    productInfo: {
        name: string;
        description: string;
        features: string[];
        specifications: Record<string, string>;
    };
    targetAudience: {
        primary: string;
        secondary: string;
        useCases: string[];
    };
    keyBenefits: string[];
    uniqueSellingPoints: string[];
    pricingInfo: {
        price: string;
        valueProposition: string;
        roi: string;
    };
    marketContext: {
        industry: string;
        position: string;
        trends: string[];
    };
    technicalDetails: {
        specifications: Record<string, string>;
        requirements: string[];
        compatibility: string[];
    };
    socialProof: {
        testimonials: string[];
        caseStudies: string[];
        statistics: Record<string, string>;
    };
    callToAction: {
        nextSteps: string[];
        contactInfo: string;
    };
    intent: string;
    targetMarkets: string[];
    competitiveAdvantages: string[];
    salesObjectives: string[];
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
        marketGaps: string[];
        successStories: string[];
    };
};

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

const salesAdditionalInfoSchema = z.object({
    targetMarkets: z.array(z.string()),
    competitiveAdvantages: z.array(z.string()),
    salesObjectives: z.array(z.string()),
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
    positioning: z.object({
        uniqueValue: z.string(),
        differentiators: z.array(z.string()),
        marketGaps: z.array(z.string()),
        successStories: z.array(z.string())
    })
});

const buildProfile = async (
    userIntent: string,
    file: string,
    template: Template,
    model: LanguageModelV1
): Promise<JobProfile | SalesProfile> => {
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

    Format the response as a JSON object with these fields:
    {
        "targetRoles": [],
        "preferredIndustries": [],
        "locationPreferences": [],
        "salaryExpectations": "",
        "additionalPreferences": {},
        "communicationStyle": {
            "tone": "",
            "keyPoints": [],
            "painPoints": [],
            "valueProposition": "",
            "callToAction": ""
        },
        "personalBranding": {
            "strengths": [],
            "uniqueValue": "",
            "careerStory": "",
            "achievements": []
        }
    }
    `;

    const salesPrompt = `
    You are an expert sales strategist and communication specialist. Your task is to build a comprehensive sales profile that will be used to write effective cold emails for product/service promotion.

    Sales Intent: "${userIntent}"

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

    Format the response as a JSON object with these fields:
    {
        "targetMarkets": [],
        "competitiveAdvantages": [],
        "salesObjectives": [],
        "marketPositioning": "",
        "additionalConsiderations": {},
        "communicationStrategy": {
            "tone": "",
            "keyMessages": [],
            "painPoints": [],
            "valueProposition": "",
            "objectionHandling": [],
            "callToAction": ""
        },
        "positioning": {
            "uniqueValue": "",
            "differentiators": [],
            "marketGaps": [],
            "successStories": []
        }
    }
    `;

    try {
        const prompt = template === Template.JobSearch ? jobSearchPrompt : salesPrompt;
        const result = await generateText({
            model: model,
            prompt: prompt,
        });

        if (template === Template.JobSearch) {
            const additionalInfo = jobSearchAdditionalInfoSchema.parse(JSON.parse(result.text));
            return {
                ...(content as JobProfile),
                intent: userIntent,
                targetRoles: additionalInfo.targetRoles,
                preferredIndustries: additionalInfo.preferredIndustries,
                locationPreferences: additionalInfo.locationPreferences,
                salaryExpectations: additionalInfo.salaryExpectations,
                additionalSections: additionalInfo.additionalPreferences,
                communicationStyle: additionalInfo.communicationStyle,
                personalBranding: additionalInfo.personalBranding
            };
        } else {
            const additionalInfo = salesAdditionalInfoSchema.parse(JSON.parse(result.text));
            return {
                ...(content as SalesProfile),
                intent: userIntent,
                targetMarkets: additionalInfo.targetMarkets,
                competitiveAdvantages: additionalInfo.competitiveAdvantages,
                salesObjectives: additionalInfo.salesObjectives,
                marketContext: {
                    ...(content as SalesProfile).marketContext,
                    position: additionalInfo.marketPositioning
                },
                communicationStrategy: additionalInfo.communicationStrategy,
                positioning: additionalInfo.positioning
            };
        }
    } catch (error) {
        console.error('Error building profile:', error);
        throw new Error(`Failed to build profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export default buildProfile;