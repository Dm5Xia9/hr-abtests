import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slide } from '@/types';
import { cn } from '@/lib/utils';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Plus, MoreVertical, ChevronUp, ChevronDown, Trash2, PlusCircle, Maximize, Edit, Eye, Presentation, Upload } from 'lucide-react';
import { SlideListProps } from './types';
import React from 'react';

export function SlideList({
  slides,
  selectedSlide,
  onSelectSlide,
  onDeleteSlide,
  onAddSlideAt,
  onShowAddDialog,
  onShowImportDialog,
  onDragEnd,
  previewMode,
  onTogglePreviewMode,
  onStartFullscreenPreview,
  onSetPreviewIndex,
  showSlideMenu,
  onToggleSlideMenu,
  getSlidePreview,
  getSlideTypeIcon,
  getSlideTypeName
}: SlideListProps) {
  return (
    <div className="w-64 border-r flex flex-col overflow-hidden h-full min-h-0 flex-shrink-0">
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <h3 className="font-medium">Слайды</h3>
            <span className="ml-2 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
              {slides.length}
            </span>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onShowAddDialog()}
              title="Добавить слайд"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onShowImportDialog}
              title="Импортировать презентацию"
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Переключатель режима просмотра */}
        {slides.length > 0 && (
          <div className="flex space-x-2 mb-2">
            <Button 
              variant={previewMode ? "default" : "outline"} 
              size="sm"
              onClick={() => onTogglePreviewMode()}
              className="flex-1"
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
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={onStartFullscreenPreview}
              title="Предпросмотр во весь экран"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="slides">
          {(provided) => (
            <div 
              className="overflow-y-auto flex-1 h-full min-h-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent" 
              {...provided.droppableProps} 
              ref={provided.innerRef}
              style={{ 
                maxHeight: slides.length > 0 ? 'calc(100% - 120px)' : 'calc(100% - 82px)',
                height: '100%'
              }}
            >
              <div className="space-y-2 p-3 h-full">
                {slides.map((slide, index) => (
                  <Draggable 
                    key={slide.id} 
                    draggableId={slide.id} 
                    index={index}
                  >
                    {(provided) => (
                      <div className="relative group">
                        {/* Индикатор добавления слайда сверху */}
                        <div className="absolute w-full h-4 -top-2 left-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-5 w-5 rounded-full bg-white shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddSlideAt('before', slide);
                            }}
                            title="Добавить слайд сверху"
                          >
                            <PlusCircle className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <Card 
                          className={cn(
                            "overflow-hidden cursor-pointer border hover:border-primary transition-colors duration-200",
                            selectedSlide?.id === slide.id && "border-primary/70 ring-1 ring-primary/70",
                            "cursor-grab active:cursor-grabbing hover:shadow-md transition-all"
                          )}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => {
                            onSelectSlide(slide);
                            if (previewMode) {
                              // Если в режиме предпросмотра, открываем презентацию с этого слайда
                              onSetPreviewIndex(index);
                              onStartFullscreenPreview();
                            }
                          }}
                        >
                          <div className="flex items-center p-2 bg-muted/50 border-b">
                            <div
                              className="mr-2"
                            >
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex items-center flex-1 space-x-2">
                              {getSlideTypeIcon(slide.type)}
                              <span className="text-xs font-medium">
                                {getSlideTypeName(slide.type)}
                              </span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity menu-trigger"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleSlideMenu(showSlideMenu === slide.id ? null : slide.id);
                              }}
                            >
                              <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                          <CardContent className="p-0">
                            {getSlidePreview(slide)}
                          </CardContent>
                        </Card>
                        
                        {/* Индикатор добавления слайда снизу */}
                        <div className="absolute w-full h-4 -bottom-2 left-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-5 w-5 rounded-full bg-white shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddSlideAt('after', slide);
                            }}
                            title="Добавить слайд снизу"
                          >
                            <PlusCircle className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        {showSlideMenu === slide.id && (
                          <div 
                            className="absolute right-0 top-8 z-10 bg-white border rounded-md shadow-md py-1 w-48 slide-menu"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start px-2 h-8 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddSlideAt('before', slide);
                              }}
                            >
                              <ChevronUp className="h-3.5 w-3.5 mr-2" />
                              Добавить слайд сверху
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start px-2 h-8 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddSlideAt('after', slide);
                              }}
                            >
                              <ChevronDown className="h-3.5 w-3.5 mr-2" />
                              Добавить слайд снизу
                            </Button>
                            <hr className="my-1" />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start px-2 h-8 text-xs text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSlide(slide.id);
                                onToggleSlideMenu(null);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" />
                              Удалить слайд
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
              
              {slides.length === 0 && (
                <div className="text-center py-8 mx-3 mt-3 border rounded-lg bg-muted/30 h-[calc(100%-20px)] flex flex-col justify-center">
                  <Presentation className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm font-medium mb-1">Добавьте первый слайд</p>
                  <p className="text-xs text-muted-foreground mb-4 px-4">
                    Создайте презентацию, добавив текстовые, видео, изображения или тестовые слайды
                  </p>
                  <div className="flex justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onShowAddDialog}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Добавить слайд
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
} 