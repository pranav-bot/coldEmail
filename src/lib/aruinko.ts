//TODO: why use server is required?
'use server'

import { auth } from "@clerk/nextjs/server";

export const getAruinkoAuthUrl = async (
  serviceType: "Google" | "Office365",
) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const params = new URLSearchParams({
    clientId: process.env.ARUINKO_CLIENT_ID!,
    serviceType: serviceType,
    scopes: 'Mail.Read Mail.ReadWrite Mail.Send Mail.Drafts Mail.All',
    response_type: 'code',
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/aruinko/callback`,
  });

  console.log(params.toString());

  return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`;
};
