import { Label } from '@/components/ui/label';
import { TextSlide } from '@/types';
import { EditorJSComponent } from '../EditorJS';
import { useEffect, useRef, useState } from 'react';

interface TextSlideEditorProps {
  slide: TextSlide;
  onChange: (id: string, updates: Partial<TextSlide>) => void;
}

export function TextSlideEditor({ slide, onChange }: TextSlideEditorProps) {
  const updateCounterRef = useRef(0);
  const slideIdRef = useRef(slide.id);
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Конвертация HTML-содержимого в формат EditorJS
  const getEditorContent = (content: string) => {
    try {
      // Проверка является ли содержимое JSON от EditorJS
      const parsed = JSON.parse(content);
      // Проверка, что это валидный формат EditorJS с блоками
      if (parsed && parsed.blocks) {
        return content;
      }
      
      throw new Error('Not valid EditorJS format');
    } catch (e) {
      // Если не JSON или не в формате EditorJS - создаем базовую структуру с одним блоком
      console.log('Converting HTML content to EditorJS format');
      
      // Проверка, есть ли содержимое
      if (!content || content === '<p></p>' || content === '') {
        return JSON.stringify({
          time: new Date().getTime(),
          blocks: [
            {
              type: 'paragraph',
              data: {
                text: 'Начните редактирование слайда...'
              }
            }
          ],
          version: '2.26.5'
        });
      }
      
      // Конвертируем HTML в текст
      let plainText = content.replace(/<\/?[^>]+(>|$)/g, ' ').trim();
      
      // Безопасно создаем новый объект в формате EditorJS
      return JSON.stringify({
        time: new Date().getTime(),
        blocks: [
          {
            type: 'paragraph',
            data: {
              text: plainText
            }
          }
        ],
        version: '2.26.5'
      });
    }
  };
  
  const [editorContent, setEditorContent] = useState(() => getEditorContent(slide.content));
  
  // Обработка смены слайда
  useEffect(() => {
    if (slideIdRef.current !== slide.id) {
      console.log('TextSlideEditor detected slide change', {
        previousSlideId: slideIdRef.current,
        newSlideId: slide.id
      });
      
      // Обновление контента при смене слайда
      setEditorContent(getEditorContent(slide.content));
      slideIdRef.current = slide.id;
      setForceUpdate(prev => prev + 1);
    }
  }, [slide.id, slide.content]);
  
  // Обработчик изменения содержимого редактора
  const handleContentChange = (content: string) => {
    updateCounterRef.current += 1;
    const currentCount = updateCounterRef.current;
    
    console.log(`TextSlideEditor content change (${currentCount})`, {
      slideId: slide.id,
      contentLength: content.length
    });
    
    // Обновление контента слайда
    onChange(slide.id, { content });
  };
  
  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold">Содержимое слайда</Label>
      
      {/* Ключ используется для пересоздания редактора при смене слайда */}
      <div key={`editor-${slide.id}-${forceUpdate}`}>
        <EditorJSComponent 
          content={editorContent}
          onChange={handleContentChange}
        />
      </div>
    </div>
  );
} 