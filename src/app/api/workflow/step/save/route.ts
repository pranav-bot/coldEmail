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

        const { workflowId, stepName, stepContent, stepIndex, status } = await req.json()

        if (!workflowId || !stepName) {
            return NextResponse.json(
                { error: "Missing required fields" },
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

        // Check if step already exists
        const existingStep = await db.workflowStep.findFirst({
            where: {
                workflowId,
                stepName
            }
        })

        let step
        if (existingStep) {
            // Update existing step
            step = await db.workflowStep.update({
                where: {
                    id: existingStep.id
                },
                data: {
                    stepContent: stepContent || '',
                    status: status || 'pending',
                    stepIndex: stepIndex || 0
                }
            })
        } else {
            // Create new step
            step = await db.workflowStep.create({
                data: {
                    workflowId,
                    stepName,
                    stepContent: stepContent || '',
                    stepIndex: stepIndex || 0,
                    status: status || 'pending'
                }
            })
        }

        return NextResponse.json(step)
    } catch (error) {
        console.error('Error saving workflow step:', error)
        return NextResponse.json(
            { error: "Failed to save workflow step" },
            { status: 500 }
        )
    }
}
