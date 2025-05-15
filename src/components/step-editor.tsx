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
import { Loader2 } from "lucide-react"

type StepEditorProps = {
    step: WorkflowStep;
    onSubmit: (content: string) => void;
}

export function StepEditor({ step, onSubmit }: StepEditorProps) {
    const [editedContent, setEditedContent] = useState(step.content)
    const [parsedContent, setParsedContent] = useState<any>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

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

    const ContinueButton = () => (
        <Button 
            onClick={() => handleSubmit(editedContent)} 
            className="w-full"
            disabled={isLoading}
        >
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                </>
            ) : (
                'Continue to Next Step'
            )}
        </Button>
    )

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
                                    value={profile.personalInfo}
                                    onChange={(e) => {
                                        const updatedProfile = { ...profile }
                                        updatedProfile.personalInfo = e.target.value
                                        setEditedContent(JSON.stringify(updatedProfile, null, 2))
                                    }}
                                    className="min-h-[100px]"
                                    placeholder="Enter personal information..."
                                />
                                <Textarea
                                    value={profile.summary}
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
                                {profile.experience.map((exp: any, i: number) => (
                                    <div key={i} className="border rounded p-4 space-y-2">
                                        <Input
                                            value={exp.company}
                                            onChange={(e) => {
                                                const updatedProfile = { ...profile }
                                                updatedProfile.experience[i].company = e.target.value
                                                setEditedContent(JSON.stringify(updatedProfile, null, 2))
                                            }}
                                            placeholder="Company name"
                                        />
                                        <Input
                                            value={exp.position}
                                            onChange={(e) => {
                                                const updatedProfile = { ...profile }
                                                updatedProfile.experience[i].position = e.target.value
                                                setEditedContent(JSON.stringify(updatedProfile, null, 2))
                                            }}
                                            placeholder="Position"
                                        />
                                        <Input
                                            value={exp.duration}
                                            onChange={(e) => {
                                                const updatedProfile = { ...profile }
                                                updatedProfile.experience[i].duration = e.target.value
                                                setEditedContent(JSON.stringify(updatedProfile, null, 2))
                                            }}
                                            placeholder="Duration"
                                        />
                                        <Textarea
                                            value={exp.description}
                                            onChange={(e) => {
                                                const updatedProfile = { ...profile }
                                                updatedProfile.experience[i].description = e.target.value
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
                                    {profile.skills.map((skill: string, i: number) => (
                                        <Badge key={i} variant="secondary" className="group">
                                            {skill}
                                            <button
                                                className="ml-2 opacity-0 group-hover:opacity-100"
                                                onClick={() => {
                                                    const updatedProfile = { ...profile }
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
                                        value={profile.communicationStyle.tone}
                                        onChange={(e) => {
                                            const updatedProfile = { ...profile }
                                            updatedProfile.communicationStyle.tone = e.target.value
                                            setEditedContent(JSON.stringify(updatedProfile, null, 2))
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Value Proposition</label>
                                    <Textarea
                                        value={profile.communicationStyle.valueProposition}
                                        onChange={(e) => {
                                            const updatedProfile = { ...profile }
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
        // Ensure leads data is valid
        const leads = Array.isArray(parsedContent) ? parsedContent : []
        
        return (
            <div className="space-y-4">
                {leads.length === 0 ? (
                    <div className="text-center p-4 text-muted-foreground">
                        No leads available or invalid data format
                    </div>
                ) : (
                    <Accordion type="single" collapsible className="w-full">
                        {leads.map((lead: any, index: number) => {
                            // Validate lead object structure
                            if (!lead?.contactInfo?.name || !lead?.companyInfo?.name) {
                                return null;
                            }
                            
                            return (
                                <AccordionItem key={index} value={`lead-${index}`}>
                                    <AccordionTrigger>
                                        {lead.contactInfo.name} - {lead.companyInfo.name}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-3">
                                            <div>
                                                <div className="font-medium">Contact Information</div>
                                                <div className="text-sm">
                                                    <div>{lead.contactInfo.title}</div>
                                                    <div>{lead.contactInfo.email}</div>
                                                    <div>{lead.contactInfo.linkedin}</div>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="font-medium">Company Details</div>
                                                <div className="text-sm">
                                                    <div>Industry: {lead.companyInfo.industry}</div>
                                                    <div>Size: {lead.companyInfo.size}</div>
                                                    <div>Location: {lead.companyInfo.location}</div>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="font-medium">Relevance</div>
                                                <div className="text-sm space-y-1">
                                                    {lead.leadDetails.relevance.jobSearch && (
                                                        <>
                                                            <div>Role Match: {lead.leadDetails.relevance.jobSearch.roleMatch}</div>
                                                            <div>Industry Match: {lead.leadDetails.relevance.jobSearch.industryMatch}</div>
                                                            <div>Experience Match: {lead.leadDetails.relevance.jobSearch.experienceMatch}</div>
                                                        </>
                                                    )}
                                                    {lead.leadDetails.relevance.sales && (
                                                        <>
                                                            <div>Product Fit: {lead.leadDetails.relevance.sales.productFit}</div>
                                                            <div>Market Segment: {lead.leadDetails.relevance.sales.marketSegment}</div>
                                                            <div>Budget Alignment: {lead.leadDetails.relevance.sales.budgetAlignment}</div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                )}
                
                <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="min-h-[200px] font-mono mt-4"
                    placeholder="Edit lead data..."
                />
                
                <Button 
                    onClick={() => {
                        try {
                            // Validate the edited content is valid JSON array
                            const parsed = JSON.parse(editedContent)
                            if (!Array.isArray(parsed)) {
                                throw new Error('Content must be an array')
                            }
                            handleSubmit(editedContent)
                        } catch (error) {
                            console.error('Invalid content:', error)
                            // You might want to show an error message to the user here
                        }
                    }} 
                    className="w-full"
                    disabled={isLoading}
                >
                    {isLoading ? (
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
                            disabled={isLoading}
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
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={() => {
                                    setIsEditing(false)
                                    handleSubmit(editedContent)
                                }}
                                disabled={isLoading}
                            >
                                {isLoading ? (
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
            <ContinueButton />
        </div>
    )
}