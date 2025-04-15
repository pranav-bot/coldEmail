import { db } from "@/server/db";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

interface ClerkWebhookPayload {
    id: string;
    email_addresses: Array<{
        id?: string;
        email_address: string;
    }>;
    first_name: string | null;
    last_name: string | null;
    image_url: string | null;
}

export const POST = async (req: Request) => {
    try {
        const body = await req.json() as { data: ClerkWebhookPayload };
        const { data } = body;
        const { id } = data;

        // Fetch the complete user data from Clerk
        const clerkUser = await (await clerkClient()).users.getUser(id)
        if (!clerkUser) {
            return NextResponse.json({ error: 'User not found in Clerk' }, { status: 404 });
        }

        // Get the primary email
        const primaryEmail = clerkUser.emailAddresses.find(
            email => email.id === clerkUser.primaryEmailAddressId
        );

        if (!primaryEmail) {
            return NextResponse.json({ error: 'No primary email found' }, { status: 400 });
        }

        const user = await db.user.upsert({
            where: { id },
            create: {
                id,
                emailAddress: primaryEmail.emailAddress,
                firstName: clerkUser.firstName ?? "",
                lastName: clerkUser.lastName ?? "",
                imageUrl: clerkUser.imageUrl ?? "",
            },
            update: {
                emailAddress: primaryEmail.emailAddress,
                firstName: clerkUser.firstName ?? "",
                lastName: clerkUser.lastName ?? "",
                imageUrl: clerkUser.imageUrl ?? "",
            }
        });

        return NextResponse.json({ success: true, user });
    } catch (error) {
        return NextResponse.json({ 
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}