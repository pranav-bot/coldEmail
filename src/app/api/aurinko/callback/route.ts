// api/aurinko/callback/

import { exchangeCodeForAccessToken, getAccountDetails } from "@/lib/aruinko"
import { db } from "@/server/db"
import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

export const GET = async (req: NextRequest) => {
    const { userId } = await auth()
    if (!userId) {
        return NextResponse.json('Unauthorized', { status: 401 })
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
            id: token.accessToken.toString()
        },
        update: {
            accessToken: token.accessToken,
        },
        create: {
            id: token.accessToken.toString(),
            userId,
            accessToken: token.accessToken,
            email: accountDetails.email,
            name: accountDetails.name,
        }
    })
    return NextResponse.redirect(new URL('/mail', req.url))
}