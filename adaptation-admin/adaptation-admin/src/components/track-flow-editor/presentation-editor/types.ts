import { PresentationStage, Slide } from '@/types';
import { DropResult } from '@hello-pangea/dnd';
import React from 'react';

export interface SlideListProps {
  slides: Slide[];
  selectedSlide: Slide | null;
  onSelectSlide: (slide: Slide) => void;
  onDeleteSlide: (id: string) => void;
  onAddSlideAt: (position: 'before' | 'after', slide: Slide) => void;
  onShowAddDialog: () => void;
  onShowImportDialog: () => void;
  onDragEnd: (result: DropResult) => void;
  previewMode: boolean;
  onTogglePreviewMode: () => void;
  onStartFullscreenPreview: () => void;
  onSetPreviewIndex: (index: number) => void;
  showSlideMenu: string | null;
  onToggleSlideMenu: (slideId: string | null) => void;
  getSlidePreview: (slide: Slide) => React.ReactNode;
  getSlideTypeIcon: (type: Slide['type']) => React.ReactNode;
  getSlideTypeName: (type: Slide['type']) => string;
}

export interface SlideEditorViewProps {
  selectedSlide: Slide | null;
  onShowAddDialog: () => void;
  onSetPreviewMode: (mode: boolean) => void;
  onStartFullscreenPreview: () => void;
}

export interface SlidePreviewProps {
  selectedSlide: Slide | null;
  slides: Slide[];
  onSetPreviewMode: (mode: boolean) => void;
  onNavigateToNextSlide: () => void;
  onNavigateToPrevSlide: () => void;
}

export interface PresentationEditorProps {
  stage: PresentationStage;
  onChange: (content: PresentationStage['content']) => void;
} 