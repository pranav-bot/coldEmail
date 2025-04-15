// api/aurinko/callback/

import { exchangeCodeForAccessToken, getAccountDetails } from "@/lib/aurinko"
import { db } from "@/server/db"
import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { waitUntil} from '@vercel/functions'
import axios from "axios"

export const GET = async (req: NextRequest) => {
    const { userId } = await auth()
    if (!userId) {
        return NextResponse.json('Unauthorized', { status: 401 })
    }

    // Check if user exists in database
    const user = await db.user.findUnique({
        where: { id: userId }
    })

    if (!user) {
        // Trigger Clerk webhook to create user
        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_APP_URL}/api/clerk/webhook`,
                {
                    data: {
                        id: userId
                    }
                }
            );
        } catch (error) {
            return NextResponse.json(
                { 
                    error: 'Failed to create user profile. Please try again.',
                    code: 'USER_CREATION_FAILED'
                },
                { status: 500 }
            );
        }
    }

    const params = req.nextUrl.searchParams
    const status = params.get('status')
    if (status !== 'success') {
        return NextResponse.json('Failed to link account', { status: 401 })
    }

    const code = params.get('code')
    if (!code) {
        return NextResponse.json('No code provided', { status: 400 })
    }
    const token = await exchangeCodeForAccessToken(code)
    if (!token) {
        return NextResponse.json('Failed to get access token', { status: 401 })
    }
    const accountDetails = await getAccountDetails(token.accessToken)
    await db.account.upsert({
        where: {
            id: token.accountId.toString()
        },
        update: {
            token: token.accessToken,
        },
        create: {
            id: token.accountId.toString(),
            userId,
            emailAddress: accountDetails?.emailAddress ?? "",
            name: accountDetails?.firstName ?? "",
            provider: "Google",
            token: token.accessToken,
        }
    })
    waitUntil(
        axios.post(`${process.env.NEXT_PUBLIC_APP_URL}/api/initial-sync`, {
            accountId: token.accountId.toString(),
            userId,
        })
    )
    return NextResponse.redirect(new URL('/mail', req.url))
}