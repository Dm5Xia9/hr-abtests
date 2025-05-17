import { useState, useEffect, useRef } from 'react'
import { Stage, 
  PresentationStage, 
  GoalStage, 
  SurveyStage, 
  MeetingStage, 
  TextSlide,
  VideoSlide,
  ImageSlide,
  TestSlide,
  CurrentTrack
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
  Check as CheckIcon,
  MapPin,
  ChevronsRight
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
import { PresentationContent } from './PresentationContent'
import { navigateToNextStage } from '@/utils/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAutoAnimate } from '@formkit/auto-animate/react'

interface StageContentProps {
  stage: Stage
  isCompleted: boolean
  onComplete: (completed: boolean) => void,
  currentTrack: CurrentTrack
}

export function StageContent({ stage, isCompleted, onComplete, currentTrack }: StageContentProps) {
  // Render different content based on stage type
  if (stage.type === 'presentation') {
    return <PresentationContent stage={stage as PresentationStage} isCompleted={isCompleted} onComplete={onComplete} />
  } else if (stage.type === 'goal') {
    return <GoalContent stage={stage as GoalStage} isCompleted={isCompleted} onComplete={onComplete} currentTrack={currentTrack} />
  } else if (stage.type === 'survey') {
    return <SurveyContent stage={stage as SurveyStage} isCompleted={isCompleted} onComplete={onComplete} />
  } else if (stage.type === 'meeting') {
    return <MeetingContent stage={stage as MeetingStage} isCompleted={isCompleted} onComplete={onComplete} />
  }
  
  return (
    <div className="text-center py-10 text-muted-foreground">
      Неизвестный тип этапа
    </div>
  )
}

interface StageTypeContentProps<T extends Stage> {
  stage: T
  isCompleted: boolean
  onComplete: (completed: boolean) => void
}
// Meeting Stage Component
function MeetingContent({ stage, isCompleted, onComplete }: StageTypeContentProps<MeetingStage>) {
  // Get access to the track data and navigation methods
  const { employees, tracks } = useStore()
  const { employeeId } = useParams()
  const [animateParent] = useAutoAnimate()
  const [showCompletionConfetti, setShowCompletionConfetti] = useState(false)
  
  const handleComplete = () => {
    // If already completed, don't allow uncompleting
    if (isCompleted) {
      return;
    }
    
    // Show completion animation
    setShowCompletionConfetti(true)
    
    // Complete the current stage (always set to true, no uncompleting)
    onComplete(true);
    
    // Proceed to the next stage
    setTimeout(() => {
      navigateToNextStage(stage, employees, tracks, employeeId);
    }, 1500); // Wait a bit longer for animation to finish
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col min-h-[calc(100vh-250px)] relative pb-24"
    >
      <div className="flex-1 space-y-6" ref={animateParent}>
        {/* Status indicator */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1.5 text-sm">
                <CheckCircle className="h-4 w-4 mr-2" /> Встреча посещена
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Meeting title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2 className="text-2xl font-semibold text-primary">{stage.title}</h2>
          
          {/* Description */}
          <div className="prose prose-sm max-w-none text-sm mt-3">
            <div dangerouslySetInnerHTML={{ __html: stage.content.description }} />
          </div>
        </motion.div>
        
        {/* Meeting details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="overflow-hidden shadow-md border-primary/10 bg-gradient-to-br from-background to-muted/50">
            <CardHeader className="bg-primary/5 pb-3">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Информация о встрече
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {stage.content.date && (
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="flex flex-col space-y-1 bg-primary/5 p-3 rounded-lg border border-primary/10"
                  >
                    <span className="text-xs font-medium text-muted-foreground">Дата</span>
                    <div className="flex items-center text-sm font-medium">
                      <Calendar className="h-4 w-4 mr-2 text-primary" />
                      <span>{format(new Date(stage.content.date), 'dd.MM.yyyy')}</span>
                    </div>
                  </motion.div>
                )}
                
                {stage.content.duration && (
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="flex flex-col space-y-1 bg-primary/5 p-3 rounded-lg border border-primary/10"
                  >
                    <span className="text-xs font-medium text-muted-foreground">Продолжительность</span>
                    <div className="flex items-center text-sm font-medium">
                      <Clock className="h-4 w-4 mr-2 text-primary" />
                      <span>{stage.content.duration} мин.</span>
                    </div>
                  </motion.div>
                )}
              </div>
              
              {stage.content.location && (
                <motion.div
                  whileHover={{ y: -2 }}
                  className="flex flex-col space-y-1 bg-primary/5 p-4 rounded-lg border border-primary/10"
                >
                  <span className="text-xs font-medium text-muted-foreground">Место проведения</span>
                  <div className="flex items-center text-sm font-medium">
                    <MapPin className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                    <span>{stage.content.location}</span>
                  </div>
                </motion.div>
              )}
              
              {stage.content.participants && stage.content.participants.length > 0 && (
                <motion.div 
                  whileHover={{ y: -2 }}
                  className="flex flex-col space-y-1 bg-primary/5 p-4 rounded-lg border border-primary/10"
                >
                  <span className="text-xs font-medium text-muted-foreground">Участники</span>
                  <div className="flex items-start text-sm">
                    <Users className="h-4 w-4 mr-2 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">
                      {stage.content.participants.join(', ')}
                    </span>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Complete button - fixed to bottom */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="fixed bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-background via-background to-background/95"
        style={{ 
          boxShadow: '0 -4px 10px rgba(0, 0, 0, 0.05)',
          maxWidth: 'inherit',
          width: '100%'
        }}
      >
        <div className="max-w-3xl mx-auto">
          <Button 
            onClick={handleComplete}
            variant={isCompleted ? "outline" : "default"}
            size="lg"
            className={cn(
              "w-full transition-all duration-300 relative overflow-hidden group h-14",
              isCompleted ? "border-green-200 text-green-700" : 
              "bg-primary hover:bg-primary/90"
            )}
            disabled={isCompleted}
          >
            {isCompleted ? (
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex items-center justify-center"
              >
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                Посещено
              </motion.div>
            ) : (
              <motion.div 
                className="flex items-center justify-center"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Отметить как посещенное
                <motion.div 
                  className="absolute right-4 opacity-0 group-hover:opacity-100"
                  initial={{ x: -5 }}
                  animate={{ x: 0 }}
                  transition={{ duration: 0.2, repeat: Infinity, repeatType: "mirror" }}
                >
                  <ChevronsRight className="h-5 w-5" />
                </motion.div>
              </motion.div>
            )}
          </Button>
        </div>
      </motion.div>
      
      {/* Completion confetti animation */}
      <AnimatePresence>
        {showCompletionConfetti && (
          <motion.div 
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="celebration-container">
              {Array.from({ length: 50 }).map((_, index) => (
                <motion.div
                  key={index}
                  className="confetti"
                  initial={{ 
                    y: -50,
                    x: 0,
                    rotate: 0,
                    opacity: 1
                  }}
                  animate={{ 
                    y: window.innerHeight,
                    x: Math.random() * window.innerWidth - window.innerWidth/2,
                    rotate: Math.random() * 360,
                    opacity: 0
                  }}
                  transition={{ 
                    duration: 1.5,
                    delay: Math.random() * 0.5,
                    ease: "easeOut"
                  }}
                  style={{
                    position: 'absolute',
                    width: '10px',
                    height: '10px',
                    backgroundColor: ['#ff0080', '#00ff80', '#8000ff', '#ffff00', '#00ffff'][Math.floor(Math.random() * 5)],
                    borderRadius: Math.random() > 0.5 ? '50%' : '0%',
                  }}
                />
              ))}
              
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-green-100 text-green-800 rounded-full p-8 flex items-center justify-center"
              >
                <CheckCircle size={60} />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
} 