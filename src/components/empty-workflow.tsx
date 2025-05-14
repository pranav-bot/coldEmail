'use client'

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { api } from "@/trpc/react"

export function EmptyWorkflow() {
  const createEmptyWorkflow = api.workflow.create.useMutation({
    onSuccess: (data) => {
      // You can add navigation to the new workflow here if needed
      console.log('Created empty workflow:', data)
    },
  })

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-8 w-8"
      onClick={() => {
        createEmptyWorkflow.mutate({
          title: "Untitled Workflow",
          prompt: "",
          content: "",
          type: "draft",
          leadMessage: "",
        })
      }}
    >
      <Plus className="h-4 w-4" />
      <span className="sr-only">Add workflow</span>
    </Button>
  )
}