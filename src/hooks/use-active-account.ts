import { api } from "@/trpc/react";
import { useLocalStorage } from "usehooks-ts";
import { useEffect } from "react";

export const useActiveAccount = () => {
    const { data: accounts, isLoading } = api.account.getAccounts.useQuery();
    const [accountId, setAccountId] = useLocalStorage<string | null>("accountId", null);

    useEffect(() => {
        if (!accountId && accounts?.length && !isLoading) {
            // Set the first account as active if none is selected
            setAccountId(accounts[0].id);
        }
    }, [accounts, accountId, setAccountId, isLoading]);

    return {
        accountId,
        setAccountId,
        accounts,
        isLoading,
        activeAccount: accounts?.find(a => a.id === accountId)
    };
};