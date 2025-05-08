import { z } from "zod";
import { generateObject, type LanguageModelV1 } from 'ai';
import { tools } from "./tools";
import path from 'path';

const resumeAgent = async (resumePath: string, model: LanguageModelV1) => {
    // Ensure the file path is absolute
    const absolutePath = path.resolve(resumePath);
    
    // First get the PDF content
    const pdfContent = await tools.parsePdf.execute(
        { filePath: absolutePath },
        { toolCallId: 'pdf-parse', messages: [] }
    );
    
    const resumePrompt = `
    You are a resume parser. Your task is to extract and format the contents of the provided resume into a structured format.
    Here is the resume content to parse:
    
    ${pdfContent}
    
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
    
    try {
        const result = await generateObject({
            model: model,
            prompt: resumePrompt,
            schema: z.object({
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
            })
        });
        
        // Clean up the response
        const cleanedResult = {
            ...result.object,
            summary: result.object.summary.trim().replace(/\n+/g, ' '),
            personalInfo: result.object.personalInfo.trim(),
            experience: result.object.experience.map(exp => ({
                ...exp,
                description: exp.description.trim().replace(/\n+/g, ' ')
            })),
            education: result.object.education.map(edu => ({
                ...edu,
                details: edu.details?.trim().replace(/\n+/g, ' ')
            }))
        };
        
        return cleanedResult;
    } catch (error) {
        console.error('Error processing resume:', error);
        throw new Error(`Failed to process resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export default resumeAgent;