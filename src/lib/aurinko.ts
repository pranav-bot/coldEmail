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
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/aurinko/callback`,
  });

  return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`;
};

export const exchangeCodeForAccessToken = async (code: string) => {
  try {
    const response = await axios.post(`https://api.aurinko.io/v1/auth/token`, {
      code,
      clientId: process.env.AURINKO_CLIENT_ID!,
      clientSecret: process.env.AURINKO_CLIENT_SECRET!,
    });

    return response.data as {
      accountId: string,
      accessToken: string,
      userId: string,
      userSession: string,
    }
  } catch (error) {
    if(axios.isAxiosError(error)){
      const errorMessage = error.response?.data?.message ?? 'Unknown error';
      console.error('Aurinko API Error:', error.response?.data);
      throw new Error(`Failed to exchange code for token: ${errorMessage}`);
    }
    console.error('Unexpected error:', error);
    throw error;
  }
}

export const getAccountDetails = async (token: string) => {
  try {
    const response = await axios.get(`https://api.aurinko.io/v1/account`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    return response.data as {
      emailAddress: string,
      firstName: string,
    }
  } catch (error) {
    if(axios.isAxiosError(error)){
      const errorMessage = error.response?.data?.message ?? 'Unknown error';
      console.error('Aurinko API Error:', error.response?.data);
      throw new Error(`Failed to get account details: ${errorMessage}`);
    }
    console.error('Unexpected error:', error);
    throw error;
  }
}
