import gemini from './gemini';
import intentAgent from './intentAgent';
import { Template } from './enums';
import leadAnalysis from './leadAnalysis';
import path from 'path';
import { fileURLToPath } from 'url';
import buildProfile, { type JobProfile, type FreelanceProfile } from './buildProfile';
import { writeEmail, writeLinkedInMessage } from './mailWriter';

// Get the directory path in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const userInput = "My goal is to find a job as fast as possible in the field of AI and ML in large tech companies. I have experience in Python, TensorFlow, and data analysis. I am looking for roles like Data Scientist or Machine Learning Engineer. I prefer to work in companies that are innovative and have a strong focus on AI research.";

const user_intent = await intentAgent(userInput, Template.JobSearch, gemini.chat('gemini-2.0-flash')).then((result) => {
    console.log(result);
    return result;
}).catch((error) => {
    console.log("Error:", error);
    return ""; // Provide a fallback value in case of error
});

const profile: Promise<string | JobProfile | FreelanceProfile> = buildProfile(user_intent, 'src/mail-agent/PranavAdvaniResume.pdf', Template.JobSearch, gemini.chat('gemini-2.0-flash')).then((result) => {
    console.log(result);
    return result;
}).catch((error) => {
    console.error("Error:", error);
    return ""; // Provide a fallback value in case of error
});

const leads = leadAnalysis(
    path.join(__dirname, 'jobs - Sheet1.csv'),
    Template.JobSearch,
    gemini.chat('gemini-2.0-flash')
).then((leads) => {
    console.log("\nJob Search Leads Analysis:");
    leads.forEach((lead, index) => {
        console.log(`\nLead ${index + 1}:`);
        console.log("Contact:", lead.contactInfo.name, `(${lead.contactInfo.email})`);
        console.log("Company:", lead.companyInfo.name);
        console.log("Role Match:", lead.leadDetails.relevance.jobSearch?.roleMatch);
        console.log("Industry Match:", lead.leadDetails.relevance.jobSearch?.industryMatch);
        console.log("Fit:", lead.qualification.fit);
        console.log("Urgency:", lead.qualification.urgency);
    });
    return leads;
}).catch((error) => {
    console.error("Error in job search lead analysis:", error);
    return []; // Provide a fallback value in case of error
});

leads.then(async (leads) => {
    await profile.then(async (profile) => {
        if (profile && leads.length > 0) {
            const template = Template.JobSearch; // Assuming you want to use the JobSearch template

            // Process each lead and generate communications
            for (let i = 0; i < leads.length; i++) {
                const lead = leads[i];
                console.log(`\nProcessing Lead ${i + 1}: ${lead?.contactInfo.name}`);

                // Generate email content
                try {
                    const emailContent = await writeEmail(lead, profile as JobProfile, template, gemini.chat('gemini-2.0-flash'));
                    console.log("\nGenerated Email Content:");
                    console.log("Subject:", emailContent.subject);
                    console.log("Body:", emailContent.body);
                } catch (error) {
                    console.error(`Error generating email for Lead ${i + 1}:`, error);
                }                // Generate LinkedIn message content
                try {
                    const linkedInContent = await writeLinkedInMessage(lead, profile as JobProfile, template, gemini.chat('gemini-2.0-flash'));
                    console.log("\nGenerated LinkedIn Message Content:");
                    console.log("Message:", linkedInContent.message);
                    console.log("To:", linkedInContent.to);
                } catch (error) {
                    console.error(`Error generating LinkedIn message for Lead ${i + 1}:`, error);
                }
            }
        }
    });
}).catch((error) => {
    console.error("Error in lead analysis:", error);
});