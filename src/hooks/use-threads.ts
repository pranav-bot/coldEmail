import { api } from "@/trpc/react";
import { useLocalStorage } from "usehooks-ts";
import { atom, useAtom } from "jotai";
import { useActiveAccount } from "./use-active-account";

export const threadIdAtom = atom<string | null>(null);

const useThreads = () => {
    const { accountId, activeAccount } = useActiveAccount();
    const [tab] = useLocalStorage<string | null>("tab", 'inbox');
    const [done] = useLocalStorage<boolean | null>("done", false);
    const [threadId, setThreadId] = useAtom(threadIdAtom);

    const {data: threads, isFetching, refetch} = api.account.getThreads.useQuery({
        accountId: accountId ?? '',
        tab: tab as 'inbox' | 'drafts' | 'sent',
        done: done ?? false,
    },
    {
        enabled: !!accountId && !!tab,
        placeholderData: e => e,
        refetchInterval: 10000,
    });

    return {
        threads,
        isFetching,
        refetch,
        accountId,
        threadId,
        setThreadId,
        account: activeAccount,
    }
};

export default useThreads;