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

        const {
            title,
            prompt,
            content,
            type,
            leadMessage
        } = await req.json()

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

        return NextResponse.json(workflow)
    } catch (error) {
        console.error('Error saving workflow:', error)
        return NextResponse.json(
            { error: "Failed to save workflow" },
            { status: 500 }
        )
    }
}