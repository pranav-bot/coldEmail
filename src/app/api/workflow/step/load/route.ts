import { auth } from "@clerk/nextjs/server"
import { db } from "@/server/db"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const url = new URL(req.url)
        const workflowId = url.searchParams.get('workflowId')

        if (!workflowId) {
            return NextResponse.json(
                { error: "Missing workflowId parameter" },
                { status: 400 }
            )
        }

        // Verify user owns the workflow
        const workflow = await db.workflow.findFirst({
            where: {
                id: workflowId,
                userId
            }
        })

        if (!workflow) {
            return NextResponse.json(
                { error: "Workflow not found or access denied" },
                { status: 404 }
            )
        }

        // Get all steps for the workflow
        const steps = await db.workflowStep.findMany({
            where: {
                workflowId
            },
            orderBy: {
                stepIndex: 'asc'
            }
        })

        return NextResponse.json(steps)
    } catch (error) {
        console.error('Error loading workflow steps:', error)
        return NextResponse.json(
            { error: "Failed to load workflow steps" },
            { status: 500 }
        )
    }
}
