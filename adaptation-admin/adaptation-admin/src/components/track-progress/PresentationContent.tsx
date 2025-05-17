import { useState, useEffect, useRef } from 'react'
import { Stage, 
  PresentationStage, 
  GoalStage, 
  SurveyStage, 
  MeetingStage, 
  TextSlide,
  VideoSlide,
  ImageSlide,
  TestSlide
} from '@/types'
import { Button } from '@/components/ui/button'
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { 
  CheckCircle, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Users, 
  Video, 
  Image, 
  FileText, 
  TestTube, 
  Clock,
  AlertCircle,
  CheckSquare,
  XCircle,
  Fullscreen,
  MinusCircle,
  PlusCircle,
  Check as CheckIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useStore } from '@/store/index'
import { useParams } from 'react-router-dom'
import { normalizeImageUrl } from '@/utils/file-storage'
import { FullscreenSlideViewer } from './FullscreenSlideViewer'
import { EditorJSRenderer } from './EditorJSRenderer'
import { SurveyContent } from './SurveyContent'
import { GoalContent } from './GoalContent'
import { navigateToNextStage } from '@/utils/navigation'

export interface StageTypeContentProps<T extends Stage> {
    stage: T
    isCompleted: boolean
    onComplete: (completed: boolean) => void
  }

