"use client";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Text } from "@tiptap/extension-text";
import { useState } from "react";
import EditorMenubar from "./editor-menubar";
import { Separator } from "@/components/ui/separator";

type Props = {};

const EmailEditor = (props: Props) => {
  const [value, setValue] = useState<string>("");
  const [expanded, setExpanded] = useState<boolean>(false);

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
      <div className="p-4 pb-0 space-y-2">
        {expanded && (
            <>
             cc inputs
            </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="cursor-pointer" onClick={() => setExpanded(!expanded)}></div>
      </div>

      <div className="prose w-full px-4">
        <EditorContent editor={editor} value={value} />
      </div>
      <Separator />
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm">
          Tips: Press{" "}
          <kbd className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-1.5 text-xs font-semibold text-gray-800">
            Cmd + J
          </kbd>{" "}
          For AI auto-completiion
        </span>
      </div>
    </div>
  );
};

export default EmailEditor;
