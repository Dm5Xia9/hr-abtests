import { useState, useEffect } from 'react';
import { TextSlide, ImageSlide, VideoSlide, TestSlide, Slide } from '@/types';
import { normalizeImageUrl } from '@/utils/file-storage';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  CheckCircle, 
  PlusCircle, 
  MinusCircle,
  CheckSquare,
  XCircle,
  Presentation,
  CheckCircle2,
  CircleOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { EditorJSRenderer } from './EditorJSRenderer';

interface FullscreenSlideViewerProps {
  slides: Slide[];
  currentSlideIndex: number;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
  onComplete?: () => void;
  isCompleted?: boolean;
  isLastSlide: boolean;
  completedTestSlides: Record<string, boolean>;
  testAnswers: Record<string, string | string[]>;
  testVerificationResult: {
    isCorrect: boolean;
    message: string;
    attemptCount: number;
  } | null;
  onTestAnswer: (slideId: string, answer: string | string[]) => void;
  verifyTestAnswer: () => boolean;
  canComplete: boolean;
  canGoNext: boolean;
}

export function FullscreenSlideViewer({
  slides,
  currentSlideIndex,
  onNext,
  onPrevious,
  onClose,
  onComplete,
  isCompleted = false,
  isLastSlide,
  completedTestSlides,
  testAnswers,
  testVerificationResult,
  onTestAnswer,
  verifyTestAnswer,
  canComplete,
  canGoNext
}: FullscreenSlideViewerProps) {
  const [imageZoom, setImageZoom] = useState(1);
  const currentSlide = slides[currentSlideIndex];
  
  // Reset zoom when slide changes
  useEffect(() => {
    setImageZoom(1);
  }, [currentSlideIndex]);
  
  const zoomIn = () => {
    setImageZoom(prev => Math.min(prev + 0.25, 3));
  };
  
  const zoomOut = () => {
    setImageZoom(prev => Math.max(prev - 0.25, 0.5));
  };
  
  const handleSingleChoiceAnswer = (optionId: string) => {
    if (currentSlide?.type === 'test') {
      onTestAnswer(currentSlide.id, optionId);
    }
  };
  
  const handleMultipleChoiceAnswer = (optionId: string) => {
    if (currentSlide?.type === 'test') {
      const currentAnswers = testAnswers[currentSlide.id] as string[] || [];
      const newAnswers = currentAnswers.includes(optionId)
        ? currentAnswers.filter(id => id !== optionId)
        : [...currentAnswers, optionId];
      
      onTestAnswer(currentSlide.id, newAnswers);
    }
  };

  if (!currentSlide) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 px-4 py-3 z-10 bg-gradient-to-b from-black/60 to-transparent text-white flex justify-between items-center">
        <div className="text-xs">
          Слайд {currentSlideIndex + 1} из {slides.length}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="text-white hover:bg-black/20 rounded-full h-8 w-8"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex items-center justify-center">
        {currentSlide.type === 'text' && (
          <div className="prose prose-invert max-w-3xl mx-auto px-6 overflow-y-auto max-h-[92vh]">
            <EditorJSRenderer 
              content={(currentSlide as TextSlide).content} 
              darkMode={true}
            />
          </div>
        )}
        
        {currentSlide.type === 'video' && (
          <div className="max-w-5xl w-full max-h-[85vh] mx-auto px-4">
            <div className="aspect-video">
              <iframe 
                src={(currentSlide as VideoSlide).url.replace('watch?v=', 'embed/')} 
                className="w-full h-full" 
                allowFullScreen
              />
            </div>
            {(currentSlide as VideoSlide).caption && (
              <p className="text-sm text-white/80 text-center mt-4">
                {(currentSlide as VideoSlide).caption}
              </p>
            )}
          </div>
        )}
        
        {currentSlide.type === 'image' && (
          <div className="flex flex-col items-center justify-center w-full h-full px-4">
            <div className="relative">
              <img 
                src={normalizeImageUrl((currentSlide as ImageSlide).url)} 
                alt={(currentSlide as ImageSlide).caption || 'Image'} 
                className="max-h-[calc(100vh-120px)] max-w-[calc(100vw-80px)] object-contain transition-transform duration-200"
                style={{ transform: `scale(${imageZoom})` }}
              />
              
              {/* Zoom controls */}
              <div className="absolute top-2 right-[-70px] flex flex-col space-y-3">
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="h-12 w-12 p-0 bg-black/40 hover:bg-black/60 text-white border-0 rounded-full shadow-lg" 
                  onClick={zoomIn}
                >
                  <PlusCircle className="h-6 w-6" />
                </Button>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="h-12 w-12 p-0 bg-black/40 hover:bg-black/60 text-white border-0 rounded-full shadow-lg" 
                  onClick={zoomOut}
                >
                  <MinusCircle className="h-6 w-6" />
                </Button>
              </div>
            </div>
            
            {(currentSlide as ImageSlide).caption && (
              <p className="text-sm text-white/80 text-center mt-4 max-w-2xl">
                {(currentSlide as ImageSlide).caption}
              </p>
            )}
          </div>
        )}
        
        {currentSlide.type === 'test' && (
          <div className="max-w-2xl mx-auto p-6 bg-white/95 rounded-lg shadow-lg max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">
              {(currentSlide as TestSlide).question}
            </h3>
            
            {completedTestSlides[(currentSlide as TestSlide).id] ? (
              <Alert className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-5 w-5" />
                <AlertDescription>
                  Тест успешно пройден
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {(currentSlide as TestSlide).testType === 'single' ? (
                  <RadioGroup 
                    value={testAnswers[(currentSlide as TestSlide).id] as string} 
                    onValueChange={handleSingleChoiceAnswer}
                    className="space-y-3"
                  >
                    {(currentSlide as TestSlide).options.map(option => (
                      <div key={option.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-md">
                        <RadioGroupItem id={option.id} value={option.id} />
                        <Label htmlFor={option.id} className="flex-1 cursor-pointer">{option.text}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="space-y-3">
                    {(currentSlide as TestSlide).options.map(option => (
                      <div key={option.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-md">
                        <Checkbox 
                          id={option.id} 
                          checked={Array.isArray(testAnswers[(currentSlide as TestSlide).id]) && 
                            (testAnswers[(currentSlide as TestSlide).id] as string[])?.includes(option.id)}
                          onCheckedChange={() => handleMultipleChoiceAnswer(option.id)}
                        />
                        <Label htmlFor={option.id} className="flex-1 cursor-pointer">{option.text}</Label>
                      </div>
                    ))}
                  </div>
                )}
                
                {testVerificationResult && (
                  <Alert 
                    className={cn(
                      "mt-4",
                      testVerificationResult.isCorrect 
                        ? "bg-green-50 text-green-700 border-green-200" 
                        : "bg-red-50 text-red-700 border-red-200"
                    )}
                  >
                    {testVerificationResult.isCorrect 
                      ? <CheckSquare className="h-5 w-5" /> 
                      : <XCircle className="h-5 w-5" />}
                    <AlertDescription>
                      {testVerificationResult.message}
                    </AlertDescription>
                  </Alert>
                )}
                
                {(currentSlide as TestSlide).explanation && completedTestSlides[(currentSlide as TestSlide).id] && (
                  <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded-md">
                    <h4 className="font-medium mb-1">Пояснение:</h4>
                    <p>{(currentSlide as TestSlide).explanation}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Navigation controls */}
      {!isLastSlide ? (
        <Button 
          onClick={onNext}
          disabled={!canGoNext}
          size="icon"
          variant="secondary"
          className="absolute right-4 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-black/30 hover:bg-black/50 text-white border-0 shadow-lg"
        >
          <ChevronRight className="h-7 w-7" />
        </Button>
      ) : (
        <Button 
          onClick={onComplete}
          variant="secondary"
          size="lg"
          disabled={!canComplete || isCompleted}
          className="absolute right-4 bottom-6 h-14 px-8 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg"
        >
          <CheckCircle className="h-6 w-6 mr-2" />
          {isCompleted ? "Завершено" : "Завершить"}
        </Button>
      )}
      
      {currentSlideIndex > 0 && (
        <Button 
          variant="secondary"
          onClick={onPrevious}
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-black/30 hover:bg-black/50 text-white border-0 shadow-lg"
        >
          <ChevronLeft className="h-7 w-7" />
        </Button>
      )}
      
      {/* Background effect for image slides */}
      {currentSlide.type === 'image' && (
        <div className="fixed inset-0 z-[-1]">
          <div 
            className="w-full h-full opacity-20 blur-2xl"
            style={{
              backgroundImage: `url(${normalizeImageUrl((currentSlide as ImageSlide).url)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        </div>
      )}
    </div>
  );
} 