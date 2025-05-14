'use client'

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export function WorkflowClient() {
    return (
        <div className="h-screen">
            <ResizablePanelGroup direction="horizontal">
                {/* Workflow History Section */}
                <ResizablePanel defaultSize={25}>
                    <div className="flex h-full flex-col">
                        <div className="p-4 border-b">
                            <h2 className="text-lg font-semibold">Workflow History</h2>
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="p-4 space-y-4">
                                {/* Add history items here */}
                            </div>
                        </ScrollArea>
                    </div>
                </ResizablePanel>
                
                <ResizableHandle />
                
                {/* Current Workflow Section */}
                <ResizablePanel defaultSize={40}>
                    <div className="flex h-full flex-col">
                        <div className="p-4 border-b">
                            <h2 className="text-lg font-semibold">Current Workflow</h2>
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="p-4">
                                {/* Add current workflow content here */}
                            </div>
                        </ScrollArea>
                    </div>
                </ResizablePanel>
                
                <ResizableHandle />
                
                {/* Response Section */}
                <ResizablePanel defaultSize={35}>
                    <div className="flex h-full flex-col">
                        <div className="p-4 border-b">
                            <h2 className="text-lg font-semibold">Response</h2>
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="p-4">
                                {/* Add response content here */}
                            </div>
                        </ScrollArea>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}