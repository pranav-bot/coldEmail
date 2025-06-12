import { auth } from "@clerk/nextjs/server"
import { db } from "@/server/db"
import { NextResponse } from "next/server"

interface WorkflowStep {
    name?: string;
    stepName?: string;
    content?: string;
    stepContent?: string;
    stepIndex?: number;
    status?: string;
}

interface WorkflowRequest {
    title: string;
    prompt: string;
    content: string;
    type: string;
    leadMessage: string;
    steps?: WorkflowStep[];
}

export async function POST(req: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const requestData = await req.json() as WorkflowRequest
        const {
            title,
            prompt,
            content,
            type,
            leadMessage,
            steps = []
        } = requestData

        // Create workflow
        const workflow = await db.workflow.create({
            data: {
                title,
                prompt,
                content,
                type,
                leadMessage,
                userId
            }
        })

        // Create workflow steps if provided
        try {
            if (steps.length > 0) {
                const stepData = steps.map((step, index) => ({
                    workflowId: workflow.id,
                    stepName: step.name ?? step.stepName ?? '',
                    stepContent: step.content ?? step.stepContent ?? '',
                    stepIndex: step.stepIndex ?? index,
                    status: step.status ?? 'pending'
                }))

                await db.workflowStep.createMany({
                    data: stepData
                })
            }
        } catch (stepError) {
            console.error('Error creating workflow steps:', stepError)
            // Continue without failing the workflow creation
        }

        return NextResponse.json(workflow)
    } catch (error) {
        console.error('Error saving workflow:', error)
        return NextResponse.json(
            { error: "Failed to save workflow" },
            { status: 500 }
        )
    }
}