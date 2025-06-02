import { Template } from "@/mail-agent/enums";
import intentAgent from "@/mail-agent/intentAgent";
import buildProfile from "@/mail-agent/buildProfile";
import leadAnalysis from "@/mail-agent/leadAnalysis";
import { writeEmail, writeLinkedInMessage } from "@/mail-agent/mailWriter";
import gemini from "@/mail-agent/gemini";
import { NextResponse } from "next/server";
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const userInput = formData.get('userInput') as string
        const template = formData.get('template') as Template
        const resumeFile = formData.get('resume') as File
        const leadsFile = formData.get('leads') as File

        if (!resumeFile || !leadsFile) {
            throw new Error('Missing required files')
        }

        // Save files to temp directory
        const tempResumePath = join(tmpdir(), resumeFile.name)
        const tempLeadsPath = join(tmpdir(), leadsFile.name)

        await writeFile(tempResumePath, Buffer.from(await resumeFile.arrayBuffer()))
        await writeFile(tempLeadsPath, Buffer.from(await leadsFile.arrayBuffer()))

        // Process user intent
        const enhancedIntent = await intentAgent(userInput, template, gemini.chat('gemini-2.0-flash'))

        // Build profile with uploaded resume
        const profile = await buildProfile(
            enhancedIntent,
            tempResumePath,
            template,
            gemini.chat('gemini-2.0-flash')
        )

        // Get leads from uploaded file
        const leads = await leadAnalysis(
            tempLeadsPath,
            template,
            gemini.chat('gemini-2.0-flash')
        )

        // Generate content for each lead
        const results = await Promise.all(
            leads.map(async (lead) => {
                const emailContent = await writeEmail(
                    lead,
                    profile,
                    template,
                    gemini.chat('gemini-2.0-flash')
                )

                const linkedInContent = await writeLinkedInMessage(
                    lead,
                    profile,
                    template,
                    gemini.chat('gemini-2.0-flash')
                )

                return {
                    lead,
                    emailContent,
                    linkedInContent
                }
            })
        )

        return NextResponse.json({
            userInput,
            enhancedIntent,
            profile,
            leads: results
        })

    } catch (error) {
        console.error('Workflow error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}