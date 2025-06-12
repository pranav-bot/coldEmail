import { auth } from "@clerk/nextjs/server"
import { db } from "@/server/db"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const workflows = await db.workflow.findMany({
            where: {
                userId
            },
            include: {
                steps: {
                    orderBy: {
                        stepIndex: 'asc'
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(workflows)
    } catch (error) {
        console.error('Error loading workflows:', error)
        return NextResponse.json(
            { error: "Failed to load workflows" },
            { status: 500 }
        )
    }
}