import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Heading2, Quote, Code } from 'lucide-react';

interface Props {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || 'Write your email...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-qq-border rounded-qq overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-qq-border bg-qq-bg-secondary">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`btn-icon ${editor.isActive('bold') ? 'bg-qq-hover text-qq-blue' : ''}`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`btn-icon ${editor.isActive('italic') ? 'bg-qq-hover text-qq-blue' : ''}`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`btn-icon ${editor.isActive('heading', { level: 2 }) ? 'bg-qq-hover text-qq-blue' : ''}`}
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-qq-border mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`btn-icon ${editor.isActive('bulletList') ? 'bg-qq-hover text-qq-blue' : ''}`}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`btn-icon ${editor.isActive('orderedList') ? 'bg-qq-hover text-qq-blue' : ''}`}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`btn-icon ${editor.isActive('blockquote') ? 'bg-qq-hover text-qq-blue' : ''}`}
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`btn-icon ${editor.isActive('codeBlock') ? 'bg-qq-hover text-qq-blue' : ''}`}
        >
          <Code className="w-4 h-4" />
        </button>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="min-h-[200px] max-h-[400px] overflow-y-auto px-4 py-3 prose prose-sm max-w-none"
      />
    </div>
  );
}
