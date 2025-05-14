// api/aurinko/callback/

import { exchangeCodeForAccessToken, getAccountDetails } from "@/lib/aurinko"
import { db } from "@/server/db"
import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { waitUntil} from '@vercel/functions'
import axios from "axios"

export const GET = async (req: NextRequest) => {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
            return NextResponse.json({ 
                error: 'Authentication failed',
                status: status 
            }, { status: 400 })
        }

        const code = params.get('code')
        if (!code) {
            return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 })
        }

        try {
            const token = await exchangeCodeForAccessToken(code)
            if (!token) {
                return NextResponse.json({ error: 'Failed to get access token' }, { status: 401 })
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

            // Redirect to workflows instead of mail
            return NextResponse.redirect(new URL('/workflows', req.url))

        } catch (error: any) {
            console.error('Token exchange error:', error);
            return NextResponse.json({ 
                error: error.message || 'Failed to process authentication',
                details: error.response?.data
            }, { status: 500 })
        }
    } catch (error: any) {
        console.error('Callback handler error:', error);
        return NextResponse.json({ 
            error: 'Internal server error',
            details: error.message 
        }, { status: 500 })
    }
}