import { Slide, TextSlide, VideoSlide, ImageSlide, TestSlide, TestOption } from '@/types';
import { FileText, Video, Image as ImageIcon, HelpCircle } from 'lucide-react';
import { normalizeImageUrl } from '@/utils/file-storage';
import React from 'react';

// Utility function to strip HTML and get plain text
const htmlToPlainText = (html: string): string => {
  // Create temporary div to render HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  // Return text content
  return tempDiv.textContent || tempDiv.innerText || '';
};

// Функция для извлечения текста из EditorJS контента
const editorJSToPlainText = (content: string): string => {
  try {
    const parsedContent = JSON.parse(content);
    
    if (!parsedContent.blocks || !Array.isArray(parsedContent.blocks)) {
      return htmlToPlainText(content); // Если формат не EditorJS, пробуем как HTML
    }
    
    // Извлекаем текст из блоков
    const textBlocks = parsedContent.blocks
      .filter((block: {type: string}) => block.type === 'paragraph' || block.type === 'header')
      .map((block: {data: {text: string}}) => block.data.text || '')
      .join(' ');
    
    return textBlocks || 'Пустой слайд';
  } catch (e) {
    // Если не удалось разобрать JSON, считаем что это HTML-контент
    return htmlToPlainText(content);
  }
};

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

// Prepare preview content for EditorJS или HTML
const prepareSlidePreview = (content: string): React.ReactNode => {
  try {
    // Проверяем, является ли контент формата EditorJS
    const parsedContent = JSON.parse(content);
    
    if (!parsedContent.blocks || !Array.isArray(parsedContent.blocks) || parsedContent.blocks.length === 0) {
      return (
        <div className="bg-muted rounded-md p-3 flex items-center justify-center">
          <FileText className="h-5 w-5 text-muted-foreground mr-2" />
          <span className="text-sm text-muted-foreground">Пустой слайд</span>
        </div>
      );
    }
    
    // Отображаем до 3-х первых блоков
    const previewBlocks = parsedContent.blocks.slice(0, 3).map((block: EditorJSBlock, index: number) => {
      switch (block.type) {
        case 'header':
          const HeaderTag = `h${block.data.level || 3}` as keyof JSX.IntrinsicElements;
          return (
            <HeaderTag key={index} className="text-sm font-semibold mb-1 truncate">
              {block.data.text}
            </HeaderTag>
          );
        
        case 'paragraph':
          return (
            <p key={index} className="text-xs mb-1 line-clamp-2">
              {block.data.text}
            </p>
          );
        
        case 'image':
          return (
            <div key={index} className="text-xs text-muted-foreground mb-1">
              [Изображение] {block.data.caption || ''}
            </div>
          );
        
        default:
          return (
            <div key={index} className="text-xs text-muted-foreground mb-1">
              [Блок {block.type}]
            </div>
          );
      }
    });
    
    return (
      <div className="space-y-1 p-1">
        {previewBlocks}
        {parsedContent.blocks.length > 3 && (
          <div className="text-xs text-muted-foreground">
            ... и еще {parsedContent.blocks.length - 3} блоков
          </div>
        )}
      </div>
    );
  } catch (e) {
    // Если не удалось разобрать JSON, используем подготовку для HTML-контента
    return <div dangerouslySetInnerHTML={{ __html: preparePreviewHtml(content) }} />;
  }
};

// Prepare safe HTML for rendering in a controlled way
const preparePreviewHtml = (html: string): string => {
  // Extract first few paragraphs (limit to 3)
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Get all child nodes
  const paragraphs = Array.from(tempDiv.children).slice(0, 3);
  
  // Create a new container for the limited content
  const previewContainer = document.createElement('div');
  
  // Add each paragraph to the preview container
  paragraphs.forEach(p => {
    // Clone to avoid modifying the original
    const clone = p.cloneNode(true) as HTMLElement;
    
    // Limit paragraph length
    if (clone.innerText && clone.innerText.length > 100) {
      // For text nodes, truncate and add ellipsis
      clone.innerText = clone.innerText.substring(0, 100) + '...';
    }
    
    previewContainer.appendChild(clone);
  });
  
  return previewContainer.innerHTML;
};

