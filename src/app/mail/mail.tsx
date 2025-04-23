'use client'
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import AccountSwitcher from "./account-switcher";
import Sidebar from "./sidebar";
import ThreadList from "./thread-list";
type Props = {
    defaultLayout: number[] | undefined;
    navCollaspedSize: number;
    defaultCollapsed: boolean;
};

const Mail = ({
    defaultLayout = [20, 32, 48],
    navCollaspedSize = 20,
    defaultCollapsed = false,
}: Props) => {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
    return (
        <Tooltip delayDuration={0}>
            <ResizablePanelGroup
                direction="horizontal"
                onLayout={(sizes: number[]) => {
                    console.log(sizes);
                }}
                className="h-full min-h-screen items-stretch"
            >
                <ResizablePanel
                    defaultSize={defaultLayout[0]}
                    collapsedSize={navCollaspedSize}
                    collapsible={true}
                    minSize={15}
                    maxSize={40}
                    onResize={() => {
                        setIsCollapsed(false);
                    }}
                    onCollapse={() => {
                        setIsCollapsed(true);
                    }}
                    className={cn(isCollapsed && "min-w-[50px] transition-all duration-300 ease-in-out")}
                >
                    <div className="flex flex-col h-full flex-1">
                        <div className={cn("flex h-[52px] items-center justify-between", isCollapsed?'h-[52px]': 'px-2')}>
                            <AccountSwitcher isCollapsed={isCollapsed} />
                        </div>
                        <Separator />
                        <Sidebar isCollapsed={isCollapsed} />
                        <div className="flex-1"></div>
                        ASK AI
                    </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={defaultLayout[1]} minSize={30} >
                    <Tabs defaultValue="inbox">
                        <div className="flex items-center px-4 py-2">
                            <h1 className="text-xl font-bold">Inbox</h1>
                            <TabsList className="ml-auto">
                                <TabsTrigger value="inbox" className="text-xinc-600 dark:text-zinc-200">Inbox</TabsTrigger>
                                <TabsTrigger value="done" className="text-xinc-600 dark:text-zinc-200">Done</TabsTrigger>
                            </TabsList>
                        </div>
                        <Separator />
                        SearchBar
                        <TabsContent value="inbox"><ThreadList /></TabsContent>
                        <TabsContent value="done"><ThreadList /></TabsContent>
                    </Tabs>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={defaultLayout[2]} minSize={30} >
                    thread display
                </ResizablePanel>
            </ResizablePanelGroup>
        </Tooltip>
    );
};

export default Mail;
