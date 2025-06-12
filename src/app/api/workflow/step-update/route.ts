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

        const body = await req.json() as {
            workflowId: string;
            stepName: string;
            stepIndex: number;
            content: string;
            status: string;
        }

        const { workflowId, stepName, stepIndex, content, status } = body
        
        if (!workflowId || stepIndex === undefined) {
            return NextResponse.json(
                { error: "Workflow ID and step index are required" },
                { status: 400 }
            )
        }

        // Verify user owns the workflow
        const workflow = await db.workflow.findUnique({
            where: {
                id: workflowId,
                userId,
            }
        })

        if (!workflow) {
            return NextResponse.json(
                { error: "Workflow not found" },
                { status: 404 }
            )
        }

        // Upsert the step (update if exists, create if not)
        const step = await db.workflowStep.upsert({
            where: {
                workflowId_stepIndex: {
                    workflowId,
                    stepIndex
                }
            },
            update: {
                content,
                status,
                stepName
            },
            create: {
                workflowId,
                stepName,
                stepIndex,
                content,
                status
            }
        })

        // Also update the main workflow's currentStep
        await db.workflow.update({
            where: { id: workflowId },
            data: {
                currentStep: stepIndex,
                updatedAt: new Date()
            }
        })

        return NextResponse.json(step)
    } catch (error) {
        console.error('Error updating workflow step:', error)
        return NextResponse.json(
            { error: "Failed to update workflow step" },
            { status: 500 }
        )
    }
}
