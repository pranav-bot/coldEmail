import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { db } from "@/server/db";
import { type Prisma } from "@prisma/client";

export const accountRouter = createTRPCRouter({
    getAccounts: privateProcedure.query(async ({ctx}) => {
        return await ctx.db.account.findMany({
            where: {
                userId: ctx.auth.userId,
            },
            select: {
                id: true,
                name: true,
                emailAddress: true,
            },
        });
    }),
    getNumThreads: privateProcedure.input(z.object({
        accountId: z.string(),
        tab: z.enum(['inbox', 'drafts', 'sent']),
    })).query(async ({ctx, input}) => {
        console.log('Getting thread count for:', { accountId: input.accountId, tab: input.tab });
        
        const account = await db.account.findFirst({
            where: {
                id: input.accountId,
                userId: ctx.auth.userId,
            },
            select: {
                id: true,
                token: true,
            },
        });

        if (!account) {
            console.log('Account not found:', input.accountId);
            throw new Error('Account not found');
        }

        // First, get the total thread count for this account
        const totalThreads = await ctx.db.thread.count({
            where: {
                accountId: account.id,
            }
        });

        console.log('Total threads for account:', totalThreads);

        // Get a sample of threads to check their status flags
        const sampleThreads = await ctx.db.thread.findMany({
            where: {
                accountId: account.id,
            },
            select: {
                id: true,
                inboxStatus: true,
                draftStatus: true,
                sentStatus: true,
            },
            take: 5,
        });

        console.log('Sample thread statuses:', sampleThreads);

        let filter: Prisma.ThreadWhereInput = {};
        if (input.tab === 'inbox') {
            filter = {
                inboxStatus: true,
            };
        } else if (input.tab === 'drafts') {
            filter = {
                draftStatus: true,
            };
        } else if (input.tab === 'sent') {
            filter = {
                sentStatus: true,
            };
        }

        const count = await ctx.db.thread.count({
            where: {
                accountId: account.id,
                ...filter,
            }
        });

        console.log('Thread count result:', { 
            accountId: input.accountId, 
            tab: input.tab, 
            count,
            totalThreads,
            sampleThreads 
        });
        
        return count;
    }),
});