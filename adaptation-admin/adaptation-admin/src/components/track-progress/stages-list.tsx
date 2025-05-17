import React, { useState, useEffect, useRef } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle,
  ChevronRight,
  Clock,
  FileText,
  Goal,
  ListChecks,
  UserRound,
  Calendar,
  MapPin,
  Star,
  Sparkles,
  BadgeCheck,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  Milestone as MilestoneIcon,
  Flag,
  ExternalLink,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CurrentTrack, Milestone, Stage } from '@/types'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'

interface StagesListProps {
  currentTrack: CurrentTrack;
  completedStages: Record<string, boolean>;
  progress: {
    completed: number;
    total: number;
    percent: number;
  };
  onSelectStage: (milestoneIndex: number, stageIndex: number) => void;
}

// Combined stage item type for unified list
interface StageItem {
  type: 'stage' | 'milestone-header';
  stage?: Stage;
  milestone?: Milestone;
  milestoneIndex?: number;
  stageIndex?: number;
  completedCount?: number;
  totalCount?: number;
}

export function StagesList({
  currentTrack,
  completedStages,
  progress,
  onSelectStage
}: StagesListProps) {
  const [animateProgress] = useAutoAnimate();
  const [showConfetti, setShowConfetti] = useState(false);
  const [prevProgressPercent, setPrevProgressPercent] = useState(0);
  const [focusedItemIndex, setFocusedItemIndex] = useState<number | null>(null);
  const [showCongratsScreen, setShowCongratsScreen] = useState(false);
  
  // Reference to scroll container
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollInitialized = useRef<boolean>(false);
  
  // Build combined list of milestones and stages
  const combinedItems: StageItem[] = [];
  
  currentTrack.milestones.forEach((milestone, milestoneIndex) => {
    // Count completed stages in milestone
    const completedInMilestone = milestone.stages.reduce(
      (count, stage) => count + (completedStages[stage.id] ? 1 : 0),
      0
    );
    
    // Add milestone header
    combinedItems.push({
      type: 'milestone-header',
      milestone,
      milestoneIndex,
      completedCount: completedInMilestone,
      totalCount: milestone.stages.length
    });
    
    // Add all stages from this milestone
    milestone.stages.forEach((stage, stageIndex) => {
      combinedItems.push({
        type: 'stage',
        stage,
        milestoneIndex,
        stageIndex
      });
    });
  });
  
  // Initialize with first stage focused
  useEffect(() => {
    scrollInitialized.current = false;
    
    // Initialize with first item focused with delay to ensure DOM is ready
    setTimeout(() => {
      if (scrollContainerRef.current && combinedItems.length > 0) {
        // Find first stage index (skip milestone header)
        const firstStageIndex = combinedItems.findIndex(item => item.type === 'stage');
        if (firstStageIndex !== -1) {
          setFocusedItemIndex(firstStageIndex);
          forceScrollToItem(firstStageIndex);
        }
      }
    }, 300);
  }, [currentTrack.milestones.length]);
  
  // Track when the progress reaches 100% to show the celebration effect
  useEffect(() => {
    if (progress.percent === 100 && prevProgressPercent !== 100) {
      setShowConfetti(true);
      
      // Также проверяем, что завершен последний этап последней вехи
      const isLastMilestoneLastStageCompleted = checkLastStageCompleted();
      
      if (isLastMilestoneLastStageCompleted) {
        // Показываем экран поздравления с небольшой задержкой
        setTimeout(() => {
          setShowCongratsScreen(true);
        }, 1000);
      }
      
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
    
    setPrevProgressPercent(progress.percent);
  }, [progress.percent, prevProgressPercent]);
  
  // Функция для проверки завершения последнего этапа последней вехи
  const checkLastStageCompleted = () => {
    if (currentTrack.milestones.length === 0) return false;
    
    // Получаем последнюю веху
    const lastMilestone = currentTrack.milestones[currentTrack.milestones.length - 1];
    if (lastMilestone.stages.length === 0) return false;
    
    // Получаем последний этап последней вехи
    const lastStage = lastMilestone.stages[lastMilestone.stages.length - 1];
    
    // Проверяем, завершен ли последний этап
    return completedStages[lastStage.id] === true;
  };
  
  // Scroll to specific item
  const scrollToItem = (itemIndex: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const element = container.querySelector(`[data-item-index="${itemIndex}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  
  // Force scroll to item without smooth behavior
  const forceScrollToItem = (itemIndex: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    // Find the target element
    const element = container.querySelector(`[data-item-index="${itemIndex}"]`) as HTMLElement;
    if (!element) return;
    
    // Get positions
    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    
    // Calculate offset to center the element
    const offset = elementRect.top - containerRect.top - (containerRect.height / 2) + (elementRect.height / 2);
    
    // Set scroll position directly
    container.scrollTop = offset;
    
    // Mark as initialized
    scrollInitialized.current = true;
  };
  
  // Handle scroll in the container
  const handleScroll = () => {
    // Skip if not yet initialized
    if (!scrollInitialized.current) return;
    
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const containerMiddle = containerRect.top + containerRect.height / 2;
    
    // Find all stage elements
    const stageElements = container.querySelectorAll('[data-item-index]');
    let closestIndex = null;
    let minDistance = Infinity;
    
    stageElements.forEach((elem) => {
      const itemIndex = parseInt(elem.getAttribute('data-item-index') || '0', 10);
      const item = combinedItems[itemIndex];
      
      // Only focus on stage items, not milestone headers
      if (item && item.type === 'stage') {
        const rect = elem.getBoundingClientRect();
        const itemMiddle = rect.top + rect.height / 2;
        const distance = Math.abs(itemMiddle - containerMiddle);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = itemIndex;
        }
      }
    });
    
    setFocusedItemIndex(closestIndex);
  };
  
  // Helper function to get the appropriate icon for a stage type
  const getStageIcon = (type: string) => {
    switch (type) {
      case 'presentation':
        return <FileText className="h-5 w-5" />
      case 'goal':
        return <Goal className="h-5 w-5" />
      case 'survey':
        return <ListChecks className="h-5 w-5" />
      case 'meeting':
        return <UserRound className="h-5 w-5" />
      default:
        return <Clock className="h-5 w-5" />
    }
  };
  
  // Get stage color by type
  const getStageColor = (type: string) => {
    switch (type) {
      case 'presentation':
        return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'goal':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100'
      case 'survey':
        return 'bg-purple-50 text-purple-600 border-purple-100'
      case 'meeting':
        return 'bg-amber-50 text-amber-600 border-amber-100'
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100'
    }
  };
  
  // Calculate scale based on distance from the focused item
  const getStageScale = (itemIndex: number) => {
    if (focusedItemIndex === null) return 1;
    
    // If item is a milestone header, always show it at full scale
    if (combinedItems[itemIndex]?.type === 'milestone-header') return 1;
    
    const distance = Math.abs(itemIndex - focusedItemIndex);
    
    if (distance === 0) return 1.05; // Focused stage - larger
    if (distance === 1) return 0.92; // Adjacent stages - smaller
    if (distance === 2) return 0.88; // Next adjacent stages - even smaller
    return 0.85; // Far stages - smallest
  };
  
  // Calculate opacity based on distance from the focused item
  const getStageOpacity = (itemIndex: number) => {
    if (focusedItemIndex === null) return 1;
    
    // If item is a milestone header, always show it at full opacity
    if (combinedItems[itemIndex]?.type === 'milestone-header') return 1;
    
    const distance = Math.abs(itemIndex - focusedItemIndex);
    
    if (distance === 0) return 1; // Focused stage
    if (distance === 1) return 0.85; // Adjacent stages
    if (distance === 2) return 0.7; // Next adjacent stages
    return 0.6; // Far stages
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Compact track progress */}
      <div className="flex items-center gap-3 px-1 py-2">
        <div className="flex-grow" ref={animateProgress}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress.percent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-2 bg-primary/10 rounded-full overflow-hidden"
          >
            <div 
              className={cn(
                "h-full rounded-full transition-all",
                progress.percent < 30 
                  ? "bg-primary/70" 
                  : progress.percent < 70 
                    ? "bg-primary" 
                    : "bg-gradient-to-r from-primary to-green-500"
              )}
            />
          </motion.div>
        </div>
        
        <div className="flex-shrink-0 flex items-center">
          <Badge 
            variant="outline" 
            className={cn(
              "px-2 py-0.5 font-medium border rounded-full transition-all flex items-center gap-1",
              progress.percent === 100 
                ? "bg-green-50 text-green-600 border-green-200"
                : "bg-primary/5 text-primary/90 border-primary/20"
            )}
          >
            {progress.percent === 100 ? (
              <>
                <Sparkles className="h-3 w-3" />
                <span>Завершено!</span>
              </>
            ) : (
              <>
                <span className="text-sm font-medium">{progress.completed}/{progress.total}</span>
                <span className="text-xs text-muted-foreground ml-1">({progress.percent}%)</span>
              </>
            )}
          </Badge>
        </div>
      </div>
      
      {/* Stages drum - main content */}
      <div className="relative pb-16">
        {/* Scroll indicator top with animated arrow */}
        <div className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-b from-background via-background/80 to-transparent z-10 pointer-events-none flex justify-center items-start">
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronUp className="h-6 w-6 text-primary/70 mt-2" />
          </motion.div>
        </div>
        
        {/* Combined list of milestones and stages */}
        <div 
          className="h-[calc(100vh-240px)] overflow-y-auto px-3 py-0 hide-scrollbar relative"
          ref={scrollContainerRef}
          onScroll={handleScroll}
          style={{ scrollPaddingTop: "200px", scrollPaddingBottom: "200px" }}
        >
          <div className="py-[250px]"> {/* Increased padding for better scrolling */}
            <div className="space-y-6">
              {combinedItems.map((item, itemIndex) => {
                // Milestone header
                if (item.type === 'milestone-header' && item.milestone) {
                  const milestoneProgress = item.completedCount && item.totalCount 
                    ? Math.round((item.completedCount / item.totalCount) * 100) 
                    : 0;
                  
                  return (
                    <motion.div
                      key={`milestone-${item.milestoneIndex}`}
                      data-item-index={itemIndex}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", damping: 20 }}
                      className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg p-3 shadow-sm border border-primary/10 mb-3 mt-8 first:mt-0"
                    >
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 text-primary p-1.5 rounded-full">
                          <Flag className="h-4 w-4" />
                        </div>
                        <h2 className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                          {item.milestone.title}
                        </h2>
                        
                        {item.milestone.endDate && (
                          <div className="flex items-center ml-2">
                            <motion.div 
                              whileHover={{ scale: 1.1 }}
                              className="px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 bg-amber-50 text-amber-600 border border-amber-100"
                            >
                              <Calendar className="h-3 w-3" /> 
                              <span>
                                {new Date(item.milestone.endDate).toLocaleDateString('ru-RU', {
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </span>
                            </motion.div>
                          </div>
                        )}
                        
                        {item.completedCount && item.completedCount > 0 && item.totalCount && (
                          <Badge variant="outline" className={cn(
                            "ml-auto px-2 py-0.5 text-xs font-medium",
                            milestoneProgress === 100 
                              ? "bg-green-50 text-green-600 border-green-100" 
                              : "bg-primary/5 text-primary/80 border-primary/10"
                          )}>
                            <div className="flex items-center gap-1">
                              {milestoneProgress === 100 ? (
                                <>
                                  <CheckCircle className="h-3 w-3" />
                                  <span>Завершено</span>
                                </>
                              ) : (
                                <>
                                  <span>{milestoneProgress}%</span>
                                </>
                              )}
                            </div>
                          </Badge>
                        )}
                      </div>
                      
                      {item.milestone.description && (
                        <p className="text-xs text-muted-foreground pl-8 mt-1">
                          {item.milestone.description}
                        </p>
                      )}
                    </motion.div>
                  );
                }
                
                // Stage item
                if (item.type === 'stage' && item.stage && item.milestoneIndex !== undefined && item.stageIndex !== undefined) {
                  const isCompleted = completedStages[item.stage.id] || false;
                  const stageColor = getStageColor(item.stage.type);
                  const isFocused = focusedItemIndex === itemIndex;
                  const scale = getStageScale(itemIndex);
                  const opacity = getStageOpacity(itemIndex);
                  
                  return (
                    <motion.div
                      key={item.stage.id}
                      data-item-index={itemIndex}
                      initial={{ scale: 0.85, opacity: 0.7 }}
                      animate={{ 
                        scale,
                        opacity,
                        y: isFocused ? -8 : 0,
                        zIndex: isFocused ? 10 : 1,
                        filter: isFocused ? 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))' : 'none'
                      }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 25,
                        mass: 1
                      }}
                      className={cn(
                        "relative mx-auto transform-gpu",
                        isFocused ? "cursor-pointer" : "cursor-pointer",
                        // Indent stages for visual hierarchy
                        "ml-4"
                      )}
                      onClick={() => {
                        // Always just scroll to the item on click
                        scrollToItem(itemIndex);
                      }}
                      onDoubleClick={() => {
                        if (item.milestoneIndex !== undefined && item.stageIndex !== undefined) {
                          onSelectStage(item.milestoneIndex, item.stageIndex);
                        }
                      }}
                    >
                      <div 
                        className={cn(
                          "absolute left-0 w-2 h-full rounded-l-full transition-colors",
                          isCompleted ? "bg-green-400" : `bg-primary/60`
                        )}
                      />
                      
                      <Card 
                        className={cn(
                          "overflow-hidden border-l-0 rounded-l-none pl-2 transition-all duration-300",
                          isCompleted 
                            ? "border-green-100 bg-gradient-to-r from-green-50/40 to-transparent" 
                            : "border-primary/10 hover:border-primary/20 hover:bg-primary/5",
                          isFocused && "shadow-lg border-primary/40"
                        )}
                      >
                        <div className={cn(
                          "flex items-start p-3",
                          isFocused && "p-4"
                        )}>
                          <motion.div 
                            className={cn(
                              "flex-shrink-0 rounded-full flex items-center justify-center mr-3",
                              isFocused ? "w-12 h-12" : "w-10 h-10",
                              isCompleted ? "bg-green-100" : `${stageColor}`
                            )}
                            whileHover={{ rotate: isCompleted ? 15 : 0, scale: 1.1 }}
                            transition={{ duration: 0.3 }}
                          >
                            {isCompleted ? (
                              <CheckCircle className={cn(isFocused ? "h-6 w-6" : "h-5 w-5", "text-green-600")} />
                            ) : (
                              <div className={isFocused ? "scale-125" : ""}>
                                {getStageIcon(item.stage.type)}
                              </div>
                            )}
                          </motion.div>
                          
                          <div className="flex-grow">
                            <div className="flex items-center gap-2">
                              <h4 className={cn(
                                "font-medium transition-all",
                                isFocused ? "text-base" : "text-sm",
                                isCompleted && "text-green-700"
                              )}>
                                {item.stage.title}
                              </h4>
                              
                              <AnimatePresence>
                                {item.stage.required && !isCompleted && (
                                  <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: [1, 1.4, 1], 
                                             opacity: [1, 0.8, 1] }}
                                    exit={{ scale: 0 }}
                                    transition={{ 
                                      duration: 2,
                                      repeat: Infinity,
                                      repeatDelay: 1
                                    }}
                                    className="w-2 h-2 rounded-full bg-red-500" 
                                  />
                                )}
                              </AnimatePresence>
                              
                              {isCompleted && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                >
                                  <Badge variant="outline" className="px-1.5 py-0 text-[10px] bg-green-50 text-green-600 border-green-100">
                                    Пройдено
                                  </Badge>
                                </motion.div>
                              )}
                            </div>
                            
                            {item.stage.description && (
                              <p className={cn(
                                "text-muted-foreground line-clamp-2 mt-1 transition-all",
                                isFocused ? "text-xs" : "text-[11px]",
                                isFocused ? "line-clamp-3" : "line-clamp-2"
                              )}>
                                {item.stage.description}
                              </p>
                            )}
                          </div>
           
                        </div>
                      </Card>
                      

                    </motion.div>
                  );
                }
                
                return null;
              })}
            </div>
          </div>
        </div>
        
        {/* Scroll indicator bottom with animated arrow */}
        <div className="absolute bottom-16 left-0 right-0 h-14 bg-gradient-to-t from-background via-background/80 to-transparent z-10 pointer-events-none flex justify-center items-end">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="h-6 w-6 text-primary/70 mb-2" />
          </motion.div>
        </div>
        
        {/* Selection indicator - more visible */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none">
          <div className="h-[90px] mx-3 rounded-md border-2 border-primary/30 bg-primary/5 opacity-40"></div>
        </div>
      </div>
      
      {/* Confetti celebration effect when track is 100% completed */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 pointer-events-none z-50"
          >
            {Array.from({ length: 100 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{ 
                  top: "50%",
                  left: "50%", 
                  scale: 0
                }}
                animate={{ 
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  scale: Math.random() * 0.8 + 0.2,
                  rotate: Math.random() * 360,
                }}
                transition={{ 
                  duration: 2,
                  ease: "easeOut"
                }}
                style={{
                  position: 'absolute',
                  width: `${Math.random() * 10 + 5}px`,
                  height: `${Math.random() * 10 + 5}px`,
                  backgroundColor: 
                    ['#FF5555', '#55FF55', '#5555FF', '#FFFF55', '#FF55FF', '#55FFFF'][
                      Math.floor(Math.random() * 6)
                    ],
                  borderRadius: Math.random() > 0.5 ? '50%' : '0%',
                }}
              />
            ))}
            
            {/* Success badge */}
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="bg-green-100 text-green-700 p-6 rounded-full border-4 border-white shadow-xl">
                <Star className="h-12 w-12" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Congrats screen - displayed when the last stage of the last milestone is completed */}
      <AnimatePresence>
        {showCongratsScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-gradient-to-b from-primary/90 to-primary/95 z-50 flex flex-col items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="relative"
            >
              <div className="absolute inset-0 rounded-3xl bg-white/10 blur-xl"></div>
              <div className="relative bg-white/20 backdrop-blur-md rounded-3xl p-8 max-w-md mx-auto text-center border border-white/30 shadow-2xl">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="inline-block p-4 rounded-full bg-green-100 mb-6">
                    <Sparkles className="h-12 w-12 text-green-600" />
                  </div>
                </motion.div>
                
                <motion.h2
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-2xl font-bold text-white mb-4"
                >
                  Поздравляем! 🎉
                </motion.h2>
                
                <motion.p
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-white/90 mb-6"
                >
                  Вы успешно завершили все этапы адаптации! Вы теперь полностью интегрированы в команду и готовы к новым вызовам.
                </motion.p>
                
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1, type: "spring" }}
                >
                  <Button
                    variant="default"
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 shadow-md"
                    onClick={() => setShowCongratsScreen(false)}
                  >
                    Спасибо, продолжить
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed bottom button for opening the selected stage */}
      {focusedItemIndex !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed bottom-16 left-1/2 transform -translate-x-1/2 z-20"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary to-primary/80 rounded-full blur-md opacity-50"></div>
            <Button 
              size="lg"
              variant="default"
              className="relative shadow-xl px-8 py-6 h-14 rounded-full font-medium flex items-center gap-3 bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground border-0"
              onClick={() => {
                // Scroll slightly to trigger haptic feedback effect
                const container = scrollContainerRef.current;
                if (container) {
                  container.scrollBy(0, 1);
                  setTimeout(() => container.scrollBy(0, -1), 50);
                }
                
                // Get the selected item
                const item = combinedItems[focusedItemIndex];
                if (item?.type === 'stage' && item.milestoneIndex !== undefined && item.stageIndex !== undefined) {
                  onSelectStage(item.milestoneIndex, item.stageIndex);
                }
              }}
            >
              <Eye className="h-5 w-5" strokeWidth={2.5} />
              <span className="text-base font-semibold">Открыть этап</span>
              <motion.div
                className="ml-1"
                animate={{ x: [0, 3, 0] }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  repeatType: "reverse", 
                  ease: "easeInOut" 
                }}
              >
                <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
              </motion.div>
            </Button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

// CSS helper for hiding scrollbars
const style = document.createElement('style');
style.textContent = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;
document.head.appendChild(style); 