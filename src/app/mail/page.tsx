import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import { MailClient } from "./mail-client";

export default async function MailPage() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    // Get accounts and perform initial sync
    const accounts = await api.account.getAccounts();
    if (!accounts?.length) redirect("/onboarding");

    // Force initial sync for the active account
    const activeAccountId = accounts[0].id;
    await api.account.performInitialSync({ accountId: activeAccountId });

    return (
        <div>
            <MailClient />
        </div>
    );
}