import {tool as createTool} from 'ai'
import { z } from 'zod'
import fs from 'fs/promises'
import { pdfToText } from 'pdf-ts'

const parsePdf = createTool({
    description: "Parse a PDF file and extract its text content.",
    parameters: z.object({
        filePath: z.string().describe("The path to the PDF file to be parsed."),
    }),
    execute: async ({ filePath }) => {
        try {
            const dataBuffer = await fs.readFile(filePath)
            const text = await pdfToText(dataBuffer)
            return text
        }
        catch (error) {
            console.error("Error reading file:", error);
            throw new Error("Failed to read the PDF file.");
        }
    }
})

export const tools = {
    parsePdf
}

// const data = await fs.readFile('src/mail-agent/PranavAdvaniResume.pdf')
// const text = await pdfToText(data)
// console.log(text)

