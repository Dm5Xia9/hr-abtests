import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from '@hello-pangea/dnd'
import { 
  Plus, 
  GripVertical, 
  Trash2, 
  FileText, 
  Video, 
  Image as ImageIcon, 
  Edit, 
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Presentation,
  Maximize,
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
  Link as LinkIcon,
  HelpCircle,
  Check,
  CheckCircle2,
  CircleOff
} from 'lucide-react'
import { 
  PresentationStage, 
  Slide, 
  TextSlide, 
  VideoSlide, 
  ImageSlide, 
  TestSlide,
  TestOption
} from '@/types'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'

// Create local RadioGroup components to avoid the import error
const RadioGroup = ({ 
  value, 
  onValueChange, 
  className, 
  children 
}: { 
  value: string; 
  onValueChange: (value: string) => void; 
  className?: string; 
  children: React.ReactNode;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      {children}
    </div>
  );
};

const RadioGroupItem = ({ 
  value, 
  id 
}: { 
  value: string; 
  id: string; 
}) => {
  return (
    <div className="flex items-center space-x-2">
      <input 
        type="radio" 
        id={id} 
        value={value} 
        className="h-4 w-4 text-primary border-muted-foreground focus:ring-primary" 
      />
    </div>
  );
};

interface PresentationEditorProps {
  stage: PresentationStage
  onChange: (content: PresentationStage['content']) => void
}

