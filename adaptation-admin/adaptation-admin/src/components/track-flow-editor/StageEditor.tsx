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
  Clock 
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
}

// Add a new interface for stage status
interface StageStatus {
  isCompleted: boolean
  completedAt?: string
  completedBy?: string
}

export function StageEditor({ stage, milestone, onChange, onBack }: StageEditorProps) {
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

  const StageIcon = STAGE_TYPES[stage.type].icon
  const stageColor = STAGE_TYPES[stage.type].color

  return (
    <div className="h-full flex flex-col">
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

      <div className="px-6 py-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onBack}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            stageColor
          )}>
            <StageIcon className="h-5 w-5" />
          </div>
          <Input
            value={stage.title}
            onChange={(e) => handleCommonChange('title', e.target.value)}
            onDoubleClick={(e: React.MouseEvent<HTMLInputElement>) => e.currentTarget.select()}
            className="text-xl font-medium h-10 flex-1 border-transparent bg-transparent focus:bg-background focus:border-input"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
            <Coins className="h-4 w-4" />
            <span className="font-medium">{stage.coinReward || 0}</span>
          </div>

          <Button
            variant={stageStatus.isCompleted ? "outline" : "default"}
            size="sm"
            className={cn(
              "gap-2",
              stageStatus.isCompleted && "border-green-500 text-green-600 bg-green-50 hover:bg-green-100 hover:text-green-700"
            )}
            onClick={() => handleStatusChange(!stageStatus.isCompleted)}
          >
            {stageStatus.isCompleted ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Выполнено
              </>
            ) : (
              <>
                <Clock className="h-4 w-4" />
                Отметить выполнение
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs 
        defaultValue="general" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <div className="border-b px-6">
          <TabsList className="bg-transparent p-0">
            <TabsTrigger 
              value="general" 
              className="py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Основные
            </TabsTrigger>
            <TabsTrigger 
              value="content" 
              className="py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Содержимое
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto">
          <TabsContent value="general" className="px-6 py-4 h-full">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={stage.description}
                  onChange={(e) => handleCommonChange('description', e.target.value)}
                  rows={4}
                  placeholder="Введите описание этапа..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coinReward" className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-amber-500" />
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
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">монет</span>
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
                />
                <Label 
                  htmlFor="required"
                  className="cursor-pointer"
                >
                  Обязательный для прохождения
                </Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="h-full">
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
          </TabsContent>
        </div>
      </Tabs>

      {/* Status card at the bottom */}
      {stageStatus.isCompleted && (
        <div className="px-6 py-3 border-t bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>
                Выполнено: {stageStatus.completedAt ? new Date(stageStatus.completedAt).toLocaleString('ru-RU') : ''}
              </span>
            </div>
            {stageStatus.completedBy && (
              <div className="text-sm text-muted-foreground">
                {stageStatus.completedBy}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 