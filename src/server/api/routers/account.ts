import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { db } from "@/server/db";
import { type Prisma } from "@prisma/client";
import { emailAddressSchema } from "@/lib/types";
import { Account } from "@/lib/account";
import { syncEmailsToDatabase } from "@/lib/sync-to-db"; // Add this import

export const authoriseAccountAccess = async (
  accountId: string,
  userId: string,
) => {
  const account = await db.account.findFirst({
    where: {
      id: accountId,
      userId: userId,
    },
    select: {
      id: true,
      emailAddress: true,
      name: true,
      token: true,
    },
  });
  if (!account) throw new Error("Invalid token");
  return account;
};

export const accountRouter = createTRPCRouter({
  getAccounts: privateProcedure.query(async ({ ctx }) => {
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
  getNumThreads: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        tab: z.enum(["inbox", "drafts", "sent"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      let filter: Prisma.ThreadWhereInput = {};
      if (input.tab === "inbox") {
        filter = {
          inboxStatus: true,
        };
      } else if (input.tab === "drafts") {
        filter = {
          draftStatus: true,
        };
      } else if (input.tab === "sent") {
        filter = {
          sentStatus: true,
        };
      }
      return await ctx.db.thread.count({
        where: filter,
      });
    }),
  getThreads: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        tab: z.enum(["inbox", "drafts", "sent"]),
        done: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      const acc = new Account(account.token);

      // Check if we need initial sync
      const dbAccount = await ctx.db.account.findUnique({
        where: { id: input.accountId }
      });

      if (!dbAccount?.nextDeltaToken) {
        console.log("Performing initial sync for account:", input.accountId);
        const initialSync = await acc.performInitialSync();
        if (initialSync?.deltaToken) {
          await ctx.db.account.update({
            where: { id: input.accountId },
            data: { nextDeltaToken: initialSync.deltaToken }
          });
          // Make sure syncEmailsToDatabase is properly called
          await syncEmailsToDatabase(initialSync.emails, input.accountId);
        }
      } else {
        const syncResult = await acc.syncEmails();
        if (syncResult?.emails.length > 0) {
          await syncEmailsToDatabase(syncResult.emails, input.accountId);
        }
      }

      let filter: Prisma.ThreadWhereInput = {};
      if (input.tab === "inbox") {
        filter = {
          inboxStatus: true,
        };
      }
      if (input.tab === "drafts") {
        filter = {
          draftStatus: true,
        };
      }
      if (input.tab === "sent") {
        filter = {
          sentStatus: true,
        };
      }
      filter.done = {
        equals: input.done,
      };

      return await ctx.db.thread.findMany({
        where: filter,
        include: {
          emails: {
            orderBy: {
              sentAt: "asc",
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
          lastMessageDate: "desc",
        },
      });
    }),
  getSuggestions: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      return await ctx.db.emailAddress.findMany({
        where: {
          accountId: account.id,
        },
        select: {
          address: true,
          name: true,
        },
      });
    }),
  getReplyDetails: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        threadId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      const thread = await ctx.db.thread.findFirst({
        where: {
          id: input.threadId,
        },
        include: {
          emails: {
            orderBy: {
              sentAt: "asc",
            },
            select: {
              from: true,
              to: true,
              cc: true,
              bcc: true,
              sentAt: true,
              subject: true,
              internetMessageId: true,
            },
          },
        },
      });
      if (!thread || thread.emails.length===0) throw new Error("Thread not found");
      const lastExternalEmail = thread.emails.reverse().find( email => email.from.address !== account.emailAddress);
      if (!lastExternalEmail) throw new Error("No external email found");
      return {
        subject: lastExternalEmail.subject,
        to: [lastExternalEmail.from, ...lastExternalEmail.to.filter(to => to.address !== account.emailAddress)],
        cc: lastExternalEmail.cc.filter(cc => cc.address !== account.emailAddress),
        from: {name: account.name, address: account.emailAddress},
        id: lastExternalEmail.internetMessageId,
      }
        

    }),
    sendEmail: privateProcedure
    .input(
        z.object({
            accountId: z.string(),
            body: z.string(),
            subject: z.string(),
            from: emailAddressSchema,
            to: z.array(emailAddressSchema),
            cc: z.array(emailAddressSchema).optional(),
            bcc: z.array(emailAddressSchema).optional(),
            replyTo: emailAddressSchema,
            inReplyTo: z.string().optional(),
            threadId: z.string().optional(),
        })
    ).mutation(async ({ ctx, input }) => {
        const account = await authoriseAccountAccess(
            input.accountId,
            ctx.auth.userId,
        );
        const acc = new Account(account.token);
        await acc.sendEmail({
            from: input.from,
            subject: input.subject,
            body: input.body,
            inReplyTo: input.inReplyTo,
            threadId: input.threadId,
            to: input.to,
            cc: input.cc,
            bcc: input.bcc,
            replyTo: input.replyTo,
        })
    }),
    performInitialSync: privateProcedure
        .input(z.object({ accountId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const account = await authoriseAccountAccess(
                input.accountId,
                ctx.auth.userId,
            );

            const acc = new Account(account.token);
            const dbAccount = await ctx.db.account.findUnique({
                where: { id: input.accountId }
            });

            if (!dbAccount?.nextDeltaToken) {
                console.log("Performing initial sync for account:", input.accountId);
                const initialSync = await acc.performInitialSync();
                if (initialSync?.deltaToken) {
                    await ctx.db.account.update({
                        where: { id: input.accountId },
                        data: { nextDeltaToken: initialSync.deltaToken }
                    });
                    await syncEmailsToDatabase(initialSync.emails, input.accountId);
                }
            }

            return { success: true };
        }),
});
