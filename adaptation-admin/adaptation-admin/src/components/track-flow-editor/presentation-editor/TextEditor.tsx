import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from '@/components/ui/button'
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  Quote, 
  Link as LinkIcon, 
  Undo, 
  Redo 
} from 'lucide-react'
import { useEffect, useRef, useLayoutEffect } from 'react'

interface TextEditorProps {
  content: string; 
  onChange: (content: string) => void;
}

export function TextEditor({ content, onChange }: TextEditorProps) {
  const initRef = useRef(false);
  const contentRef = useRef(content);
  const updateCountRef = useRef(0);
  const editorContentSetRef = useRef(false);
  
  // Log incoming props
  useEffect(() => {
    console.log('TextEditor props updated', { 
      contentLength: content?.length || 0,
      contentFirstChars: content?.substring(0, 30) || '',
      hasContentChanged: content !== contentRef.current,
      updateCount: ++updateCountRef.current
    });
    
    contentRef.current = content;
  }, [content]);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Placeholder.configure({
        placeholder: 'Введите текст слайда...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      console.log('TextEditor onUpdate triggered', {
        newContentLength: newContent?.length || 0,
        previousContentLength: contentRef.current?.length || 0,
        isDifferent: newContent !== contentRef.current
      });
      onChange(newContent);
    },
  })
  
  // Use a layout effect to update content from props immediately when it changes
  useLayoutEffect(() => {
    if (!editor || !content) return;
    
    const currentContent = editor.getHTML();
    
    if (content !== currentContent) {
      console.log('TextEditor forcing content update with layoutEffect', {
        newContentLength: content?.length || 0,
        currentEditorContent: currentContent?.length || 0
      });
      
      // Set a flag to indicate we've updated the content
      editorContentSetRef.current = true;
      
      // Use transactionUpdate with setContent for better performance
      editor.commands.setContent(content, false);
    }
  }, [editor, content]);
  
  // Update content when props change
  useEffect(() => {
    if (!editor || !content) return;
    
    // Skip first update since content is initialized in useEditor
    if (!initRef.current) {
      initRef.current = true;
      return;
    }
    
    // If already updated in the layout effect, skip
    if (editorContentSetRef.current) {
      editorContentSetRef.current = false;
      return;
    }
    
    // Only update if editor content differs from new content
    const currentContent = editor.getHTML();
    
    if (content !== currentContent) {
      console.log('TextEditor content prop changed, updating editor', {
        newContentLength: content?.length || 0,
        currentEditorContent: currentContent?.length || 0
      });
      
      editor.commands.setContent(content, false);
    }
  }, [editor, content]);

  if (!editor) {
    return <div>Загрузка редактора...</div>
  }

  return (
    <div className="border rounded-lg">
      <div className="border-b p-2 flex flex-wrap gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-muted' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-muted' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'bg-muted' : ''}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-muted' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-muted' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-muted' : ''}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = window.prompt('URL')
            if (url) {
              editor.chain().focus().setLink({ href: url }).run()
            }
          }}
          className={editor.isActive('link') ? 'bg-muted' : ''}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 min-h-[300px] focus:outline-none"
      />
    </div>
  )
} 