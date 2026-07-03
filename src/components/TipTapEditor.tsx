'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, { useEffect } from 'react';

interface TipTapEditorProps {
  content: any; // TipTap JSON
  onChange: (json: any) => void;
}

export default function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[250px] max-h-[500px] overflow-y-auto p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm leading-relaxed',
      },
    },
  });

  // Met à jour l'éditeur si le contenu change (changement de jour par exemple)
  useEffect(() => {
    if (editor && content) {
      const currentContent = JSON.stringify(editor.getJSON());
      const incomingContent = JSON.stringify(content);
      if (currentContent !== incomingContent) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="space-y-2 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
      {/* Barre d'outils */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400">
        {/* Titres */}
        <button
          type="button"
          onClick={() => editor.commands.toggleHeading({ level: 2 })}
          className={`px-2 py-1 rounded text-xs font-bold transition-all ${
            editor.isActive('heading', { level: 2 }) ? 'bg-amber-600 text-white' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          Titre H2
        </button>
        <button
          type="button"
          onClick={() => editor.commands.toggleHeading({ level: 3 })}
          className={`px-2 py-1 rounded text-xs font-bold transition-all ${
            editor.isActive('heading', { level: 3 }) ? 'bg-amber-600 text-white' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          Sous-titre H3
        </button>

        <span className="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-1" />

        {/* Gras / Italique */}
        <button
          type="button"
          onClick={() => editor.commands.toggleBold()}
          className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
            editor.isActive('bold') ? 'bg-amber-600 text-white' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
          title="Gras"
        >
          Gras
        </button>
        <button
          type="button"
          onClick={() => editor.commands.toggleItalic()}
          className={`px-2.5 py-1 rounded text-xs italic font-bold transition-all ${
            editor.isActive('italic') ? 'bg-amber-600 text-white' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
          title="Italique"
        >
          Italique
        </button>

        <span className="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-1" />

        {/* Listes */}
        <button
          type="button"
          onClick={() => editor.commands.toggleBulletList()}
          className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
            editor.isActive('bulletList') ? 'bg-amber-600 text-white' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
          title="Liste à puces"
        >
          • Liste
        </button>
        <button
          type="button"
          onClick={() => editor.commands.toggleOrderedList()}
          className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
            editor.isActive('orderedList') ? 'bg-amber-600 text-white' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
          title="Liste ordonnée"
        >
          1. Liste
        </button>

        <span className="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-1" />

        {/* Citations et Blocs */}
        <button
          type="button"
          onClick={() => editor.commands.toggleBlockquote()}
          className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
            editor.isActive('blockquote') ? 'bg-amber-600 text-white' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
          title="Citation"
        >
          « Citation »
        </button>
        <button
          type="button"
          onClick={() => editor.commands.toggleCodeBlock()}
          className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
            editor.isActive('codeBlock') ? 'bg-amber-600 text-white' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
          title="Verset mis en valeur"
        >
          [Verset mis en valeur]
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
