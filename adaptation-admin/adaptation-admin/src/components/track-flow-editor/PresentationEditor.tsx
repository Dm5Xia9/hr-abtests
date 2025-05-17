import { useState, useRef, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from '@hello-pangea/dnd'
import { 
  Plus, 
  GripVertical, 
  Trash2, 
  FileText, 
  Video, 
  Image as ImageIcon, 
  Edit, 
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Presentation,
  Maximize,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Undo,
  Heading1,
  Heading2,
  Link as LinkIcon,
  HelpCircle,
  Check,
  CheckCircle2,
  CircleOff,
  Upload,
  AlertCircle,
  Loader2,
  Package,
  FileText as FileIcon,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  PlusCircle,
  Sparkles
} from 'lucide-react'
import { 
  PresentationStage, 
  Slide, 
  TextSlide, 
  VideoSlide, 
  ImageSlide, 
  TestSlide,
  TestOption
} from '@/types'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { importScormPackage } from '@/utils/scorm-import'
import { importPptxPackage } from '@/utils/pptx-import'
import { importPdfFile } from '@/utils/pdf-import'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { uploadImage, uploadImageFromUrl, normalizeImageUrl } from '@/utils/file-storage'

// Import components
import {
  SlideList,
  SlideEditorView,
  SlidePreview,
  FullscreenPreview,
  AddSlideDialog,
  ImportDialog,
  PresentationEditorProps,
  createNewSlide,
  getSlidePreview,
  getSlideTypeIcon,
  getSlideTypeName,
  updateSlide
} from './presentation-editor'

// Import AI components
import { PresentationAIGenerator } from './presentation-editor/ai'

export function PresentationEditor({ stage, onChange }: PresentationEditorProps) {
  // State
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [showFullscreenPreview, setShowFullscreenPreview] = useState(false);
  const [currentPreviewSlideIndex, setCurrentPreviewSlideIndex] = useState(0);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [slideToAddPosition, setSlideToAddPosition] = useState<'before' | 'after' | null>(null);
  const [showSlideMenu, setShowSlideMenu] = useState<string | null>(null);
  const [containerHeight, setContainerHeight] = useState('calc(100vh - 64px)');
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Update container height on mount and resize
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const windowHeight = window.innerHeight;
        const offsetTop = containerRef.current.getBoundingClientRect().top;
        const newHeight = `${windowHeight - offsetTop - 20}px`;
        setContainerHeight(newHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    
    // Apply CSS variable for height
    document.documentElement.style.setProperty('--editor-height', containerHeight);
    
    return () => window.removeEventListener('resize', updateHeight);
  }, [containerHeight]);

  // Close slide menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSlideMenu) {
        const target = event.target as HTMLElement;
        if (!target.closest('.slide-menu') && !target.closest('.menu-trigger')) {
          setShowSlideMenu(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSlideMenu]);

  // Event handlers
  const handleAddSlide = (type: Slide['type']) => {
    const newSlide = createNewSlide(type);

    // Add slide at specific position or at the end
    if (selectedSlide && slideToAddPosition) {
      const slides = [...stage.content.slides];
      const selectedIndex = slides.findIndex(slide => slide.id === selectedSlide.id);
      
      if (selectedIndex !== -1) {
        const insertIndex = slideToAddPosition === 'before' ? selectedIndex : selectedIndex + 1;
        slides.splice(insertIndex, 0, newSlide);
        onChange({ slides });
      } else {
        onChange({ slides: [...slides, newSlide] });
      }
    } else {
      // Add to the end
      onChange({
        slides: [...stage.content.slides, newSlide]
      });
    }
    
    setShowAddDialog(false);
    setSelectedSlide(newSlide);
    setSlideToAddPosition(null);
  };

  const handleAddSlideAt = (position: 'before' | 'after', slide: Slide) => {
    setSelectedSlide(slide);
    setSlideToAddPosition(position);
    setShowAddDialog(true);
    setShowSlideMenu(null);
  };

  const handleDeleteSlide = (id: string) => {
    onChange({
      slides: stage.content.slides.filter(s => s.id !== id)
    });
    
    if (selectedSlide?.id === id) {
      setSelectedSlide(null);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(stage.content.slides);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onChange({ slides: items });
  };

  const handleSlideChange = (id: string, updates: Partial<Slide>) => {
    const updatedSlides = updateSlide(stage.content.slides, id, updates);
    onChange({ slides: updatedSlides });

    // Update selected slide if it's being edited
    if (selectedSlide?.id === id) {
      const updatedSlide = updatedSlides.find(s => s.id === id) || null;
      setSelectedSlide(updatedSlide);
    }
  };

  const nextSlide = () => {
    if (stage.content.slides.length <= 1) return;
    setCurrentPreviewSlideIndex(prev => 
      prev === stage.content.slides.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    if (stage.content.slides.length <= 1) return;
    setCurrentPreviewSlideIndex(prev => 
      prev === 0 ? stage.content.slides.length - 1 : prev - 1
    );
  };

  const handleStartPreview = () => {
    // Start preview from selected slide or first slide
    if (selectedSlide) {
      const index = stage.content.slides.findIndex(s => s.id === selectedSlide.id);
      if (index !== -1) {
        setCurrentPreviewSlideIndex(index);
      } else {
        setCurrentPreviewSlideIndex(0);
      }
    } else {
      setCurrentPreviewSlideIndex(0);
    }
    setShowFullscreenPreview(true);
  };

  const navigateToNextSlide = () => {
    if (!selectedSlide || stage.content.slides.length <= 1) return;
    
    const currentIndex = stage.content.slides.findIndex(s => s.id === selectedSlide.id);
    if (currentIndex === -1) return;
    
    const nextIndex = (currentIndex + 1) % stage.content.slides.length;
    console.log('PresentationEditor.navigateToNextSlide', {
      currentSlideId: selectedSlide.id,
      currentSlideType: selectedSlide.type,
      nextSlideId: stage.content.slides[nextIndex].id,
      nextSlideType: stage.content.slides[nextIndex].type,
      slideCount: stage.content.slides.length
    });
    
    setSelectedSlide(stage.content.slides[nextIndex]);
  };
  
  const navigateToPrevSlide = () => {
    if (!selectedSlide || stage.content.slides.length <= 1) return;
    
    const currentIndex = stage.content.slides.findIndex(s => s.id === selectedSlide.id);
    if (currentIndex === -1) return;
    
    const prevIndex = (currentIndex - 1 + stage.content.slides.length) % stage.content.slides.length;
    console.log('PresentationEditor.navigateToPrevSlide', {
      currentSlideId: selectedSlide.id,
      currentSlideType: selectedSlide.type,
      prevSlideId: stage.content.slides[prevIndex].id,
      prevSlideType: stage.content.slides[prevIndex].type,
      slideCount: stage.content.slides.length
    });
    
    setSelectedSlide(stage.content.slides[prevIndex]);
  };

  // Import handlers
  const handleScormImport = async (file: File) => {
    try {
      setImportError(null);
      setIsImporting(true);
      
      const importedSlides = await importScormPackage(file);
      
      onChange({
        slides: [...stage.content.slides, ...importedSlides]
      });
      
      setShowImportDialog(false);
      toast({
        title: "Импорт SCORM успешен",
        description: `Импортировано ${importedSlides.length} слайдов из SCORM`,
      });
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Ошибка при импорте SCORM');
    } finally {
      setIsImporting(false);
    }
  };
  
  const handlePptxImport = async (file: File) => {
    try {
      setImportError(null);
      setIsImporting(true);
      
      const importedSlides = await importPptxPackage(file);
      
      onChange({
        slides: [...stage.content.slides, ...importedSlides]
      });
      
      setShowImportDialog(false);
      toast({
        title: "Импорт PPTX успешен",
        description: `Импортировано ${importedSlides.length} слайдов из PowerPoint`,
      });
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Ошибка при импорте PPTX');
    } finally {
      setIsImporting(false);
    }
  };
  
  const handlePdfImport = async (file: File) => {
    try {
      setImportError(null);
      setIsImporting(true);
      
      const importedSlides = await importPdfFile(file);
      
      onChange({
        slides: [...stage.content.slides, ...importedSlides]
      });
      
      setShowImportDialog(false);
      toast({
        title: "Импорт PDF успешен",
        description: `Импортировано ${importedSlides.length} слайдов из PDF`,
      });
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Ошибка при импорте PDF');
    } finally {
      setIsImporting(false);
    }
  };

  // Image handling
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, slideId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      // Upload image to server
      const imageUrl = await uploadImage(file);
      
      // Update slide with new image URL
      handleSlideChange(slideId, { url: imageUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Ошибка загрузки",
        description: error instanceof Error ? error.message : 'Ошибка при загрузке изображения',
        variant: "destructive"
      });
    }
  };
  
  const handleImageUrlSubmit = async (url: string, slideId: string) => {
    if (!url) return;
    
    try {
      // Upload image from URL
      const imageUrl = await uploadImageFromUrl(url);
      
      // Update slide with new image URL
      handleSlideChange(slideId, { url: imageUrl });
    } catch (error) {
      console.error('Error uploading image from URL:', error);
      toast({
        title: "Ошибка загрузки",
        description: error instanceof Error ? error.message : 'Ошибка при загрузке изображения по URL',
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col h-full" ref={containerRef}>
      {/* Add AI Generator button to the header */}
      <div className="border-b p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center">
          <Presentation className="h-5 w-5 mr-2 text-muted-foreground" />
          <h1 className="text-xl font-semibold">{stage.title}</h1>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImportDialog(true)}
            className="flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Импорт
          </Button>
          
          {/* Add AI Generation button */}
          <Button
            variant="outline" 
            size="sm"
            onClick={() => setShowAIGenerator(true)}
            className="flex items-center text-blue-500 border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI Генерация
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Slide list panel */}
        <SlideList
          slides={stage.content.slides}
          selectedSlide={selectedSlide}
          onSelectSlide={setSelectedSlide}
          onDeleteSlide={handleDeleteSlide}
          onAddSlideAt={handleAddSlideAt}
          onShowAddDialog={() => {
            setSlideToAddPosition(null);
            setShowAddDialog(true);
          }}
          onShowImportDialog={() => setShowImportDialog(true)}
          onDragEnd={handleDragEnd}
          previewMode={previewMode}
          onTogglePreviewMode={() => setPreviewMode(!previewMode)}
          onStartFullscreenPreview={handleStartPreview}
          onSetPreviewIndex={setCurrentPreviewSlideIndex}
          showSlideMenu={showSlideMenu}
          onToggleSlideMenu={setShowSlideMenu}
          getSlidePreview={getSlidePreview}
          getSlideTypeIcon={getSlideTypeIcon}
          getSlideTypeName={getSlideTypeName}
        />
        
        {/* Main content area - either editor or preview */}
        {previewMode ? (
          <SlidePreview
            selectedSlide={selectedSlide}
            slides={stage.content.slides}
            onSetPreviewMode={setPreviewMode}
            onNavigateToNextSlide={navigateToNextSlide}
            onNavigateToPrevSlide={navigateToPrevSlide}
          />
        ) : (
          <SlideEditorView
            selectedSlide={selectedSlide}
            onShowAddDialog={() => {
              setSlideToAddPosition(null);
              setShowAddDialog(true);
            }}
            onSetPreviewMode={setPreviewMode}
            onStartFullscreenPreview={handleStartPreview}
            onChange={handleSlideChange}
            onImageUrlSubmit={handleImageUrlSubmit}
            onImageFileUpload={handleImageFileUpload}
          />
        )}
      </div>
      
      {/* Dialogs */}
      <AddSlideDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddSlide={handleAddSlide}
      />
      
      <ImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onScormImport={handleScormImport}
        onPptxImport={handlePptxImport}
        onPdfImport={handlePdfImport}
        isImporting={isImporting}
        importError={importError}
      />
      
      {/* AI Generator Dialog */}
      {showAIGenerator && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-10 bg-background border rounded-lg shadow-lg flex flex-col overflow-hidden">
            <PresentationAIGenerator 
              stage={stage}
              onChange={onChange}
              onClose={() => setShowAIGenerator(false)}
            />
          </div>
        </div>
      )}
      
      {/* Fullscreen preview */}
      {showFullscreenPreview && (
        <FullscreenPreview
          slides={stage.content.slides}
          currentSlideIndex={currentPreviewSlideIndex}
          onClose={() => setShowFullscreenPreview(false)}
          onNextSlide={nextSlide}
          onPrevSlide={prevSlide}
        />
      )}
    </div>
  );
} 