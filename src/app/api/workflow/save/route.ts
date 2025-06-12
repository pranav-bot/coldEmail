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
            title: string;
            prompt: string;
            content: string;
            type: string;
            leadMessage: string;
            steps?: Array<{
                name: string;
                content: string;
                status: string;
            }>;
        }

        const { title, prompt, content, type, leadMessage, steps } = body

        // Create workflow with steps in a transaction
        const workflow = await db.$transaction(async (prisma) => {
            // Create the workflow
            const newWorkflow = await prisma.workflow.create({
                data: {
                    title,
                    prompt,
                    content: content || "", // Provide default empty string if content is undefined
                    type,
                    leadMessage: leadMessage || "", // Provide default empty string if leadMessage is undefined
                    userId
                }
            })

                if (steps && Array.isArray(steps)) {
                    const stepData = steps.map((step, index) => ({
                        workflowId: newWorkflow.id,
                        stepName: step.name,
                        stepIndex: index,
                        content: step.content || '',
                        status: step.status || 'pending'
                    }))

                    await prisma.workflowStep.createMany({
                        data: stepData
                    })
                }

            return newWorkflow
        })

        // Return workflow with steps
        const workflowWithSteps = await db.workflow.findUnique({
            where: { id: workflow.id },
            include: {
                steps: {
                    orderBy: {
                        stepIndex: 'asc'
                    }
                }
            }
        })

        return NextResponse.json(workflowWithSteps)
    } catch (error) {
        console.error('Error saving workflow:', error)
        return NextResponse.json(
            { error: "Failed to save workflow" },
            { status: 500 }
        )
    }
}