'use client';
import { KBarAnimator, KBarPortal, KBarPositioner, KBarProvider, KBarSearch, type Action } from 'kbar';
import RenderResults from './render-results';
import { useLocalStorage } from 'usehooks-ts';
import useThemeSwitching from './use-theme-switching';
import useAccountSwitching from './use-account-switching';

export default function KBar({childeren}: {childeren: React.ReactNode}) {
  //const [isSearching, setIsSearching] = useAtom(isSearchingAtom)
  const [_, setTab] = useLocalStorage(`tab`, 'inbox')
  //const [threadId, setThreadId] = useThread()
  const [done, setDone] = useLocalStorage('done', false)
  const actions: Action[] = [
    {
      id:'inboxAction',
      name:'Inbox',
      shortcut: ['g','i'],
      section: 'Navigation',
      subtitle: 'Go to inbox',
      perform: () => {
        setTab('inbox');
      }
    },        {
      id: "draftsAction",
      name: "Drafts",
      shortcut: ['g', 'd'],
      keywords: "drafts",
      subtitle: "View your drafts",
      section: "Navigation",
      perform: () => {
          setTab('drafts')
      },
  },
  {
      id: "sentAction",
      name: "Sent",
      shortcut: ['g', "s"],
      keywords: "sent",
      section: "Navigation",
      subtitle: "View the sent",
      perform: () => {
          setTab('sent')
      },
  },
  {
      id: "pendingAction",
      name: "See done",
      shortcut: ['g', "d"],
      keywords: "done",
      section: "Navigation",
      subtitle: "View the done emails",
      perform: () => {
          setDone(true)
      },
  },
  {
      id: "doneAction",
      name: "See Pending",
      shortcut: ['g', "u"],
      keywords: 'pending, undone, not done',
      section: "Navigation",
      subtitle: "View the pending emails",
      perform: () => {
          setDone(false)
      },
  },
  ]
  return <KBarProvider actions={actions} options={{ enableHistory: true }}>
    <ActualComponent>{childeren}</ActualComponent>
  </KBarProvider>;
}

const ActualComponent = ({ children }: { children: React.ReactNode }) => {
  useThemeSwitching()
  useAccountSwitching()
  return <>
  <KBarPortal>
    <KBarPositioner className='fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm scrollbar-hide !p-0 z-[999]'>
        <KBarAnimator className='max-w-[600px] !mt-64 w-full bg-white dark:bg-gray-800 text-foreground dark:text-gray-200 shadow-lg bordrer darl:border-gray-600 rounded-lg overflow-hidden realtive !translate-y-12'>
        <div className='bg-white dark:bg-gray-800'>
          <div className='border-x-0 border-b-2 dark:border-gray-700'>
        <KBarSearch className='py-4 px-6 text-lg w-full bg-white dark:bg-gray-800 outline-none border-none focus:outline-none focus:ring-0 focus:ring-offset-0' />
        </div>
        <RenderResults />
        </div>
        </KBarAnimator>
    </KBarPositioner>
  </KBarPortal>
  {children}
  </>;
}

