import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { WorkflowStep } from "@/types/workflow"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, Search } from "lucide-react"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import type { WorkflowResult } from "@/types/workflow"
import { WorkflowEmailEditor } from "@/components/workflow-email-editor"

type StepEditorProps = {
    step: WorkflowStep;
    onSubmit: (content: string) => void;
    isHistoricalView?: boolean;
    initialAttachments?: File[];
    isParentLoading?: boolean;
}

export function StepEditor({ step, onSubmit, isHistoricalView = false, initialAttachments = [], isParentLoading = false }: StepEditorProps) {
    const [editedContent, setEditedContent] = useState(step.content)
    const [parsedContent, setParsedContent] = useState<any>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        if (!step.content) {
            setEditedContent('')
            setParsedContent(null)
            return
        }

        try {
            // Check if content is already a JSON string
            const isJsonString = typeof step.content === 'string' && 
                (step.content.startsWith('{') || step.content.startsWith('['))

            // If it's a JSON string, parse it, otherwise use as-is
            const parsed = isJsonString ? JSON.parse(step.content) : step.content
            setParsedContent(parsed)
            setEditedContent(isJsonString ? JSON.stringify(parsed, null, 2) : step.content)
        } catch (error) {
            console.error('Failed to parse content:', error)
            setEditedContent(step.content || '')
        }
    }, [step.content])

    // Reset search when step changes
    useEffect(() => {
        setSearchTerm('')
    }, [step.name])

    const handleSubmit = async (content: string) => {
        setIsLoading(true)
        try {
            await onSubmit(content)
        } catch (error) {
            console.error('Error submitting content:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const ContinueButton = () => {
        const isContentEmpty = !editedContent.trim()
        
        return (
            <div className="space-y-2">
                {isContentEmpty && (
                    <div className="text-sm text-red-500 font-medium">
                        Please enter content before continuing to the next step
                    </div>
                )}
                <Button 
                    onClick={() => handleSubmit(editedContent)} 
                    className="w-full"
                    disabled={isLoading || isParentLoading || isContentEmpty}
                >
                    {(isLoading || isParentLoading) ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        'Continue to Next Step'
                    )}
                </Button>
            </div>
        )
    }

    const SaveButton = () => {
        const isContentEmpty = !editedContent.trim()
        
        return (
            <div className="space-y-2">
                {isContentEmpty && (
                    <div className="text-sm text-red-500 font-medium">
                        No content to save
                    </div>
                )}
                <Button 
                    onClick={() => handleSubmit(editedContent)} 
                    className="w-full"
                    disabled={isLoading || isParentLoading || isContentEmpty}
                    variant="outline"
                >
                    {(isLoading || isParentLoading) ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        'Save Changes'
                    )}
                </Button>
            </div>
        )
    }

    // Determine if this is the final step
    const isFinalStep = step.name === 'Generated Content'

    // For historical views, disable editing
    if (isHistoricalView) {
        return (
            <div className="space-y-4">
                <div className="bg-muted rounded-lg p-6">
                    <pre className="whitespace-pre-wrap text-sm">{step.content}</pre>
                </div>
            </div>
        )
    }

    if (step.name === 'Profile Analysis') {
        // Ensure profile data is valid
        if (!parsedContent || typeof parsedContent !== 'object') {
            return (
                <div className="text-center p-4 text-red-500">
                    Invalid profile data format
                </div>
            )
        }

        const profile = parsedContent
        return (
            <div className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                    {/* Personal Information */}
                    <AccordionItem value="personal">
                        <AccordionTrigger className="flex justify-between">
                            Personal Information
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-4">
                                <Textarea
                                    value={profile.personalInfo || ''}
                                    onChange={(e) => {
                                        const updatedProfile = { ...profile }
                                        updatedProfile.personalInfo = e.target.value
                                        setEditedContent(JSON.stringify(updatedProfile, null, 2))
                                    }}
                                    className="min-h-[100px]"
                                    placeholder="Enter personal information..."
                                />
                                <Textarea
                                    value={profile.summary || ''}
                                    onChange={(e) => {
                                        const updatedProfile = { ...profile }
                                        updatedProfile.summary = e.target.value
                                        setEditedContent(JSON.stringify(updatedProfile, null, 2))
                                    }}
                                    className="min-h-[200px]"
                                    placeholder="Enter summary..."
                                />
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Experience */}
                    <AccordionItem value="experience">
                        <AccordionTrigger>Experience</AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-4">
                                {(profile.experience || []).map((exp: any, i: number) => (
                                    <div key={i} className="border rounded p-4 space-y-2">
                                        <Input
                                            value={exp.company || ''}
                                            onChange={(e) => {
                                                const updatedProfile = { ...profile }
                                                if (!updatedProfile.experience) {
                                                    updatedProfile.experience = []
                                                }
                                                updatedProfile.experience[i] = { ...updatedProfile.experience[i], company: e.target.value }
                                                setEditedContent(JSON.stringify(updatedProfile, null, 2))
                                            }}
                                            placeholder="Company name"
                                        />
                                        <Input
                                            value={exp.position || ''}
                                            onChange={(e) => {
                                                const updatedProfile = { ...profile }
                                                if (!updatedProfile.experience) {
                                                    updatedProfile.experience = []
                                                }
                                                updatedProfile.experience[i] = { ...updatedProfile.experience[i], position: e.target.value }
                                                setEditedContent(JSON.stringify(updatedProfile, null, 2))
                                            }}
                                            placeholder="Position"
                                        />
                                        <Input
                                            value={exp.duration || ''}
                                            onChange={(e) => {
                                                const updatedProfile = { ...profile }
                                                if (!updatedProfile.experience) {
                                                    updatedProfile.experience = []
                                                }
                                                updatedProfile.experience[i] = { ...updatedProfile.experience[i], duration: e.target.value }
                                                setEditedContent(JSON.stringify(updatedProfile, null, 2))
                                            }}
                                            placeholder="Duration"
                                        />
                                        <Textarea
                                            value={exp.description || ''}
                                            onChange={(e) => {
                                                const updatedProfile = { ...profile }
                                                if (!updatedProfile.experience) {
                                                    updatedProfile.experience = []
                                                }
                                                updatedProfile.experience[i] = { ...updatedProfile.experience[i], description: e.target.value }
                                                setEditedContent(JSON.stringify(updatedProfile, null, 2))
                                            }}
                                            className="min-h-[100px]"
                                            placeholder="Description"
                                        />
                                        <Button 
                                            variant="destructive" 
                                            size="sm"
                                            onClick={() => {
                                                const updatedProfile = { ...profile }
                                                if (!updatedProfile.experience) {
                                                    updatedProfile.experience = []
                                                }
                                                updatedProfile.experience.splice(i, 1)
                                                setEditedContent(JSON.stringify(updatedProfile, null, 2))
                                            }}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    onClick={() => {
                                        const updatedProfile = { ...profile }
                                        if (!updatedProfile.experience) {
                                            updatedProfile.experience = []
                                        }
                                        updatedProfile.experience.push({
                                            company: '',
                                            position: '',
                                            duration: '',
                                            description: ''
                                        })
                                        setEditedContent(JSON.stringify(updatedProfile, null, 2))
                                    }}
                                    className="w-full"
                                >
                                    Add Experience
                                </Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Skills */}
                    <AccordionItem value="skills">
                        <AccordionTrigger>Skills</AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    {(profile.skills || []).map((skill: string, i: number) => (
                                        <Badge key={i} variant="secondary" className="group">
                                            {skill}
                                            <button
                                                className="ml-2 opacity-0 group-hover:opacity-100"
                                                onClick={() => {
                                                    const updatedProfile = { ...profile }
                                                    if (!updatedProfile.skills) updatedProfile.skills = []
                                                    updatedProfile.skills.splice(i, 1)
                                                    setEditedContent(JSON.stringify(updatedProfile, null, 2))
                                                }}
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add new skill"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && e.currentTarget.value) {
                                                const updatedProfile = { ...profile }
                                                if (!updatedProfile.skills) updatedProfile.skills = []
                                                updatedProfile.skills.push(e.currentTarget.value)
                                                setEditedContent(JSON.stringify(updatedProfile, null, 2))
                                                e.currentTarget.value = ''
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Communication Strategy */}
                    <AccordionItem value="communication">
                        <AccordionTrigger>Communication Strategy</AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Tone</label>
                                    <Input
                                        value={profile.communicationStyle?.tone || ''}
                                        onChange={(e) => {
                                            const updatedProfile = { ...profile }
                                            if (!updatedProfile.communicationStyle) updatedProfile.communicationStyle = {}
                                            updatedProfile.communicationStyle.tone = e.target.value
                                            setEditedContent(JSON.stringify(updatedProfile, null, 2))
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Value Proposition</label>
                                    <Textarea
                                        value={profile.communicationStyle?.valueProposition || ''}
                                        onChange={(e) => {
                                            const updatedProfile = { ...profile }
                                            if (!updatedProfile.communicationStyle) updatedProfile.communicationStyle = {}
                                            updatedProfile.communicationStyle.valueProposition = e.target.value
                                            setEditedContent(JSON.stringify(updatedProfile, null, 2))
                                        }}
                                        className="min-h-[100px]"
                                    />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <ContinueButton />
            </div>
        )
    }

    if (step.name === 'Lead Analysis') {
        const leads = Array.isArray(parsedContent) ? parsedContent : []
        
        // Filter leads based on search term
        const filteredLeads = leads.filter((lead: any) => {
            if (!searchTerm) return true
            const searchLower = searchTerm.toLowerCase()
            const name = lead.contactInfo?.name?.toLowerCase() || ''
            const company = lead.companyInfo?.name?.toLowerCase() || ''
            const email = lead.contactInfo?.email?.toLowerCase() || ''
            return name.includes(searchLower) || company.includes(searchLower) || email.includes(searchLower)
        })
        
        return (
            <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search leads by name, company, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                
                {/* Results count */}
                <div className="text-sm text-muted-foreground">
                    {searchTerm ? `${filteredLeads.length} of ${leads.length} leads` : `${leads.length} leads`}
                </div>

                <Accordion type="single" collapsible className="w-full">
                    {filteredLeads.map((lead: any, originalIndex: number) => {
                        // Find original index for updating
                        const actualIndex = leads.findIndex((l: any) => l === lead)
                        
                        return (
                            <AccordionItem key={actualIndex} value={`lead-${actualIndex}`}>
                                <AccordionTrigger>
                                    {lead.contactInfo?.name || 'Unnamed Lead'} - {lead.companyInfo?.name || 'Unknown Company'}
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-4">
                                        {/* Contact Information */}
                                        <div>
                                            <h4 className="font-medium mb-2">Contact Information</h4>
                                            <div className="space-y-2">
                                                <Input
                                                    value={lead.contactInfo?.name || ''}
                                                    onChange={(e) => {
                                                        const updatedLeads = [...leads]
                                                        if (!updatedLeads[actualIndex].contactInfo) {
                                                            updatedLeads[actualIndex].contactInfo = {}
                                                        }
                                                        updatedLeads[actualIndex].contactInfo.name = e.target.value
                                                        setEditedContent(JSON.stringify(updatedLeads, null, 2))
                                                    }}
                                                    placeholder="Name"
                                                />
                                                <Input
                                                    value={lead.contactInfo?.email || ''}
                                                    onChange={(e) => {
                                                        const updatedLeads = [...leads]
                                                        if (!updatedLeads[actualIndex].contactInfo) {
                                                            updatedLeads[actualIndex].contactInfo = {}
                                                        }
                                                        updatedLeads[actualIndex].contactInfo.email = e.target.value
                                                        setEditedContent(JSON.stringify(updatedLeads, null, 2))
                                                    }}
                                                    placeholder="Email"
                                                />
                                                <Input
                                                    value={lead.contactInfo?.linkedin || ''}
                                                    onChange={(e) => {
                                                        const updatedLeads = [...leads]
                                                        if (!updatedLeads[actualIndex].contactInfo) {
                                                            updatedLeads[actualIndex].contactInfo = {}
                                                        }
                                                        updatedLeads[actualIndex].contactInfo.linkedin = e.target.value
                                                        setEditedContent(JSON.stringify(updatedLeads, null, 2))
                                                    }}
                                                    placeholder="LinkedIn URL"
                                                />
                                            </div>
                                        </div>

                                        {/* Company Information */}
                                        <div>
                                            <h4 className="font-medium mb-2">Company Information</h4>
                                            <div className="space-y-2">
                                                <Input
                                                    value={lead.companyInfo?.name || ''}
                                                    onChange={(e) => {
                                                        const updatedLeads = [...leads]
                                                        if (!updatedLeads[actualIndex].companyInfo) {
                                                            updatedLeads[actualIndex].companyInfo = {}
                                                        }
                                                        updatedLeads[actualIndex].companyInfo.name = e.target.value
                                                        setEditedContent(JSON.stringify(updatedLeads, null, 2))
                                                    }}
                                                    placeholder="Company Name"
                                                />
                                                <Input
                                                    value={lead.companyInfo?.industry || ''}
                                                    onChange={(e) => {
                                                        const updatedLeads = [...leads]
                                                        if (!updatedLeads[actualIndex].companyInfo) {
                                                            updatedLeads[actualIndex].companyInfo = {}
                                                        }
                                                        updatedLeads[actualIndex].companyInfo.industry = e.target.value
                                                        setEditedContent(JSON.stringify(updatedLeads, null, 2))
                                                    }}
                                                    placeholder="Industry"
                                                />
                                            </div>
                                        </div>

                                        {/* Lead Details */}
                                        <div>
                                            <h4 className="font-medium mb-2">Lead Details</h4>
                                            <div className="space-y-2">
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-sm font-medium">Pain Points</label>
                                                        <div className="flex flex-wrap gap-2 mb-2">
                                                            {lead.leadDetails?.painPoints?.map((point: string, i: number) => (
                                                                <Badge key={i} variant="secondary" className="group">
                                                                    {point}
                                                                    <button
                                                                        className="ml-2 opacity-0 group-hover:opacity-100"
                                                                        onClick={() => {
                                                                            const updatedLeads = [...leads]
                                                                            updatedLeads[actualIndex].leadDetails.painPoints.splice(i, 1)
                                                                            setEditedContent(JSON.stringify(updatedLeads, null, 2))
                                                                        }}
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                        <Input
                                                            placeholder="Add pain point"
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' && e.currentTarget.value) {
                                                                    const updatedLeads = [...leads]
                                                                    if (!updatedLeads[actualIndex].leadDetails) {
                                                                        updatedLeads[actualIndex].leadDetails = {}
                                                                    }
                                                                    if (!updatedLeads[actualIndex].leadDetails.painPoints) {
                                                                        updatedLeads[actualIndex].leadDetails.painPoints = []
                                                                    }
                                                                    updatedLeads[actualIndex].leadDetails.painPoints.push(e.currentTarget.value)
                                                                    setEditedContent(JSON.stringify(updatedLeads, null, 2))
                                                                    e.currentTarget.value = ''
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Remove Lead Button */}
                                        <Button 
                                            variant="destructive" 
                                            size="sm"
                                            onClick={() => {
                                                const updatedLeads = [...leads]
                                                updatedLeads.splice(actualIndex, 1)
                                                setEditedContent(JSON.stringify(updatedLeads, null, 2))
                                            }}
                                        >
                                            Remove Lead
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        )
                    })}
                </Accordion>

                {/* Add New Lead Button */}
                <Button
                    onClick={() => {
                        const newLead = {
                            contactInfo: { name: '', email: '', linkedin: '' },
                            companyInfo: { name: '', industry: '' },
                            leadDetails: { painPoints: [] }
                        }
                        const updatedLeads = [...leads, newLead]
                        setEditedContent(JSON.stringify(updatedLeads, null, 2))
                    }}
                    className="w-full mt-4"
                >
                    Add New Lead
                </Button>

                <ContinueButton />
            </div>
        )
    }

    if (step.name === 'Generated Content') {
        const results = Array.isArray(parsedContent) ? parsedContent : [];
        
        // Filter results based on search term
        const filteredResults = results.filter((result: WorkflowResult) => {
            if (!searchTerm) return true
            if (!result?.lead?.contactInfo) return false
            
            const searchLower = searchTerm.toLowerCase()
            const name = result.lead.contactInfo.name?.toLowerCase() || ''
            const company = result.lead.companyInfo?.name?.toLowerCase() || ''
            const email = result.lead.contactInfo.email?.toLowerCase() || ''
            return name.includes(searchLower) || company.includes(searchLower) || email.includes(searchLower)
        })
        
        return (
            <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search results by lead name, company, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                
                {/* Results count */}
                <div className="text-sm text-muted-foreground">
                    {searchTerm ? `${filteredResults.length} of ${results.length} results` : `${results.length} results`}
                </div>

                <ScrollArea className="h-[calc(100vh-8rem)]">
                    <Accordion type="single" collapsible className="w-full">
                        {filteredResults.map((result: WorkflowResult, index: number) => {
                            // Validate result object structure
                            if (!result?.lead?.contactInfo || !result?.emailContent || !result?.linkedInContent) {
                                return null;
                            }

                            const { lead, emailContent, linkedInContent } = result;

                            return (
                                <AccordionItem key={index} value={`result-${index}`}>
                                    <AccordionTrigger>
                                        {lead.contactInfo?.name || 'Unnamed Lead'} - {' '}
                                        {lead.companyInfo?.name || 'Unknown Company'}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-6">
                                            {/* Lead Information */}
                                            <div>
                                                <h4 className="font-medium mb-2">Lead Information</h4>
                                                <div className="space-y-2 text-sm">
                                                    <p><span className="font-medium">Name:</span> {lead.contactInfo.name || 'N/A'}</p>
                                                    <p><span className="font-medium">Email:</span> {lead.contactInfo.email || 'N/A'}</p>
                                                    <p><span className="font-medium">LinkedIn:</span> {lead.contactInfo.linkedin || 'N/A'}</p>
                                                    <p><span className="font-medium">Company:</span> {lead.companyInfo?.name || 'N/A'}</p>
                                                    <p><span className="font-medium">Industry:</span> {lead.companyInfo?.industry || 'N/A'}</p>
                                                </div>
                                            </div>                            {/* Email Content */}
                            <div>
                                <h4 className="font-medium mb-4">Email</h4>
                                <WorkflowEmailEditor
                                    to={lead.contactInfo.email || ''}
                                    subject={emailContent.subject || ''}
                                    body={emailContent.body || ''}
                                    leadName={lead.contactInfo.name || 'Unknown'}
                                    initialAttachments={initialAttachments}
                                    onSend={(data) => {
                                        // Handle email sending logic here
                                        console.log('Sending email:', data);
                                        // You can implement actual email sending API call here
                                    }}
                                    onCopy={async () => {
                                        // Copy email content to clipboard
                                        const emailText = `To: ${lead.contactInfo.email}\nSubject: ${emailContent.subject}\n\n${emailContent.body}`;
                                        await navigator.clipboard.writeText(emailText);
                                    }}
                                    onDownload={() => {
                                        // Download email as file
                                        const emailText = `To: ${lead.contactInfo.email}\nSubject: ${emailContent.subject}\n\n${emailContent.body}`;
                                                        const blob = new Blob([emailText], { type: 'text/plain' });
                                                        const url = URL.createObjectURL(blob);
                                                        const a = document.createElement('a');
                                                        a.href = url;
                                                        a.download = `email-${lead.contactInfo.name || 'lead'}.txt`;
                                                        document.body.appendChild(a);
                                                        a.click();
                                                        document.body.removeChild(a);
                                                        URL.revokeObjectURL(url);
                                                    }}
                                                    isEditable={true}
                                                />
                                            </div>

                                            {/* LinkedIn Content */}
                                            <div>
                                                <h4 className="font-medium mb-2">LinkedIn Message</h4>
                                                <div className="bg-muted p-3 rounded">
                                                    <p className="whitespace-pre-wrap">{linkedInContent.message}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                    <SaveButton />
                </ScrollArea>
                
                {/* Save button for final step */}
                
            </div>
        );
    }

    // Default editor for Enhanced Intent step
    if (step.name === 'Enhanced Intent') {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">{step.name}</h3>
                    {!isEditing && (
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            disabled={isLoading || isParentLoading}
                        >
                            Edit Intent
                        </Button>
                    )}
                </div>

                {isEditing ? (
                    <div className="space-y-4">
                        <Textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            className="min-h-[400px] text-lg leading-relaxed font-mono"
                            placeholder="Enter enhanced intent..."
                        />
                        <div className="flex justify-end gap-2">
                            <Button 
                                variant="outline"
                                onClick={() => {
                                    setIsEditing(false)
                                    setEditedContent(step.content) // Reset to original content
                                }}
                                disabled={isLoading || isParentLoading}
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={() => {
                                    setIsEditing(false)
                                    handleSubmit(editedContent)
                                }}
                                disabled={isLoading || isParentLoading || !editedContent.trim()}
                            >
                                {(isLoading || isParentLoading) ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-muted rounded-lg p-6 text-lg leading-relaxed whitespace-pre-wrap">
                            {editedContent}
                        </div>
                        <ContinueButton />
                    </div>
                )}
            </div>
        )
    }

    // Default editor for other steps
    return (
        <div className="space-y-4">
            <div>
                <h3 className="font-medium mb-2">{step.name}</h3>
                <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className={cn(
                        "font-mono",
                        step.name === 'Enhanced Intent' 
                            ? "min-h-[400px] text-lg leading-relaxed"
                            : "min-h-[200px]"
                    )}
                    placeholder={`Enter ${step.name.toLowerCase()}...`}
                />
            </div>
            {isFinalStep ? <SaveButton /> : <ContinueButton />}
        </div>
    )
}