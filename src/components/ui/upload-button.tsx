'use client'

import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

export function UploadButton() {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => document.getElementById("file-upload")?.click()}
    >
      <Upload className="h-4 w-4" />
      <input
        id="file-upload"
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            // Handle file upload
            console.log("Uploading file:", file)
          }
        }}
      />
    </Button>
  )
}