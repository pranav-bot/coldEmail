'use client'

import { useState, useEffect } from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Template } from "@/mail-agent/enums"
import { Loader2, Upload, Plus, ArrowLeft, ArrowRight, Home } from "lucide-react"
import type { WorkflowState, WorkflowHistory } from "@/types/workflow"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { StepEditor } from "@/components/step-editor"

type WorkflowStep = {
    name: string;
    content: string;
    status: 'pending' | 'editing' | 'complete';
}

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
    const [steps, setSteps] = useState<WorkflowStep[]>([
        { name: 'Enhanced Intent', content: '', status: 'pending' },
        { name: 'Profile Analysis', content: '', status: 'pending' },
        { name: 'Lead Analysis', content: '', status: 'pending' },
        { name: 'Generated Content', content: '', status: 'pending' }
    ]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

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
            
            // Update the first step with enhanced intent
            setSteps(prev => prev.map((step, idx) => 
                idx === 0 
                    ? { ...step, status: 'editing', content: result.enhancedIntent }
                    : step
            ))

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

    const handleStepSubmit = async (stepContent: string) => {
        try {
            setIsLoading(true)
            
            // Validate content before submitting
            if (steps[currentStepIndex].name !== 'Enhanced Intent') {
                try {
                    JSON.parse(stepContent)
                } catch (error) {
                    throw new Error('Invalid JSON format')
                }
            }

            // First process the step
            const formData = new FormData()
            formData.append('userInput', userInput)
            formData.append('template', selectedTemplate)
            formData.append('resume', resumeFile!)
            formData.append('leads', leadsFile!)
            formData.append('step', steps[currentStepIndex].name)
            formData.append('stepContent', stepContent)
            
            if (currentStepIndex > 0) {
                const prevContent = steps[currentStepIndex - 1].content
                formData.append('previousStepContent', prevContent)
            }

            const stepResponse = await fetch('/api/workflow/step', {
                method: 'POST',
                body: formData
            })

            if (!stepResponse.ok) {
                const error = await stepResponse.json()
                throw new Error(error.message || 'Failed to process step')
            }

            const stepResult = await stepResponse.json()

            // Then update the workflow with the new content
            if (workflowState.id) { // Check if we have a workflow ID
                const updateResponse = await fetch('/api/workflow/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        workflowId: workflowState.id,
                        step: steps[currentStepIndex].name,
                        content: stepContent,
                        generatedContent: stepResult.content
                    })
                })

                if (!updateResponse.ok) {
                    console.error('Failed to update workflow state')
                }
            }

            // Update UI state
            setSteps(prev => prev.map((step, idx) => 
                idx === currentStepIndex 
                    ? { ...step, status: 'complete', content: stepContent }
                    : step
            ))

            if (currentStepIndex < steps.length - 1) {
                setCurrentStepIndex(prev => prev + 1)
                setSteps(prev => prev.map((step, idx) => 
                    idx === currentStepIndex + 1 
                        ? { ...step, status: 'editing', content: stepResult.content }
                        : step
                ))
            }
        } catch (error) {
            console.error('Step processing error:', error)
            setWorkflowState(prev => ({
                ...prev,
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error'
            }))
        } finally {
            setIsLoading(false)
        }
    }

    const handleBackStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1)
            setSteps(prev => prev.map((step, idx) => 
                idx === currentStepIndex - 1
                    ? { ...step, status: 'editing' }
                    : step
            ))
        }
    }

    const handleForwardStep = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1)
            setSteps(prev => prev.map((step, idx) => 
                idx === currentStepIndex + 1
                    ? { ...step, status: 'editing' }
                    : step
            ))
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
                            <div className="flex gap-1">
                                <Link href="/">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                    >
                                        <Home className="h-4 w-4" />
                                        <span className="sr-only">Home</span>
                                    </Button>
                                </Link>
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
                        </div>
                        <ScrollArea className="flex-1 h-[calc(100vh-8rem)]">
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
                                        <SelectItem value={Template.Freelance}>Freelance</SelectItem>
                                        <SelectItem value={Template.Funding}>Startup Funding</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        {selectedTemplate === Template.JobSearch 
                                            ? 'Resume File' 
                                            : selectedTemplate === Template.Funding 
                                                ? 'Pitch Deck/Business Plan' 
                                                : 'Content File'}
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
                    <div className="flex h-full flex-col overflow-hidden">
                        <div className="p-4 border-b">
                            <div className="flex items-center">
                                {currentStepIndex > 0 && (
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={handleBackStep}
                                        className="mr-2 h-8 w-8"
                                        aria-label="Go back"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                )}
                                <h2 className="text-lg font-semibold">
                                    {steps[currentStepIndex]?.name || 'Generated Content'}
                                </h2>
                                {currentStepIndex < steps.length - 1 && (
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={handleForwardStep}
                                        className="ml-2 h-8 w-8"
                                        aria-label="Go forward"
                                    >
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        <ScrollArea className="flex-1 h-[calc(100vh-5rem)]">
                            <div className="p-4">
                                {workflowState.status === 'processing' && (
                                    <div className="flex items-center justify-center">
                                        <Loader2 className="h-8 w-8 animate-spin" />
                                    </div>
                                )}

                                {workflowState.status === 'complete' && currentStepIndex < steps.length && (
                                    <StepEditor
                                        step={steps[currentStepIndex]}
                                        onSubmit={handleStepSubmit}
                                        initialAttachments={resumeFile ? [resumeFile] : []}
                                        isParentLoading={isLoading}
                                    />
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}