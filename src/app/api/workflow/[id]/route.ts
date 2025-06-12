import { auth } from "@clerk/nextjs/server"
import { db } from "@/server/db"
import { NextResponse } from "next/server"

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const workflow = await db.workflow.findUnique({
            where: {
                id: params.id,
                userId, // Ensure user owns the workflow
            },
            include: {
                steps: {
                    orderBy: {
                        stepIndex: 'asc'
                    }
                }
            }
        })

        if (!workflow) {
            return NextResponse.json(
                { error: "Workflow not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(workflow)
    } catch (error) {
        console.error('Error loading workflow:', error)
        return NextResponse.json(
            { error: "Failed to load workflow" },
            { status: 500 }
        )
    }
}
