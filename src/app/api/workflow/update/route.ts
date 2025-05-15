import { auth } from "@clerk/nextjs/server"
import { db } from "@/server/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { workflowId, step, content, generatedContent } = await req.json()
        
        if (!workflowId) {
            return NextResponse.json(
                { error: "Workflow ID is required" },
                { status: 400 }
            )
        }

        const updateData: any = {}

        switch (step) {
            case 'Enhanced Intent':
                updateData.prompt = content
                break
            case 'Profile Analysis':
                updateData.content = content
                break
            case 'Lead Analysis':
                updateData.leadMessage = content
                break
            case 'Generated Content':
                updateData.generatedContent = content
                break
            default:
                return NextResponse.json(
                    { error: "Invalid step" },
                    { status: 400 }
                )
        }

        const workflow = await db.workflow.update({
            where: {
                id: workflowId,
                userId, // Ensure user owns the workflow
            },
            data: updateData
        })

        return NextResponse.json(workflow)
    } catch (error) {
        console.error('Error updating workflow:', error)
        return NextResponse.json(
            { error: "Failed to update workflow" },
            { status: 500 }
        )
    }
}