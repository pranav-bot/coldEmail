import { z } from "zod";
import { generateObject, type LanguageModelV1 } from 'ai';
import { tools } from "./tools";
import path from 'path';
import { Template } from "./enums";

// Define types for our responses
type JobSearchResponse = {
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
    additionalSections?: Record<string, string>;
};

type SalesResponse = {
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
};

const getTemplatePrompt = (template: Template, content: string): string => {
    switch (template) {
        case Template.JobSearch:
            return `
            You are a resume parser. Your task is to extract and format the contents of the provided resume into a structured format.
            Here is the resume content to parse:
            
            ${content}
            
            Please parse the resume and organize the information into the following sections:
            1. Personal Information (name, contact details, etc.)
            2. Professional Summary (keep it concise, max 200 words)
            3. Work Experience
            4. Education
            5. Skills
            6. Additional Sections (if any)

            Format response as JSON with:
            {
                "personalInfo": "",
                "summary": "",
                "experience": [
                    {
                        "company": "",
                        "position": "",
                        "duration": "",
                        "description": ""
                    }
                ],
                "education": [
                    {
                        "institution": "",
                        "degree": "",
                        "year": "",
                        "details": ""
                    }
                ],
                "skills": [],
                "additionalSections": {}
            }

            Important:
            - Keep the summary concise and meaningful
            - Remove any excessive newlines or whitespace
            - Ensure all text fields are properly escaped
            - Format dates consistently
            - List skills without duplicates
            `;
        case Template.Sales:
            return `
            You are a sales content analyzer. Your task is to extract and analyze any information from the provided document that could be useful for sales purposes.
            Here is the content to analyze:
            
            ${content}
            
            Please analyze the content and extract any information that could be valuable for sales, organizing it into the following sections:
            1. Product/Service Information (what is being sold, features, specifications)
            2. Target Audience (who would benefit from this, ideal customers)
            3. Key Benefits (what problems does it solve, advantages)
            4. Unique Selling Points (what makes it different from competitors)
            5. Pricing Information (cost, value proposition, ROI)
            6. Market Context (industry trends, market position)
            7. Technical Details (specifications, requirements, compatibility)
            8. Social Proof (testimonials, case studies, usage statistics)
            9. Call to Action (how to proceed, next steps)

            Format response as JSON with:
            {
                "productInfo": {
                    "name": "",
                    "description": "",
                    "features": [],
                    "specifications": {}
                },
                "targetAudience": {
                    "primary": "",
                    "secondary": "",
                    "useCases": []
                },
                "keyBenefits": [],
                "uniqueSellingPoints": [],
                "pricingInfo": {
                    "price": "",
                    "valueProposition": "",
                    "roi": ""
                },
                "marketContext": {
                    "industry": "",
                    "position": "",
                    "trends": []
                },
                "technicalDetails": {
                    "specifications": {},
                    "requirements": [],
                    "compatibility": []
                },
                "socialProof": {
                    "testimonials": [],
                    "caseStudies": [],
                    "statistics": {}
                },
                "callToAction": {
                    "nextSteps": [],
                    "contactInfo": ""
                }
            }

            Important:
            - Extract any relevant information that could help in selling the product/service
            - If certain information is not available, leave those fields empty
            - Focus on extracting concrete, specific details rather than general statements
            - Include any numbers, statistics, or specific examples mentioned
            - Highlight any unique or competitive advantages
            - Note any time-sensitive offers or promotions
            - Include any relevant technical specifications or requirements
            - Extract any social proof or validation of the product/service
            `;
        default:
            const _exhaustiveCheck: never = template;
            throw new Error(`Unsupported template type: `);
    }
};

const contentAnalyzer = async (resumePath: string, template: Template, model: LanguageModelV1): Promise<JobSearchResponse | SalesResponse> => {
    // Ensure the file path is absolute
    const absolutePath = path.resolve(resumePath);
    
    // First get the PDF content
    const pdfContent = await tools.parsePdf.execute(
        { filePath: absolutePath },
        { toolCallId: 'pdf-parse', messages: [] }
    );
    
    const prompt = getTemplatePrompt(template, pdfContent);
    
    try {
        const result = await generateObject({
            model: model,
            prompt: prompt,
            schema: template === Template.JobSearch ?
                z.object({
                    personalInfo: z.string().min(1),
                    summary: z.string().min(1).max(1000),
                    experience: z.array(z.object({
                        company: z.string().min(1),
                        position: z.string().min(1),
                        duration: z.string().min(1),
                        description: z.string().min(1)
                    })),
                    education: z.array(z.object({
                        institution: z.string().min(1),
                        degree: z.string().min(1),
                        year: z.string().min(1),
                        details: z.string().optional()
                    })),
                    skills: z.array(z.string().min(1)),
                    additionalSections: z.record(z.string()).optional()
                }) :
                z.object({
                    productInfo: z.object({
                        name: z.string().min(1),
                        description: z.string().min(1),
                        features: z.array(z.string()),
                        specifications: z.record(z.string())
                    }),
                    targetAudience: z.object({
                        primary: z.string().min(1),
                        secondary: z.string(),
                        useCases: z.array(z.string())
                    }),
                    keyBenefits: z.array(z.string()),
                    uniqueSellingPoints: z.array(z.string()),
                    pricingInfo: z.object({
                        price: z.string().min(1),
                        valueProposition: z.string(),
                        roi: z.string()
                    }),
                    marketContext: z.object({
                        industry: z.string(),
                        position: z.string(),
                        trends: z.array(z.string())
                    }),
                    technicalDetails: z.object({
                        specifications: z.record(z.string()),
                        requirements: z.array(z.string()),
                        compatibility: z.array(z.string())
                    }),
                    socialProof: z.object({
                        testimonials: z.array(z.string()),
                        caseStudies: z.array(z.string()),
                        statistics: z.record(z.string())
                    }),
                    callToAction: z.object({
                        nextSteps: z.array(z.string()),
                        contactInfo: z.string()
                    })
                })
        });
        
        // Clean up the response
        if (template === Template.JobSearch) {
            const jobSearchResult = result.object as JobSearchResponse;
            return {
                ...jobSearchResult,
                summary: jobSearchResult.summary.trim().replace(/\n+/g, ' '),
                personalInfo: jobSearchResult.personalInfo.trim(),
                experience: jobSearchResult.experience.map(exp => ({
                    ...exp,
                    description: exp.description.trim().replace(/\n+/g, ' ')
                })),
                education: jobSearchResult.education.map(edu => ({
                    ...edu,
                    details: edu.details?.trim().replace(/\n+/g, ' ')
                }))
            };
        } else {
            const salesResult = result.object as unknown as SalesResponse;
            return {
                ...salesResult,
                productInfo: {
                    ...salesResult.productInfo,
                    description: salesResult.productInfo.description.trim().replace(/\n+/g, ' ')
                },
                targetAudience: {
                    ...salesResult.targetAudience,
                    primary: salesResult.targetAudience.primary.trim().replace(/\n+/g, ' '),
                    secondary: salesResult.targetAudience.secondary?.trim().replace(/\n+/g, ' ') ?? ''
                },
                pricingInfo: {
                    ...salesResult.pricingInfo,
                    price: salesResult.pricingInfo.price.trim().replace(/\n+/g, ' '),
                    valueProposition: salesResult.pricingInfo.valueProposition?.trim().replace(/\n+/g, ' ') ?? ''
                }
            };
        }
    } catch (error) {
        console.error('Error processing content:', error);
        throw new Error(`Failed to process content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export default contentAnalyzer;