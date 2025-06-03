"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Paperclip, Send, Copy, Download, Edit3, X, Loader2 } from "lucide-react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Text } from "@tiptap/extension-text";
import EditorMenubar from "@/app/mail/editor-menubar";
import { toast } from "sonner";

// Utility function to format plain text into proper HTML paragraphs
function formatEmailBody(text: string): string {
    if (!text) return '';
    
    // First, handle common email patterns and create logical breaks
    let formattedText = text
        // Add breaks after greetings
        .replace(/(Hi [^,]+,)\s*/g, '$1\n\n')
        .replace(/(Hello [^,]+,)\s*/g, '$1\n\n')
        .replace(/(Dear [^,]+,)\s*/g, '$1\n\n')
        // Add breaks before closing statements
        .replace(/\s+(Thanks for your time|Thank you|Best regards|Sincerely|Looking forward)/g, '\n\n$1')
        // Add breaks after sentences that end with specific patterns
        .replace(/(\. )(I'm [A-Z]|My [A-Z]|I noticed|I'm confident|Would you)/g, '$1\n\n$2')
        // Add breaks after long sentences (>120 chars) that end with a period
        .replace(/([^.]{120,}\.)\s+([A-Z])/g, '$1\n\n$2');
    
    // Split into paragraphs and clean up
    const paragraphs = formattedText
        .split(/\n\s*\n/) // Split on double line breaks
        .map(p => p.trim())
        .filter(p => p.length > 0);
    
    // Convert to HTML paragraphs
    return paragraphs
        .map(p => `<p>${p}</p>`)
        .join('');
}

type WorkflowEmailEditorProps = {
    to: string;
    subject: string;
    body: string;
    leadName: string;
    onSend?: (data: { to: string; subject: string; body: string; attachments: File[] }) => void;
    onCopy?: () => void;
    onDownload?: () => void;
    isEditable?: boolean;
};

export function WorkflowEmailEditor({
    to,
    subject: initialSubject,
    body: initialBody,
    leadName,
    onSend,
    onCopy,
    onDownload,
    isEditable = true
}: WorkflowEmailEditorProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editableSubject, setEditableSubject] = useState(initialSubject);
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isSending, setIsSending] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Format the initial body content into proper HTML
    const formattedBody = formatEmailBody(initialBody);
    const [editableBody, setEditableBody] = useState(formattedBody);

    const editor = useEditor({
        extensions: [StarterKit, Text],
        content: formattedBody,
        onUpdate: ({ editor }) => {
            setEditableBody(editor.getHTML());
        },
        editable: isEditing,
    });

    const handleEdit = () => {
        setIsEditing(!isEditing);
        if (editor) {
            editor.setEditable(!isEditing);
        }
    };

    const handleSave = () => {
        setIsEditing(false);
        if (editor) {
            editor.setEditable(false);
        }
    };

    const handleSend = async () => {
        if (!onSend) return;
        
        setIsSending(true);
        try {
            await onSend({
                to,
                subject: editableSubject,
                body: editableBody,
                attachments
            });
            toast.success("Email sent successfully!");
        } catch (error) {
            toast.error("Failed to send email");
        } finally {
            setIsSending(false);
        }
    };

    const handleCopy = async () => {
        // Convert HTML back to plain text for copying
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = editableBody;
        const plainText = tempDiv.textContent || tempDiv.innerText || '';
        
        const emailContent = `To: ${to}\nSubject: ${editableSubject}\n\n${plainText}`;
        
        try {
            await navigator.clipboard.writeText(emailContent);
            toast.success("Email content copied to clipboard!");
            onCopy?.();
        } catch (error) {
            toast.error("Failed to copy to clipboard");
        }
    };

    const handleDownload = () => {
        // Convert HTML back to plain text for download
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = editableBody;
        const plainText = tempDiv.textContent || tempDiv.innerText || '';
        
        const emailContent = `To: ${to}\nSubject: ${editableSubject}\n\n${plainText}`;
        const blob = new Blob([emailContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `email_${leadName.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Email downloaded!");
        onDownload?.();
    };

    const handleFileAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setAttachments(prev => [...prev, ...files]);
        toast.success(`${files.length} file(s) attached`);
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
        toast.success("Attachment removed");
    };

    return (
        <div className="border rounded-lg bg-background">
            {/* Email Header */}
            <div className="p-4 border-b bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-lg">Email to {leadName}</h4>
                    <div className="flex gap-2">
                        {isEditable && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleEdit}
                                className="h-8"
                            >
                                <Edit3 className="h-3 w-3 mr-1" />
                                {isEditing ? 'View' : 'Edit'}
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopy}
                            className="h-8"
                        >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownload}
                            className="h-8"
                        >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                        </Button>
                    </div>
                </div>

                {/* Email Fields */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium w-12">To:</span>
                        <span className="text-sm px-2 py-1 bg-primary/10 rounded text-primary">{to}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium w-12">Subject:</span>
                        {isEditing ? (
                            <Input
                                value={editableSubject}
                                onChange={(e) => setEditableSubject(e.target.value)}
                                className="flex-1 h-8"
                                placeholder="Email subject"
                            />
                        ) : (
                            <span className="text-sm font-medium">{editableSubject}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Editor Toolbar (only show when editing) */}
            {isEditing && editor && (
                <div className="p-2 border-b bg-muted/20">
                    <EditorMenubar editor={editor} />
                </div>
            )}

            {/* Email Body */}
            <div className="p-4">
                {isEditing && editor ? (
                    <div className="prose w-full max-w-none">
                        <EditorContent editor={editor} className="min-h-[200px]" />
                    </div>
                ) : (
                    <div 
                        className="prose max-w-none text-sm leading-relaxed space-y-3"
                        style={{
                            lineHeight: '1.6'
                        }}
                        dangerouslySetInnerHTML={{ __html: editableBody }}
                    />
                )}
            </div>

            {/* Attachments Section */}
            {(attachments.length > 0 || isEditing) && (
                <>
                    <Separator />
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium">Attachments</span>
                            {isEditing && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="h-8"
                                >
                                    <Paperclip className="h-3 w-3 mr-1" />
                                    Attach File
                                </Button>
                            )}
                        </div>
                        
                        {attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {attachments.map((file, index) => (
                                    <Badge key={index} variant="secondary" className="py-1 px-2">
                                        <Paperclip className="h-3 w-3 mr-1" />
                                        {file.name}
                                        {isEditing && (
                                            <button
                                                onClick={() => removeAttachment(index)}
                                                className="ml-2 hover:text-destructive"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        )}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {attachments.length === 0 && !isEditing && (
                            <p className="text-sm text-muted-foreground">No attachments</p>
                        )}
                    </div>
                </>
            )}

            {/* Action Buttons */}
            <Separator />
            <div className="p-4 flex justify-between items-center">
                <div className="text-xs text-muted-foreground">
                    {isEditing ? "Make your changes and save when ready" : "Ready to send or continue editing"}
                </div>
                <div className="flex gap-2">
                    {isEditing && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSave}
                        >
                            Save Changes
                        </Button>
                    )}
                    {onSend && (
                        <Button
                            onClick={handleSend}
                            disabled={isSending}
                            size="sm"
                        >
                            {isSending ? (
                                <>
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="h-3 w-3 mr-1" />
                                    Send Email
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileAttachment}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.xlsx,.csv"
            />
        </div>
    );
}
