"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";

type Props = {
  initialContent: any;
  onChange: (content: any) => void;
  editable?: boolean;
};

export default function DocumentEditor({
  initialContent,
  onChange,
  editable = true,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
    ],
    content: initialContent,
    editable,
    immediatelyRender: false,

    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50 p-3">
        <button
          disabled={!editable}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-indigo-400 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Bold
        </button>

        <button
          disabled={!editable}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-indigo-400 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Italic
        </button>

        <button
          disabled={!editable}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-indigo-400 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Underline
        </button>

        <button
          disabled={!editable}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-indigo-400 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          H1
        </button>

        <button
          disabled={!editable}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-indigo-400 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Bullet List
        </button>

        <button
          disabled={!editable}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-indigo-400 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Numbered List
        </button>
      </div>

      <EditorContent
        editor={editor}
        className="px-6 py-6 prose max-w-none sm:px-10"
      />
    </div>
  );
}
