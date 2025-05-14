import axios from "axios";
import type { EmailAddress, EmailMessage, SyncResponse, SyncUpdatedResponse } from "./types";
import { db } from "@/server/db";
import { syncEmailsToDatabase } from "./sync-to-db";

export class Account {
    private token: string;

    constructor(token: string) {
        this.token = token;
    }

    private async startSync() {
        console.log('Starting initial sync with token:', this.token.substring(0, 10) + '...');
        
        const response = await axios.post<SyncResponse>(`https://api.aurinko.io/v1/email/sync`, {}, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            params: {
                daysWithin: 2, // Increased from 2 to 30 days
                bodyType: 'html',
                includeDeleted: false,
                includeSpam: false,
                includeAttachments: true
            }
        });

        console.log('Initial sync full response:', {
            status: response.status,
            ready: response.data.ready,
            hasToken: !!response.data.syncUpdatedToken,
            fullResponse: response.data
        });

        return response.data;
    }

    async getUpdatedEmails({deltaToken, pageToken}: {deltaToken?: string, pageToken?: string}) {
        const params: Record<string, string> = {}
        if (deltaToken) params.deltaToken = deltaToken;
        if (pageToken) params.pageToken = pageToken;

        console.log('Fetching updated emails:', {
            deltaToken: deltaToken?.substring(0, 20) + '...',
            pageToken,
            fullParams: params
        });

        const response = await axios.get<SyncUpdatedResponse>(`https://api.aurinko.io/v1/email/sync/updated`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            params
        });

        console.log('Updated emails response:', {
            status: response.status,
            recordCount: response.data.records?.length ?? 0,
            hasNextPage: !!response.data.nextPageToken,
            hasNextDelta: !!response.data.nextDeltaToken,
            fullResponse: response.data
        });

        return response.data;
    }

    async performInitialSync() {
        try {
            // Force a new initial sync by clearing any existing delta token
            const account = await db.account.findUnique({
                where: { token: this.token },
            });

            if (account) {
                await db.account.update({
                    where: { id: account.id },
                    data: { nextDeltaToken: null }
                });
            }

            let syncResponse = await this.startSync();
            let retries = 0;
            const maxRetries = 5;

            while (!syncResponse.ready && retries < maxRetries) {
                console.log(`Waiting for sync (attempt ${retries + 1}/${maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, 2000)); // Increased wait time
                syncResponse = await this.startSync();
                retries++;
            }

            if (!syncResponse.ready) {
                throw new Error("Initial sync failed to become ready after max retries");
            }

            if (!syncResponse.syncUpdatedToken) {
                throw new Error("No sync token received from initial sync");
            }

            let storedDeltaToken = syncResponse.syncUpdatedToken;
            let updatedResponse = await this.getUpdatedEmails({deltaToken: storedDeltaToken});
            let allEmails: EmailMessage[] = updatedResponse.records;

            if (updatedResponse.nextDeltaToken) {
                storedDeltaToken = updatedResponse.nextDeltaToken;
            }

            while (updatedResponse.nextPageToken) {
                updatedResponse = await this.getUpdatedEmails({pageToken: updatedResponse.nextPageToken});
                allEmails = allEmails.concat(updatedResponse.records);
                if (updatedResponse.nextDeltaToken) {
                    storedDeltaToken = updatedResponse.nextDeltaToken;
                }
            }

            console.log("Initial sync complete with delta token:", storedDeltaToken);
            return {
                emails: allEmails,
                deltaToken: storedDeltaToken
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Sync error details:', {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data,
                    headers: error.response?.headers
                });
                throw new Error(`Sync failed: ${error.response?.data?.message || error.message}`);
            }
            throw error;
        }
    }

    async syncEmails() {
        const account = await db.account.findUnique({
            where: { token: this.token },
        });

        if (!account) throw new Error("Account not found");

        // If no delta token, perform initial sync
        if (!account.nextDeltaToken) {
            console.log("No delta token found, performing initial sync");
            const initialSync = await this.performInitialSync();
            if (!initialSync?.deltaToken) {
                throw new Error("Failed to get delta token from initial sync");
            }
            return initialSync;
        }

        let response = await this.getUpdatedEmails({deltaToken: account.nextDeltaToken});
        let storedDeltaToken: string | undefined = account.nextDeltaToken;
        let allEmails: EmailMessage[] = response.records;
        if (response.nextDeltaToken) {
            storedDeltaToken = response.nextDeltaToken;
        }
        while (response.nextPageToken) {
            response = await this.getUpdatedEmails({pageToken: response.nextPageToken});
            allEmails = allEmails.concat(response.records);
            if (response.nextDeltaToken) {
                storedDeltaToken = response.nextDeltaToken;
            }
        }

        try {
            await syncEmailsToDatabase(allEmails, account.id);
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error syncing emails: ", error.response?.data)
            }
            else {
                console.error("Error syncing emails: ", error)
            }
        }
        await db.account.update({
            where: {
                id: account.id
            },
            data: {
                nextDeltaToken: storedDeltaToken
            }
        })
        console.log("sync complete")
        return {
            emails: allEmails,
            deltaToken: storedDeltaToken
        }
    }

    async sendEmail({
        from,
        subject,
        body,
        inReplyTo,
        threadId,
        references,
        to,
        cc,
        bcc,
        replyTo

    }: {from: EmailAddress,
        subject: string,
        body: string,
        inReplyTo?: string,
        threadId?: string,
        references?: string[],
        to: EmailAddress[],
        cc?: EmailAddress[],
        bcc?: EmailAddress[],
        replyTo?: EmailAddress
    }){
        try{
            const response = await axios.post(`https://api.aurinko.io/v1/email/messages`, {
                from,
                subject,
                body,
                inReplyTo,
                threadId,
                references,
                to,
                cc,
                bcc,
                replyTo: [replyTo]
            }, {
                params: {
                    returnIds: true
                },
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            })

            return response.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error sending email: ", error.response?.data)
            }
            else {
                console.error("Error sending email: ", error)
            }
        }
    }
}