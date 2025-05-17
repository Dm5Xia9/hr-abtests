import { Button } from '@/components/ui/button';
import { ImageSlide, Slide, TextSlide, VideoSlide, TestSlide } from '@/types';
import { cn } from '@/lib/utils';
import { normalizeImageUrl } from '@/utils/file-storage';
import { Check, ChevronLeft, ChevronRight, Edit } from 'lucide-react';
import { SlidePreviewProps } from './types';
import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';

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
      return <div className="text-muted-foreground">Пустой слайд</div>;
    }
    
    const parsedContent = JSON.parse(content);
    
    // Проверка на валидную структуру EditorJS
    if (!parsedContent || !parsedContent.blocks || !Array.isArray(parsedContent.blocks)) {
      // Если это не EditorJS формат, пробуем показать как HTML
      return <div dangerouslySetInnerHTML={{ __html: content || '' }} />;
    }
    
    // Если нет блоков, показываем сообщение о пустом слайде
    if (parsedContent.blocks.length === 0) {
      return <div className="text-muted-foreground">Пустой слайд</div>;
    }
    
    return (
      <div className="editorjs-renderer">
        {parsedContent.blocks.map((block: EditorJSBlock, index: number) => {
          switch (block.type) {
            case 'header':
              const HeaderTag = `h${block.data?.level || 2}` as keyof JSX.IntrinsicElements;
              return <HeaderTag key={index} className="mb-4 mt-4">{block.data?.text || ''}</HeaderTag>;
            
            case 'paragraph':
              return <p key={index} className="mb-3">{block.data?.text || ''}</p>;
            
            case 'list':
              const ListTag = block.data?.style === 'ordered' ? 'ol' : 'ul';
              return (
                <ListTag key={index} className="mb-4 pl-6">
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
                    <figcaption className="text-center text-sm text-muted-foreground mt-2">
                      {block.data.caption}
                    </figcaption>
                  )}
                </figure>
              );
            
            case 'quote':
              return (
                <blockquote key={index} className="border-l-4 border-muted pl-4 italic mb-4">
                  <p>{block.data?.text || ''}</p>
                  {block.data?.caption && <cite>— {block.data.caption}</cite>}
                </blockquote>
              );
            
            default:
              return <p key={index} className="mb-3 text-muted-foreground">[Неподдерживаемый блок: {block.type}]</p>;
          }
        })}
      </div>
    );
  } catch (e) {
    console.warn('Error rendering EditorJS content:', e);
    // В случае ошибки пробуем отобразить как HTML
    return <div dangerouslySetInnerHTML={{ __html: content || '' }} />;
  }
};

