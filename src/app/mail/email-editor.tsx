"use client";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Text } from "@tiptap/extension-text";
import { useState } from "react";
import EditorMenubar from "./editor-menubar";
import { Separator } from "@/components/ui/separator";
import TagInput from "./tag-input";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  subject: string;
  setSubject: (value: string) => void;
  toValues: { label: string; value: string }[];
  setToValues: (values: { label: string; value: string }[]) => void;
  ccValues: { label: string; value: string }[];
  setCcValues: (values: { label: string; value: string }[]) => void;
  to: string[];
  handleSend: (value: string) => void;
  isSending: boolean; // Preserved for future use
  defaultToolBarExpanded: boolean;
};

const EmailEditor = ({
  subject,
  setSubject,
  toValues,
  setToValues,
  ccValues,
  setCcValues,
  to,
  handleSend,
  isSending: _isSending, // Preserved for future use but prefixed to avoid lint error
  defaultToolBarExpanded,
}: Props) => {
  const [value, setValue] = useState<string>("");
  const [expanded, setExpanded] = useState<boolean>(defaultToolBarExpanded);

  const CustomText = Text.extend({
    addKeyboardShortcuts() {
      return {
        "Meta-j": () => {
          console.log("Meta-j pressed");
          return true;
        },
      };
    },
  });

  const editor = useEditor({
    autofocus: true,
    extensions: [StarterKit, CustomText],
    onUpdate: ({ editor }) => {
      setValue(editor.getHTML());
    },
  });
  if (!editor) {
    return null;
  }
  return (
    <div>
      <div className="flex border-b p-4 py-2">
        <EditorMenubar editor={editor} />
      </div>
      <div className="space-y-2 p-4 pb-0">
        {expanded && (
          <>
            <TagInput
              placeholder="Add Recipients"
              label="To"
              onChange={setToValues}
              value={toValues}
            />
            <TagInput
              placeholder="Add Recipients"
              label="Cc"
              onChange={setCcValues}
              value={ccValues}
            />
            <Input
              id="subject"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <span className="font-medium text-green-600">Draft </span>
          <span>to {to.join(",")}</span>
        </div>
      </div>

      <div className="prose w-full px-4">
        <EditorContent editor={editor} value={value} />
      </div>      <Separator />
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm">
          Tips: Press{" "}
          <kbd className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-1.5 text-xs font-semibold text-gray-800">
            Cmd + J
          </kbd>{" "}
          For AI auto-completiion
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Coming Soon:</span>
          <Button
            disabled
            onClick={async () => {
              // Preserved for future use
              editor?.commands?.clearContent();
              handleSend(value);
            }}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailEditor;
