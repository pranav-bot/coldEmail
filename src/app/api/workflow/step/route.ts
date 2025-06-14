import { NextResponse } from "next/server"
import { Template } from "@/mail-agent/enums"
import buildProfile from "@/mail-agent/buildProfile"
import leadAnalysis from "@/mail-agent/leadAnalysis"
import { writeEmail, writeLinkedInMessage } from "@/mail-agent/mailWriter"
import gemini from "@/mail-agent/gemini"
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const step = formData.get('step') as string
        const stepContent = formData.get('stepContent') as string
        const previousStepContent = formData.get('previousStepContent') as string
        const template = formData.get('template') as Template
        const resumeFile = formData.get('resume') as File
        const leadsFile = formData.get('leads') as File

        let content = ''

        switch (step) {
            case 'Enhanced Intent':
                // Move to profile analysis
                // Write resume to a temporary file and pass its path
                const tempResumePath = join(tmpdir(), `resume-${Date.now()}.pdf`)
                await writeFile(tempResumePath, Buffer.from(await resumeFile.arrayBuffer()))
                const profile = await buildProfile(
                    stepContent,
                    tempResumePath,
                    template,
                    gemini.chat('gemini-2.0-flash')
                )
                content = JSON.stringify(profile, null, 2)
                break

            case 'Profile Analysis':
                // Move to lead analysis
                const tempLeadsPath = join(tmpdir(), `leads-${Date.now()}.csv`)
                await writeFile(tempLeadsPath, Buffer.from(await leadsFile.arrayBuffer()))
                
                const leads = await leadAnalysis(
                    tempLeadsPath,  // Pass the temporary file path instead of ArrayBuffer
                    template,
                    gemini.chat('gemini-2.0-flash')
                )
                content = JSON.stringify(leads, null, 2)
                break

            case 'Lead Analysis':
                // Final content generation
                const analyzedLeads = JSON.parse(stepContent)
                const analyzedProfile = previousStepContent ? JSON.parse(previousStepContent) : null

                if (!analyzedProfile) {
                    throw new Error('Previous step content is required')
                }

                // Validate that analyzedLeads is an array
                if (!Array.isArray(analyzedLeads)) {
                    throw new Error('Lead Analysis data must be an array')
                }

                try {
                    const results = await Promise.all(
                        analyzedLeads.map(async (lead: any) => {
                            if (!lead || typeof lead !== 'object') {
                                throw new Error('Invalid lead object')
                            }

                            const emailContent = await writeEmail(
                                lead,
                                analyzedProfile,
                                template,
                                gemini.chat('gemini-2.0-flash')
                            )

                            const linkedInContent = await writeLinkedInMessage(
                                lead,
                                analyzedProfile,
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
                    content = JSON.stringify(results, null, 2)
                } catch (error) {
                    throw new Error(`Failed to process leads: ${error instanceof Error ? error.message : 'Unknown error'}`)
                }
                break

            case 'Generated Content':
                // Final step - just return the content as-is for saving
                content = stepContent
                break

            default:
                throw new Error('Invalid step')
        }

        return NextResponse.json({ content })

    } catch (error) {
        console.error('Step processing error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}