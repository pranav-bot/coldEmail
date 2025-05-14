import { db } from "@/server/db";
import type { EmailAddress, EmailAttachment, EmailMessage } from "./types";
import type { Prisma } from "@prisma/client";
import pLimit from "p-limit";

export async function syncEmailsToDatabase(
    emails: EmailMessage[],
    accountId: string,
) {
    // Sort emails by date and take only the last 10
    const sortedEmails = emails.sort((a, b) => 
        new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    ).slice(0, 10);

    console.log(`Syncing ${sortedEmails.length} most recent emails to database`);
    const limit = pLimit(5);

    try {
        const tasks = sortedEmails.map((email, index) => 
            limit(() => upsertEmail(email, accountId, index))
        );
        
        await Promise.all(tasks);
        console.log(`Successfully synced ${sortedEmails.length} recent emails`);
    } catch (error) {
        console.error("Error syncing emails to database", error);
        throw error;
    }
}

async function upsertEmail(
    email: EmailMessage,
    accountId: string,
    index: number,
) {
    console.log(`Upserting email`, index);
    try {
        let emailLabelType: "inbox" | "draft" | "sent" = "inbox";
        if (
            email.sysLabels.includes("inbox") ||
            email.sysLabels.includes("important")
        ) {
            emailLabelType = "inbox";
        } else if (email.sysLabels.includes("draft")) {
            emailLabelType = "draft";
        } else if (email.sysLabels.includes("sent")) {
            emailLabelType = "sent";
        }
        const addressesToUpsert = new Map();
        for (const address of [
            email.from,
            ...email.to,
            ...email.cc,
            ...email.bcc,
            ...email.replyTo,
        ]) {
            addressesToUpsert.set(address.address, address);
        }
        const upsertedAddresses: (Awaited<ReturnType<typeof upsertEmailAddress>>)[] = [];
        for (const address of addressesToUpsert.values()) {
            const upsertedAddress = await upsertEmailAddress(address, accountId);
            upsertedAddresses.push(upsertedAddress);
        }
        const addressMap = new Map(
            upsertedAddresses.filter(Boolean).map(address => [address!.address, address])
        )
        const fromAddress = addressMap.get(email.from.address);
        if (!fromAddress) {
            console.log("From address not found", email.from.address);
            return;
        }
        const toAddresses = email.to.map(address => addressMap.get(address.address)).filter(Boolean);
        const ccAddresses = email.cc.map(address => addressMap.get(address.address)).filter(Boolean);
        const bccAddresses = email.bcc.map(address => addressMap.get(address.address)).filter(Boolean);
        const replyToAddresses = email.replyTo.map(address => addressMap.get(address.address)).filter(Boolean);

        const thread = await db.thread.upsert({
            where: {
                id: email.threadId
            },
            update: {
                subject: email.subject,
                accountId: accountId,
                lastMessageDate: new Date(email.sentAt),
                done: false,
                participantIds: [...new Set([
                    fromAddress.id,
                    ...(toAddresses as {id: string}[]).map(address => address.id),
                    ...(ccAddresses as {id: string}[]).map(address => address.id), 
                    ...(bccAddresses as {id: string}[]).map(address => address.id),
                    ...(replyToAddresses as {id: string}[]).map(address => address.id)
                ])]
            },
            create: {
                id: email.threadId,
                accountId: accountId,
                subject: email.subject,
                done: false,
                inboxStatus: emailLabelType === "inbox",
                draftStatus: emailLabelType === "draft",
                sentStatus: emailLabelType === "sent",
                lastMessageDate: new Date(email.sentAt),
                participantIds: [...new Set([
                    fromAddress.id,
                    ...toAddresses.map(a => a!.id),
                    ...ccAddresses.map(a => a!.id),
                    ...bccAddresses.map(a => a!.id),
                ])]
            }
        });

        const emailData: Prisma.EmailCreateInput = {
            id: email.id,
            emailLabel: emailLabelType,
            thread: { connect: { id: thread.id } },
            createdTime: new Date(email.createdTime),
            lastModifiedTime: new Date(),
            sentAt: new Date(email.sentAt),
            receivedAt: new Date(email.receivedAt),
            internetMessageId: email.internetMessageId,
            subject: email.subject,
            sysLabels: email.sysLabels,
            internetHeaders: email.internetHeaders.map(header => ({
                name: header.name,
                value: header.value
            })) as unknown as Prisma.InputJsonArray,
            keywords: email.keywords,
            sysClassifications: email.sysClassifications,
            sensitivity: email.sensitivity,
            meetingMessageMethod: email.meetingMessageMethod,
            from: { connect: { id: fromAddress.id } },
            to: { connect: toAddresses.map(address => ({ id: address!.id })) },
            cc: { connect: ccAddresses.map(address => ({ id: address!.id })) },
            bcc: { connect: bccAddresses.map(address => ({ id: address!.id })) },
            replyTo: { connect: replyToAddresses.map(address => ({ id: address!.id })) },
            hasAttachments: email.hasAttachments,
            body: email.body,
            bodySnippet: email.bodySnippet,
            inReplyTo: email.inReplyTo,
            references: email.references,
            threadIndex: email.threadIndex,
            nativeProperties: email.nativeProperties as unknown as Prisma.InputJsonObject,
            folderId: email.folderId,
            omitted: email.omitted,
        };

        await db.email.upsert({
            where: {
                id: email.id
            },
            create: emailData,
            update: emailData
        });

        const threadEmails = await db.email.findMany({
            where: {
                thread: { id: thread.id }
            },
            orderBy: {
                receivedAt: "asc"
            }
        });
        let threadFolderType = 'sent';
        for (const threadEmail of threadEmails) {
            if (threadEmail.emailLabel === 'inbox') {
                threadFolderType = 'inbox';
                break;
            } else if (threadEmail.emailLabel === 'draft') {
                threadFolderType = 'draft';
                break;
            }
        }
        await db.thread.update({
            where: {
                id: thread.id ?? ""
            },
            data: {
                draftStatus: threadFolderType === 'draft',
                inboxStatus: threadFolderType === 'inbox',
                sentStatus: threadFolderType === 'sent',
            }
        });
        for (const attachment of email.attachments) {
            await upsertAttachment(email.id, attachment);
        }
    } catch (error) {
        console.error("Error upserting email", error);
    }
}

