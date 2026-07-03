'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, { useEffect } from 'react';

interface TipTapRendererProps {
  content: any; // TipTap JSON
}

export default function TipTapRenderer({ content }: TipTapRendererProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
    ],
    content: content || '',
    editable: false, // Lecture seule
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none text-zinc-800 dark:text-zinc-200 text-sm md:text-base leading-relaxed',
      },
    },
  });

  // Met à jour l'afficheur si le contenu change
  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  return <EditorContent editor={editor} />;
}
