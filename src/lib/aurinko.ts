//TODO: fix aurinko spelling error
'use server'

import axios from 'axios'
import { auth } from "@clerk/nextjs/server";

export const getAurinkoAuthUrl = async (
  serviceType: "Google" | "Office365",
) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const params = new URLSearchParams({
    clientId: process.env.AURINKO_CLIENT_ID!,
    serviceType: serviceType,
    scopes: 'Mail.Read Mail.ReadWrite Mail.Send Mail.Drafts Mail.All',
    response_type: 'code',
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/aruinko/callback`,
  });

  console.log(params.toString());

  return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`;
};

export const exchangeCodeForAccessToken = async (code: string) => {
  try {
    const response = await axios.post(`https://api.aurinko.io/v1/auth/token/${code}`, {}, {
      auth: {
        username: process.env.AURINKO_CLIENT_ID!,
        password: process.env.AURINKO_CLIENT_SECRET!,
      }
    })

    return response.data as {
      accountId: string,
      accessToken: string,
      userId: string,
      userSession: string,
    }
  } catch (error) {
    if(axios.isAxiosError(error)){
      console.error(error.response?.data)
    }
    console.error(error)
  }
}

export const getAccountDetails = async (accessToken: string) => {
  try {
    const response = await axios.get(`https://api.aurinko.io/v1/account`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    })

    return response.data as {
      email: string,
      name: string,
    }
  } catch (error) {
    if(axios.isAxiosError(error)){
      console.error(error.response?.data)
    }
    else{
      console.error(error)
    }
    console.error(error)
  }
}
