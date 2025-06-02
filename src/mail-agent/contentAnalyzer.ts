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

type FundingResponse = {
    startupInfo: {
        name: string;
        tagline: string;
        stage: string;
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
        metrics: Record<string, string>;
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
};

type FreelanceResponse = {
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
        position: string;
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
            `;        case Template.Freelance:
            return `
            You are a freelancer profile analyzer. Your task is to extract and analyze any information from the provided document that could be useful for freelance pitching purposes.
            Here is the content to analyze:
            
            ${content}
            
            Please analyze the content and extract any information that could be valuable for freelance pitching, organizing it into the following sections:
            1. Services Offered (what services you provide, specializations)
            2. Expertise (skills, specializations, tools, years of experience)
            3. Portfolio Highlights (notable projects, clients, outcomes)
            4. Client Benefits (what problems you solve, advantages of working with you)
            5. Unique Value Proposition (what makes you different from other freelancers)
            6. Pricing Information (rate structure, value proposition, ROI for clients)
            7. Market Context (industry expertise, niche position)
            8. Process Overview (how you work, timeline, deliverables)
            9. Social Proof (testimonials, portfolio highlights, client results)
            10. Call to Action (how to proceed, next steps)

            Format response as JSON with:
            {
                "servicesOffered": {
                    "primary": "",
                    "secondary": [],
                    "description": ""
                },
                "expertise": {
                    "skills": [],
                    "specializations": [],
                    "tools": [],
                    "yearsExperience": ""
                },
                "portfolioHighlights": [
                    {
                        "projectName": "",
                        "clientName": "",
                        "description": "",
                        "outcomes": []
                    }
                ],
                "clientBenefits": [],
                "uniqueSellingPoints": [],
                "pricingInfo": {
                    "rateStructure": "",
                    "valueProposition": "",
                    "roi": ""
                },
                "marketContext": {
                    "industry": "",
                    "position": "",
                    "trends": []
                },
                "processOverview": {
                    "workflow": [],
                    "timeline": "",
                    "deliverables": []
                },
                "socialProof": {
                    "testimonials": [],
                    "caseStudies": [],
                    "results": {}
                },
                "callToAction": {
                    "nextSteps": [],
                    "contactInfo": ""
                }
            }

            Important:
            - Extract any relevant information that could help in freelance pitching
            - If certain information is not available, leave those fields empty
            - Focus on extracting concrete, specific details rather than general statements
            - Include any numbers, statistics, or specific examples mentioned
            - Highlight any unique skills or competitive advantages
            - Include portfolio examples and client success stories when available            - Extract any social proof or validation of your work
            `;
        case Template.Funding:
            return `
            You are a startup pitch analyzer. Your task is to extract and analyze any information from the provided document that would be valuable for crafting investor pitches.
            Here is the content to analyze:
            
            ${content}
            
            Please analyze the content and extract any information that could be valuable for fundraising pitches, organizing it into the following sections:
            1. Startup Information (name, tagline, stage, founding date, location)
            2. Summary (elevator pitch, 1-2 sentences)
            3. Vision (long-term vision and mission)
            4. Problem (what problem you're solving, market size, who experiences it)
            5. Solution (your value proposition, what makes it unique, technical details)
            6. Traction (metrics, growth rate, key milestones)
            7. Business Model (revenue streams, pricing strategy, customer acquisition)
            8. Market (size, trends, competitors)
            9. Team (founders and key team members, relevant experience)
            10. Financials (current runway, past funding, projections)
            11. Ask (funding amount, use of funds, timeline)

            Format response as JSON with:
            {
                "startupInfo": {
                    "name": "",
                    "tagline": "",
                    "stage": "",
                    "foundingDate": "",
                    "location": ""
                },
                "summary": "",
                "vision": "",
                "problem": {
                    "description": "",
                    "marketSize": "",
                    "targetCustomers": []
                },
                "solution": {
                    "value": "",
                    "uniqueness": "",
                    "techDetails": ""
                },
                "traction": {
                    "metrics": {},
                    "growth": "",
                    "milestones": []
                },
                "businessModel": {
                    "revenueStreams": [],
                    "pricing": "",
                    "customerAcquisition": ""
                },
                "market": {
                    "size": "",
                    "trends": [],
                    "competition": []
                },
                "team": [
                    {
                        "name": "",
                        "role": "",
                        "background": ""
                    }
                ],
                "financials": {
                    "currentRunway": "",
                    "pastFunding": "",
                    "projections": ""
                },
                "ask": {
                    "amount": "",
                    "use": [],
                    "timeline": ""
                }
            }

            Important:
            - Extract any data points, metrics, or statistics that demonstrate traction
            - Focus on the unique value proposition and differentiators
            - Extract information about market size and growth potential
            - Include team credentials and experience that establish credibility
            - Highlight any notable investors, advisors, or partnerships
            - Note any specific funding needs and timeline
            `;
        default:
            throw new Error(`Unsupported template type: ${template}`);
    }
};

const contentAnalyzer = async (
    resumePath: string,
    template: Template,
    model: LanguageModelV1
): Promise<JobSearchResponse | FreelanceResponse | FundingResponse> => {
    // Ensure the file path is absolute
    const absolutePath = path.resolve(resumePath);

    // First get the PDF content
    const pdfContent = await tools.parsePdf.execute(
        { filePath: absolutePath },
        { toolCallId: 'pdf-parse', messages: [] }
    );

    const prompt = getTemplatePrompt(template, pdfContent);
    try {
        let validator;
        if (template === Template.JobSearch) {
            validator = z.object({
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
            });
        } else if (template === Template.Freelance) {
            validator = z.object({
                servicesOffered: z.object({
                    primary: z.string().min(1),
                    secondary: z.array(z.string()),
                    description: z.string().min(1)
                }),
                expertise: z.object({
                    skills: z.array(z.string()),
                    specializations: z.array(z.string()),
                    tools: z.array(z.string()),
                    yearsExperience: z.string()
                }),
                portfolioHighlights: z.array(z.object({
                    projectName: z.string().min(1),
                    clientName: z.string().optional(),
                    description: z.string().min(1),
                    outcomes: z.array(z.string())
                })),
                clientBenefits: z.array(z.string()),
                uniqueSellingPoints: z.array(z.string()),
                pricingInfo: z.object({
                    rateStructure: z.string().min(1),
                    valueProposition: z.string(),
                    roi: z.string()
                }),
                marketContext: z.object({
                    industry: z.string(),
                    position: z.string(),
                    trends: z.array(z.string())
                }),
                processOverview: z.object({
                    workflow: z.array(z.string()),
                    timeline: z.string(),
                    deliverables: z.array(z.string())
                }),
                socialProof: z.object({
                    testimonials: z.array(z.string()),
                    caseStudies: z.array(z.string()),
                    results: z.record(z.string())
                }),
                callToAction: z.object({
                    nextSteps: z.array(z.string()),
                    contactInfo: z.string()
                })
            });
        } else if (template === Template.Funding) {
            validator = z.object({
                startupInfo: z.object({
                    name: z.string(),
                    tagline: z.string(),
                    stage: z.string(),
                    foundingDate: z.string(),
                    location: z.string()
                }),
                summary: z.string(),
                vision: z.string(),
                problem: z.object({
                    description: z.string(),
                    marketSize: z.string(),
                    targetCustomers: z.array(z.string())
                }),
                solution: z.object({
                    value: z.string(),
                    uniqueness: z.string(),
                    techDetails: z.string()
                }),
                traction: z.object({
                    metrics: z.record(z.string()),
                    growth: z.string(),
                    milestones: z.array(z.string())
                }),
                businessModel: z.object({
                    revenueStreams: z.array(z.string()),
                    pricing: z.string(),
                    customerAcquisition: z.string()
                }),
                market: z.object({
                    size: z.string(),
                    trends: z.array(z.string()),
                    competition: z.array(z.string())
                }),
                team: z.array(z.object({
                    name: z.string(),
                    role: z.string(),
                    background: z.string()
                })),
                financials: z.object({
                    currentRunway: z.string(),
                    pastFunding: z.string(),
                    projections: z.string()
                }),
                ask: z.object({
                    amount: z.string(),
                    use: z.array(z.string()),
                    timeline: z.string()
                })
            });
        } else {
            throw new Error(`Unsupported template type: ${template}`);
        }        const result = await generateObject({
            model: model,
            prompt: prompt,
            schema: validator
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
        } else if (template === Template.Freelance) {
            const freelanceResult = result.object as FreelanceResponse;
            return {
                ...freelanceResult,
                servicesOffered: {
                    ...freelanceResult.servicesOffered,
                    description: freelanceResult.servicesOffered.description.trim().replace(/\n+/g, ' ')
                },
                expertise: {
                    ...freelanceResult.expertise,
                    yearsExperience: freelanceResult.expertise.yearsExperience?.trim().replace(/\n+/g, ' ') ?? ''
                },
                pricingInfo: {
                    ...freelanceResult.pricingInfo,
                    rateStructure: freelanceResult.pricingInfo.rateStructure.trim().replace(/\n+/g, ' '),
                    valueProposition: freelanceResult.pricingInfo.valueProposition?.trim().replace(/\n+/g, ' ') ?? ''
                }
            };
        } else if (template === Template.Funding) {
            const fundingResult = result.object as FundingResponse;
            return {
                ...fundingResult,
                summary: fundingResult.summary.trim().replace(/\n+/g, ' '),
                vision: fundingResult.vision.trim().replace(/\n+/g, ' '),
                problem: {
                    ...fundingResult.problem,
                    description: fundingResult.problem.description.trim().replace(/\n+/g, ' '),
                    marketSize: fundingResult.problem.marketSize.trim().replace(/\n+/g, ' ')
                },
                solution: {
                    ...fundingResult.solution,
                    value: fundingResult.solution.value.trim().replace(/\n+/g, ' '),
                    uniqueness: fundingResult.solution.uniqueness.trim().replace(/\n+/g, ' ')
                }
            };
        }
    } catch (error) {
        console.error('Error processing content:', error);
        throw new Error(`Failed to process content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export default contentAnalyzer;