export function SlidePreview({ 
  selectedSlide, 
  slides, 
  onSetPreviewMode, 
  onNavigateToNextSlide, 
  onNavigateToPrevSlide 
}: SlidePreviewProps) {
  // Use local state to manage slide content with explicit force re-render trigger
  const [slideContent, setSlideContent] = useState<React.ReactNode | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // For tracking previous selectedSlide
  const prevSlideIdRef = useRef<string | null>(null);
  const renderCountRef = useRef(0);
  
  // Logging component renders
  console.log('SlidePreview render', {
    currentSlideId: selectedSlide?.id,
    prevSlideId: prevSlideIdRef.current,
    renderCount: ++renderCountRef.current,
    slidesCount: slides.length,
    selectedSlideType: selectedSlide?.type,
    forceUpdateCount: forceUpdate
  });
  
  // Force complete re-render when slide changes
  useLayoutEffect(() => {
    if (selectedSlide?.id !== prevSlideIdRef.current) {
      console.log('SlidePreview detected slide change - forcing update', {
        from: prevSlideIdRef.current,
        to: selectedSlide?.id
      });
      setForceUpdate(prev => prev + 1);
      prevSlideIdRef.current = selectedSlide?.id || null;
    }
  }, [selectedSlide?.id]);
  
  // Update content when selected slide changes
  useEffect(() => {
    console.log('SlidePreview content update effect triggered', {
      currentSlideId: selectedSlide?.id,
      forceUpdateCount: forceUpdate,
      slideType: selectedSlide?.type
    });
    
    if (!selectedSlide) {
      setSlideContent(null);
      return;
    }
    
    if (selectedSlide.type === 'text') {
      const textSlide = selectedSlide as TextSlide;
      console.log('Rendering TEXT slide', { 
        id: textSlide.id,
        contentLength: textSlide.content?.length || 0,
        contentStart: textSlide.content?.substring(0, 50),
        forceUpdateCount: forceUpdate
      });
      
      // Clear content briefly before setting new content to ensure DOM refresh
      setSlideContent(null);
      
      // Use setTimeout to ensure the DOM has time to clear the content
      setTimeout(() => {
        setSlideContent(
          <div className="prose max-w-none">
            {renderEditorJSContent(textSlide.content)}
          </div>
        );
      }, 0);
    } else if (selectedSlide.type === 'video') {
      const videoSlide = selectedSlide as VideoSlide;
      console.log('Rendering VIDEO slide', { id: videoSlide.id, url: videoSlide.url });
      
      setSlideContent(
        <div className="space-y-4">
          <div className="aspect-video">
            <iframe
              src={videoSlide.url.replace('watch?v=', 'embed/')}
              allowFullScreen
              className="w-full h-full rounded-lg"
            />
          </div>
          {videoSlide.caption && (
            <p className="text-center text-muted-foreground">
              {videoSlide.caption}
            </p>
          )}
        </div>
      );
    } else if (selectedSlide.type === 'image') {
      const imageSlide = selectedSlide as ImageSlide;
      console.log('Rendering IMAGE slide', { id: imageSlide.id, url: imageSlide.url });
      
      setSlideContent(
        <div className="space-y-4">
          <div className="flex justify-center">
            <img
              src={normalizeImageUrl(imageSlide.url)}
              alt={imageSlide.caption || ''}
              className="max-h-[400px] rounded-lg object-contain"
            />
          </div>
          {imageSlide.caption && (
            <p className="text-center text-muted-foreground">
              {imageSlide.caption}
            </p>
          )}
        </div>
      );
    } else if (selectedSlide.type === 'test') {
      const testSlide = selectedSlide as TestSlide;
      console.log('Rendering TEST slide', { 
        id: testSlide.id, 
        question: testSlide.question,
        optionsCount: testSlide.options.length
      });
      
      setSlideContent(
        <div className="space-y-6">
          <h3 className="text-xl font-medium text-center">
            {testSlide.question}
          </h3>
          
          <div className="space-y-3">
            {testSlide.options.map((option) => (
              <div 
                key={option.id} 
                className={cn(
                  "flex items-center p-3 border rounded-md",
                  option.isCorrect ? "bg-green-50 border-green-300" : ""
                )}
              >
                <div className="mr-3">
                  {testSlide.testType === 'single' ? (
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
          
          {testSlide.explanation && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">{testSlide.explanation}</p>
            </div>
          )}
        </div>
      );
    }
  }, [selectedSlide, forceUpdate]);

  if (!selectedSlide) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Выберите слайд для просмотра
        </p>
      </div>
    );
  }

  const slideIndex = slides.findIndex(slide => slide.id === selectedSlide.id);
  
  // Logging for navigation button clicks
  const handleNext = () => {
    console.log('Next slide button clicked', {
      currentIndex: slideIndex,
      totalSlides: slides.length,
      nextIndex: (slideIndex + 1) % slides.length,
      nextSlideId: slides[(slideIndex + 1) % slides.length]?.id,
      nextSlideType: slides[(slideIndex + 1) % slides.length]?.type
    });
    onNavigateToNextSlide();
  };
  
  const handlePrev = () => {
    console.log('Previous slide button clicked', {
      currentIndex: slideIndex,
      totalSlides: slides.length,
      prevIndex: (slideIndex - 1 + slides.length) % slides.length,
      prevSlideId: slides[(slideIndex - 1 + slides.length) % slides.length]?.id,
      prevSlideType: slides[(slideIndex - 1 + slides.length) % slides.length]?.type
    });
    onNavigateToPrevSlide();
  };
  
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="border rounded-lg p-8">
        <div className="flex justify-end mb-6">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onSetPreviewMode(false)}
            className="flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Режим редактирования
          </Button>
        </div>
        
        {/* Display slide content from local state with unique key to force re-render */}
        <div 
          key={`slide-${selectedSlide.id}-${forceUpdate}`} 
          className="slide-content-container" 
          data-slide-id={selectedSlide.id}
        >
          {slideContent}
        </div>

        {/* Navigation buttons for preview */}
        {slides.length > 1 && (
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Назад</span>
            </Button>
            <div className="text-sm text-muted-foreground">
              {slideIndex + 1} из {slides.length}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              <span>Дальше</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 