import React from 'react';
import { cn } from '@/lib/utils';
import { normalizeImageUrl } from '@/utils/file-storage';

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
    items?: any[]; // Changed type to handle both string and object items
    style?: 'ordered' | 'unordered';
    withBackground?: boolean;
    stretched?: boolean;
    withBorder?: boolean;
  };
}

interface EditorJSData {
  blocks: EditorJSBlock[];
  time?: number;
  version?: string;
}

interface EditorJSRendererProps {
  content: string;
  className?: string;
  darkMode?: boolean;
}

/**
 * Компонент для рендеринга содержимого EditorJS
 */
export function EditorJSRenderer({ content, className, darkMode = false }: EditorJSRendererProps) {
  // Парсим контент
  let parsedContent: EditorJSData | null = null;
  
  try {
    // Если контент пустой, возвращаем пустой div
    if (!content) {
      return <div className="text-muted-foreground">Пустой слайд</div>;
    }
    
    // Пытаемся распарсить JSON
    parsedContent = JSON.parse(content);
    
    // Проверка на валидную структуру EditorJS
    if (!parsedContent || !parsedContent.blocks || !Array.isArray(parsedContent.blocks)) {
      // Если это не EditorJS формат, пробуем показать как HTML
      return (
        <div 
          className={cn(
            "prose max-w-none", 
            darkMode && "prose-invert", 
            className
          )} 
          dangerouslySetInnerHTML={{ __html: content || '' }} 
        />
      );
    }
    
    // Если нет блоков, показываем сообщение о пустом слайде
    if (parsedContent.blocks.length === 0) {
      return <div className={cn("text-muted-foreground", darkMode && "text-gray-400")}>Пустой слайд</div>;
    }
  } catch (error) {
    console.error('Error parsing EditorJS content:', error);
    // При ошибке парсинга, пробуем отобразить как HTML
    return (
      <div 
        className={cn(
          "prose max-w-none", 
          darkMode && "prose-invert", 
          className
        )} 
        dangerouslySetInnerHTML={{ __html: content || '' }} 
      />
    );
  }

  // Рендерим блоки
  return (
    <div className={cn("editorjs-renderer", className)}>
      {parsedContent.blocks.map((block, index) => (
        <React.Fragment key={index}>
          {renderBlock(block, darkMode)}
        </React.Fragment>
      ))}
    </div>
  );
}

/**
 * Преобразует элемент списка в строку
 */
function getListItemContent(item: any): string {
  if (typeof item === 'string') {
    return item;
  }
  
  // Если элемент - объект, пытаемся извлечь содержимое
  if (item && typeof item === 'object') {
    if (item.content) {
      return item.content;
    }
    
    // Преобразуем в строку для отладки
    return JSON.stringify(item);
  }
  
  return '';
}

/**
 * Рендерит отдельный блок EditorJS
 */
function renderBlock(block: EditorJSBlock, darkMode: boolean) {
  switch (block.type) {
    case 'header':
      const HeaderTag = `h${block.data?.level || 2}` as keyof JSX.IntrinsicElements;
      return (
        <HeaderTag className={cn("mb-4 mt-4", darkMode && "text-white")}>
          {block.data?.text || ''}
        </HeaderTag>
      );
    
    case 'paragraph':
      return (
        <p className={cn("mb-3", darkMode && "text-white")}>
          {block.data?.text || ''}
        </p>
      );
    
    case 'list':
      const ListTag = block.data?.style === 'ordered' ? 'ol' : 'ul';
      return (
        <ListTag className={cn("mb-4 pl-6", darkMode && "text-white")}>
          {(block.data?.items || []).map((item: any, i: number) => (
            <li key={i} className="mb-1">{getListItemContent(item)}</li>
          ))}
        </ListTag>
      );
    
    case 'image':
      const imageUrl = block.data?.file?.url ? normalizeImageUrl(block.data.file.url) : '';
      return (
        <figure className={cn(
          "mb-5",
          block.data?.withBackground && "bg-muted p-3",
          block.data?.withBorder && "border rounded-md overflow-hidden",
        )}>
          <div className={cn(
            "overflow-hidden",
            !block.data?.stretched && "flex justify-center"
          )}>
            <img 
              src={imageUrl} 
              alt={block.data?.caption || 'Image'} 
              className={cn(
                "max-w-full rounded-md",
                block.data?.stretched ? "w-full" : "max-h-[70vh] object-contain"
              )}
            />
          </div>
          {block.data?.caption && (
            <figcaption className={cn(
              "text-center text-sm mt-2",
              darkMode ? "text-gray-300" : "text-muted-foreground"
            )}>
              {block.data.caption}
            </figcaption>
          )}
        </figure>
      );
    
    case 'quote':
      return (
        <blockquote className={cn(
          "border-l-4 pl-4 italic mb-4",
          darkMode ? "border-gray-600" : "border-gray-200"
        )}>
          <p className={darkMode ? "text-white" : ""}>{block.data?.text || ''}</p>
          {block.data?.caption && (
            <cite className={darkMode ? "text-gray-300" : ""}>— {block.data.caption}</cite>
          )}
        </blockquote>
      );
    
    default:
      return (
        <div className={cn(
          "mb-4 p-3 border rounded text-sm",
          darkMode ? "border-gray-700 text-gray-300" : "border-gray-200 text-muted-foreground"
        )}>
          Неподдерживаемый блок: {block.type}
        </div>
      );
  }
} 