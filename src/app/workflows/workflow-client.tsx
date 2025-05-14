'use client'

import { useState, useEffect } from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Template } from "@/mail-agent/enums"
import { Loader2, Upload, Plus } from "lucide-react"
import type { WorkflowState, WorkflowHistory } from "@/types/workflow"
import { formatDistanceToNow } from "date-fns"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function WorkflowClient() {
    const [userInput, setUserInput] = useState("")
    const [resumeFile, setResumeFile] = useState<File | null>(null)
    const [leadsFile, setLeadsFile] = useState<File | null>(null)
    const [workflowHistory, setWorkflowHistory] = useState<WorkflowHistory[]>([])
    const [workflowCount, setWorkflowCount] = useState(1)
    const [workflowState, setWorkflowState] = useState<WorkflowState>({
        userInput: "",
        enhancedIntent: "",
        profile: null,
        leads: [],
        status: 'idle'
    })
    const [selectedTemplate, setSelectedTemplate] = useState<Template>(Template.JobSearch)

    useEffect(() => {
        const loadWorkflows = async () => {
            try {
                const response = await fetch('/api/workflow/list')
                if (!response.ok) throw new Error('Failed to load workflows')
                
                const workflows = await response.json()
                setWorkflowHistory(workflows.map((w: any) => ({
                    id: w.id,
                    title: w.title,
                    createdAt: new Date(w.createdAt),
                    enhancedIntent: w.prompt,
                    status: 'complete'
                })))
                
                // Set workflow count to be one more than the highest existing number
                const maxNumber = Math.max(...workflows.map((w: any) => {
                    const num = parseInt(w.title.split('#')[1])
                    return isNaN(num) ? 0 : num
                }), 0)
                setWorkflowCount(maxNumber + 1)
            } catch (error) {
                console.error('Error loading workflows:', error)
            }
        }

        loadWorkflows()
    }, [])

    const handleSubmit = async () => {
        try {
            if (!resumeFile || !leadsFile) {
                throw new Error('Please upload both required files')
            }

            setWorkflowState(prev => ({ ...prev, status: 'processing' }))
            
            const formData = new FormData()
            formData.append('userInput', userInput)
            formData.append('template', selectedTemplate)
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
            
            // Create new workflow in history
            const newWorkflow = {
                title: `Workflow #${workflowCount}`,
                prompt: userInput,
                content: JSON.stringify(result.profile),
                type: selectedTemplate,
                leadMessage: JSON.stringify(result.leads),
            }

            // Save workflow to database
            const saveResponse = await fetch('/api/workflow/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newWorkflow)
            })

            if (!saveResponse.ok) {
                throw new Error('Failed to save workflow')
            }

            const savedWorkflow = await saveResponse.json()

            // Update local state
            setWorkflowHistory(prev => [{
                id: savedWorkflow.id,
                title: savedWorkflow.title,
                createdAt: new Date(savedWorkflow.createdAt),
                enhancedIntent: result.enhancedIntent,
                status: 'complete'
            }, ...prev])

            setWorkflowCount(prev => prev + 1)
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

    const handleNewWorkflow = () => {
        // Reset the current workflow state
        setUserInput("")
        setResumeFile(null)
        setLeadsFile(null)
        setWorkflowState({
            userInput: "",
            enhancedIntent: "",
            profile: null,
            leads: [],
            status: 'idle'
        })
    }

    return (
        <div className="h-screen">
            <ResizablePanelGroup direction="horizontal">
                {/* History Panel */}
                <ResizablePanel defaultSize={20}>
                    <div className="flex h-full flex-col">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="text-lg font-semibold">History</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleNewWorkflow}
                                className="h-8 w-8"
                            >
                                <Plus className="h-4 w-4" />
                                <span className="sr-only">New Workflow</span>
                            </Button>
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="p-4 space-y-4">
                                {workflowHistory.map((workflow) => (
                                    <div
                                        key={workflow.id}
                                        className="border rounded-lg p-3 hover:bg-accent cursor-pointer transition-colors"
                                        onClick={() => {
                                            // Set the selected workflow's content
                                            setWorkflowState(prev => ({
                                                ...prev,
                                                ...workflow,
                                                status: 'complete'
                                            }))
                                        }}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-medium">{workflow.title}</h3>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(workflow.createdAt, { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {workflow.enhancedIntent}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </ResizablePanel>

                <ResizableHandle />

                {/* Current Workflow Panel */}
                <ResizablePanel defaultSize={35}>
                    <div className="flex h-full flex-col">
                        <div className="p-4 border-b">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Current Workflow</h2>
                                <Select
                                    value={selectedTemplate}
                                    onValueChange={(value) => setSelectedTemplate(value as Template)}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select template" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={Template.JobSearch}>Job Search</SelectItem>
                                        <SelectItem value={Template.Sales}>Sales</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        {selectedTemplate === Template.JobSearch ? 'Resume File' : 'Content File'}
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

                {/* Generated Content Panel */}
                <ResizablePanel defaultSize={45}>
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