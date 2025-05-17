import React, { useEffect, useRef, useState } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import Image from '@editorjs/image';
import { Loader2 } from 'lucide-react';
import { uploadImage, normalizeImageUrl } from '@/utils/file-storage';

// Фикс типизации для EditorJS tools
interface EditorJSTools {
  [key: string]: any;
}

// Создаем кастомную функцию загрузки изображений для EditorJS
const createImageUploader = () => {
  return {
    /**
     * Загрузка файла изображения на сервер
     * @param {File} file - загружаемый файл
     * @return {Promise} - промис с результатом загрузки
     */
    uploadByFile: async (file: File) => {
      try {
        // Используем существующую функцию для загрузки изображений
        const imageUrl = await uploadImage(file);
        
        return {
          success: 1,
          file: {
            url: normalizeImageUrl(imageUrl),
          }
        };
      } catch (error) {
        console.error('Error uploading image:', error);
        return {
          success: 0,
          file: {
            url: '',
          }
        };
      }
    },
    
    /**
     * Загрузка изображения по URL (если есть доступ к серверу)
     * @param {string} url - URL изображения
     * @return {Promise} - промис с результатом загрузки
     */
    uploadByUrl: async (url: string) => {
      try {
        // Создаем временный элемент изображения
        const image = new globalThis.Image();
        image.src = url;
        
        // Ждем загрузки изображения
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
        });
        
        // Возвращаем результат
        return {
          success: 1,
          file: {
            url: url,
          }
        };
      } catch (error) {
        console.error('Error loading image from URL:', error);
        return {
          success: 0,
          file: {
            url: '',
          }
        };
      }
    }
  };
};

// Конфигурация инструментов EditorJS
const EDITOR_JS_TOOLS: EditorJSTools = {
  header: Header,
  list: List,
  quote: Quote,
  image: {
    class: Image,
    config: {
      // Заголовки для элементов интерфейса
      buttonContent: 'Выбрать изображение',
      captionPlaceholder: 'Подпись к изображению',
      
      // Настраиваем загрузчик изображений
      uploader: createImageUploader(),
      
      // Настройки внешнего вида
      types: 'image/*',
      
      // Кнопки для выбора способа загрузки
      actions: [
        {
          name: 'withCaption',
          icon: '<svg width="15" height="15" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 5V15"></path><path d="M15 10H5"></path></svg>',
          title: 'Добавить подпись',
          toggle: true,
        },
        {
          name: 'stretched',
          icon: '<svg width="17" height="10" viewBox="0 0 20 10" xmlns="http://www.w3.org/2000/svg"><path d="M13.3335 0.666626H6.66683C5.78324 0.666626 5.00004 1.44983 5.00004 2.33341V7.66675C5.00004 8.55034 5.78324 9.33354 6.66683 9.33354H13.3335C14.2171 9.33354 15.0002 8.55034 15.0002 7.66675V2.33341C15.0002 1.44983 14.2171 0.666626 13.3335 0.666626Z"></path></svg>',
          title: 'Растянуть изображение',
          toggle: true,
        },
        {
          name: 'withBackground',
          icon: '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.043 8.265l3.183-3.183h-2.924L4.75 10.636v2.923l4.15-4.15v2.351l-2.158 2.159H8.9l2.391-2.391v-1.116h1.116l2.159-2.159V8.265H10.043z"></path></svg>',
          title: 'Добавить фон',
          toggle: true,
        }
      ]
    }
  }
};

interface EditorJSComponentProps {
  content: string;
  onChange: (content: string) => void;
}

export function EditorJSComponent({ content, onChange }: EditorJSComponentProps) {
  const editorRef = useRef<EditorJS | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  
  // Уникальный ID для каждого экземпляра редактора
  const editorId = useRef(`editorjs-${Math.random().toString(36).substring(2, 9)}`);

  // Инициализация редактора
  useEffect(() => {
    let editor: EditorJS | null = null;
    
    // Задержка инициализации, чтобы DOM точно загрузился
    const initEditor = setTimeout(() => {
      try {
        // Проверяем существование контейнера перед инициализацией
        if (!document.getElementById(editorId.current)) {
          console.error(`Editor container with ID ${editorId.current} not found`);
          return;
        }
        
        let parsedData;
        try {
          parsedData = content ? JSON.parse(content) : { blocks: [] };
        } catch (e) {
          console.warn('Failed to parse editor content, initializing with empty content', e);
          parsedData = { blocks: [] };
        }
        
        editor = new EditorJS({
          holder: editorId.current,
          tools: EDITOR_JS_TOOLS,
          data: parsedData,
          placeholder: 'Начните писать здесь...',
          onChange: async () => {
            try {
              if (editor) {
                const savedData = await editor.save();
                onChange(JSON.stringify(savedData));
              }
            } catch (err) {
              console.error('Error saving editor content:', err);
            }
          },
          onReady: () => {
            setIsReady(true);
          },
        });
        
        editorRef.current = editor;
      } catch (err) {
        console.error('Error initializing Editor.js:', err);
      }
    }, 100);

    return () => {
      clearTimeout(initEditor);
      
      // Безопасное уничтожение редактора
      if (editorRef.current) {
        try {
          // Проверяем, что destroy существует
          if (typeof editorRef.current.destroy === 'function') {
            editorRef.current.destroy();
          }
        } catch (err) {
          console.warn('Error destroying Editor.js instance:', err);
        }
        editorRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {!isReady && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
      
      <div className={`border rounded-md p-4 min-h-[400px] bg-white ${!isReady ? 'hidden' : ''}`}>
        <div id={editorId.current} className="prose max-w-none" ref={editorContainerRef} />
      </div>
    </div>
  );
} 