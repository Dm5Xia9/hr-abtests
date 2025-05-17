import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs'
import { 
  ChevronLeft, 
  Presentation, 
  Target, 
  FileText, 
  Calendar, 
  Coins, 
  CheckCircle, 
  Clock,
  Settings,
  Box
} from 'lucide-react'
import { Stage, PresentationStage, GoalStage, SurveyStage, MeetingStage, StageTypes, Milestone } from '@/types'
import { cn } from '@/lib/utils'
import { PresentationEditor } from './PresentationEditor'
import { GoalEditor } from './GoalEditor'
import { SurveyEditor } from './SurveyEditor'
import { MeetingEditor } from './MeetingEditor'
import { updateLinkedChecklist } from '@/utils/checklist'

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

interface StageEditorProps {
  stage: Stage
  milestone: Milestone
  onChange: (stage: Partial<Stage>) => void
  onBack: () => void
  isLeftPanelVisible: boolean
}

// Add a new interface for stage status
interface StageStatus {
  isCompleted: boolean
  completedAt?: string
  completedBy?: string
}

export function StageEditor({ stage, milestone, onChange, onBack, isLeftPanelVisible }: StageEditorProps) {
  const [activeTab, setActiveTab] = useState('general')
  const [isCompletionAnimationVisible, setIsCompletionAnimationVisible] = useState(false)

  // Add properties to track the stage status
  const [stageStatus, setStageStatus] = useState<StageStatus>({
    isCompleted: stage.status?.isCompleted || false,
    completedAt: stage.status?.completedAt,
    completedBy: stage.status?.completedBy
  })

  const handleCommonChange = (field: keyof Stage, value: any) => {
    onChange({ [field]: value })
  }

  // Handle status changes (completion)
  const handleStatusChange = (isCompleted: boolean) => {
    // If marking as completed, show animation
    if (isCompleted && !stageStatus.isCompleted) {
      setIsCompletionAnimationVisible(true)
      setTimeout(() => {
        setIsCompletionAnimationVisible(false)
      }, 3000)
    }

    // Update local state
    const newStatus = {
      isCompleted,
      completedAt: isCompleted ? new Date().toISOString() : stageStatus.completedAt,
      completedBy: isCompleted ? 'Current User' : stageStatus.completedBy // Replace with actual user info
    }
    setStageStatus(newStatus)
    
    // Update parent component
    onChange({ 
      status: newStatus 
    })

    // Update linked checklist items in other goals
    if (milestone) {
      const updatedMilestone = updateLinkedChecklist(milestone, stage.id, isCompleted)
      // This will need a different callback to update the entire milestone with the linked changes
      // handleMilestoneChange(updatedMilestone) 
    }
  }

  // Ensure proper content structure for each stage type
  const ensureProperContentStructure = () => {
    if (stage.type === 'presentation' && (!stage.content || !stage.content.slides)) {
      onChange({
        content: {
          ...(stage.content || {}),
          slides: []
        },
        coinReward: stage.coinReward || 10 // Default coin reward
      })
    } else if (stage.type === 'goal' && (!stage.content || stage.content.description === undefined)) {
      onChange({
        content: {
          ...(stage.content || {}),
          description: '',
          checklist: []
        },
        coinReward: stage.coinReward || 15 // Default coin reward
      })
    } else if (stage.type === 'survey' && (!stage.content || !stage.content.questions)) {
      onChange({
        content: {
          ...(stage.content || {}),
          title: '',
          description: '',
          questions: []
        },
        coinReward: stage.coinReward || 5 // Default coin reward
      })
    } else if (stage.type === 'meeting' && (!stage.content || stage.content.description === undefined)) {
      onChange({
        content: {
          ...(stage.content || {}),
          description: '',
          date: '',
          duration: 60,
          location: '',
          participants: [],
          meetingTool: undefined
        },
        coinReward: stage.coinReward || 20 // Default coin reward
      })
    }
  }

  // Initialize content structure on mount only
  useEffect(() => {
    if (stage.type && (!stage.content || Object.keys(stage.content).length === 0)) {
      ensureProperContentStructure()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage.type]);

  // Автоматически переключаем на вкладку general, если нет вкладки содержимого
  useEffect(() => {
    if (!hasContentTab() && activeTab === 'content') {
      setActiveTab('general');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage.type, activeTab]);

  const StageIcon = STAGE_TYPES[stage.type].icon
  const stageColor = STAGE_TYPES[stage.type].color

  // Функция для определения, нужна ли вкладка содержимого
  const hasContentTab = () => {
    return ['presentation', 'goal', 'survey', 'meeting'].includes(stage.type);
  };

  return (
    <div className={cn(
      "h-full flex flex-col transition-all duration-300",
      !isLeftPanelVisible && "ml-4"
    )}>
      {/* Coin reward animation - only shown briefly when completing a stage */}
      {isCompletionAnimationVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="flex flex-col items-center animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="bg-amber-100 rounded-full p-8 mb-4 shadow-lg">
              <Coins className="h-20 w-20 text-amber-500" />
            </div>
            <div className="text-4xl font-bold text-amber-600 animate-bounce">
              +{stage.coinReward}
            </div>
          </div>
        </div>
      )}

      <div className={cn(
        "px-4 py-2 border-b flex items-center justify-between transition-all duration-300 ease-in-out",
        !isLeftPanelVisible && "pl-8" // уменьшен отступ слева, когда панель свернута
      )}>
        <div className="flex items-center gap-3 flex-1">
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
            stageColor
          )}>
            <StageIcon className="h-4 w-4" />
          </div>
          <Input
            value={stage.title}
            onChange={(e) => handleCommonChange('title', e.target.value)}
            onDoubleClick={(e: React.MouseEvent<HTMLInputElement>) => e.currentTarget.select()}
            className="text-base font-medium h-8 border-transparent bg-transparent focus:bg-background focus:border-input w-full min-w-0"
          />
        </div>

        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          {hasContentTab() && (
            <div className="flex h-7 bg-muted p-0.5 rounded-md">
              <Button
                type="button"
                variant={activeTab === 'general' ? 'default' : 'ghost'} 
                className="h-6 px-2 text-xs rounded-sm gap-1 flex items-center"
                onClick={() => setActiveTab('general')}
              >
                <Settings className="h-3 w-3" />
                <span className="sm:inline hidden">Основные</span>
                <span className="sm:hidden inline">Осн.</span>
              </Button>
              <Button
                type="button"
                variant={activeTab === 'content' ? 'default' : 'ghost'}
                className="h-6 px-2 text-xs rounded-sm gap-1 flex items-center"
                onClick={() => setActiveTab('content')}
              >
                <Box className="h-3 w-3" />
                <span className="sm:inline hidden">Содержимое</span>
                <span className="sm:hidden inline">Сод.</span>
              </Button>
            </div>
          )}
          
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
            <Coins className="h-3 w-3" />
            <span className="text-sm font-medium">{stage.coinReward || 0}</span>
          </div>

          <Button
            variant={stageStatus.isCompleted ? "outline" : "default"}
            size="sm"
            className={cn(
              "gap-1 h-7 text-xs px-2",
              stageStatus.isCompleted && "border-green-500 text-green-600 bg-green-50 hover:bg-green-100 hover:text-green-700"
            )}
            onClick={() => handleStatusChange(!stageStatus.isCompleted)}
          >
            {stageStatus.isCompleted ? (
              <>
                <CheckCircle className="h-3 w-3" />
                <span className="sm:inline hidden">Выполнено</span>
              </>
            ) : (
              <>
                <Clock className="h-3 w-3" />
                <span className="sm:inline hidden">Отметить</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'general' && (
          <div className={cn(
            "px-4 py-3 h-full transition-all duration-300 ease-in-out",
            !isLeftPanelVisible && "pl-8" // уменьшен отступ слева, когда панель свернута
          )}>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-sm">Описание</Label>
                <Textarea
                  id="description"
                  value={stage.description}
                  onChange={(e) => handleCommonChange('description', e.target.value)}
                  rows={3}
                  placeholder="Введите описание этапа..."
                  className="text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="coinReward" className="flex items-center gap-1.5 text-sm">
                  <Coins className="h-3.5 w-3.5 text-amber-500" />
                  Награда за выполнение
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="coinReward"
                    type="number"
                    min={0}
                    max={1000}
                    value={stage.coinReward || 0}
                    onChange={(e) => handleCommonChange('coinReward', parseInt(e.target.value) || 0)}
                    className="w-20 h-8 text-sm"
                  />
                  <span className="text-xs text-muted-foreground">монет</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Количество монет, которое получит сотрудник за выполнение этого этапа
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="required" 
                  checked={stage.required}
                  onCheckedChange={(checked) => 
                    handleCommonChange('required', !!checked)
                  }
                  className="h-4 w-4"
                />
                <Label 
                  htmlFor="required"
                  className="cursor-pointer text-sm"
                >
                  Обязательный для прохождения
                </Label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className={cn(
            "h-full transition-all duration-300 ease-in-out",
            !isLeftPanelVisible && "pl-8" // уменьшен отступ слева, когда панель свернута
          )}>
            {stage.type === 'presentation' && (
              <PresentationEditor
                stage={stage as PresentationStage}
                onChange={(content) => onChange({ content })}
              />
            )}

            {stage.type === 'goal' && (
              <GoalEditor
                stage={stage as GoalStage}
                milestone={milestone}
                onChange={(content) => onChange({ content })}
              />
            )}

            {stage.type === 'survey' && (
              <SurveyEditor
                step={stage as SurveyStage}
                onChange={(updatedStep) => {
                  console.log('SurveyEditor onChange вызван:', updatedStep);
                  
                  // Убедимся что content правильно передается
                  onChange({ 
                    content: updatedStep.content 
                  });
                  
                  console.log('Stage после обновления:', stage);
                }}
              />
            )}

            {stage.type === 'meeting' && (
              <MeetingEditor
                stage={stage as MeetingStage}
                onChange={(content) => onChange({ content })}
              />
            )}
          </div>
        )}
      </div>

      {/* Status card at the bottom */}
      {stageStatus.isCompleted && (
        <div className={cn(
          "px-4 py-2 border-t bg-muted/30 transition-all duration-300 ease-in-out",
          !isLeftPanelVisible && "pl-8" // уменьшен отступ слева, когда панель свернута
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>
                Выполнено: {stageStatus.completedAt ? new Date(stageStatus.completedAt).toLocaleString('ru-RU') : ''}
              </span>
            </div>
            {stageStatus.completedBy && (
              <div className="text-xs text-muted-foreground">
                {stageStatus.completedBy}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 