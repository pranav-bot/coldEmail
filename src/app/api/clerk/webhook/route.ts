import { db } from "@/server/db";

interface ClerkWebhookPayload {
    id: string;
    email_addresses: Array<{
        email_address: string;
    }>;
    first_name: string;
    last_name: string;
    image_url: string;
}

export const POST = async (req: Request) => {
    const { data } = await req.json() as { data: ClerkWebhookPayload };
    console.log('clerk received new data', data);
    
    const { id, email_addresses, first_name, last_name, image_url } = data;
    
    if (!email_addresses?.[0]?.email_address) {
        return new Response('No email address provided', { status: 400 });
    }
    
    const email = email_addresses[0].email_address;

    await db.user.create({
        data: {
            id,
            email,
            fistName: first_name,
            lastName: last_name,
            imageUrl: image_url,
        }
    });
    console.log('user created');
    return new Response('Webhook received', { status: 200 });
}