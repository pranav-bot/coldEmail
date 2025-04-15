import { db } from "@/server/db"
import { NextRequest, NextResponse } from "next/server"

export const POST = async (req: NextRequest) => {
    try {
        const data = {
            data: {
                id: "user_29w83sxmDNGwOuEthce5gg56FcC",
                email_addresses: [{
                    email_address: "example@example.org",
                    id: "idn_29w83yL7CwVlJXylYLxcslromF1",
                    verification: {
                        status: "verified",
                        strategy: "ticket"
                    }
                }],
                first_name: "Example",
                last_name: "Example",
                image_url: "https://img.clerk.com/xxxxxx",
                created_at: 1654012591514,
                updated_at: 1654012591835
            }
        }

        const emailAddress = data.data.email_addresses[0]?.email_address
        if (!emailAddress) {
            return NextResponse.json(
                { error: "Email address is required" },
                { status: 400 }
            )
        }

        const user = await db.user.upsert({
            where: {
                id: data.data.id
            },
            create: {
                id: data.data.id,
                emailAddress,
                firstName: data.data.first_name ?? null,
                lastName: data.data.last_name ?? null,
                imageUrl: data.data.image_url ?? null
            },
            update: {
                emailAddress,
                firstName: data.data.first_name ?? null,
                lastName: data.data.last_name ?? null,
                imageUrl: data.data.image_url ?? null
            }
        })

        return NextResponse.json({ success: true, user })
    } catch (error) {
        console.error("Error creating user:", error)
        return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
        )
    }
} 