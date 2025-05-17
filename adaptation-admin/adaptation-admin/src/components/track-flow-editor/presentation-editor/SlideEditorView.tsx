import { Button } from '@/components/ui/button';
import { Slide, ImageSlide, TextSlide, VideoSlide, TestSlide } from '@/types';
import { Eye, Maximize, Plus } from 'lucide-react';
import { TextSlideEditor, VideoSlideEditor, ImageSlideEditor, TestSlideEditor } from './slide-editors';
import { SlideEditorViewProps } from './types';
import React from 'react';

interface SlideEditorProps {
  selectedSlide: Slide;
  onChange: (id: string, updates: Partial<Slide>) => void;
  onImageUrlSubmit: (url: string, slideId: string) => Promise<void>;
  onImageFileUpload: (e: React.ChangeEvent<HTMLInputElement>, slideId: string) => Promise<void>;
}

const SlideEditor = ({ 
  selectedSlide, 
  onChange,
  onImageUrlSubmit,
  onImageFileUpload
}: SlideEditorProps) => {
  switch (selectedSlide.type) {
    case 'text':
      return <TextSlideEditor slide={selectedSlide as TextSlide} onChange={onChange} />;
    case 'video':
      return <VideoSlideEditor slide={selectedSlide as VideoSlide} onChange={onChange} />;
    case 'image':
      return (
        <ImageSlideEditor 
          slide={selectedSlide as ImageSlide} 
          onChange={onChange} 
          onImageUrlSubmit={onImageUrlSubmit}
          onImageFileUpload={onImageFileUpload}
        />
      );
    case 'test':
      return <TestSlideEditor slide={selectedSlide as TestSlide} onChange={onChange} />;
    default:
      return <div>Неизвестный тип слайда</div>;
  }
};

export function SlideEditorView({
  selectedSlide,
  onShowAddDialog,
  onSetPreviewMode,
  onStartFullscreenPreview,
  ...props
}: SlideEditorViewProps & {
  onChange: (id: string, updates: Partial<Slide>) => void;
  onImageUrlSubmit: (url: string, slideId: string) => Promise<void>;
  onImageFileUpload: (e: React.ChangeEvent<HTMLInputElement>, slideId: string) => Promise<void>;
}) {
  return (
    <div className="p-6 flex-1 overflow-y-auto">
      {selectedSlide ? (
        <div>
          <SlideEditor 
            selectedSlide={selectedSlide} 
            onChange={props.onChange}
            onImageUrlSubmit={props.onImageUrlSubmit}
            onImageFileUpload={props.onImageFileUpload}
          />
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            Выберите слайд для редактирования или создайте новый
          </p>
          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              onClick={onShowAddDialog}
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить слайд
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 