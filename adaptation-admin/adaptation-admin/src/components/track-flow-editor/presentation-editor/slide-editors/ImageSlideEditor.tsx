import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageSlide } from '@/types';
import { normalizeImageUrl } from '@/utils/file-storage';
import { AlertCircle, Copy, ExternalLink, ImagePlus, Loader2, Upload, Edit, Pencil, UploadCloud } from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ImageSlideEditorProps {
  slide: ImageSlide;
  onChange: (id: string, updates: Partial<ImageSlide>) => void;
  onImageUrlSubmit: (url: string, slideId: string) => Promise<void>;
  onImageFileUpload: (e: React.ChangeEvent<HTMLInputElement>, slideId: string) => Promise<void>;
}

export function ImageSlideEditor({ 
  slide, 
  onChange, 
  onImageUrlSubmit, 
  onImageFileUpload 
}: ImageSlideEditorProps) {
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [showCaptionEdit, setShowCaptionEdit] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hasImageInClipboard, setHasImageInClipboard] = useState(false);
  
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const captionInputRef = useRef<HTMLTextAreaElement>(null);

  // Обработчик для перетаскивания файлов
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('image/')) {
          const dummyEvent = {
            target: {
              files: [file] as unknown as FileList
            }
          } as React.ChangeEvent<HTMLInputElement>;
          
          await handleFileUpload(dummyEvent);
        }
      }
    };

    const currentDropZone = dropZoneRef.current;
    
    if (currentDropZone) {
      currentDropZone.addEventListener('dragover', handleDragOver);
      currentDropZone.addEventListener('dragleave', handleDragLeave);
      currentDropZone.addEventListener('drop', handleDrop);
    }

    return () => {
      if (currentDropZone) {
        currentDropZone.removeEventListener('dragover', handleDragOver);
        currentDropZone.removeEventListener('dragleave', handleDragLeave);
        currentDropZone.removeEventListener('drop', handleDrop);
      }
    };
  }, []);

  // Проверка буфера обмена на наличие изображения
  useEffect(() => {
    const checkClipboard = async () => {
      try {
        const permission = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName });
        if (permission.state === 'granted' || permission.state === 'prompt') {
          navigator.clipboard.read().then(items => {
            for (const item of items) {
              if (item.types.some(type => type.startsWith('image/'))) {
                setHasImageInClipboard(true);
                return;
              }
              
              // Проверка на URL изображения в буфере обмена
              if (item.types.includes('text/plain')) {
                item.getType('text/plain').then(async blob => {
                  const text = await blob.text();
                  if (text.match(/\.(jpeg|jpg|gif|png|webp)$/) || text.match(/^https?:\/\/.*\.(jpeg|jpg|gif|png|webp)/i)) {
                    setHasImageInClipboard(true);
                  }
                });
              }
            }
          }).catch(() => {
            // Если не удалось получить доступ к буферу, игнорируем ошибку
          });
        }
      } catch (e) {
        // Некоторые браузеры могут не поддерживать эту функцию
        console.log('Clipboard API not fully supported');
      }
    };

    checkClipboard();
    
    // Проверяем каждые 2 секунды, когда компонент активен
    const interval = setInterval(checkClipboard, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsImageUploading(true);
      setError(null);
      await onImageFileUpload(e, slide.id);
    } catch (error) {
      setError(
        error instanceof Error 
          ? error.message
          : 'Произошла ошибка при загрузке изображения'
      );
    } finally {
      setIsImageUploading(false);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      // Если в буфере есть изображение
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const dummyEvent = {
            target: {
              files: [file] as unknown as FileList
            }
          } as React.ChangeEvent<HTMLInputElement>;
          
          await handleFileUpload(dummyEvent);
          return;
        }
      }
      
      // Если в буфере есть текст, проверяем является ли он URL изображения
      if (items[i].type === 'text/plain') {
        items[i].getAsString(async (text) => {
          if (text.match(/\.(jpeg|jpg|gif|png|webp)$/) || text.match(/^https?:\/\/.*\.(jpeg|jpg|gif|png|webp)/i)) {
            try {
              setIsImageUploading(true);
              setError(null);
              await onImageUrlSubmit(text, slide.id);
            } catch (error) {
              setError(
                error instanceof Error 
                  ? error.message
                  : 'Произошла ошибка при загрузке изображения по URL'
              );
            } finally {
              setIsImageUploading(false);
            }
          }
        });
      }
    }
  };

  const focusCaptionEdit = () => {
    setShowCaptionEdit(true);
    setTimeout(() => {
      captionInputRef.current?.focus();
    }, 100);
  };

  return (
    <div 
      className="space-y-6 flex flex-col items-center" 
      onPaste={handlePaste}
      ref={dropZoneRef}
    >
      {/* Основной блок с изображением */}
      <div 
        className={cn(
          "w-full min-h-[300px] relative rounded-lg overflow-hidden transition-all duration-300 ease-in-out",
          !slide.url && "border-2 border-dashed cursor-pointer",
          isDragging && "border-primary bg-primary/5 scale-[1.01] shadow-lg",
          !slide.url && !isDragging && "border-muted-foreground/25 hover:border-primary/50 hover:shadow-md"
        )}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={() => !slide.url && imageFileInputRef.current?.click()}
      >
        {isImageUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 animate-in fade-in duration-200">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-sm">Загрузка изображения...</p>
            </div>
          </div>
        )}
        
        {slide.url ? (
          <div className="flex items-center justify-center w-full h-full transition-transform duration-300 ease-in-out">
            <img
              src={normalizeImageUrl(slide.url)}
              alt={slide.caption || 'Изображение слайда'}
              className={cn(
                "max-w-full max-h-[400px] object-contain transition-all duration-300 ease-in-out",
                isHovering && "scale-[1.02] filter brightness-[0.8]"
              )}
            />
            
            {/* Оверлей при наведении на изображение */}
            <div 
              className={cn(
                "absolute inset-0 bg-black/40 flex items-center justify-center transition-all duration-300 ease-in-out",
                isHovering ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
            >
              <Button 
                variant="outline" 
                className="bg-background/90 hover:bg-background transform transition-all duration-200 hover:scale-105 shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  imageFileInputRef.current?.click();
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Изменить изображение
              </Button>
            </div>
          </div>
        ) : (
          <div className={cn(
            "flex flex-col items-center justify-center h-full px-4 py-8 text-center transition-all duration-300 ease-in-out",
            isDragging && "transform scale-105"
          )}>
            <ImagePlus className={cn(
              "h-16 w-16 text-muted-foreground mb-4 transition-all duration-300 ease-in-out",
              isDragging && "text-primary animate-pulse scale-110"
            )} />
            <h3 className="text-lg font-medium mb-2">Добавьте изображение</h3>
            <p className="text-muted-foreground text-sm mb-4 max-w-md">
              Нажмите здесь, чтобы выбрать файл, или просто перетащите изображение в эту область
            </p>
            
            {hasImageInClipboard && (
              <div className="mt-2 p-3 bg-muted rounded-lg flex items-center animate-in slide-in-from-bottom-2 duration-300">
                <div className="p-2 bg-background rounded-full mr-3">
                  <UploadCloud className="h-5 w-5 text-primary animate-pulse" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">В буфере обмена есть изображение</p>
                  <p className="text-xs text-muted-foreground">Нажмите Ctrl+V, чтобы вставить</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Поле для загрузки файла */}
      <input 
        ref={imageFileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileUpload}
      />
      
      {/* Сообщение об ошибке */}
      {error && (
        <div className="w-full px-4 py-3 border border-red-200 bg-red-50 rounded-md text-sm text-red-600 animate-in slide-in-from-top-2 duration-300">
          {error}
        </div>
      )}
      
      {/* Подпись к изображению */}
      {slide.url && (
        <div className="w-full relative">
          {showCaptionEdit ? (
            <div className="relative animate-in fade-in duration-200">
              <Textarea
                ref={captionInputRef}
                value={slide.caption || ''}
                onChange={e => onChange(slide.id, { caption: e.target.value })}
                placeholder="Добавьте подпись к изображению..."
                rows={2}
                className="resize-none focus:ring-2 transition-all duration-200"
                onBlur={() => setShowCaptionEdit(false)}
              />
            </div>
          ) : (
            <div 
              className={cn(
                "p-2 border border-transparent hover:border-input rounded-md cursor-text min-h-[4rem] flex items-center transition-all duration-200 ease-in-out group",
                !slide.caption && "text-muted-foreground text-sm italic",
                "hover:bg-muted/30"
              )}
              onClick={focusCaptionEdit}
            >
              <div className="flex-1">
                {slide.caption || "Нажмите, чтобы добавить подпись к изображению"}
              </div>
              <Pencil className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2" />
            </div>
          )}
        </div>
      )}
    </div>
  );
} 