export function PresentationEditor({ stage, onChange }: PresentationEditorProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [showFullscreenPreview, setShowFullscreenPreview] = useState(false)
  const [currentPreviewSlideIndex, setCurrentPreviewSlideIndex] = useState(0)

  const handleAddSlide = (type: Slide['type']) => {
    const baseSlide = {
      id: crypto.randomUUID(),
      type
    }

    let newSlide: Slide
    switch (type) {
      case 'text':
        newSlide = {
          ...baseSlide,
          type: 'text',
          content: ''
        } as TextSlide
        break
      case 'video':
        newSlide = {
          ...baseSlide,
          type: 'video',
          url: '',
          caption: ''
        } as VideoSlide
        break
      case 'image':
        newSlide = {
          ...baseSlide,
          type: 'image',
          url: '',
          caption: ''
        } as ImageSlide
        break
      case 'test':
        newSlide = {
          ...baseSlide,
          type: 'test',
          question: '',
          options: [
            {
              id: crypto.randomUUID(),
              text: '',
              isCorrect: false
            },
            {
              id: crypto.randomUUID(),
              text: '',
              isCorrect: false
            }
          ],
          testType: 'single',
          explanation: ''
        } as TestSlide
        break
      default:
        return
    }

    onChange({
      slides: [...stage.content.slides, newSlide]
    })
    setShowAddDialog(false)
    setSelectedSlide(newSlide)
  }

  const handleDeleteSlide = (id: string) => {
    onChange({
      slides: stage.content.slides.filter(s => s.id !== id)
    })
    if (selectedSlide?.id === id) {
      setSelectedSlide(null)
    }
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(stage.content.slides)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    onChange({ slides: items })
  }

  const handleSlideChange = (id: string, updates: Partial<Slide>) => {
    const updatedSlides = stage.content.slides.map(slide => {
      if (slide.id !== id) return slide;
      
      // Create type-safe updates based on slide type
      switch (slide.type) {
        case 'text':
          return { ...slide, ...updates } as TextSlide;
        case 'video':
          return { ...slide, ...updates } as VideoSlide;
        case 'image':
          return { ...slide, ...updates } as ImageSlide;
        case 'test':
          return { ...slide, ...updates } as TestSlide;
        default:
          return slide;
      }
    });
    
    onChange({ slides: updatedSlides });

    // Update selected slide if it's being edited
    if (selectedSlide?.id === id) {
      const updatedSlide = updatedSlides.find(s => s.id === id) || null;
      setSelectedSlide(updatedSlide);
    }
  }

  const getSlidePreview = (slide: Slide) => {
    switch (slide.type) {
      case 'text':
        const textSlide = slide as TextSlide
        return (
          <div className="p-2 overflow-hidden">
            <p className="text-sm line-clamp-3">{textSlide.content || 'Пустой текстовый слайд'}</p>
          </div>
        )
      case 'video':
        const videoSlide = slide as VideoSlide
        return (
          <div className="p-2">
            <div className="aspect-video bg-muted flex items-center justify-center rounded">
              <Video className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-xs mt-1 truncate">{videoSlide.url || 'URL видео не указан'}</p>
          </div>
        )
      case 'image':
        const imageSlide = slide as ImageSlide
        return (
          <div className="p-2">
            {imageSlide.url ? (
              <div className="aspect-video bg-muted rounded overflow-hidden">
                <img 
                  src={imageSlide.url} 
                  alt={imageSlide.caption || 'Изображение'} 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video bg-muted flex items-center justify-center rounded">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <p className="text-xs mt-1 truncate">{imageSlide.caption || 'Изображение без подписи'}</p>
          </div>
        )
      case 'test':
        const testSlide = slide as TestSlide
        return (
          <div className="p-2">
            <div className="flex items-center justify-center rounded h-16 bg-orange-100">
              <HelpCircle className="h-6 w-6 text-orange-600 mr-2" />
              <span className="text-sm font-medium text-orange-800">
                {testSlide.testType === 'single' ? 'Тест с одним ответом' : 'Тест с множеством ответов'}
              </span>
            </div>
            <p className="text-xs mt-1 truncate">{testSlide.question || 'Вопрос теста не указан'}</p>
          </div>
        )
      default:
        return <div>Неизвестный тип слайда</div>
    }
  }

  const TextEditor = ({ content, onChange }: { content: string, onChange: (content: string) => void }) => {
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
        onChange(editor.getHTML())
      },
    })
  
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

  const getSlideEditor = (slide: Slide) => {
    switch (slide.type) {
      case 'text':
        const textSlide = slide as TextSlide
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-content">Содержимое</Label>
              <TextEditor 
                content={textSlide.content}
                onChange={(content) => handleSlideChange(slide.id, { content })}
              />
            </div>
          </div>
        )
      case 'video':
        const videoSlide = slide as VideoSlide
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video-url">URL видео</Label>
              <Input
                id="video-url"
                value={videoSlide.url}
                onChange={e => handleSlideChange(slide.id, { url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video-caption">Подпись</Label>
              <Input
                id="video-caption"
                value={videoSlide.caption || ''}
                onChange={e => handleSlideChange(slide.id, { caption: e.target.value })}
                placeholder="Добавьте подпись к видео..."
              />
            </div>
            {videoSlide.url && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Предпросмотр</h3>
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <iframe
                    src={videoSlide.url.replace('watch?v=', 'embed/')}
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}
          </div>
        )
      case 'image':
        const imageSlide = slide as ImageSlide
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">URL изображения</Label>
              <Input
                id="image-url"
                value={imageSlide.url}
                onChange={e => handleSlideChange(slide.id, { url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image-caption">Подпись</Label>
              <Input
                id="image-caption"
                value={imageSlide.caption || ''}
                onChange={e => handleSlideChange(slide.id, { caption: e.target.value })}
                placeholder="Добавьте подпись к изображению..."
              />
            </div>
            {imageSlide.url && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Предпросмотр</h3>
                <div className="rounded-lg overflow-hidden border">
                  <img
                    src={imageSlide.url}
                    alt={imageSlide.caption || 'Preview'}
                    className="max-w-full max-h-[300px] object-contain mx-auto"
                  />
                </div>
              </div>
            )}
          </div>
        )
      case 'test':
        const testSlide = slide as TestSlide
        
        const handleTestTypeChange = (value: 'single' | 'multiple') => {
          // If changing from multiple to single, make sure only one answer is marked as correct
          if (value === 'single') {
            const correctOptions = testSlide.options.filter(o => o.isCorrect);
            if (correctOptions.length > 1) {
              const updatedOptions = [...testSlide.options];
              // Keep only the first correct answer
              updatedOptions.forEach((option, index) => {
                if (option.isCorrect && index > updatedOptions.findIndex(o => o.isCorrect)) {
                  option.isCorrect = false;
                }
              });
              
              handleSlideChange(slide.id, { 
                testType: value,
                options: updatedOptions
              });
              return;
            }
          }
          
          handleSlideChange(slide.id, { testType: value });
        };
        
        const handleAddOption = () => {
          const newOption: TestOption = {
            id: crypto.randomUUID(),
            text: '',
            isCorrect: false
          };
          
          handleSlideChange(slide.id, { 
            options: [...testSlide.options, newOption]
          });
        };
        
        const handleDeleteOption = (optionId: string) => {
          if (testSlide.options.length <= 2) {
            // Должно остаться как минимум 2 варианта ответа
            return;
          }
          
          handleSlideChange(slide.id, { 
            options: testSlide.options.filter(option => option.id !== optionId)
          });
        };
        
        const handleOptionChange = (optionId: string, updates: Partial<TestOption>) => {
          const updatedOptions = testSlide.options.map(option => 
            option.id === optionId ? { ...option, ...updates } : option
          );
          
          // Для одиночного выбора только один ответ может быть правильным
          if (testSlide.testType === 'single' && updates.isCorrect === true) {
            updatedOptions.forEach(option => {
              if (option.id !== optionId) {
                option.isCorrect = false;
              }
            });
          }
          
          handleSlideChange(slide.id, { options: updatedOptions });
        };
        
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="test-type">Тип теста</Label>
              <Select
                value={testSlide.testType}
                onValueChange={(value) => handleTestTypeChange(value as 'single' | 'multiple')}
              >
                <SelectTrigger id="test-type">
                  <SelectValue placeholder="Выберите тип теста" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Один правильный ответ</SelectItem>
                  <SelectItem value="multiple">Несколько правильных ответов</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="test-question">Вопрос</Label>
              <Textarea
                id="test-question"
                value={testSlide.question}
                onChange={e => handleSlideChange(slide.id, { question: e.target.value })}
                placeholder="Введите вопрос теста..."
                rows={3}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Варианты ответов</Label>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleAddOption}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить вариант
                </Button>
              </div>
              
              <Card>
                <CardContent className="p-4 space-y-4">
                  {testSlide.options.map((option, index) => (
                    <div key={option.id} className="flex items-start gap-2">
                      <div className="mt-2">
                        {testSlide.testType === 'single' ? (
                          <RadioGroup
                            value={option.isCorrect ? option.id : ''}
                            onValueChange={(value) => handleOptionChange(option.id, { isCorrect: value === option.id })}
                            className="flex"
                          >
                            <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                          </RadioGroup>
                        ) : (
                          <Checkbox
                            checked={option.isCorrect}
                            onCheckedChange={(checked) => 
                              handleOptionChange(option.id, { isCorrect: checked === true })
                            }
                            id={`option-${option.id}`}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <Input
                          value={option.text}
                          onChange={e => handleOptionChange(option.id, { text: e.target.value })}
                          placeholder={`Вариант ${index + 1}`}
                          className="flex-1"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteOption(option.id)}
                        disabled={testSlide.options.length <= 2}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="test-explanation">Пояснение (необязательно)</Label>
              <Textarea
                id="test-explanation"
                value={testSlide.explanation || ''}
                onChange={e => handleSlideChange(slide.id, { explanation: e.target.value })}
                placeholder="Добавьте пояснение, которое будет показано после ответа..."
                rows={3}
              />
            </div>
          </div>
        )
      default:
        return <div>Неизвестный тип слайда</div>
    }
  }

  const getSlideTypeIcon = (type: Slide['type']) => {
    switch (type) {
      case 'text':
        return <FileText className="h-4 w-4" />
      case 'video':
        return <Video className="h-4 w-4" />
      case 'image':
        return <ImageIcon className="h-4 w-4" />
      case 'test':
        return <HelpCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const getSlideTypeName = (type: Slide['type']) => {
    switch (type) {
      case 'text':
        return 'Текст'
      case 'video':
        return 'Видео'
      case 'image':
        return 'Изображение'
      case 'test':
        return 'Тест'
      default:
        return 'Неизвестный тип'
    }
  }

  const nextSlide = () => {
    if (stage.content.slides.length <= 1) return;
    setCurrentPreviewSlideIndex(prev => 
      prev === stage.content.slides.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    if (stage.content.slides.length <= 1) return;
    setCurrentPreviewSlideIndex(prev => 
      prev === 0 ? stage.content.slides.length - 1 : prev - 1
    );
  };

  const handleStartPreview = () => {
    // Если выбран слайд, начинаем с него
    if (selectedSlide) {
      const index = stage.content.slides.findIndex(s => s.id === selectedSlide.id);
      if (index !== -1) {
        setCurrentPreviewSlideIndex(index);
      } else {
        setCurrentPreviewSlideIndex(0);
      }
    } else {
      setCurrentPreviewSlideIndex(0);
    }
    setShowFullscreenPreview(true);
  };

  const FullscreenPreview = () => {
    if (stage.content.slides.length === 0) return null;
    
    const currentSlide = stage.content.slides[currentPreviewSlideIndex];
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [showResults, setShowResults] = useState(false);
    
    const handleCheckAnswer = () => {
      setShowResults(true);
    };
    
    const handleNextAfterTest = () => {
      setShowResults(false);
      setSelectedOptions([]);
      nextSlide();
    };
    
    const handleOptionSelect = (optionId: string, testType: 'single' | 'multiple') => {
      if (testType === 'single') {
        setSelectedOptions([optionId]);
      } else {
        if (selectedOptions.includes(optionId)) {
          setSelectedOptions(selectedOptions.filter(id => id !== optionId));
        } else {
          setSelectedOptions([...selectedOptions, optionId]);
        }
      }
    };
    
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        {/* Верхняя панель с навигацией */}
        <div className="p-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-2">
            <Presentation className="h-5 w-5" />
            <span className="font-medium">Презентация</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Слайд {currentPreviewSlideIndex + 1} из {stage.content.slides.length}
          </div>
          <Button variant="ghost" size="icon" onClick={() => setShowFullscreenPreview(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Содержимое слайда */}
        <div className="flex-1 flex items-center justify-center p-8 relative">
          <div className="max-w-4xl w-full mx-auto">
            {currentSlide.type === 'text' && (
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: (currentSlide as TextSlide).content }} />
              </div>
            )}
            
            {currentSlide.type === 'video' && (
              <div className="space-y-4">
                <div className="aspect-video">
                  <iframe
                    src={(currentSlide as VideoSlide).url.replace('watch?v=', 'embed/')}
                    allowFullScreen
                    className="w-full h-full rounded-lg"
                  />
                </div>
                {(currentSlide as VideoSlide).caption && (
                  <p className="text-center text-muted-foreground">
                    {(currentSlide as VideoSlide).caption}
                  </p>
                )}
              </div>
            )}
            
            {currentSlide.type === 'image' && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img
                    src={(currentSlide as ImageSlide).url}
                    alt={(currentSlide as ImageSlide).caption || ''}
                    className="max-h-[70vh] object-contain"
                  />
                </div>
                {(currentSlide as ImageSlide).caption && (
                  <p className="text-center text-muted-foreground">
                    {(currentSlide as ImageSlide).caption}
                  </p>
                )}
              </div>
            )}
            
            {currentSlide.type === 'test' && (
              <div className="space-y-8">
                <div className="text-xl font-medium text-center">
                  {(currentSlide as TestSlide).question}
                </div>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {(currentSlide as TestSlide).options.map((option) => (
                        <div 
                          key={option.id} 
                          className={cn(
                            "flex items-center p-3 border rounded-md cursor-pointer transition-colors",
                            !showResults && selectedOptions.includes(option.id) ? "bg-primary/10 border-primary" : "hover:bg-muted",
                            showResults && option.isCorrect ? "bg-green-100 border-green-500" : "",
                            showResults && !option.isCorrect && selectedOptions.includes(option.id) ? "bg-red-100 border-red-500" : ""
                          )}
                          onClick={() => !showResults && handleOptionSelect(option.id, (currentSlide as TestSlide).testType)}
                        >
                          <div className="mr-3">
                            {(currentSlide as TestSlide).testType === 'single' ? (
                              <div className={cn(
                                "h-5 w-5 rounded-full border border-primary flex items-center justify-center",
                                selectedOptions.includes(option.id) ? "bg-primary text-white" : "bg-background"
                              )}>
                                {selectedOptions.includes(option.id) && <Check className="h-3 w-3" />}
                              </div>
                            ) : (
                              <div className={cn(
                                "h-5 w-5 rounded-sm border border-primary flex items-center justify-center",
                                selectedOptions.includes(option.id) ? "bg-primary text-white" : "bg-background"
                              )}>
                                {selectedOptions.includes(option.id) && <Check className="h-3 w-3" />}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            {option.text}
                          </div>
                          {showResults && (
                            <div className="ml-3">
                              {option.isCorrect ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : (
                                <CircleOff className="h-5 w-5 text-red-600" />
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {!showResults ? (
                  <div className="flex justify-center">
                    <Button 
                      onClick={handleCheckAnswer}
                      disabled={selectedOptions.length === 0}
                      className="px-8"
                    >
                      Проверить
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(currentSlide as TestSlide).explanation && (
                      <Card className="bg-muted border-muted">
                        <CardContent className="p-4">
                          <p className="text-sm">
                            {(currentSlide as TestSlide).explanation}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                    <div className="flex justify-center">
                      <Button onClick={handleNextAfterTest}>
                        Далее
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Кнопки навигации */}
          <div className="absolute top-1/2 left-4 -translate-y-1/2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full opacity-70 hover:opacity-100"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
          <div className="absolute top-1/2 right-4 -translate-y-1/2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full opacity-70 hover:opacity-100"
              onClick={nextSlide}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const navigateToNextSlide = () => {
    if (!selectedSlide || stage.content.slides.length <= 1) return;
    
    const currentIndex = stage.content.slides.findIndex(s => s.id === selectedSlide.id);
    if (currentIndex === -1) return;
    
    const nextIndex = (currentIndex + 1) % stage.content.slides.length;
    setSelectedSlide(stage.content.slides[nextIndex]);
  };
  
  const navigateToPrevSlide = () => {
    if (!selectedSlide || stage.content.slides.length <= 1) return;
    
    const currentIndex = stage.content.slides.findIndex(s => s.id === selectedSlide.id);
    if (currentIndex === -1) return;
    
    const prevIndex = (currentIndex - 1 + stage.content.slides.length) % stage.content.slides.length;
    setSelectedSlide(stage.content.slides[prevIndex]);
  };

  const SlideList = (
    <div className="w-64 border-r h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Слайды</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => setPreviewMode(!previewMode)}
              title={previewMode ? "Режим редактирования" : "Режим просмотра"}
            >
              {previewMode ? <Edit className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            {stage.content.slides.length > 0 && (
              <Button
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={handleStartPreview}
                title="Полноэкранный просмотр"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить слайд
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="slides">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex-1 overflow-y-auto p-3 space-y-3"
            >
              {stage.content.slides.map((slide, index) => (
                <Draggable
                  key={slide.id}
                  draggableId={slide.id}
                  index={index}
                >
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={cn(
                        "overflow-hidden border transition-colors",
                        selectedSlide?.id === slide.id
                          ? "border-primary"
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => setSelectedSlide(slide)}
                    >
                      <CardHeader className="p-3 pb-0">
                        <div className="flex items-center justify-between">
                        <div
                          {...provided.dragHandleProps}
                            className="cursor-grab"
                        >
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                        </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {getSlideTypeIcon(slide.type)}
                            <span>{getSlideTypeName(slide.type)}</span>
                          </div>
                                  <Button
                                    variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteSlide(slide.id)
                                    }}
                                  >
                            <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                              </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {getSlidePreview(slide)}
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              {stage.content.slides.length === 0 && (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm">
                  <p>Нет слайдов</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setShowAddDialog(true)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Добавить слайд
                  </Button>
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )

  const SlidePreview = selectedSlide ? (
    <div className="flex-1 p-6 overflow-auto">
      {previewMode ? (
        <div className="max-w-3xl mx-auto relative">
          {selectedSlide.type === 'text' && (
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: (selectedSlide as TextSlide).content }} />
          )}
          {selectedSlide.type === 'video' && (
            <div className="space-y-4">
              <div className="aspect-video">
                <iframe
                  src={(selectedSlide as VideoSlide).url.replace('watch?v=', 'embed/')}
                  allowFullScreen
                  className="w-full h-full rounded-lg"
                />
              </div>
              {(selectedSlide as VideoSlide).caption && (
                <p className="text-center text-muted-foreground">
                  {(selectedSlide as VideoSlide).caption}
                </p>
              )}
            </div>
          )}
          {selectedSlide.type === 'image' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={(selectedSlide as ImageSlide).url}
                  alt={(selectedSlide as ImageSlide).caption || 'Image'}
                  className="max-h-[70vh] rounded-lg"
                />
              </div>
              {(selectedSlide as ImageSlide).caption && (
                <p className="text-center text-muted-foreground">
                  {(selectedSlide as ImageSlide).caption}
                </p>
              )}
            </div>
          )}
          
          {/* Навигационные кнопки для предпросмотра */}
          {stage.content.slides.length > 1 && (
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={navigateToPrevSlide}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Назад</span>
              </Button>
              <div className="text-sm text-muted-foreground">
                {stage.content.slides.findIndex(s => s.id === selectedSlide.id) + 1} из {stage.content.slides.length}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={navigateToNextSlide}
                className="flex items-center gap-2"
              >
                <span>Дальше</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {getSlideTypeIcon(selectedSlide.type)}
                <span>{getSlideTypeName(selectedSlide.type)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getSlideEditor(selectedSlide)}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  ) : (
    <div className="flex-1 flex items-center justify-center text-muted-foreground p-6 text-center">
      <div>
        <p>Выберите слайд для редактирования или создайте новый</p>
        <Button 
          variant="ghost" 
          size="sm" 
          className="mt-2"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="w-4 h-4 mr-1" />
          Добавить слайд
        </Button>
      </div>
    </div>
  )

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="px-4 py-3 border-b flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить слайд
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
            className={previewMode ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
          >
            {previewMode ? (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Редактировать
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Предпросмотр
              </>
            )}
          </Button>
          
          {!previewMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartPreview}
            >
              <Maximize className="h-4 w-4 mr-2" />
              Полноэкранный режим
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex-1 flex">
        {/* Миниатюры слайдов */}
        <div className="w-64 border-r overflow-y-auto">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="slides">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="p-4 space-y-3"
                >
                  {stage.content.slides.map((slide, index) => (
                    <Draggable
                      key={slide.id}
                      draggableId={slide.id}
                      index={index}
                    >
                      {(provided) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={cn(
                            "overflow-hidden",
                            selectedSlide?.id === slide.id && "border-primary"
                          )}
                        >
                          <CardHeader className="p-2 pb-0 flex-row items-center justify-between">
                            <div
                              {...provided.dragHandleProps}
                              className="flex items-center"
                            >
                              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab mr-1" />
                              <div className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-md">
                                {getSlideTypeIcon(slide.type)}
                                <span>{getSlideTypeName(slide.type)}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteSlide(slide.id)
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </CardHeader>
                          <CardContent className="p-0 cursor-pointer">
                            <div
                              onClick={() => setSelectedSlide(slide)}
                              className="h-24"
                            >
                              {getSlidePreview(slide)}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  
                  {stage.content.slides.length === 0 && (
                    <div className="text-center py-8 border rounded-lg bg-muted/30">
                      <p className="text-sm text-muted-foreground mb-2">
                        Нет слайдов
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddDialog(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Добавить слайд
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
        
        {/* Редактор слайда или предпросмотр */}
        <div className="flex-1 overflow-y-auto">
          {previewMode ? (
            <div className="p-8 max-w-3xl mx-auto">
              {selectedSlide ? (
                <div className="border rounded-lg p-8">
                  {selectedSlide.type === 'text' && (
                    <div className="prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: (selectedSlide as TextSlide).content }} />
                    </div>
                  )}
                  
                  {selectedSlide.type === 'video' && (
                    <div className="space-y-4">
                      <div className="aspect-video">
                        <iframe
                          src={(selectedSlide as VideoSlide).url.replace('watch?v=', 'embed/')}
                          allowFullScreen
                          className="w-full h-full rounded-lg"
                        />
                      </div>
                      {(selectedSlide as VideoSlide).caption && (
                        <p className="text-center text-muted-foreground">
                          {(selectedSlide as VideoSlide).caption}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {selectedSlide.type === 'image' && (
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <img
                          src={(selectedSlide as ImageSlide).url}
                          alt={(selectedSlide as ImageSlide).caption || ''}
                          className="max-h-[400px] rounded-lg object-contain"
                        />
                      </div>
                      {(selectedSlide as ImageSlide).caption && (
                        <p className="text-center text-muted-foreground">
                          {(selectedSlide as ImageSlide).caption}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {selectedSlide.type === 'test' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-medium text-center">
                        {(selectedSlide as TestSlide).question}
                      </h3>
                      
                      <div className="space-y-3">
                        {(selectedSlide as TestSlide).options.map((option) => (
                          <div 
                            key={option.id} 
                            className={cn(
                              "flex items-center p-3 border rounded-md",
                              option.isCorrect ? "bg-green-50 border-green-300" : ""
                            )}
                          >
                            <div className="mr-3">
                              {(selectedSlide as TestSlide).testType === 'single' ? (
                                <div className={cn(
                                  "h-5 w-5 rounded-full border flex items-center justify-center",
                                  option.isCorrect ? "border-green-500 text-green-500" : "border-muted-foreground"
                                )}>
                                  {option.isCorrect && <Check className="h-3 w-3" />}
                                </div>
                              ) : (
                                <div className={cn(
                                  "h-5 w-5 rounded-sm border flex items-center justify-center",
                                  option.isCorrect ? "border-green-500 text-green-500" : "border-muted-foreground"
                                )}>
                                  {option.isCorrect && <Check className="h-3 w-3" />}
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              {option.text}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {(selectedSlide as TestSlide).explanation && (
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="text-sm">{(selectedSlide as TestSlide).explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Выберите слайд для просмотра
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6">
              {selectedSlide ? (
                getSlideEditor(selectedSlide)
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    Выберите слайд для редактирования или создайте новый
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить слайд
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Диалог для добавления слайда */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Выберите тип слайда</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 p-4">
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center p-4 h-auto gap-2"
              onClick={() => handleAddSlide('text')}
            >
              <FileText className="h-8 w-8 text-blue-500" />
              <span>Текстовый слайд</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center p-4 h-auto gap-2"
              onClick={() => handleAddSlide('image')}
            >
              <ImageIcon className="h-8 w-8 text-green-500" />
              <span>Изображение</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center p-4 h-auto gap-2"
              onClick={() => handleAddSlide('video')}
            >
              <Video className="h-8 w-8 text-red-500" />
              <span>Видео</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center p-4 h-auto gap-2"
              onClick={() => handleAddSlide('test')}
            >
              <HelpCircle className="h-8 w-8 text-orange-500" />
              <span>Тест</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {showFullscreenPreview && (
        <FullscreenPreview />
      )}
    </div>
  )
} 