async function upsertAttachment(emailId: string, attachment: EmailAttachment) {
    try{
        await db.emailAttachment.upsert({
            where: {
                id: attachment.id
            },
            update: {
                name: attachment.name,
                mimeType: attachment.mimeType,
                size: attachment.size,
                inline: attachment.inline,
                contentId: attachment.contentId,
                contentLocation: attachment.contentLocation,
            },
            create: {
                id: attachment.id,
                emailId: emailId,
                name: attachment.name,
                mimeType: attachment.mimeType,
                size: attachment.size,
                inline: attachment.inline,
                contentId: attachment.contentId,
                contentLocation: attachment.contentLocation,
            }
        });
    } catch (error) {
        console.error("Error upserting attachment", error);
    }
}

async function upsertEmailAddress(address: EmailAddress, accountId: string) {
    try {
        const existingAddress = await db.emailAddress.findUnique({
            where: {
                accountId_address: {
                    accountId: accountId,
                    address: address.address ?? ""
                }
            },
        });
        if (existingAddress) {
            return await db.emailAddress.findUnique({
                where: {
                    id: existingAddress.id
                },
            });
        } else {
            return await db.emailAddress.create({
                data: {
                    accountId: accountId,
                    address: address.address ?? "",
                    name: address.name ?? "",
                    raw: address.raw ?? ""
                }
            });
        }
    } catch (error) {
        console.error("Error upserting email address", error)
        return null
    }
}
