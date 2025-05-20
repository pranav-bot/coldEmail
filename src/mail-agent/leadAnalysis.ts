import type { LanguageModelV1 } from "ai"
import { Template } from "./enums"
import { generateObject } from "ai"
import { z } from "zod"
import { tools } from "./tools"

type Lead = {
    contactInfo: {
        name: string;
        email: string;
        phone?: string;
        title?: string;
        company?: string;
        linkedin?: string;
    };
    companyInfo: {
        name: string;
        industry?: string;
        size?: string;
        location?: string;
        website?: string;
    };
    leadDetails: {
        source: string;
        status: string;
        interest: string;
        painPoints: string[];
        needs: string[];
        budget?: string;
        timeline?: string;
        relevance: {
            jobSearch?: {
                roleMatch: string;
                industryMatch: string;
                skillMatch: string[];
                experienceMatch: string;
                locationMatch: string;
                companyCulture: string;
                growthPotential: string;
            };
            sales?: {
                productFit: string;
                marketSegment: string;
                useCaseMatch: string[];
                budgetAlignment: string;
                decisionProcess: string;
                competitivePosition: string;
            };
            funding?: {
                stageFit: string;
                sectorFit: string;
                historyMatch: string;
                decisionProcess: string;
                portfolioHighlights: string[];
                valueAdd: string;
            };
        };
    };
    communication: {
        preferredChannel: string;
        bestTimeToContact?: string;
        previousInteractions?: string[];
        notes?: string;
    };
    qualification: {
        decisionMaker: boolean;
        influence: string;
        budgetAuthority: boolean;
        urgency: string;
        fit: string;
    };
};

export type { Lead };

type ParsedContent = Record<string, any>[] | Record<string, Record<string, any>[]>;

const getJobSearchPrompt = (content: ParsedContent) => `
You are an expert job search lead analyst. Your task is to analyze the provided lead data and extract comprehensive information about each potential employer or job opportunity.

Lead Data:
${JSON.stringify(content, null, 2)}

Please analyze this data and extract detailed information for each lead, including:
1. Contact Information (name, email, phone, title, company, LinkedIn)
2. Company Information (name, industry, size, location, website)
3. Lead Details (source, status, interest level, pain points, needs, budget, timeline)
4. Job Search Relevance:
   - Role match with candidate's profile
   - Industry match
   - Required skills match
   - Experience level match
   - Location compatibility
   - Company culture alignment
   - Growth potential
5. Communication Preferences (preferred channel, best time to contact, previous interactions)
6. Qualification Details (decision maker status, influence level, budget authority, urgency, fit)

Format the response as a JSON array of lead objects, where each lead object contains:
{
    "contactInfo": {
        "name": "",
        "email": "",
        "phone": "",
        "title": "",
        "company": "",
        "linkedin": ""
    },
    "companyInfo": {
        "name": "",
        "industry": "",
        "size": "",
        "location": "",
        "website": ""
    },
    "leadDetails": {
        "source": "",
        "status": "",
        "interest": "",
        "painPoints": [],
        "needs": [],
        "budget": "",
        "timeline": "",
        "relevance": {
            "jobSearch": {
                "roleMatch": "",
                "industryMatch": "",
                "skillMatch": [],
                "experienceMatch": "",
                "locationMatch": "",
                "companyCulture": "",
                "growthPotential": ""
            }
        }
    },
    "communication": {
        "preferredChannel": "",
        "bestTimeToContact": "",
        "previousInteractions": [],
        "notes": ""
    },
    "qualification": {
        "decisionMaker": boolean,
        "influence": "",
        "budgetAuthority": boolean,
        "urgency": "",
        "fit": ""
    }
}

Important Guidelines:
- Extract all available contact information
- If certain information is not available, leave those fields empty
- For arrays (painPoints, needs, previousInteractions), include all relevant items
- Include any additional notes or observations that could be valuable
- Rate the lead's fit and urgency on a scale (e.g., "High", "Medium", "Low")
- Mark decision maker status and budget authority as true/false based on available information
- For job search relevance:
  * Rate matches on a scale (e.g., "Excellent", "Good", "Fair", "Poor")
  * Provide specific reasons for each rating
  * Highlight any unique opportunities or challenges
  * Note any specific requirements or qualifications
  * Consider company culture and growth potential
`;

