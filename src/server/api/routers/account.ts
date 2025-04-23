import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { db } from "@/server/db";
import { type Prisma } from "@prisma/client";

export const authoriseAccountAccess = async (accountId: string, userId: string) => {
    const account = await db.account.findFirst({
        where: {
            id: accountId,
            userId: userId,
        },
        select: {
            id: true, emailAddress: true, name: true, token: true
        }
    })
    if (!account) throw new Error("Invalid token")
    return account
}

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
        const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId);

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
        return await ctx.db.thread.count({
            where: filter
        })
    }),
    getThreads: privateProcedure.input(z.object({
        accountId: z.string(),
        tab: z.enum(['inbox', 'drafts', 'sent']),
        done: z.boolean().optional(),
    })).query(async ({ctx, input}) => {
        const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId);
        let filter: Prisma.ThreadWhereInput = {};
        if (input.tab === 'inbox') {
            filter = {
                inboxStatus: true,
            };
        }
        if (input.tab === 'drafts') {
            filter = {
                draftStatus: true,
            };
        }
        if (input.tab === 'sent') {
            filter = {
                sentStatus: true,
            };
        }
        filter.done = {
            equals: input.done,
        }

        return await ctx.db.thread.findMany({
            where: filter,
            include: {
                emails: {
                    orderBy: {
                        sentAt: 'asc',
                    },
                    select: {
                        id: true,
                        subject: true,
                        sentAt: true,
                        from: true,
                        to: true,
                        bodySnippet: true,
                        sysLabels: true,
                        emailLabel: true,
                    },
                },
            },
            take: 15,
            orderBy: {
                lastMessageDate: 'desc',
            },
        });
    }),
});