import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { WorkflowStep } from "@/types/workflow";
import { useState, useEffect } from "react"


type StepEditorProps = {
    step: WorkflowStep;
    onSubmit: (content: string) => void;
}

export function StepEditor({ step, onSubmit }: StepEditorProps) {
    const [editedContent, setEditedContent] = useState(step.content)

    // Format JSON content when it changes
    useEffect(() => {
        if (step.content) {
            try {
                // Try to parse and format if it's JSON
                const parsed = JSON.parse(step.content)
                setEditedContent(JSON.stringify(parsed, null, 2))
            } catch {
                // If not JSON, use as is
                setEditedContent(step.content)
            }
        }
    }, [step.content])

    return (
        <div className="space-y-4">
            <div>
                <h3 className="font-medium mb-2">{step.name}</h3>
                <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="min-h-[200px] font-mono"
                    placeholder={`Enter ${step.name.toLowerCase()}...`}
                />
            </div>
            <Button 
                onClick={() => onSubmit(editedContent)}
                className="w-full"
            >
                Continue to Next Step
            </Button>
        </div>
    )
}