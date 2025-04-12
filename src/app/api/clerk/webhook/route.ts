import { db } from "@/server/db";

export const POST = async (req: Request) =>  {
    const {data} = await req.json();
    console.log('clerk received new data', data);
    const id = data.id;
    const email = data.email_addresses[0].email_address;
    const firstName = data.first_name;
    const lastName = data.last_name;
    const imageUrl = data.image_url;

    await db.user.create({
        data: {
            id: id,
            email: email,
            fistName: firstName,
            lastName: lastName,
            imageUrl: imageUrl,
        }
    })
    console.log('user created');
    return new Response('Webhook received', {status: 200});
}