const getFreelancePrompt = (content: ParsedContent) => `
You are an expert freelancer client analyst. Your task is to analyze the provided lead data and extract comprehensive information about each potential client for freelance services.

Lead Data:
${JSON.stringify(content, null, 2)}

Please analyze this data and extract detailed information for each lead, including:
1. Contact Information (name, email, phone, title, company, LinkedIn)
2. Company Information (name, industry, size, location, website)
3. Lead Details (source, status, interest level, pain points, needs, budget, timeline)
4. Freelance Service Relevance:
   - Service/expertise fit
   - Project potential alignment
   - Collaboration opportunities
   - Budget alignment
   - Decision-making process
   - Competitive position
5. Communication Preferences (preferred channel, best time to contact, previous interactions)
6. Qualification Details (decision maker status, influence level, budget authority, urgency, fit)

Format the response as a JSON array of lead objects, where each lead object contains:
{
    "contactInfo": {
        "name": "",
        "email": "",
        "phone": "",
        "title": "",
        "company": "",
        "linkedin": ""
    },
    "companyInfo": {
        "name": "",
        "industry": "",
        "size": "",
        "location": "",
        "website": ""
    },
    "leadDetails": {
        "source": "",
        "status": "",
        "interest": "",
        "painPoints": [],
        "needs": [],
        "budget": "",
        "timeline": "",
        "relevance": {
            "sales": {
                "productFit": "",
                "marketSegment": "",
                "useCaseMatch": [],
                "budgetAlignment": "",
                "decisionProcess": "",
                "competitivePosition": ""
            }
        }
    },
    "communication": {
        "preferredChannel": "",
        "bestTimeToContact": "",
        "previousInteractions": [],
        "notes": ""
    },
    "qualification": {
        "decisionMaker": boolean,
        "influence": "",
        "budgetAuthority": boolean,
        "urgency": "",
        "fit": ""
    }
}

Important Guidelines:
- Extract all available contact information
- If certain information is not available, leave those fields empty
- For arrays (painPoints, needs, previousInteractions), include all relevant items
- Include any additional notes or observations that could be valuable
- Rate the lead's fit and urgency on a scale (e.g., "High", "Medium", "Low")
- Mark decision maker status and budget authority as true/false based on available information
- For sales relevance:
  * Rate matches on a scale (e.g., "Excellent", "Good", "Fair", "Poor")
  * Provide specific reasons for each rating
  * Identify key decision makers and influencers
  * Note budget constraints and timeline
  * Highlight competitive advantages and challenges
  * Consider market position and growth potential
`;

const getFundingPrompt = (content: ParsedContent) => `
You are an expert investor lead analyst. Your task is to analyze the provided lead data and extract comprehensive information about each potential investor (VC, angel, etc) for a startup funding outreach campaign.

Lead Data:
${JSON.stringify(content, null, 2)}

Please analyze this data and extract detailed information for each lead, including:
1. Contact Information (name, email, phone, title, firm, LinkedIn)
2. Firm Information (name, focus, stage, location, website)
3. Lead Details (source, status, interest level, investment thesis, past investments, check size, timeline)
4. Funding Relevance:
   - Stage/sector fit
   - Investment history
   - Decision process
   - Notable portfolio companies
   - Value-add for startups
5. Communication Preferences (preferred channel, best time to contact, previous interactions)
6. Qualification Details (decision maker status, influence level, urgency, fit)

Format the response as a JSON array of lead objects, where each lead object contains:
{
    "contactInfo": {
        "name": "",
        "email": "",
        "phone": "",
        "title": "",
        "firm": "",
        "linkedin": ""
    },
    "firmInfo": {
        "name": "",
        "focus": "",
        "stage": "",
        "location": "",
        "website": ""
    },
    "leadDetails": {
        "source": "",
        "status": "",
        "interest": "",
        "investmentThesis": "",
        "pastInvestments": [],
        "checkSize": "",
        "timeline": "",
        "relevance": {
            "funding": {
                "stageFit": "",
                "sectorFit": "",
                "historyMatch": "",
                "decisionProcess": "",
                "portfolioHighlights": [],
                "valueAdd": ""
            }
        }
    },
    "communication": {
        "preferredChannel": "",
        "bestTimeToContact": "",
        "previousInteractions": [],
        "notes": ""
    },
    "qualification": {
        "decisionMaker": boolean,
        "influence": "",
        "urgency": "",
        "fit": ""
    }
}

Important Guidelines:
- Extract all available contact information
- If certain information is not available, leave those fields empty
- For arrays (pastInvestments, portfolioHighlights, previousInteractions), include all relevant items
- Include any additional notes or observations that could be valuable
- Rate the lead's fit and urgency on a scale (e.g., "High", "Medium", "Low")
- Mark decision maker status as true/false based on available information
- For funding relevance:
  * Rate matches on a scale (e.g., "Excellent", "Good", "Fair", "Poor")
  * Provide specific reasons for each rating
  * Identify key decision makers and influencers
  * Note check size, stage, and sector fit
  * Highlight portfolio companies and value-add
`;

