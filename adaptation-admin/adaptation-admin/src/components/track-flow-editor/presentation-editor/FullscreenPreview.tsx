import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slide, TextSlide, VideoSlide, ImageSlide, TestSlide } from '@/types';
import { normalizeImageUrl } from '@/utils/file-storage';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Presentation, 
  Check, 
  CheckCircle2, 
  CircleOff 
} from 'lucide-react';

// Определяем типы для блоков EditorJS
interface EditorJSBlock {
  type: string;
  data: {
    text?: string;
    level?: number;
    file?: {
      url: string;
    };
    caption?: string;
    items?: string[];
    style?: 'ordered' | 'unordered';
  };
}

// Вспомогательная функция для рендеринга блоков EditorJS
const renderEditorJSContent = (content: string) => {
  try {
    // Если контент пустой, возвращаем пустой div
    if (!content) {
      return <div className="text-gray-400">Пустой слайд</div>;
    }
    
    const parsedContent = JSON.parse(content);
    
    // Проверка на валидную структуру EditorJS
    if (!parsedContent || !parsedContent.blocks || !Array.isArray(parsedContent.blocks)) {
      // Если это не EditorJS формат, пробуем показать как HTML
      return <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content || '' }} />;
    }
    
    // Если нет блоков, показываем сообщение о пустом слайде
    if (parsedContent.blocks.length === 0) {
      return <div className="text-gray-400">Пустой слайд</div>;
    }
    
    return (
      <div className="editorjs-renderer">
        {parsedContent.blocks.map((block: EditorJSBlock, index: number) => {
          switch (block.type) {
            case 'header':
              const HeaderTag = `h${block.data?.level || 2}` as keyof JSX.IntrinsicElements;
              return <HeaderTag key={index} className="mb-4 mt-4 text-white">{block.data?.text || ''}</HeaderTag>;
            
            case 'paragraph':
              return <p key={index} className="mb-3 text-white">{block.data?.text || ''}</p>;
            
            case 'list':
              const ListTag = block.data?.style === 'ordered' ? 'ol' : 'ul';
              return (
                <ListTag key={index} className="mb-4 pl-6 text-white">
                  {(block.data?.items || []).map((item: string, i: number) => (
                    <li key={i} className="mb-1">{item}</li>
                  ))}
                </ListTag>
              );
            
            case 'image':
              return (
                <figure key={index} className="mb-5">
                  <img 
                    src={block.data?.file?.url} 
                    alt={block.data?.caption || 'Image'} 
                    className="max-w-full rounded-md"
                  />
                  {block.data?.caption && (
                    <figcaption className="text-center text-sm text-gray-300 mt-2">
                      {block.data.caption}
                    </figcaption>
                  )}
                </figure>
              );
            
            case 'quote':
              return (
                <blockquote key={index} className="border-l-4 border-gray-600 pl-4 italic mb-4">
                  <p className="text-white">{block.data?.text || ''}</p>
                  {block.data?.caption && <cite className="text-gray-300">— {block.data.caption}</cite>}
                </blockquote>
              );
            
            default:
              return <p key={index} className="mb-3 text-gray-400">[Неподдерживаемый блок: {block.type}]</p>;
          }
        })}
      </div>
    );
  } catch (e) {
    console.warn('Error rendering EditorJS content:', e);
    // В случае ошибки пробуем отобразить как HTML
    return <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content || '' }} />;
  }
};

interface FullscreenPreviewProps {
  slides: Slide[];
  currentSlideIndex: number;
  onClose: () => void;
  onNextSlide: () => void;
  onPrevSlide: () => void;
}

export function FullscreenPreview({
  slides,
  currentSlideIndex,
  onClose,
  onNextSlide,
  onPrevSlide
}: FullscreenPreviewProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  if (slides.length === 0) return null;
  
  const currentSlide = slides[currentSlideIndex];
  
  const handleCheckAnswer = () => {
    setShowResults(true);
  };
  
  const handleNextAfterTest = () => {
    setShowResults(false);
    setSelectedOptions([]);
    onNextSlide();
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
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Верхняя панель с навигацией */}
      <div className="p-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-2 text-white">
          <Presentation className="h-5 w-5" />
          <span className="font-medium">Презентация</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          Слайд {currentSlideIndex + 1} из {slides.length}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white">
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Содержимое слайда */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="max-w-4xl w-full mx-auto">
          {currentSlide.type === 'text' && (
            <div className="prose prose-invert max-w-none">
              {renderEditorJSContent((currentSlide as TextSlide).content)}
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
                <p className="text-center text-gray-300">
                  {(currentSlide as VideoSlide).caption}
                </p>
              )}
            </div>
          )}
          
          {currentSlide.type === 'image' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={normalizeImageUrl((currentSlide as ImageSlide).url)}
                  alt={(currentSlide as ImageSlide).caption || ''}
                  className="max-h-[70vh] object-contain"
                />
              </div>
              {(currentSlide as ImageSlide).caption && (
                <p className="text-center text-gray-300">
                  {(currentSlide as ImageSlide).caption}
                </p>
              )}
            </div>
          )}
          
          {currentSlide.type === 'test' && (
            <div className="space-y-8">
              <div className="text-xl font-medium text-center text-white">
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
            onClick={onPrevSlide}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
        <div className="absolute top-1/2 right-4 -translate-y-1/2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full opacity-70 hover:opacity-100"
            onClick={onNextSlide}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
} 