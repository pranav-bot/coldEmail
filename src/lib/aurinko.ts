//TODO: fix aurinko spelling error
'use server'

import axios from 'axios'
import { auth } from "@clerk/nextjs/server";

export const getAurinkoAuthUrl = async (
  serviceType: "Google",
) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const params = new URLSearchParams({
    clientId: process.env.AURINKO_CLIENT_ID!,
    serviceType: serviceType,
    scopes: 'Mail.Read Mail.ReadWrite Mail.Send Mail.Drafts Mail.All',
    response_type: 'code',
    //TODO: use env variable
    returnUrl: `http://localhost:3000/api/aurinko/callback`,
  });


  console.log("Params: ", params)

  return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`;
};

export const exchangeCodeForAccessToken = async (code: string) => {
  try {
        const response = await axios.post(`https://api.aurinko.io/v1/auth/token/${code}`,
            {},
            {
                auth: {
                    username: process.env.AURINKO_CLIENT_ID as string,
                    password: process.env.AURINKO_CLIENT_SECRET as string,
                }
            }
        );

        return response.data as {
            accountId: number,
            accessToken: string,
            userId: string,
            userSession: string
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching Aurinko token:', error.response?.data);
        } else {
            console.error('Unexpected error fetching Aurinko token:', error);
        }
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
