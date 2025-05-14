import React, { useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Plus, 
  Trash2, 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Redo, 
  Strikethrough, 
  Undo, 
  Heading1, 
  Heading2, 
  Link as LinkIcon 
} from 'lucide-react'
import { TextSlide, ChoiceQuestion } from '@/types'

// Вспомогательная функция для преобразования HTML в текст
const htmlToPlainText = (html: string) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
};

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

const RichTextEditor = ({ content, onChange, placeholder = 'Введите текст...' }: RichTextEditorProps) => {
  // Используем локальное состояние для хранения контента
  const [localContent, setLocalContent] = useState(content);
  
  // Эффект для синхронизации внешнего контента с локальным при изменении пропсов
  useEffect(() => {
    setLocalContent(content);
  }, [content]);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: localContent,
    onUpdate: ({ editor }) => {
      // Обновляем только локальное состояние при вводе
      setLocalContent(editor.getHTML());
    },
    // Отложенный вызов onChange для предотвращения потери фокуса
    onBlur: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Вызываем внешний onChange только при размонтировании компонента
  // или когда компонент теряет фокус
  useEffect(() => {
    return () => {
      if (localContent !== content) {
        onChange(localContent);
      }
    };
  }, [localContent, content, onChange]);

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
        className="prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none"
      />
    </div>
  )
}

// Компонент для отображения форматированного текста
interface HtmlContentProps {
  html: string
  className?: string
}

const HtmlContent: React.FC<HtmlContentProps> = ({ html, className = '' }) => {
  return (
    <div 
      className={`prose prose-sm ${className}`} 
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
};

interface SlidesEditorProps {
  slides: (TextSlide | ChoiceQuestion)[]
  onChange: (slides: (TextSlide | ChoiceQuestion)[]) => void
}

export const SlidesEditor: React.FC<SlidesEditorProps> = ({ slides, onChange }) => {
  const addSlide = (type: 'text' | 'choice') => {
    const newSlide = type === 'text' 
      ? {
          id: crypto.randomUUID(),
          type: 'text' as const,
          content: ''
        } 
      : {
          id: crypto.randomUUID(),
          type: 'choice' as const,
          title: 'Новый вопрос',
          options: [''],
          multiple: false,
          required: true
        }
    onChange([...slides, newSlide])
  }

  const updateSlide = (index: number, slide: TextSlide | ChoiceQuestion) => {
    const newSlides = [...slides]
    newSlides[index] = slide
    onChange(newSlides)
  }

  const removeSlide = (index: number) => {
    const newSlides = [...slides]
    newSlides.splice(index, 1)
    onChange(newSlides)
  }

  // Функция для отображения превью текстового слайда
  const renderTextSlidePreview = (content: string) => {
    if (!content) return 'Пустой текстовый слайд';
    
    // Получаем текст без HTML для превью
    const plainText = htmlToPlainText(content);
    return plainText.length > 120 ? `${plainText.slice(0, 120)}...` : plainText;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium">Слайды</h4>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => addSlide('text')}>
            <Plus className="h-4 w-4 mr-2" />
            Текст
          </Button>
          <Button variant="outline" size="sm" onClick={() => addSlide('choice')}>
            <Plus className="h-4 w-4 mr-2" />
            Вопрос
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        {slides.map((slide, index) => (
          <div key={slide.id || index} className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-4">
              <h5 className="font-medium">Слайд {index + 1} ({slide.type === 'text' ? 'Текст' : 'Вопрос'})</h5>
              <Button variant="ghost" size="icon" onClick={() => removeSlide(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Превью содержимого слайда */}
            {slide.type === 'text' && (
              <div className="mb-4 p-2 bg-muted/30 rounded text-sm line-clamp-2">
                {renderTextSlidePreview(slide.content)}
              </div>
            )}
            {slide.type === 'choice' && (
              <div className="mb-4 p-2 bg-muted/30 rounded text-sm line-clamp-2">
                {slide.title || 'Вопрос без заголовка'}
              </div>
            )}
            
            <div className="space-y-4">
              {slide.type === 'text' && (
                <>
                  <div className="space-y-2">
                    <Label>Содержимое</Label>
                    <RichTextEditor
                      content={slide.content}
                      onChange={(content) => updateSlide(index, { ...slide, content })}
                      placeholder="Введите текст слайда..."
                    />
                  </div>
                </>
              )}
              {slide.type === 'choice' && (
                <>
                  <div className="space-y-2">
                    <Label>Заголовок вопроса</Label>
                    <Input
                      value={slide.title}
                      onChange={e => updateSlide(index, { ...slide, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Варианты ответов</Label>
                    {slide.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <Input
                          value={option}
                          onChange={e => {
                            const newOptions = [...slide.options]
                            newOptions[optionIndex] = e.target.value
                            updateSlide(index, { ...slide, options: newOptions })
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (slide.options.length > 1) {
                              const newOptions = [...slide.options]
                              newOptions.splice(optionIndex, 1)
                              updateSlide(index, { ...slide, options: newOptions })
                            }
                          }}
                          disabled={slide.options.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newOptions = [...slide.options, '']
                        updateSlide(index, { ...slide, options: newOptions })
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Добавить вариант
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id={`multiple-${index}`}
                        checked={slide.multiple}
                        onChange={e => updateSlide(index, { ...slide, multiple: e.target.checked })}
                      />
                      <Label htmlFor={`multiple-${index}`}>Множественный выбор</Label>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
        {slides.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <p>Нет слайдов. Добавьте слайд, чтобы начать.</p>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => addSlide('text')}>
                <Plus className="h-4 w-4 mr-2" />
                Текст
              </Button>
              <Button variant="outline" size="sm" onClick={() => addSlide('choice')}>
                <Plus className="h-4 w-4 mr-2" />
                Вопрос
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 