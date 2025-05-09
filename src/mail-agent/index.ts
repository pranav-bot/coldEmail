import targetAgent from './targetAgent';
import gemini from './gemini';
import contentAnalzyer from './contentAnalyzer';
import intentAgent from './intentAgent';
import { Template } from './enums';
import { error } from 'console';
import leadAnalysis from './leadAnalysis';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory path in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const userInput = "My goal is to find a job as fast as possible in the field of AI and ML in large tech companies. I have experience in Python, TensorFlow, and data analysis. I am looking for roles like Data Scientist or Machine Learning Engineer. I prefer to work in companies that are innovative and have a strong focus on AI research.";

intentAgent(userInput, Template.JobSearch, gemini.chat('gemini-1.5-flash')).then((result) => {
    console.log(result);
}).catch((error)=>{
    console.log("Error:", error)
})

// targetAgent(userInput, gemini.chat('gemini-1.5-flash')).then((result) => {
//     console.log("Goal:", result.goal);
//     console.log("Industry:", result.industry);
//     console.log("Target Roles:", result.targetRoles.join(", "));
//     console.log("Target Titles:", result.targetTitles.join(", "));
//     console.log("Key Skills:", result.keySkills.join(", "));
//     console.log("Company Criteria:", result.companyCriterias.join(", "));
// }

// ).catch((error) => {
//     console.error("Error:", error);
// })

// resumeAgent('src/mail-agent/PranavAdvaniResume.pdf', gemini.chat('gemini-1.5-flash')).then((result) => {
//     console.log("Resume:", result);
// }).catch((error) => {
//     console.error("Error:", error);
// })

contentAnalzyer('src/mail-agent/PranavAdvaniResume.pdf',  Template.JobSearch, gemini.chat('gemini-1.5-flash')).then((result)=> {
    console.log(result)
}).catch((error)=>{
    console.error("error", error)
})

// Test lead analysis with job search template
console.log("\n=== Testing Lead Analysis with Job Search Template ===");
leadAnalysis(
    path.join(__dirname, 'jobs - Sheet1.csv'),
    Template.JobSearch,
    gemini.chat('gemini-1.5-flash')
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
}).catch((error) => {
    console.error("Error in job search lead analysis:", error);
});

// Test lead analysis with sales template
console.log("\n=== Testing Lead Analysis with Sales Template ===");
leadAnalysis(
    path.join(__dirname, 'jobs.xlsx'),
    Template.Sales,
    gemini.chat('gemini-1.5-flash')
).then((leads) => {
    console.log("\nSales Leads Analysis:");
    leads.forEach((lead, index) => {
        console.log(`\nLead ${index + 1}:`);
        console.log("Contact:", lead.contactInfo.name, `(${lead.contactInfo.email})`);
        console.log("Company:", lead.companyInfo.name);
        console.log("Product Fit:", lead.leadDetails.relevance.sales?.productFit);
        console.log("Market Segment:", lead.leadDetails.relevance.sales?.marketSegment);
        console.log("Decision Maker:", lead.qualification.decisionMaker);
        console.log("Budget Authority:", lead.qualification.budgetAuthority);
    });
}).catch((error) => {
    console.error("Error in sales lead analysis:", error);
});
