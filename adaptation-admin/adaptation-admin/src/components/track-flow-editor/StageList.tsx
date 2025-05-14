import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, GripVertical, ChevronRight, MoreVertical, Presentation, Target, FileText, Calendar, Coins, CheckCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Milestone, Stage, StageTypes } from '@/types'
import { cn } from '@/lib/utils'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'

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

interface StageListProps {
  milestone: Milestone
  selectedStageId: string | null
  onStageSelect: (id: string | null) => void
  onDragEnd: (result: any) => void
  onChange: (updates: Partial<Milestone>) => void
}

export function StageList({
  milestone,
  selectedStageId,
  onStageSelect,
  onDragEnd,
  onChange
}: StageListProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newStageType, setNewStageType] = useState<Stage['type'] | null>(null)
  const [editingStage, setEditingStage] = useState<Stage | null>(null)

  const addStage = (type: Stage['type']) => {
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
    }

    let newStage: Stage
    switch (type) {
      case 'presentation':
        newStage = {
          ...baseStage,
          type: 'presentation',
          content: {
            slides: []
          }
        }
        break
      case 'goal':
        newStage = {
          ...baseStage,
          type: 'goal',
          content: {
            description: '',
            checklist: []
          }
        }
        break
      case 'survey':
        newStage = {
          ...baseStage,
          type: 'survey',
          content: {
            title: '',
            description: '',
            questions: []
          }
        }
        break
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
        }
        break
    }

    onChange({
      stages: [...milestone.stages, newStage]
    })
    setNewStageType(null)
    setShowAddDialog(false)
  }

  const getDefaultCoinReward = (type: Stage['type']): number => {
    switch (type) {
      case 'presentation': return 10
      case 'goal': return 15
      case 'survey': return 5
      case 'meeting': return 20
      default: return 10
    }
  }

  const deleteStage = (id: string) => {
    onChange({
      stages: milestone.stages.filter(s => s.id !== id)
    })
    if (selectedStageId === id) {
      onStageSelect(null)
    }
  }

  const duplicateStage = (id: string) => {
    const original = milestone.stages.find(s => s.id === id)
    if (!original) return

    const copy: Stage = {
      ...original,
      id: crypto.randomUUID(),
      title: `${original.title} (копия)`,
    }

    onChange({ stages: [...milestone.stages, copy] })
  }

  const handleStageClick = (stage: Stage) => {
    onStageSelect(stage.id)
  }

  const handleInlineTitleChange = (id: string, title: string) => {
    const updatedStages = milestone.stages.map(s => 
      s.id === id ? { ...s, title } : s
    )
    onChange({ stages: updatedStages })
  }

  const getStageTypeIcon = (type: Stage['type']) => {
    const StageIcon = STAGE_TYPES[type].icon
    return <StageIcon className="h-4 w-4" />
  }

  const getStageTypeColor = (type: Stage['type']) => {
    return STAGE_TYPES[type].color
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

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-lg truncate">{milestone.title}</h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                <Coins className="h-4 w-4" />
                <span className="font-medium">
                  {milestone.stages.reduce((total, stage) => total + (stage.coinReward || 0), 0)}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">Общая награда за веху</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить этап
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="stages">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
            >
              {milestone.stages.map((stage, index) => (
                <Draggable
                  key={stage.id}
                  draggableId={stage.id}
                  index={index}
                >
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={cn(
                        "p-3 transition-colors",
                        selectedStageId === stage.id
                          ? "bg-primary/10 border-primary"
                          : stage.status?.isCompleted 
                            ? "bg-green-50/80 border-green-200 hover:bg-green-100/50" 
                            : "hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          {...provided.dragHandleProps}
                          className="mt-1 cursor-grab"
                        >
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div 
                          className="flex-1 space-y-2 cursor-pointer" 
                          onClick={() => handleStageClick(stage)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2 flex-1">
                              <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center",
                                getStageTypeColor(stage.type)
                              )}>
                                {getStageTypeIcon(stage.type)}
                              </div>
                              <Input
                                value={stage.title}
                                onChange={e => handleInlineTitleChange(stage.id, e.target.value)}
                                onDoubleClick={(e: React.MouseEvent<HTMLInputElement>) => e.currentTarget.select()}
                                onClick={e => e.stopPropagation()}
                                className={cn(
                                  "h-7 text-sm font-medium p-1 bg-transparent border-transparent focus:bg-background focus:border-input",
                                  stage.status?.isCompleted && "text-green-800"
                                )}
                              />
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
                                  <DropdownMenuItem onClick={() => duplicateStage(stage.id)}>
                                    Дублировать
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => deleteStage(stage.id)}
                                  >
                                    Удалить
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 ml-auto"
                                onClick={() => handleStageClick(stage)}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground ml-8">
                            {getStageQuickInfo(stage)}
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              {milestone.stages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm">
                  <p>Нет этапов</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setShowAddDialog(true)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Добавить этап
                  </Button>
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Выберите тип этапа</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 p-4">
            {Object.entries(STAGE_TYPES).map(([type, info]) => {
              const Icon = info.icon
              return (
                <Tooltip key={type}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-20 flex flex-col items-center justify-center gap-2 border-2",
                        info.color.split(' ')[0],
                        info.color.split(' ')[1],
                        newStageType === type ? "border-primary" : ""
                      )}
                      onClick={() => addStage(type as Stage['type'])}
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
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 