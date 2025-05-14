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

type StepEditorProps = {
    step: WorkflowStep;
    onSubmit: (content: string) => void;
}

export function StepEditor({ step, onSubmit }: StepEditorProps) {
    const [editedContent, setEditedContent] = useState(step.content)
    const [parsedContent, setParsedContent] = useState<any>(null)

    useEffect(() => {
        if (step.content) {
            try {
                const parsed = JSON.parse(step.content)
                setParsedContent(parsed)
                setEditedContent(JSON.stringify(parsed, null, 2))
            } catch {
                setEditedContent(step.content)
            }
        }
    }, [step.content])

    if (step.name === 'Profile Analysis') {
        const profile = parsedContent
        return (
            <div className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                    {profile?.personalInfo && (
                        <AccordionItem value="personal">
                            <AccordionTrigger>Personal Information</AccordionTrigger>
                            <AccordionContent>
                                <div className="text-sm">{profile.personalInfo}</div>
                            </AccordionContent>
                        </AccordionItem>
                    )}

                    {profile?.experience && (
                        <AccordionItem value="experience">
                            <AccordionTrigger>Experience</AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-3">
                                    {profile.experience.map((exp: any, i: number) => (
                                        <div key={i} className="border rounded p-3">
                                            <div className="font-medium">{exp.position}</div>
                                            <div className="text-sm text-muted-foreground">{exp.company} • {exp.duration}</div>
                                            <div className="text-sm mt-2">{exp.description}</div>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    )}

                    {profile?.skills && (
                        <AccordionItem value="skills">
                            <AccordionTrigger>Skills</AccordionTrigger>
                            <AccordionContent>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map((skill: string, i: number) => (
                                        <Badge key={i} variant="secondary">{skill}</Badge>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    )}

                    {profile?.communicationStyle && (
                        <AccordionItem value="communication">
                            <AccordionTrigger>Communication Strategy</AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-2">
                                    <div>
                                        <div className="font-medium">Tone</div>
                                        <div className="text-sm">{profile.communicationStyle.tone}</div>
                                    </div>
                                    <div>
                                        <div className="font-medium">Value Proposition</div>
                                        <div className="text-sm">{profile.communicationStyle.valueProposition}</div>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    )}
                </Accordion>

                <div className="mt-4">
                    <Button onClick={() => onSubmit(editedContent)} className="w-full">
                        Continue to Next Step
                    </Button>
                </div>
            </div>
        )
    }

    if (step.name === 'Lead Analysis') {
        const leads = parsedContent
        return (
            <div className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                    {leads?.map((lead: any, index: number) => (
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
                    ))}
                </Accordion>

                <div className="mt-4">
                    <Button onClick={() => onSubmit(editedContent)} className="w-full">
                        Continue to Next Step
                    </Button>
                </div>
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
            <Button onClick={() => onSubmit(editedContent)} className="w-full">
                Continue to Next Step
            </Button>
        </div>
    )
}