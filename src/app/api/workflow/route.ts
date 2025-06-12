import { Template } from "@/mail-agent/enums";
import intentAgent from "@/mail-agent/intentAgent";
import gemini from "@/mail-agent/gemini";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const userInput = formData.get('userInput') as string
        const template = formData.get('template') as Template

        if (!userInput || !template) {
            throw new Error('Missing required userInput or template')
        }

        // Process user intent - this is the only step in this workflow
        const enhancedIntent = await intentAgent(userInput, template, gemini.chat('gemini-2.0-flash'))

        return NextResponse.json({
            userInput,
            template,
            enhancedIntent
        })

    } catch (error) {
        console.error('Workflow error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}