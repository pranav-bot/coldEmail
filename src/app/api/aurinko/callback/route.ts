// api/aurinko/callback/

import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
export const GET = async (req: Request) => {
    const { userId } = await auth()
    if (!userId) {
        return new Response('Unauthorized', { status: 401 })
    }
    console.log('userId', userId)
    return NextResponse.json({ message: 'Hello, world!' })
    
}