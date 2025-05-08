import { generateObject, type LanguageModelV1 } from 'ai';
import { z } from 'zod';

const targetAgent = async (propmpt: string, model: LanguageModelV1) => {
  const jobAnalysisPrompt = `
Analyze this job search query to identify:
1. Primary goal (job type/level: entry-level, senior, internship, etc.)
2. Target industry/sector
3. Required technical/non-technical skills
4. Ideal company size/stage (startup, enterprise, etc.)

For "${propmpt}", identify:
- Target roles to contact (hiring managers, recruiters, team leads)
- Relevant industries/verticals
- Target companies (if specified or implied)
- Key value propositions to highlight

Format response as JSON with:
{
  "goal": "",
  "industry": "",
  "targetRoles": [],
  "targetTitles": [],
  "keySkills": [],
  "companyCriterias": ""
}
`;
const result = await generateObject({
    model: model,
    prompt: jobAnalysisPrompt,
    schema: z.object({
        goal: z.string(),
        industry: z.string(),
        targetRoles: z.array(z.string()),
        targetTitles: z.array(z.string()),
        keySkills: z.array(z.string()),
        companyCriterias: z.array(z.string()),
    })
  });
  return result.object;

}
;

export default targetAgent;