const leadAnalysis = async (filePath: string, template: Template, model: LanguageModelV1): Promise<Lead[]> => {
    // Parse the file based on its type
    let content;
    if (filePath.endsWith('.csv')) {
        content = await tools.parseCSV.execute(
            { filePath },
            { toolCallId: 'csv-parse', messages: [] }
        );
    } else if (filePath.endsWith('.xlsx')) {
        content = await tools.parseExcel.execute(
            { filePath },
            { toolCallId: 'excel-parse', messages: [] }
        );
    } else {
        throw new Error('Unsupported file format. Please provide a CSV or Excel file.');
    }

    let prompt;
    if (template === Template.JobSearch) {
        prompt = getJobSearchPrompt(content);
    } else if (template === Template.Freelance) {
        prompt = getFreelancePrompt(content);
    } else {
        prompt = getFundingPrompt(content);
    }

    let schema;
    if (template === Template.JobSearch) {
        schema = z.array(z.object({
            contactInfo: z.object({
                name: z.string(),
                email: z.string(),
                phone: z.string().optional(),
                title: z.string().optional(),
                company: z.string().optional(),
                linkedin: z.string().optional()
            }),
            companyInfo: z.object({
                name: z.string(),
                industry: z.string().optional(),
                size: z.string().optional(),
                location: z.string().optional(),
                website: z.string().optional()
            }),
            leadDetails: z.object({
                source: z.string(),
                status: z.string(),
                interest: z.string(),
                painPoints: z.array(z.string()),
                needs: z.array(z.string()),
                budget: z.string().optional(),
                timeline: z.string().optional(),
                relevance: z.object({
                    jobSearch: z.object({
                        roleMatch: z.string(),
                        industryMatch: z.string(),
                        skillMatch: z.array(z.string()),
                        experienceMatch: z.string(),
                        locationMatch: z.string(),
                        companyCulture: z.string(),
                        growthPotential: z.string()
                    }).optional(),
                    sales: z.object({
                        productFit: z.string(),
                        marketSegment: z.string(),
                        useCaseMatch: z.array(z.string()),
                        budgetAlignment: z.string(),
                        decisionProcess: z.string(),
                        competitivePosition: z.string()
                    }).optional()
                })
            }),
            communication: z.object({
                preferredChannel: z.string(),
                bestTimeToContact: z.string().optional(),
                previousInteractions: z.array(z.string()).optional(),
                notes: z.string().optional()
            }),
            qualification: z.object({
                decisionMaker: z.boolean(),
                influence: z.string(),
                budgetAuthority: z.boolean(),
                urgency: z.string(),
                fit: z.string()
            })
        }));
    } else if (template === Template.Freelance) {
        schema = z.array(z.object({
            contactInfo: z.object({
                name: z.string(),
                email: z.string(),
                phone: z.string().optional(),
                title: z.string().optional(),
                company: z.string().optional(),
                linkedin: z.string().optional()
            }),
            companyInfo: z.object({
                name: z.string(),
                industry: z.string().optional(),
                size: z.string().optional(),
                location: z.string().optional(),
                website: z.string().optional()
            }),
            leadDetails: z.object({
                source: z.string(),
                status: z.string(),
                interest: z.string(),
                painPoints: z.array(z.string()),
                needs: z.array(z.string()),
                budget: z.string().optional(),
                timeline: z.string().optional(),
                relevance: z.object({
                    sales: z.object({
                        productFit: z.string(),
                        marketSegment: z.string(),
                        useCaseMatch: z.array(z.string()),
                        budgetAlignment: z.string(),
                        decisionProcess: z.string(),
                        competitivePosition: z.string()
                    }).optional()
                })
            }),
            communication: z.object({
                preferredChannel: z.string(),
                bestTimeToContact: z.string().optional(),
                previousInteractions: z.array(z.string()).optional(),
                notes: z.string().optional()
            }),
            qualification: z.object({
                decisionMaker: z.boolean(),
                influence: z.string(),
                budgetAuthority: z.boolean(),
                urgency: z.string(),
                fit: z.string()
            })
        }));
    } else {
        // Funding template
        schema = z.array(z.object({
            contactInfo: z.object({
                name: z.string(),
                email: z.string(),
                phone: z.string().optional(),
                title: z.string().optional(),
                firm: z.string().optional(),
                linkedin: z.string().optional()
            }),
            firmInfo: z.object({
                name: z.string(),
                focus: z.string().optional(),
                stage: z.string().optional(),
                location: z.string().optional(),
                website: z.string().optional()
            }),
            leadDetails: z.object({
                source: z.string(),
                status: z.string(),
                interest: z.string(),
                investmentThesis: z.string().optional(),
                pastInvestments: z.array(z.string()).optional(),
                checkSize: z.string().optional(),
                timeline: z.string().optional(),
                relevance: z.object({
                    funding: z.object({
                        stageFit: z.string(),
                        sectorFit: z.string(),
                        historyMatch: z.string(),
                        decisionProcess: z.string(),
                        portfolioHighlights: z.array(z.string()),
                        valueAdd: z.string()
                    }).optional()
                })
            }),
            communication: z.object({
                preferredChannel: z.string(),
                bestTimeToContact: z.string().optional(),
                previousInteractions: z.array(z.string()).optional(),
                notes: z.string().optional()
            }),
            qualification: z.object({
                decisionMaker: z.boolean(),
                influence: z.string(),
                urgency: z.string(),
                fit: z.string()
            })
        }));
    }

    try {
        const result = await generateObject({
            model,
            prompt,
            schema
        });

        return result.object;
    } catch (error) {
        console.error('Error analyzing leads:', error);
        throw new Error(`Failed to analyze leads: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export default leadAnalysis;