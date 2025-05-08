import targetAgent from './targetAgent';
import gemini from './gemini';
import resumeAgent from './resumeAgent';

const userInput = "My goal is to find a job as fast as possible in the field of AI and ML in large tech companies. I have experience in Python, TensorFlow, and data analysis. I am looking for roles like Data Scientist or Machine Learning Engineer. I prefer to work in companies that are innovative and have a strong focus on AI research.";

targetAgent(userInput, gemini.chat('gemini-1.5-flash')).then((result) => {
    console.log("Goal:", result.goal);
    console.log("Industry:", result.industry);
    console.log("Target Roles:", result.targetRoles.join(", "));
    console.log("Target Titles:", result.targetTitles.join(", "));
    console.log("Key Skills:", result.keySkills.join(", "));
    console.log("Company Criteria:", result.companyCriterias.join(", "));
}

).catch((error) => {
    console.error("Error:", error);
})

resumeAgent('src/mail-agent/PranavAdvaniResume.pdf', gemini.chat('gemini-1.5-flash')).then((result) => {
    console.log("Resume:", result);
}).catch((error) => {
    console.error("Error:", error);
})
