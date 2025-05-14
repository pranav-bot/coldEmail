'use client'

import { api } from "@/trpc/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalStorage } from "usehooks-ts";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { getAurinkoAuthUrl } from "@/lib/aurinko";
import { useActiveAccount } from "@/hooks/use-active-account";
type Props = {
    isCollapsed: boolean;
};

const AccountSwitcher = ({ isCollapsed }: Props) => {
    const { accountId, setAccountId, accounts } = useActiveAccount();
    
    if (!accounts?.length) return null;

    return (
        <Select value={accountId ?? undefined} onValueChange={setAccountId}>
            <SelectTrigger className={cn(
            "flex w-full flex-1 items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
            isCollapsed &&
            "flex h-9 w-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>svg]:hidden")}aria-label="Select account"
        >
            <SelectValue placeholder="Select account" >
                <span className={cn({hidden: isCollapsed ,'ml-2':true})}>
                    {accounts.find(account => account.id === accountId)?.emailAddress}
                </span>
                <span className={cn({hidden: !isCollapsed})}>
                    {accounts.find(account => account.id === accountId)?.emailAddress[0]}
                </span>
            </SelectValue>
        </SelectTrigger>
        <SelectContent>
            {accounts.map(account => (
                <SelectItem key={account.id} value={account.id}>
                    {account.emailAddress}
                </SelectItem>
            ))}
            <div onClick={async () => {
                const authURL = await getAurinkoAuthUrl('Google')
                window.location.href = authURL
            }} className="flex relative hover:bg-gray-50 w-full cursor-pointer items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent">
                <Plus className="size-4 mr-1" />
                Add account
            </div>
        </SelectContent>
        </Select>
    )
}

export default AccountSwitcher;