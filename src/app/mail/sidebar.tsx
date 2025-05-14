'use client'
import { Nav } from "./nav";
import { File, Inbox, Send } from "lucide-react";
import { api } from "@/trpc/react";
import { useActiveAccount } from "@/hooks/use-active-account";
import { useLocalStorage } from "usehooks-ts";

type Props = {
    isCollapsed: boolean;
}

const Sidebar = ({isCollapsed}: Props) => {
    const { accountId } = useActiveAccount();
    const [tab, setTab] = useLocalStorage<'inbox' | 'drafts' | 'sent'>("tab", 'inbox');

    const { data: inboxThreads } = api.account.getNumThreads.useQuery({
        accountId: accountId ?? '',
        tab: 'inbox',
    }, {
        enabled: !!accountId,
    });

    const { data: draftsThreads } = api.account.getNumThreads.useQuery({
        accountId: accountId ?? '',
        tab: 'drafts',
    }, {
        enabled: !!accountId,
    });

    const { data: sentThreads } = api.account.getNumThreads.useQuery({
        accountId: accountId ?? '',
        tab: 'sent',
    }, {
        enabled: !!accountId,
    });

    console.log('Thread counts:', {
        inbox: inboxThreads,
        drafts: draftsThreads,
        sent: sentThreads,
        accountId,
        currentTab: tab,
    });

    const handleTabChange = (newTab: 'inbox' | 'drafts' | 'sent') => {
        setTab(newTab);
    };

    return (
        <Nav 
            links={[
                {
                    title: 'Inbox',
                    icon: Inbox,
                    variant: tab === 'inbox' ? 'default' : 'ghost',
                    label: inboxThreads?.toString() ?? '0',
                    onClick: () => handleTabChange('inbox'),
                },
                {
                    title: 'Drafts',
                    icon: File,
                    variant: tab === 'drafts' ? 'default' : 'ghost',
                    label: draftsThreads?.toString() ?? '0',
                    onClick: () => handleTabChange('drafts'),
                },
                {
                    title: 'Sent',
                    icon: Send,
                    variant: tab === 'sent' ? 'default' : 'ghost',
                    label: sentThreads?.toString() ?? '0',
                    onClick: () => handleTabChange('sent'),
                }
            ]} 
            isCollapsed={isCollapsed} 
        />
    )
}

export default Sidebar