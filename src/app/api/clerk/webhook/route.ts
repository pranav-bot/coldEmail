import { db } from "@/server/db";
import { NextResponse } from "next/server";

interface ClerkWebhookPayload {
    id: string;
    email_addresses: Array<{
        id?: string;
        email_address: string;
        verification?: {
            status: string;
            strategy: string;
        }
    }>;
    first_name: string | null;
    last_name: string | null;
    image_url: string | null;
}

export const POST = async (req: Request) => {
    try {
        const body = await req.json() as { data: ClerkWebhookPayload };
        const { data } = body;

        const emailAddress = data.email_addresses[0]?.email_address;
        if (!emailAddress) {
            return NextResponse.json(
                { error: "Email address is required" },
                { status: 400 }
            );
        }

        const user = await db.user.upsert({
            where: { id: data.id },
            create: {
                id: data.id,
                emailAddress,
                firstName: data.first_name ?? null,
                lastName: data.last_name ?? null,
                imageUrl: data.image_url ?? null
            },
            update: {
                emailAddress,
                firstName: data.first_name ?? null,
                lastName: data.last_name ?? null,
                imageUrl: data.image_url ?? null
            }
        });

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
        );
    }
}