// Create a new slide of the specified type
export const createNewSlide = (type: Slide['type']): Slide => {
  const baseSlide = {
    id: crypto.randomUUID(),
    type
  };

  let newSlide: Slide;
  switch (type) {
    case 'text':
      newSlide = {
        ...baseSlide,
        type: 'text',
        content: ''
      } as TextSlide;
      break;
    case 'video':
      newSlide = {
        ...baseSlide,
        type: 'video',
        url: '',
        caption: ''
      } as VideoSlide;
      break;
    case 'image':
      newSlide = {
        ...baseSlide,
        type: 'image',
        url: '',
        caption: ''
      } as ImageSlide;
      break;
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
      } as TestSlide;
      break;
    default:
      throw new Error(`Unknown slide type: ${type}`);
  }

  return newSlide;
};

// Get an icon for a slide type
export const getSlideTypeIcon = (type: Slide['type']) => {
  switch (type) {
    case 'text':
      return <FileText className="h-4 w-4" />;
    case 'video':
      return <Video className="h-4 w-4" />;
    case 'image':
      return <ImageIcon className="h-4 w-4" />;
    case 'test':
      return <HelpCircle className="h-4 w-4" />;
    default:
      return null;
  }
};

// Get a human-readable name for a slide type
export const getSlideTypeName = (type: Slide['type']) => {
  switch (type) {
    case 'text':
      return 'Текст';
    case 'video':
      return 'Видео';
    case 'image':
      return 'Изображение';
    case 'test':
      return 'Тест';
    default:
      return 'Неизвестный тип';
  }
};

// Get a preview component for a slide
export const getSlidePreview = (slide: Slide) => {
  switch (slide.type) {
    case 'text':
      const textSlide = slide as TextSlide;
      
      // If there's no content, show a placeholder
      if (!textSlide.content || textSlide.content === '<p></p>') {
        return (
          <div className="p-2 overflow-hidden">
            <div className="bg-muted rounded-md p-3 flex items-center justify-center">
              <FileText className="h-5 w-5 text-muted-foreground mr-2" />
              <span className="text-sm text-muted-foreground">Пустой текстовый слайд</span>
            </div>
          </div>
        );
      }
      
      // Create a visual document preview
      return (
        <div className="p-2 overflow-hidden">
          <div className="bg-white border rounded-md shadow-sm p-3 relative overflow-hidden" style={{ height: '90px' }}>
            {/* Rich text preview with formatting preserved */}
            <div 
              className="prose prose-sm max-w-none prose-headings:mt-1 prose-headings:mb-1 prose-p:my-0.5 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 scale-90 origin-top-left overflow-hidden"
              style={{ maxHeight: '80px' }}
            >
              {prepareSlidePreview(textSlide.content)}
            </div>
            
            {/* Add subtle gradient at bottom to indicate more content */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
          </div>
        </div>
      );
    case 'video':
      const videoSlide = slide as VideoSlide;
      return (
        <div className="p-2">
          <div className="aspect-video bg-muted flex items-center justify-center rounded">
            <Video className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-xs mt-1 truncate">{videoSlide.url || 'URL видео не указан'}</p>
        </div>
      );
    case 'image':
      const imageSlide = slide as ImageSlide;
      return (
        <div className="p-2">
          {imageSlide.url ? (
            <div className="aspect-video bg-muted rounded overflow-hidden">
              <img 
                src={normalizeImageUrl(imageSlide.url)} 
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
      );
    case 'test':
      const testSlide = slide as TestSlide;
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
      );
    default:
      return <div>Неизвестный тип слайда</div>;
  }
};

// Update slide data with type safety
export const updateSlide = (
  slides: Slide[], 
  slideId: string, 
  updates: Partial<Slide>
): Slide[] => {
  return slides.map(slide => {
    if (slide.id !== slideId) return slide;
    
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
};