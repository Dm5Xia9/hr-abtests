import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  GripVertical, 
  Calendar, 
  ChevronRight, 
  MoreVertical, 
  ChevronDown, 
  ChevronUp, 
  Presentation, 
  Target, 
  FileText, 
  Coins, 
  CheckCircle 
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Track, Milestone, Stage, StageTypes } from '@/types'
import { cn } from '@/lib/utils'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { useAutoAnimate } from '@formkit/auto-animate/react'

const STAGE_TYPES: StageTypes = {
  presentation: {
    label: 'Презентация',
    icon: Presentation,
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  goal: {
    label: 'Цель',
    icon: Target,
    color: 'bg-orange-100 text-orange-700 border-orange-200'
  },
  survey: {
    label: 'Опрос',
    icon: FileText,
    color: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  meeting: {
    label: 'Встреча', 
    icon: Calendar,
    color: 'bg-green-100 text-green-700 border-green-200'
  }
}

interface MilestoneStageListProps {
  track: Track
  selectedMilestoneId: string | null
  selectedStageId: string | null
  onMilestoneSelect: (id: string | null) => void
  onStageSelect: (id: string | null) => void
  onMilestoneDragEnd: (result: any) => void
  onStageDragEnd: (result: any) => void
  onTrackChange: (track: Partial<Track>) => void
}

export function MilestoneStageList({
  track,
  selectedMilestoneId,
  selectedStageId,
  onMilestoneSelect,
  onStageSelect,
  onMilestoneDragEnd,
  onStageDragEnd,
  onTrackChange
}: MilestoneStageListProps) {
  const [parent] = useAutoAnimate();
  
  // Состояния для отслеживания перетаскивания
  const [isDragging, setIsDragging] = useState(false);
  const [currentDragId, setCurrentDragId] = useState<string | null>(null);
  
  const [expandedMilestones, setExpandedMilestones] = useState<Record<string, boolean>>(() => {
    // По умолчанию раскрываем только выбранную веху
    const expanded: Record<string, boolean> = {};
    track.milestones.forEach(milestone => {
      expanded[milestone.id] = milestone.id === selectedMilestoneId;
    });
    return expanded;
  });
  
  // При изменении selectedStageId автоматически раскрываем веху, содержащую этот этап
  useEffect(() => {
    if (selectedStageId) {
      // Ищем веху, содержащую выбранный этап
      const milestoneWithStage = track.milestones.find(milestone => 
        milestone.stages.some(stage => stage.id === selectedStageId)
      );
      
      if (milestoneWithStage) {
        setExpandedMilestones(prev => ({
          ...prev,
          [milestoneWithStage.id]: true
        }));
      }
    }
  }, [selectedStageId, track.milestones]);
  
  useEffect(() => {
    if (!isDragging) {
      // Когда перетаскивание заканчивается, проверяем, открыта ли веха содержащая выбранный этап
      if (selectedStageId) {
        const milestoneWithSelectedStage = track.milestones.find(milestone => 
          milestone.stages.some(stage => stage.id === selectedStageId)
        );
        
        if (milestoneWithSelectedStage) {
          setExpandedMilestones(prev => ({
            ...prev,
            [milestoneWithSelectedStage.id]: true
          }));
        }
      }
    }
  }, [isDragging, selectedStageId, track.milestones]);
  
  const [showMilestoneEditDialog, setShowMilestoneEditDialog] = useState(false);
  const [showStageAddDialog, setShowStageAddDialog] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [activeMilestoneId, setActiveMilestoneId] = useState<string | null>(null);

  // Настройки анимации для элементов
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut"
      }
    }),
    dragging: {
      scale: 1.02,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      zIndex: 50
    }
  };

  // Используем useEffect для трекинга драга
  useEffect(() => {
    if (isDragging) {
      // Добавляем класс для стилизации во время перетаскивания
      document.body.classList.add('is-dragging');
      
      // При перетаскивании автоматически раскрываем все вехи
      if (track.milestones.length > 0) {
        const newExpandedState: Record<string, boolean> = {};
        track.milestones.forEach(milestone => {
          newExpandedState[milestone.id] = true;
        });
        setExpandedMilestones(newExpandedState);
      }
    } else {
      document.body.classList.remove('is-dragging');
    }
    
    return () => {
      document.body.classList.remove('is-dragging');
    };
  }, [isDragging, track.milestones]);
  
  const handleDragStart = (result: any) => {
    console.log('Start dragging:', result);
    setIsDragging(true);
    setCurrentDragId(result.draggableId);
  };
  
  const handleDragEnd = (result: any) => {
    console.log('End dragging:', result);
    setIsDragging(false);
    setCurrentDragId(null);
    
    if (!result.destination) {
      console.log('No destination, skipping');
      return;
    }
    
    const { source, destination, type, draggableId } = result;
    
    if (type === 'milestone') {
      // Перетаскивание вех
      console.log('Dragging milestone from', source.index, 'to', destination.index);
      
      const newMilestones = [...track.milestones];
      const [movedMilestone] = newMilestones.splice(source.index, 1);
      newMilestones.splice(destination.index, 0, movedMilestone);
      
      onTrackChange({ milestones: newMilestones });
    } else if (type === 'stage') {
      console.log('Dragging stage:', draggableId, 'source', source, 'destination', destination);
      
      // Каждый Droppable имеет ID вехи
      const sourceMilestoneId = source.droppableId;
      const destMilestoneId = destination.droppableId;
      
      console.log('From milestone', sourceMilestoneId, 'to milestone', destMilestoneId);
      
      // Создаем копию данных для обновления
      const deepClone = (obj: any) => JSON.parse(JSON.stringify(obj));
      const updatedMilestones = deepClone(track.milestones);
      
      const sourceMilestone = updatedMilestones.find((m: Milestone) => m.id === sourceMilestoneId);
      const destMilestone = updatedMilestones.find((m: Milestone) => m.id === destMilestoneId);
      
      if (!sourceMilestone || !destMilestone) {
        console.error('Source or destination milestone not found');
        return;
      }
      
      // Получаем этап, который перетаскиваем
      const stageToMove = sourceMilestone.stages[source.index];
      
      if (sourceMilestoneId === destMilestoneId) {
        // Перетаскивание в пределах одной вехи
        sourceMilestone.stages.splice(source.index, 1);
        sourceMilestone.stages.splice(destination.index, 0, stageToMove);
        console.log('Reordered stages in milestone', sourceMilestoneId);
      } else {
        // Перетаскивание между разными вехами
        sourceMilestone.stages.splice(source.index, 1);
        destMilestone.stages.splice(destination.index, 0, stageToMove);
        console.log('Moved stage from milestone', sourceMilestoneId, 'to', destMilestoneId);
      }
      
      onTrackChange({ milestones: updatedMilestones });
    }
  };

  // Функции для работы с вехами
  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: crypto.randomUUID(),
      title: 'Новая веха',
      description: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      stages: []
    }
    onTrackChange({ milestones: [...track.milestones, newMilestone] });
  }

  const deleteMilestone = (id: string) => {
    onTrackChange({
      milestones: track.milestones.filter(m => m.id !== id)
    });
    if (selectedMilestoneId === id) {
      onMilestoneSelect(null);
    }
  }

  const duplicateMilestone = (id: string) => {
    const original = track.milestones.find(m => m.id === id);
    if (!original) return;

    const copy: Milestone = {
      ...original,
      id: crypto.randomUUID(),
      title: `${original.title} (копия)`,
      stages: original.stages.map(stage => ({
        ...stage,
        id: crypto.randomUUID()
      }))
    }

    onTrackChange({ milestones: [...track.milestones, copy] });
  }

  const openMilestoneEditDialog = (milestone: Milestone) => {
    setEditingMilestone({ ...milestone });
    setShowMilestoneEditDialog(true);
  }

  const saveMilestoneEdit = () => {
    if (!editingMilestone) return;

    const updatedMilestones = track.milestones.map(m => 
      m.id === editingMilestone.id ? editingMilestone : m
    );
    onTrackChange({ milestones: updatedMilestones });
    setShowMilestoneEditDialog(false);
    setEditingMilestone(null);
  }

  const toggleMilestoneExpanded = (id: string) => {
    setExpandedMilestones(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }

  // Функции для работы с этапами
  const addStage = (milestoneId: string, type: Stage['type']) => {
    const milestone = track.milestones.find(m => m.id === milestoneId);
    if (!milestone) return;

    const baseStage = {
      id: crypto.randomUUID(),
      title: `Новый ${STAGE_TYPES[type].label.toLowerCase()}`,
      description: '',
      type,
      order: milestone.stages.length,
      required: false,
      coinReward: getDefaultCoinReward(type),
      status: {
        isCompleted: false
      }
    };

    let newStage: Stage;
    switch (type) {
      case 'presentation':
        newStage = {
          ...baseStage,
          type: 'presentation',
          content: {
            slides: []
          }
        };
        break;
      case 'goal':
        newStage = {
          ...baseStage,
          type: 'goal',
          content: {
            description: '',
            checklist: []
          }
        };
        break;
      case 'survey':
        newStage = {
          ...baseStage,
          type: 'survey',
          content: {
            title: '',
            description: '',
            questions: []
          }
        };
        break;
      case 'meeting':
        newStage = {
          ...baseStage,
          type: 'meeting',
          content: {
            description: '',
            date: '',
            duration: 60,
            location: '',
            participants: []
          }
        };
        break;
    }

    const updatedMilestones = track.milestones.map(m => 
      m.id === milestoneId 
        ? { ...m, stages: [...m.stages, newStage] } 
        : m
    );
    
    onTrackChange({ milestones: updatedMilestones });
    setShowStageAddDialog(false);
  }

  const deleteStage = (milestoneId: string, stageId: string) => {
    const updatedMilestones = track.milestones.map(m => 
      m.id === milestoneId 
        ? { ...m, stages: m.stages.filter(s => s.id !== stageId) } 
        : m
    );
    
    onTrackChange({ milestones: updatedMilestones });
    if (selectedStageId === stageId) {
      onStageSelect(null);
    }
  }

  const duplicateStage = (milestoneId: string, stageId: string) => {
    const milestone = track.milestones.find(m => m.id === milestoneId);
    if (!milestone) return;

    const original = milestone.stages.find(s => s.id === stageId);
    if (!original) return;

    const copy: Stage = {
      ...original,
      id: crypto.randomUUID(),
      title: `${original.title} (копия)`,
    };

    const updatedMilestones = track.milestones.map(m => 
      m.id === milestoneId 
        ? { ...m, stages: [...m.stages, copy] } 
        : m
    );
    
    onTrackChange({ milestones: updatedMilestones });
  }

  // Вспомогательные функции
  const getDefaultCoinReward = (type: Stage['type']) => {
    switch (type) {
      case 'presentation': return 10;
      case 'goal': return 20;
      case 'survey': return 5;
      case 'meeting': return 15;
      default: return 10;
    }
  }

  const getStageQuickInfo = (stage: Stage) => {
    if (!stage.content) return '';
    
    switch (stage.type) {
      case 'presentation':
        const slides = stage.content.slides || [];
        const slideCount = slides.length;
        return `${slideCount} ${slideCount === 1 ? 'слайд' : slideCount > 1 && slideCount < 5 ? 'слайда' : 'слайдов'}`
      case 'goal':
        const checklistCount = stage.content.checklist?.length || 0
        return `${checklistCount} ${checklistCount === 1 ? 'задача' : checklistCount > 1 && checklistCount < 5 ? 'задачи' : 'задач'}`
      case 'survey':
        const questions = stage.content.questions || [];
        const questionCount = questions.length;
        return `${questionCount} ${questionCount === 1 ? 'вопрос' : questionCount > 1 && questionCount < 5 ? 'вопроса' : 'вопросов'}`
      case 'meeting':
        return stage.content.date ? `Дата: ${stage.content.date}` : 'Дата не указана'
      default:
        return ''
    }
  }

  // Функция для определения, можно ли перетаскивать этап
  const isDraggingDisabled = (milestone: Milestone) => {
    return milestone.stages.length === 1 && track.milestones.length === 1;
  };

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">Вехи и этапы</h2>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={addMilestone}
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить веху
          </Button>
        </div>

        <DragDropContext 
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <Droppable droppableId="milestones" type="milestone">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex-1 overflow-y-auto space-y-4 p-4"
              >
                {track.milestones.map((milestone, index) => (
                  <Draggable
                    key={milestone.id}
                    draggableId={milestone.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn(
                          "space-y-2 transition-all duration-200 group",
                          snapshot.isDragging ? "z-50" : "",
                          isDragging && !snapshot.isDragging ? "opacity-70" : ""
                        )}
                        style={{
                          ...provided.draggableProps.style,
                          zIndex: snapshot.isDragging ? 9999 : undefined
                        }}
                      >
                        <Card 
                          className={cn(
                            "border-2 transition-all duration-200 group",
                            selectedMilestoneId === milestone.id ? "border-primary" : "",
                            expandedMilestones[milestone.id] ? "shadow-md" : "hover:shadow-sm",
                            expandedMilestones[milestone.id] ? "bg-gradient-to-b from-background to-muted/10" : "",
                            snapshot.isDragging ? "shadow-lg scale-[1.01] rotate-1 z-[999]" : ""
                          )}
                        >
                          <div
                            className={cn(
                              "p-3 flex flex-col gap-2 cursor-pointer",
                              expandedMilestones[milestone.id] ? "border-b" : "",
                              selectedMilestoneId === milestone.id ? "bg-muted/40" : ""
                            )}
                            onClick={(e) => {
                              // Если клик был на кнопке-переключателе раскрытия, не выбираем веху
                              if (!(e.target as HTMLElement).closest('button[data-toggle-expand]')) {
                                // Только переключаем раскрытие вехи, но не выбираем её
                                toggleMilestoneExpanded(milestone.id);
                              }
                            }}
                          >
                            <div className="flex items-center">
                              <div {...provided.dragHandleProps} 
                                className="p-1.5 opacity-60 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                              >
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <button
                                data-toggle-expand="true"
                                className="mr-1.5 text-muted-foreground hover:text-foreground transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleMilestoneExpanded(milestone.id);
                                }}
                              >
                                {expandedMilestones[milestone.id] ? (
                                  <ChevronDown className="h-5 w-5" />
                                ) : (
                                  <ChevronUp className="h-5 w-5" />
                                )}
                              </button>
                              <div className="flex-grow">
                                <div 
                                  className="font-medium truncate mb-1 hover:text-primary transition-colors max-w-[200px]"
                                  title={milestone.title}
                                >
                                  {milestone.title}
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                      {format(new Date(milestone.startDate), 'd MMM', { locale: ru })} -{' '}
                                      {format(new Date(milestone.endDate), 'd MMM', { locale: ru })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Coins className="w-3 h-3" />
                                    <span>
                                      {milestone.stages.reduce((total, stage) => total + (stage.coinReward || 0), 0)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMilestoneId(milestone.id);
                                    setShowStageAddDialog(true);
                                  }}
                                  title="Добавить этап"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openMilestoneEditDialog(milestone)}>
                                      Редактировать
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => duplicateMilestone(milestone.id)}>
                                      Дублировать
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      className="text-destructive"
                                      onClick={() => deleteMilestone(milestone.id)}
                                    >
                                      Удалить
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>

                          {expandedMilestones[milestone.id] && (
                            <AnimatePresence>
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="p-1"
                              >
                                {milestone.stages.length > 0 ? (
                                  <div className="space-y-2 pl-8" ref={parent}>
                                    <Droppable 
                                      droppableId={milestone.id}
                                      type="stage"
                                    >
                                      {(stagesProvided, stagesSnapshot) => (
                                        <div
                                          {...stagesProvided.droppableProps}
                                          ref={stagesProvided.innerRef}
                                          className={cn(
                                            "space-y-2 py-1 transition-all duration-150 rounded-md min-h-[2.5rem]",
                                            stagesSnapshot.isDraggingOver ? "bg-primary/5 p-2 ring-1 ring-primary/20" : "",
                                            isDragging && !stagesSnapshot.isDraggingOver ? "border border-dashed border-muted-foreground/20 p-2" : ""
                                          )}
                                        >
                                          {milestone.stages.map((stage, stageIndex) => {
                                            const StageIcon = STAGE_TYPES[stage.type].icon;
                                            return (
                                              <Draggable
                                                key={stage.id}
                                                draggableId={stage.id}
                                                index={stageIndex}
                                                isDragDisabled={isDraggingDisabled(milestone)}
                                              >
                                                {(stageDragProvided, stageDragSnapshot) => (
                                                  <div
                                                    ref={stageDragProvided.innerRef}
                                                    {...stageDragProvided.draggableProps}
                                                    {...stageDragProvided.dragHandleProps}
                                                    className={cn(
                                                      "transition-all duration-200",
                                                      stageDragSnapshot.isDragging ? "z-50" : ""
                                                    )}
                                                    style={{
                                                      ...stageDragProvided.draggableProps.style,
                                                      zIndex: stageDragSnapshot.isDragging ? 9999 : undefined
                                                    }}
                                                  >
                                                    <Card
                                                      className={cn(
                                                        "border hover:shadow-sm transition-all duration-100",
                                                        selectedStageId === stage.id ? "border-primary ring-1 ring-primary ring-opacity-50 bg-primary/5" : "",
                                                        "hover:translate-x-1 cursor-pointer",
                                                        stageDragSnapshot.isDragging && "shadow-xl scale-[1.02] rotate-1 border-primary/50 bg-background z-[999]"
                                                      )}
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        onStageSelect(stage.id);
                                                      }}
                                                      {...stageDragProvided.dragHandleProps}
                                                    >
                                                      <div className="p-2.5 flex items-start relative">
                                                        {/* Drag indicator */}
                                                        <div className={cn(
                                                          "absolute -left-1 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity",
                                                          STAGE_TYPES[stage.type].color.split(' ')[1].replace('text-', 'bg-')
                                                        )} />
                                                        
                                                        <div className="mr-2 flex-shrink-0">
                                                          <div className={cn(
                                                            "w-7 h-7 rounded-md flex items-center justify-center",
                                                            STAGE_TYPES[stage.type].color
                                                          )}>
                                                            <StageIcon className="h-4 w-4" />
                                                          </div>
                                                        </div>
                                                        
                                                        <div className="flex-grow min-w-0 mr-2">
                                                          <div className="font-medium text-sm line-clamp-1" title={stage.title}>
                                                            {stage.title}
                                                          </div>
                                                          <div className="text-xs text-muted-foreground line-clamp-1" title={getStageQuickInfo(stage)}>
                                                            {getStageQuickInfo(stage)}
                                                          </div>
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                          <div className="flex items-center gap-1">
                                                            {stage.status?.isCompleted && (
                                                              <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 h-5 px-1.5">
                                                                    <CheckCircle className="h-3 w-3" />
                                                                  </Badge>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="top">
                                                                  <p className="text-xs">Этап выполнен</p>
                                                                </TooltipContent>
                                                              </Tooltip>
                                                            )}
                                                            {stage.coinReward > 0 && (
                                                              <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1 h-5 px-1.5">
                                                                    <Coins className="h-3 w-3" />
                                                                    {stage.coinReward}
                                                                  </Badge>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="top">
                                                                  <p className="text-xs">Награда: {stage.coinReward} монет</p>
                                                                </TooltipContent>
                                                              </Tooltip>
                                                            )}
                                                          </div>
                                                          <div className="flex items-center gap-1">
                                                            <DropdownMenu>
                                                              <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                                                  <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                              </DropdownMenuTrigger>
                                                              <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={(e) => {
                                                                  e.stopPropagation();
                                                                  duplicateStage(milestone.id, stage.id);
                                                                }}>
                                                                  Дублировать
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem 
                                                                  className="text-destructive"
                                                                  onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    deleteStage(milestone.id, stage.id);
                                                                  }}
                                                                >
                                                                  Удалить
                                                                </DropdownMenuItem>
                                                              </DropdownMenuContent>
                                                            </DropdownMenu>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </Card>
                                                  </div>
                                                )}
                                              </Draggable>
                                            );
                                          })}
                                          {stagesProvided.placeholder}
                                        </div>
                                      )}
                                    </Droppable>
                                  </div>
                                ) : (
                                  <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="py-4 pl-8"
                                  >
                                    <Droppable
                                      droppableId={milestone.id}
                                      type="stage"
                                    >
                                      {(emptyStagesProvided, emptyStagesSnapshot) => (
                                        <div
                                          {...emptyStagesProvided.droppableProps}
                                          ref={emptyStagesProvided.innerRef}
                                          className={cn(
                                            "text-center py-4 text-muted-foreground text-sm rounded-md min-h-[5rem] flex flex-col items-center justify-center transition-all duration-300",
                                            emptyStagesSnapshot.isDraggingOver ? "bg-primary/5 ring-1 ring-primary/20" : "",
                                            isDragging && !emptyStagesSnapshot.isDraggingOver ? "border border-dashed border-muted-foreground/20" : ""
                                          )}
                                        >
                                          {isDragging && currentDragId ? (
                                            <p>Перетащите этап сюда</p>
                                          ) : (
                                            <>
                                              <p>У этой вехи нет этапов</p>
                                              <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="mt-1"
                                                onClick={() => {
                                                  setActiveMilestoneId(milestone.id);
                                                  setShowStageAddDialog(true);
                                                }}
                                              >
                                                <Plus className="w-3 h-3 mr-1" />
                                                Добавить этап
                                              </Button>
                                            </>
                                          )}
                                          {emptyStagesProvided.placeholder}
                                        </div>
                                      )}
                                    </Droppable>
                                  </motion.div>
                                )}
                              </motion.div>
                            </AnimatePresence>
                          )}
                        </Card>
                      </div>
                    )}
                  </Draggable>
                ))}
                {track.milestones.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4 relative">
                      <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-75" style={{ animationDuration: '3s' }}></div>
                      <Calendar className="w-10 h-10 text-primary/70" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Нет вех</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Создайте первую веху, чтобы начать планирование трека адаптации
                    </p>
                    <Button 
                      onClick={addMilestone}
                      className="gap-1"
                      size="lg"
                    >
                      <Plus className="w-4 h-4" />
                      Добавить веху
                    </Button>
                    
                    {isDragging && (
                      <div className="mt-8 p-4 border border-dashed rounded-md border-primary/50 bg-primary/5 text-sm text-center">
                        Вы не можете перетащить этап сюда, пока не создадите хотя бы одну веху
                      </div>
                    )}
                  </div>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Диалог редактирования вехи */}
        <Dialog open={showMilestoneEditDialog} onOpenChange={setShowMilestoneEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редактирование вехи</DialogTitle>
            </DialogHeader>
            {editingMilestone && (
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Название</Label>
                  <Input
                    id="title"
                    value={editingMilestone.title}
                    onChange={e => setEditingMilestone({...editingMilestone, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={editingMilestone.description}
                    onChange={e => setEditingMilestone({...editingMilestone, description: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Дата начала</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={editingMilestone.startDate}
                      onChange={e => setEditingMilestone({...editingMilestone, startDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Дата окончания</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={editingMilestone.endDate}
                      onChange={e => setEditingMilestone({...editingMilestone, endDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowMilestoneEditDialog(false)}>
                    Отмена
                  </Button>
                  <Button onClick={saveMilestoneEdit}>
                    Сохранить
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Диалог добавления этапа */}
        <Dialog open={showStageAddDialog} onOpenChange={setShowStageAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Выберите тип этапа</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 p-4">
              {Object.entries(STAGE_TYPES).map(([type, info]) => {
                const Icon = info.icon;
                return (
                  <Tooltip key={type}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-20 flex flex-col items-center justify-center gap-2 border-2",
                          info.color.split(' ')[0],
                          info.color.split(' ')[1],
                        )}
                        onClick={() => activeMilestoneId && addStage(activeMilestoneId, type as Stage['type'])}
                      >
                        <Icon className="h-8 w-8" />
                        <span>{info.label}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{type === 'presentation' ? 'Слайды, видео, изображения' : 
                          type === 'goal' ? 'Задачи с чеклистом' : 
                          type === 'survey' ? 'Форма с вопросами' :
                          type === 'meeting' ? 'Онлайн или офлайн встреча' : ''}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
} 