// Presentation Stage Component
export function PresentationContent({ stage, isCompleted, onComplete }: StageTypeContentProps<PresentationStage>) {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
    const [highestVisitedSlideIndex, setHighestVisitedSlideIndex] = useState(0)
    const [completedTestSlides, setCompletedTestSlides] = useState<Record<string, boolean>>({})
    const [testAnswers, setTestAnswers] = useState<Record<string, string | string[]>>({})
    const [testVerificationResult, setTestVerificationResult] = useState<{
      isCorrect: boolean;
      message: string;
      attemptCount: number;
    } | null>(null)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isLandscape, setIsLandscape] = useState(false)
    const [imageZoom, setImageZoom] = useState(1)
    const [slideTransition, setSlideTransition] = useState<'none' | 'next' | 'prev'>('none')
    const slideContainerRef = useRef<HTMLDivElement>(null)
    
    // Get access to the track data and navigation methods
    const { employees, tracks, updateStepProgress } = useStore()
    const { employeeId } = useParams()
    
    const slides = stage.content.slides || []
    const currentSlide = slides[currentSlideIndex]
    const isCurrentSlideTest = currentSlide?.type === 'test'
    const hasCurrentTestAnswer = isCurrentSlideTest ? 
      !!testAnswers[currentSlide.id] && 
      (Array.isArray(testAnswers[currentSlide.id]) 
        ? (testAnswers[currentSlide.id] as string[]).length > 0 
        : true) 
      : true
    
    const isLastSlide = currentSlideIndex === slides.length - 1
    const isFirstSlide = currentSlideIndex === 0
  
    // Detect orientation changes
    useEffect(() => {
      const checkOrientation = () => {
        setIsLandscape(window.innerWidth > window.innerHeight);
        
        // Передача информации о режиме в родительский компонент
        const orientationChangeEvent = new CustomEvent('orientationChange', { 
          detail: { isLandscape: window.innerWidth > window.innerHeight } 
        });
        window.dispatchEvent(orientationChangeEvent);
      };
      
      checkOrientation();
      window.addEventListener('resize', checkOrientation);
      
      return () => {
        window.removeEventListener('resize', checkOrientation);
      };
    }, []);
  
    // Автоматически входим в полноэкранный режим при переходе в ландшафтную ориентацию
    useEffect(() => {
      // Если устройство поддерживает полноэкранный режим, включаем его в ландшафтном режиме
      const enableFullscreenWhenLandscape = async () => {
        if (isLandscape && document.documentElement.requestFullscreen && !document.fullscreenElement) {
          try {
            await document.documentElement.requestFullscreen();
          } catch (err) {
            // Игнорируем ошибки, так как возможно пользователь не разрешил полноэкранный режим
          }
        } else if (!isLandscape && document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      };
  
      // Запускаем с небольшой задержкой, чтобы UI успел обновиться
      const timer = setTimeout(() => {
        enableFullscreenWhenLandscape();
      }, 500);
  
      return () => clearTimeout(timer);
    }, [isLandscape]);
    
    // Handle fullscreen mode
    const toggleFullscreen = () => {
      setIsFullscreen(prev => !prev);
    };
    
    // Reset zoom when changing slides
    useEffect(() => {
      setImageZoom(1);
    }, [currentSlideIndex]);
    
    const zoomIn = () => {
      setImageZoom(prev => Math.min(prev + 0.25, 3));
    };
    
    const zoomOut = () => {
      setImageZoom(prev => Math.max(prev - 0.25, 0.5));
    };
  
    useEffect(() => {
      // Update highest visited slide when navigating
      if (currentSlideIndex > highestVisitedSlideIndex) {
        setHighestVisitedSlideIndex(currentSlideIndex);
      }
      
      // Reset test verification result when changing slides
      setTestVerificationResult(null);
    }, [currentSlideIndex, highestVisitedSlideIndex]);
    
    const verifyTestAnswer = () => {
      if (currentSlide?.type !== 'test') return true;
      
      const slide = currentSlide as TestSlide;
      const userAnswer = testAnswers[slide.id];
      
      if (!userAnswer) {
        return false;
      }
      
      // Find correct answers
      const correctAnswers = slide.options
        .filter(option => option.isCorrect)
        .map(option => option.id);
        
      // Check if answer is correct
      let isCorrect = false;
      
      if (slide.testType === 'single') {
        isCorrect = true// DEBUG correctAnswers.includes(userAnswer as string);
      } else {
        // For multiple choice, all correct options must be selected and no incorrect ones
        const userAnswerArray = userAnswer as string[];
        const allCorrectSelected = correctAnswers.every(id => userAnswerArray.includes(id));
        const noIncorrectSelected = userAnswerArray.every(id => correctAnswers.includes(id));
        isCorrect = allCorrectSelected && noIncorrectSelected;
      }
      
      if (isCorrect) {
        // Mark the test as completed
        setCompletedTestSlides({
          ...completedTestSlides,
          [slide.id]: true
        });
        
        setTestVerificationResult({
          isCorrect: true,
          message: "Верный ответ!",
          attemptCount: testVerificationResult ? testVerificationResult.attemptCount + 1 : 1
        });
        
        return true;
      } else {
        setTestVerificationResult({
          isCorrect: false,
          message: "Неверный ответ. Попробуйте еще раз.",
          attemptCount: testVerificationResult ? testVerificationResult.attemptCount + 1 : 1
        });
        
        return false;
      }
    }
    
    const handleNextSlide = () => {
      // For test slides, we should only allow progression if the test is completed
      // or if the answer has been verified
      if (isCurrentSlideTest && !completedTestSlides[currentSlide.id]) {
        // If there's no verification result yet, user needs to submit answer first
        if (hasCurrentTestAnswer && !testVerificationResult) {
          submitTestAnswer();
          return;
        }
        
        // If verification result exists but answer is incorrect, don't allow progression
        if (testVerificationResult && !testVerificationResult.isCorrect) {
          return;
        }
      }
      
      if (currentSlideIndex < slides.length - 1) {
        setSlideTransition('next');
        setTimeout(() => {
          setCurrentSlideIndex(currentSlideIndex + 1);
          // Reset transition after a short delay to prepare for next transition
          setTimeout(() => setSlideTransition('none'), 50);
        }, 200);
      }
    }
    
    const handlePreviousSlide = () => {
      if (currentSlideIndex > 0) {
        setSlideTransition('prev');
        setTimeout(() => {
          setCurrentSlideIndex(currentSlideIndex - 1);
          // Reset transition after a short delay to prepare for next transition
          setTimeout(() => setSlideTransition('none'), 50);
        }, 200);
      }
    }
  
    const handleComplete = () => {
      // Check if already completed or all tests are completed before allowing completion
      if (isCompleted) {
        return; // Already completed, don't allow uncompleting
      }
      
      const testSlides = slides.filter(slide => slide.type === 'test');
      const allTestsCompleted = testSlides.every(slide => completedTestSlides[slide.id]);
      
      if (testSlides.length > 0 && !allTestsCompleted) {
        alert("Необходимо пройти все тесты перед завершением презентации");
        return;
      }
      
      // Complete the current stage (always set to true, no uncompleting)
      onComplete(true);
      
      // Proceed to the next stage
      setTimeout(() => {
        navigateToNextStage(stage, employees, tracks, employeeId);
      }, 300); // Wait a bit for the completion state to update
    }
    
    const handleSingleChoiceAnswer = (optionId: string) => {
      if (currentSlide?.type === 'test') {
        setTestAnswers({
          ...testAnswers,
          [currentSlide.id]: optionId
        });
        
        // Reset verification result when answer changes
        setTestVerificationResult(null);
      }
    }
    
    const handleMultipleChoiceAnswer = (optionId: string) => {
      if (currentSlide?.type === 'test') {
        const currentAnswers = testAnswers[currentSlide.id] as string[] || [];
        const newAnswers = currentAnswers.includes(optionId)
          ? currentAnswers.filter(id => id !== optionId)
          : [...currentAnswers, optionId];
          
        setTestAnswers({
          ...testAnswers,
          [currentSlide.id]: newAnswers
        });
        
        // Reset verification result when answer changes
        setTestVerificationResult(null);
      }
    }
  
    const handleTestAnswer = (slideId: string, answer: string | string[]) => {
      setTestAnswers({
        ...testAnswers,
        [slideId]: answer
      });
      
      // Reset verification result when answer changes
      setTestVerificationResult(null);
    };
    
    const isCurrentSlideCompleted = currentSlide?.type === 'test' ? completedTestSlides[currentSlide.id] : true;
    
    // Determine if next button should be enabled
    const canGoNext = !isLastSlide && (!isCurrentSlideTest || isCurrentSlideCompleted || hasCurrentTestAnswer);
    
    // Determine if complete button should be enabled
    const canComplete = isLastSlide && (!isCurrentSlideTest || isCurrentSlideCompleted);
  
    // If in fullscreen mode, use the dedicated fullscreen component
    if (isFullscreen) {
      return (
        <FullscreenSlideViewer
          slides={slides}
          currentSlideIndex={currentSlideIndex}
          onNext={handleNextSlide}
          onPrevious={handlePreviousSlide}
          onClose={() => setIsFullscreen(false)}
          onComplete={handleComplete}
          isCompleted={isCompleted}
          isLastSlide={isLastSlide}
          completedTestSlides={completedTestSlides}
          testAnswers={testAnswers}
          testVerificationResult={testVerificationResult}
          onTestAnswer={handleTestAnswer}
          verifyTestAnswer={verifyTestAnswer}
          canComplete={canComplete}
          canGoNext={canGoNext}
        />
      );
    }
  
    // Added states and handlers for swipe gestures
    const [isDragging, setIsDragging] = useState(false);
    const [touchStartX, setTouchStartX] = useState<number | null>(null);
    const [touchEndX, setTouchEndX] = useState<number | null>(null);
    const [touchDiffX, setTouchDiffX] = useState(0);
  
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
      setIsDragging(true);
      if ('touches' in e) {
        setTouchStartX(e.touches[0].clientX);
      } else {
        setTouchStartX(e.clientX);
      }
      setTouchEndX(null);
      setTouchDiffX(0);
    };
  
    const handleTouchEnd = () => {
      setIsDragging(false);
      if (touchStartX !== null && touchEndX !== null) {
        const diff = touchEndX - touchStartX;
        // For test slides, prevent swiping if not completed and no verification or incorrect
        const canSwipeOnTestSlide = !isCurrentSlideTest || 
                                   completedTestSlides[currentSlide.id] || 
                                   (testVerificationResult && testVerificationResult.isCorrect);
        
        if (diff > 100 && !isFirstSlide) {
          // Always allow swiping back to previous slide
          handlePreviousSlide();
        } else if (diff < -100 && !isLastSlide && (canSwipeOnTestSlide || !isCurrentSlideTest)) {
          // Only allow swiping forward on test slides if completed or verified correct
          handleNextSlide();
        }
      }
      setTouchStartX(null);
      setTouchEndX(null);
      setTouchDiffX(0);
    };
  
    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      
      if ('touches' in e) {
        setTouchEndX(e.touches[0].clientX);
      } else {
        setTouchEndX(e.clientX);
      }
      
      if (touchStartX !== null && touchEndX !== null) {
        const diff = touchEndX - touchStartX;
        setTouchDiffX(diff);
        
        // Prevent dragging too far
        if ((diff > 0 && isFirstSlide) || (diff < 0 && isLastSlide)) {
          setTouchDiffX(diff * 0.3); // Resist movement at ends
        }
      }
    };
    
    // Показываем подсказку для свайпа при смене слайда
    useEffect(() => {
      // Если пользователь не перетаскивает слайд, показываем подсказку
      const showSwipeHint = setTimeout(() => {
        // Имитируем небольшой свайп в сторону
        setTouchDiffX(!isLastSlide ? -30 : 30);
        
        // Через короткое время возвращаем в исходное положение
        const resetHint = setTimeout(() => {
          setTouchDiffX(0);
        }, 600);
        
        return () => clearTimeout(resetHint);
      }, 1000);
      
      return () => clearTimeout(showSwipeHint);
    }, [currentSlideIndex, isLastSlide]);
  
    // Добавляем маленький индикатор прогресса для альбомного режима
    const ProgressIndicator = () => {
      return (
        <div className="flex items-center justify-center space-x-1 mt-1">
          {slides.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1 rounded-full transition-all duration-200",
                index === currentSlideIndex 
                  ? "w-3 bg-white/80" 
                  : "w-1 bg-white/20",
                index > highestVisitedSlideIndex && "opacity-40"
              )}
            />
          ))}
        </div>
      );
    };
  
    const [videoLoadError, setVideoLoadError] = useState<Record<string, boolean>>({});
    const [videoLoading, setVideoLoading] = useState<Record<string, boolean>>({});
    const [videoSources, setVideoSources] = useState<Record<string, string>>({});
  
    // Function to extract YouTube video ID
    const getYouTubeVideoId = (url: string) => {
      if (!url) return null;
      
      // Regular expression to extract YouTube video ID
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      
      return (match && match[2].length === 11) ? match[2] : null;
    };
  
    // Function to get YouTube thumbnail
    const getYouTubeThumbnail = (url: string) => {
      const videoId = getYouTubeVideoId(url);
      if (videoId) {
        // Return high quality thumbnail URL
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
      return null;
    };
  
    // Reset error and loading state when changing slides
    useEffect(() => {
      // Clear states when changing slides
      if (currentSlide?.type === 'video') {
        setVideoLoadError(prev => ({...prev, [currentSlide.id]: false}));
        setVideoLoading(prev => ({...prev, [currentSlide.id]: true}));
        
        // Set a timeout to handle cases where the iframe never fires an onLoad event
        const timer = setTimeout(() => {
          setVideoLoading(prev => {
            // Only mark as not loading if we're still on this slide
            if (slides[currentSlideIndex]?.id === currentSlide.id) {
              return {...prev, [currentSlide.id]: false};
            }
            return prev;
          });
        }, 8000); // 8 second timeout
        
        return () => clearTimeout(timer);
      }
    }, [currentSlideIndex, currentSlide, slides]);
  
    // Function to handle video load errors
    const handleVideoError = (slideId: string, url: string) => {
      console.error("Error loading video:", url);
      setVideoLoadError(prev => ({...prev, [slideId]: true}));
      setVideoLoading(prev => ({...prev, [slideId]: false}));
    };
  
    // Function to handle successful video load
    const handleVideoLoad = (slideId: string) => {
      console.log("Video iframe loaded successfully:", slideId);
      setVideoLoadError(prev => ({...prev, [slideId]: false}));
      setVideoLoading(prev => ({...prev, [slideId]: false}));
    };
  
    // Utility function to get correct video URL
    const getVideoEmbedUrl = (url: string) => {
      // Try to get URL from cache first
      if (videoSources[url]) {
        return videoSources[url];
      }
      
      // Check if it's a YouTube URL
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        // Convert to embed URL
        let embedUrl = url.replace('watch?v=', 'embed/');
        // Handle youtu.be URLs
        if (url.includes('youtu.be/')) {
          const videoId = url.split('youtu.be/')[1].split('?')[0];
          embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
        // Add autoplay=0 and related=0 to avoid unwanted behavior
        embedUrl = embedUrl.includes('?') 
          ? `${embedUrl}&autoplay=0&related=0` 
          : `${embedUrl}?autoplay=0&related=0`;
        
        // Cache the URL
        setVideoSources(prev => ({...prev, [url]: embedUrl}));
        return embedUrl;
      }
      
      // Handle Vimeo URLs
      if (url.includes('vimeo.com')) {
        // Extract video ID from URL
        const matches = url.match(/vimeo\.com\/(\d+)/);
        if (matches && matches[1]) {
          const embedUrl = `https://player.vimeo.com/video/${matches[1]}?autoplay=0`;
          // Cache the URL
          setVideoSources(prev => ({...prev, [url]: embedUrl}));
          return embedUrl;
        }
      }
      
      // If it's not a recognized format, return the original
      return url;
    };
  
    // For video slides, make sure we can scroll if needed
    const videoContainerRef = useRef<HTMLDivElement>(null);
  
    // Make sure video containers are scrollable
    useEffect(() => {
      if (currentSlide?.type === 'video' && videoContainerRef.current) {
        // Make the container scrollable after a short delay (allowing content to render)
        const timer = setTimeout(() => {
          if (videoContainerRef.current) {
            videoContainerRef.current.style.overflowY = 'auto';
            videoContainerRef.current.style.overflowX = 'hidden';
          }
        }, 500);
        
        return () => clearTimeout(timer);
      }
    }, [currentSlide, videoLoadError]);
  
    // Function to check if test answer can be submitted
    const canSubmitTestAnswer = (slideId: string) => {
      if (!testAnswers[slideId]) return false;
      
      const slide = slides.find(s => s.id === slideId) as TestSlide | undefined;
      if (!slide) return false;
      
      if (slide.testType === 'single') {
        return !!testAnswers[slideId];
      } else {
        // For multiple choice, check if at least one option is selected
        return Array.isArray(testAnswers[slideId]) && (testAnswers[slideId] as string[]).length > 0;
      }
    };
  
    // Function to submit test answer
    const submitTestAnswer = () => {
      if (currentSlide?.type !== 'test') return;
      verifyTestAnswer();
    };
  
    return (
      <div className="flex flex-col min-h-[calc(100vh-250px)]" ref={slideContainerRef}>
        <div className={cn(
          "flex-1 space-y-4",
          isLandscape && "flex flex-row items-stretch space-y-0 space-x-0 p-0 h-[100vh] overflow-hidden relative"
        )}>
          {/* Тонкий прогресс-бар в верхней части экрана в альбомном режиме */}
          {isLandscape && (
            <div className="absolute top-0 left-0 right-0 z-30 h-0.5 bg-black/10">
              <div 
                className="h-full bg-white/60 transition-all duration-300"
                style={{ width: `${(currentSlideIndex + 1) / slides.length * 100}%` }}
              />
            </div>
          )}
          
          {/* Enhanced slide header with more compact and visual design - hide most of it in landscape mode */}
          <div className={cn(
            "sticky top-0 z-40 flex flex-col bg-background/95 backdrop-blur-sm border-b transition-all duration-200 ease-in-out",
            isLandscape && "absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-black/15 backdrop-blur-sm rounded-full border-none w-auto px-2 py-0.5"
          )}>
            {!isLandscape ? (
              <>
                <div className="flex justify-between items-center py-2 px-3">
                  <div className="flex items-center gap-2">
            <div className={cn(
                      "flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-medium",
                      isLandscape && "bg-white/20 text-white"
                    )}>
                      {currentSlideIndex + 1}
                    </div>
                    <div className={cn(
                      "text-sm font-medium",
              isLandscape && "text-white text-xs"
            )}>
                      из {slides.length}
                    </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {isCompleted && (
                <Badge variant="outline" className={cn(
                        "bg-green-50 text-green-700 border-green-200 transition-all duration-200",
                  isLandscape && "bg-green-600/20 text-white border-green-600/30"
                )}>
                  <CheckCircle className="h-3 w-3 mr-1" /> Пройдено
                </Badge>
              )}
              
              {currentSlide?.type === 'image' && (
                <div className={cn(
                  "flex items-center",
                        isLandscape && "space-x-1"
                )}>
                  <Button 
                    variant={isLandscape ? "secondary" : "ghost"} 
                    size="sm" 
                    className={cn(
                            "h-7 w-7 p-0",
                      isLandscape && "bg-white/20 hover:bg-white/30 rounded-full text-white"
                    )} 
                    onClick={toggleFullscreen}
                  >
                          <Fullscreen className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant={isLandscape ? "secondary" : "ghost"} 
                    size="sm" 
                    className={cn(
                            "h-7 w-7 p-0",
                      isLandscape && "bg-white/20 hover:bg-white/30 rounded-full text-white"
                    )} 
                    onClick={zoomOut}
                  >
                          <MinusCircle className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant={isLandscape ? "secondary" : "ghost"} 
                    size="sm" 
                    className={cn(
                            "h-7 w-7 p-0",
                      isLandscape && "bg-white/20 hover:bg-white/30 rounded-full text-white"
                    )} 
                    onClick={zoomIn}
                  >
                          <PlusCircle className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
                {/* Progress bar */}
          <div className={cn(
                  "w-full h-1 bg-muted relative transition-all duration-500 ease-out",
                  isLandscape && "bg-white/10 rounded-b-xl overflow-hidden"
                )}>
                  <div 
                    className={cn(
                      "absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out",
                      isLandscape && "bg-white/50"
                    )}
                    style={{ width: `${(currentSlideIndex + 1) / slides.length * 100}%` }}
                  />
                </div>
                
                {/* Slide indicators */}
                <div className={cn(
                  "hidden md:flex justify-center items-center py-2 gap-1 overflow-x-auto",
                  isLandscape && "py-1"
                )}>
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-200 ease-out",
                        index === currentSlideIndex 
                          ? "w-4 bg-primary" 
                          : "w-1.5 bg-muted hover:bg-muted-foreground/50",
                        index > highestVisitedSlideIndex && "opacity-50",
                        isLandscape && (index === currentSlideIndex ? "bg-white" : "bg-white/30 hover:bg-white/50")
                      )}
                      onClick={() => {
                        // Only allow navigating to slides we've already seen or the next one
                        if (index <= highestVisitedSlideIndex + 1) {
                          if (index > currentSlideIndex) {
                            setSlideTransition('next');
                          } else if (index < currentSlideIndex) {
                            setSlideTransition('prev');
                          }
                          setTimeout(() => {
                            setCurrentSlideIndex(index);
                            setTimeout(() => setSlideTransition('none'), 50);
                          }, 200);
                        }
                      }}
                      disabled={index > highestVisitedSlideIndex + 1}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            ) : (
              // Минималистичный счетчик слайдов для альбомного режима
              <div className="flex items-center gap-2 text-white/80">
                <span className="text-xs font-medium">{currentSlideIndex + 1}/{slides.length}</span>
                
                {currentSlide?.type === 'image' && (
                  <div className="flex items-center gap-1 ml-1">
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0 bg-white/10 hover:bg-white/20 rounded-full" onClick={toggleFullscreen}>
                      <Fullscreen className="h-2.5 w-2.5 text-white" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0 bg-white/10 hover:bg-white/20 rounded-full" onClick={zoomOut}>
                      <MinusCircle className="h-2.5 w-2.5 text-white" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0 bg-white/10 hover:bg-white/20 rounded-full" onClick={zoomIn}>
                      <PlusCircle className="h-2.5 w-2.5 text-white" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Slide content - adjusted for better spacing */}
          <div 
            className={cn(
              "px-3 py-2 transition-all duration-200 ease-in-out relative overflow-hidden",
              isLandscape && "flex-1 flex items-center justify-center p-0 h-full"
            )}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
            style={{ 
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: 'none'
            }}
          >
            {/* Swipe indicators - smaller and more transparent in landscape mode */}
            <div 
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/70 backdrop-blur-sm transform transition-all duration-300",
                touchDiffX > 50 ? "opacity-100 scale-110" : "opacity-0 scale-90",
                isLandscape && "bg-white/15 p-1.5 left-2 bottom-10 top-auto -translate-y-0"
              )}
            >
              <ChevronLeft className={cn("h-5 w-5 text-primary", isLandscape && "text-white/90 h-4 w-4")} />
            </div>
            
            <div 
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/70 backdrop-blur-sm transform transition-all duration-300",
                touchDiffX < -50 ? "opacity-100 scale-110" : "opacity-0 scale-90",
                isLandscape && "bg-white/15 p-1.5 right-2 bottom-10 top-auto -translate-y-0"
              )}
            >
              <ChevronRight className={cn("h-5 w-5 text-primary", isLandscape && "text-white/90 h-4 w-4")} />
            </div>
            
            {/* Text slide */}
            {currentSlide.type === 'text' && (
              <div className={cn(
                "prose max-w-none mx-auto animate-fadeIn transition-all duration-300",
                slideTransition === 'next' && "opacity-0 transform translate-x-6",
                slideTransition === 'prev' && "opacity-0 transform -translate-x-6",
                isLandscape && "max-w-none w-[95vw] mx-auto px-8 overflow-y-auto max-h-[92vh] bg-white/10 backdrop-blur-sm rounded-xl p-8 text-white shadow-lg"
              )}
              style={{ 
                transform: isDragging ? `translateX(${touchDiffX}px)` : undefined,
                opacity: isDragging ? Math.max(0.6, 1 - Math.abs(touchDiffX) / 500) : 1,
                transition: isDragging ? 'none' : 'all 0.3s ease-out'
              }}
              >
                <EditorJSRenderer 
                  content={(currentSlide as TextSlide).content} 
                  darkMode={isLandscape}
                />
              </div>
            )}
            
            {/* Video slide */}
            {currentSlide.type === 'video' && (
              <div 
                ref={videoContainerRef}
                className={cn(
                  "aspect-video max-h-[300px] w-full animate-scaleIn transition-all duration-300",
                  slideTransition === 'next' && "opacity-0 transform translate-y-6",
                  slideTransition === 'prev' && "opacity-0 transform -translate-y-6",
                  isLandscape && "max-h-none h-[88vh] max-w-[96vw] w-[96vw] mx-auto",
                  videoLoadError[(currentSlide as VideoSlide).id] && "overflow-y-auto"
                )}
                style={{ 
                  transform: isDragging ? `translateX(${touchDiffX}px)` : undefined,
                  opacity: isDragging ? Math.max(0.6, 1 - Math.abs(touchDiffX) / 500) : 1,
                  transition: isDragging ? 'none' : 'all 0.3s ease-out'
                }}
              >
              <div className={cn(
                  "w-full h-full rounded-lg shadow-sm transition-all duration-200",
                  videoLoadError[(currentSlide as VideoSlide).id] ? "overflow-y-auto" : "overflow-hidden"
                )}>
                  {videoLoadError[(currentSlide as VideoSlide).id] ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-muted/20 rounded-lg p-4 text-center">
                      {getYouTubeThumbnail((currentSlide as VideoSlide).url) && (
                        <div className="w-full max-w-[300px] mb-4 relative">
                          <img 
                            src={getYouTubeThumbnail((currentSlide as VideoSlide).url)!} 
                            alt="Video thumbnail" 
                            className="w-full object-cover rounded-md" 
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-md">
                            <div className="w-12 h-12 rounded-full bg-red-600/90 flex items-center justify-center">
                              <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[12px] border-l-white border-b-[6px] border-b-transparent ml-1"></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="mb-2 text-red-500 font-medium">Ошибка загрузки видео</div>
                      <p className="text-xs text-muted-foreground mb-3">
                        Видео не может быть встроено. Возможно, нет подключения к интернету или источник не разрешает встраивание.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <a 
                          href={(currentSlide as VideoSlide).url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-white bg-primary hover:bg-primary/90 px-4 py-2 rounded-md text-sm"
                        >
                          Открыть видео в новой вкладке
                        </a>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setVideoLoadError(prev => ({...prev, [(currentSlide as VideoSlide).id]: false}))}
                        >
                          Попробовать снова
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {videoLoading[(currentSlide as VideoSlide).id] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted/20 z-10 rounded-lg">
                          <div className="flex flex-col items-center">
                            <div className="h-8 w-8 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin mb-3"></div>
                            <p className="text-sm">Загрузка видео...</p>
                          </div>
                        </div>
                      )}
                <iframe 
                        src={getVideoEmbedUrl((currentSlide as VideoSlide).url)} 
                        className="w-full h-full rounded-lg"
                  allowFullScreen
                        loading="eager"
                        referrerPolicy="no-referrer"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
                        onError={() => handleVideoError((currentSlide as VideoSlide).id, (currentSlide as VideoSlide).url)}
                        onLoad={() => handleVideoLoad((currentSlide as VideoSlide).id)}
                      ></iframe>
                    </>
                  )}
                </div>
                {(currentSlide as VideoSlide).caption && (
                  <p className={cn(
                    "text-xs text-muted-foreground mt-2",
                    isLandscape && "text-center text-white/70 text-[10px]"
                  )}>
                    {(currentSlide as VideoSlide).caption}
                  </p>
                )}
              </div>
            )}
            
            {/* Image slide */}
            {currentSlide.type === 'image' && (
              <div className={cn(
                "flex flex-col items-center animate-scaleIn transition-all duration-300",
                slideTransition === 'next' && "opacity-0 transform scale-95",
                slideTransition === 'prev' && "opacity-0 transform scale-105",
                isLandscape && "h-full w-full flex justify-center items-center px-0 max-w-[96vw] w-[96vw]"
              )}
              style={{ 
                transform: isDragging 
                  ? `translateX(${touchDiffX}px) scale(${Math.max(0.9, 1 - Math.abs(touchDiffX) / 1000)})` 
                  : undefined,
                opacity: isDragging ? Math.max(0.7, 1 - Math.abs(touchDiffX) / 500) : 1,
                transition: isDragging ? 'none' : 'all 0.3s ease-out'
              }}>
                <div className={cn(
                  "relative overflow-hidden",
                  isLandscape && "flex items-center justify-center h-full w-full"
                )}>
                  <img 
                    src={normalizeImageUrl((currentSlide as ImageSlide).url)} 
                    alt={(currentSlide as ImageSlide).caption || 'Image'} 
                    className={cn(
                      "max-h-[60vh] object-contain rounded-md transition-transform duration-300 ease-out",
                      isLandscape && "max-h-[88vh] max-w-[96vw] rounded-lg shadow-2xl"
                    )}
                    style={{ transform: `scale(${imageZoom})` }}
                  />
                </div>
                {(currentSlide as ImageSlide).caption && (
                  <p className={cn(
                    "text-xs text-muted-foreground mt-2",
                    isLandscape && "text-center text-white/70 text-[10px] mt-1 absolute bottom-2"
                  )}>
                    {(currentSlide as ImageSlide).caption}
                  </p>
                )}
              </div>
            )}
            
            {/* Test slide */}
            {currentSlide.type === 'test' && (
              <div className={cn(
                "space-y-4 animate-fadeIn transition-all duration-300",
                slideTransition === 'next' && "opacity-0 transform translate-y-6",
                slideTransition === 'prev' && "opacity-0 transform -translate-y-6",
                isLandscape && "max-w-none w-[92vw] mx-auto p-6 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl overflow-y-auto max-h-[88vh] pb-24"
              )}
              style={{ 
                transform: isDragging ? `translateX(${touchDiffX}px)` : undefined,
                opacity: isDragging ? Math.max(0.7, 1 - Math.abs(touchDiffX) / 500) : 1,
                transition: isDragging ? 'none' : 'all 0.3s ease-out'
              }}>
                <div className="flex items-start justify-between">
                <h3 className="text-base font-medium">
                  {(currentSlide as TestSlide).question}
                </h3>
                  {/* Test type indicator */}
                  <Badge variant="outline" className="ml-2 text-xs">
                    {(currentSlide as TestSlide).testType === 'single' 
                      ? 'Один ответ' 
                      : 'Несколько ответов'}
                  </Badge>
                </div>
                
                {completedTestSlides[(currentSlide as TestSlide).id] ? (
                  <Alert className="bg-green-50 text-green-700 border-green-200 mt-4">
                    <CheckCircle className="h-4 w-4" />
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
                        className="space-y-2 mt-4"
                      >
                        {(currentSlide as TestSlide).options.map(option => (
                          <div 
                            key={option.id} 
                            className={cn(
                              "flex items-center space-x-2 py-2 px-3 hover:bg-muted/50 rounded-md transition-colors duration-150 border",
                              testAnswers[(currentSlide as TestSlide).id] === option.id 
                                ? "border-primary/30 bg-primary/5" 
                                : "border-transparent"
                            )}
                          >
                            <RadioGroupItem id={option.id} value={option.id} />
                            <Label htmlFor={option.id} className="text-sm cursor-pointer flex-1">{option.text}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    ) : (
                      <div className="space-y-2 mt-4">
                        {(currentSlide as TestSlide).options.map(option => {
                          const isChecked = Array.isArray(testAnswers[(currentSlide as TestSlide).id]) && 
                            (testAnswers[(currentSlide as TestSlide).id] as string[])?.includes(option.id);
                          
                          return (
                            <div 
                              key={option.id} 
                              className={cn(
                                "flex items-center space-x-2 py-2 px-3 hover:bg-muted/50 rounded-md transition-colors duration-150 border",
                                isChecked ? "border-primary/30 bg-primary/5" : "border-transparent"
                              )}
                            >
                            <Checkbox 
                              id={option.id} 
                                checked={isChecked}
                              onCheckedChange={() => handleMultipleChoiceAnswer(option.id)}
                            />
                              <Label htmlFor={option.id} className="text-sm cursor-pointer flex-1">{option.text}</Label>
                          </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
        
            {/* Fixed button for test slides */}
            {currentSlide.type === 'test' && !completedTestSlides[(currentSlide.id)] && hasCurrentTestAnswer && !testVerificationResult && (
        <div className={cn(
                "fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t z-40 shadow-sm transition-all duration-200 ease-in-out",
                isLandscape && "bg-black/15 border-none py-4 px-6"
              )}>
                <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
                  <span className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1 text-primary" />
                    Ответ выбран, нажмите кнопку для проверки
                  </span>
                  {(currentSlide as TestSlide).testType === 'multiple' && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      Выбрано: {Array.isArray(testAnswers[(currentSlide as TestSlide).id]) 
                        ? (testAnswers[(currentSlide as TestSlide).id] as string[]).length 
                        : 0}
                    </Badge>
                  )}
                </div>
              <Button 
                  onClick={submitTestAnswer} 
                  size="lg" 
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Проверить ответ
              </Button>
              </div>
            )}
            
            {/* Fixed verification result */}
            {currentSlide.type === 'test' && testVerificationResult && (
              <div className={cn(
                "fixed bottom-0 left-0 right-0 p-4 z-40 transition-all duration-300",
                testVerificationResult.isCorrect 
                  ? "bg-green-50 text-green-700 border-t border-green-200 animate-pulse" 
                  : "bg-red-50 text-red-700 border-t border-red-200 animate-shake"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      {testVerificationResult.isCorrect 
                        ? <CheckSquare className="h-4 w-4 mr-2" /> 
                        : <XCircle className="h-4 w-4 mr-2" />}
                      <AlertDescription className="font-medium">
                        {testVerificationResult.message}
                      </AlertDescription>
                    </div>
                    
                    {testVerificationResult.isCorrect && (
                      <div className="mt-2 text-xs">
                        {!isLastSlide 
                          ? "Свайпните влево или нажмите кнопку Вперед для продолжения" 
                          : "Вы завершили все тесты"}
                      </div>
                    )}
                  </div>
                  
                  {!isLastSlide && testVerificationResult.isCorrect && (
              <Button 
                variant="outline"
                      size="sm" 
                      className="ml-auto bg-green-50 text-green-700 border-green-200 hover:bg-green-100 shrink-0"
                      onClick={handleNextSlide}
                    >
                      Вперед
                      <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
                  )}
                </div>
              </div>
            )}
            
            {/* Add spacing at the bottom when buttons are fixed */}
            {currentSlide.type === 'test' && (hasCurrentTestAnswer || testVerificationResult) && (
              <div className="h-28"></div>
            )}
          </div>
        </div>
        
        {/* Navigation buttons */}
        <div className={cn(
          "fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t z-50 shadow-sm transition-all duration-200 ease-in-out",
          isLandscape && "bg-black/15 border-none w-auto px-1.5 py-0.5 mx-auto rounded-full bottom-1.5 left-1/2 -translate-x-1/2 shadow-md",
          // Hide navigation when test verification is shown
          (isCurrentSlideTest && !completedTestSlides[currentSlide.id] && hasCurrentTestAnswer) && "hidden"
        )}>
          {/* Заменяем кнопки на индикатор свайпа */}
          <div className={cn(
            "flex flex-col items-center justify-center py-1",
            isLandscape && "flex-row space-x-1"
          )}>
            {/* Скрываем подсказку свайпа, если это тест и он не пройден */}
            {!isLandscape && !(isCurrentSlideTest && !completedTestSlides[currentSlide.id]) && (
              <div className={cn(
                "text-xs text-muted-foreground mb-1",
                isLandscape && "text-white/70"
              )}>
                {!isLastSlide ? "Свайпните влево для продолжения" : "Свайпните вправо для возврата"}
              </div>
            )}
            <div className={cn(
              "flex items-center justify-center space-x-1",
              isLandscape && "opacity-60"
            )}>
              {!isFirstSlide && (
                <span className={cn(
                  "text-muted-foreground text-xs animate-pulse flex items-center",
                  isLandscape && "text-white/60 text-[8px]"
                )}>
                  <ChevronLeft className={cn("h-3 w-3", isLandscape && "h-2 w-2")} />
                  {!isLandscape && "Назад"}
                </span>
              )}
              <div className={cn(
                "mx-2 w-8 h-1 rounded-full bg-muted",
                isLandscape && "bg-white/15 w-8 h-0.5 mx-1"
              )} />
              {/* Скрываем индикатор свайпа вперед, если это тест и он не пройден */}
              {!isLastSlide && !(isCurrentSlideTest && !completedTestSlides[currentSlide.id]) ? (
                <span className={cn(
                  "text-primary text-xs animate-pulse flex items-center",
                  isLandscape && "text-white/60 text-[8px]"
                )}>
                  {!isLandscape && "Вперед"}
                  <ChevronRight className={cn("h-3 w-3", isLandscape && "h-2 w-2")} />
                </span>
              ) : isLastSlide && !(isCurrentSlideTest && !completedTestSlides[currentSlide.id]) && (
              <Button 
                onClick={handleComplete}
                variant={isCompleted ? "outline" : "default"}
                  size="sm"
                disabled={!canComplete || isCompleted}
                  className={cn(
                    "ml-2",
                    isLandscape && "bg-white/20 hover:bg-white/30 text-white border-white/20 h-6 text-[10px] py-0 min-w-0"
                  )}
              >
                {isCompleted ? (
                  <>
                      <CheckCircle className={cn("h-3 w-3 mr-1", isLandscape && "h-2.5 w-2.5")} />
                      {!isLandscape && "Завершено"}
                  </>
                ) : (
                  <>
                      <CheckCircle className={cn("h-3 w-3 mr-1", isLandscape && "h-2.5 w-2.5")} />
                      {!isLandscape && "Завершить"}
                  </>
                )}
              </Button>
          )}
        </div>
            
            {isLandscape && <ProgressIndicator />}
          </div>
        </div>
        
        {/* Add a padding div to prevent content from being hidden behind fixed buttons */}
        <div className={cn(
          "h-20",
          isLandscape && "h-0"
        )}></div>
        
        {/* Background in landscape mode */}
        {isLandscape && currentSlide?.type === 'image' && (
          <div className="fixed inset-0 z-[-1]">
            <div 
              className="w-full h-full opacity-25 blur-2xl"
              style={{
                backgroundImage: `url(${normalizeImageUrl((currentSlide as ImageSlide).url)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/90" /> {/* Улучшенное затемнение фона с градиентом */}
          </div>
        )}
        
        {/* Общий фон для альбомного режима */}
        {isLandscape && currentSlide?.type !== 'image' && (
          <div className="fixed inset-0 z-[-1] bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
        )}
      </div>
    )
  }