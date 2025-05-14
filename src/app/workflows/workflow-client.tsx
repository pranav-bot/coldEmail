'use client'

import { useState } from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Template } from "@/mail-agent/enums"
import { Loader2, Upload } from "lucide-react"
import type { WorkflowState } from "@/types/workflow"

export function WorkflowClient() {
    const [userInput, setUserInput] = useState("")
    const [resumeFile, setResumeFile] = useState<File | null>(null)
    const [leadsFile, setLeadsFile] = useState<File | null>(null)
    const [workflowState, setWorkflowState] = useState<WorkflowState>({
        userInput: "",
        enhancedIntent: "",
        profile: null,
        leads: [],
        status: 'idle'
    })

    const handleSubmit = async () => {
        try {
            if (!resumeFile || !leadsFile) {
                throw new Error('Please upload both resume and leads files')
            }

            setWorkflowState(prev => ({ ...prev, status: 'processing' }))
            
            const formData = new FormData()
            formData.append('userInput', userInput)
            formData.append('template', Template.JobSearch)
            formData.append('resume', resumeFile)
            formData.append('leads', leadsFile)
            
            const response = await fetch('/api/workflow', {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to process workflow')
            }

            const result = await response.json()
            setWorkflowState({
                ...result,
                status: 'complete'
            })
        } catch (error) {
            console.error('Workflow error:', error)
            setWorkflowState(prev => ({
                ...prev,
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error'
            }))
        }
    }

    return (
        <div className="h-screen">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={40}>
                    <div className="flex h-full flex-col">
                        <div className="p-4 border-b">
                            <h2 className="text-lg font-semibold">Current Workflow</h2>
                            <div className="space-y-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Resume/Content File
                                    </label>
                                    <Input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Leads File (CSV/Excel)
                                    </label>
                                    <Input
                                        type="file"
                                        accept=".csv,.xlsx"
                                        onChange={(e) => setLeadsFile(e.target.files?.[0] || null)}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Workflow Prompt
                                    </label>
                                    <Textarea
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        placeholder="Enter your workflow prompt..."
                                        className="mt-1"
                                    />
                                </div>

                                <Button
                                    onClick={handleSubmit}
                                    disabled={workflowState.status === 'processing' || !resumeFile || !leadsFile}
                                    className="w-full"
                                >
                                    {workflowState.status === 'processing' ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : 'Generate Content'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </ResizablePanel>

                <ResizableHandle />

                <ResizablePanel defaultSize={60}>
                    <div className="flex h-full flex-col overflow-hidden"> {/* Added overflow-hidden */}
                        <div className="p-4 border-b">
                            <h2 className="text-lg font-semibold">Generated Content</h2>
                        </div>
                        <ScrollArea className="flex-1 h-[calc(100vh-5rem)]"> {/* Added fixed height calculation */}
                            <div className="p-4">
                                {workflowState.status === 'complete' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="font-medium">Enhanced Intent:</h3>
                                            <p className="text-sm mt-1">{workflowState.enhancedIntent}</p>
                                        </div>

                                        {workflowState.leads.map((result, index) => (
                                            <div key={index} className="border rounded-lg p-4">
                                                <h3 className="font-medium mb-2">
                                                    {result.lead.contactInfo.name} - {result.lead.companyInfo.name}
                                                </h3>
                                                <div className="space-y-4">
                                                    <div>
                                                        <h4 className="text-sm font-medium">Email</h4>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            Subject: {result.emailContent.subject}
                                                        </p>
                                                        <p className="text-sm whitespace-pre-wrap mt-1">
                                                            {result.emailContent.body}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-medium">LinkedIn</h4>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            Connection Request: {result.linkedInContent.intro}
                                                        </p>
                                                        <p className="text-sm whitespace-pre-wrap mt-1">
                                                            {result.linkedInContent.message}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {workflowState.status === 'error' && (
                                    <div className="text-red-500">
                                        {workflowState.error}
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}