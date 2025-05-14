import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { Milestone, Step } from '@/types'

interface MilestoneEditorProps {
  milestone: Milestone
  index: number
  milestonesCount: number
  onChange: (milestone: Milestone) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
  onAddStep: (type: Step['type']) => void
  onSelectStep: (id: string | null) => void
  selectedStep: string | null
  onDragEnd?: (result: any) => void
}

export const MilestoneEditor: React.FC<MilestoneEditorProps> = ({
  milestone,
  index,
  milestonesCount,
  onChange,
  onMoveUp,
  onMoveDown,
  onDelete,
  onAddStep,
  onSelectStep,
  selectedStep,
  onDragEnd
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMoveUp}
            disabled={index === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-medium">Этап {index + 1}</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onMoveDown}
            disabled={index === milestonesCount - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="ghost" size="icon" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Название</Label>
          <Input
            value={milestone.title}
            onChange={e => onChange({ ...milestone, title: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Описание</Label>
          <Textarea
            value={milestone.description}
            onChange={e => onChange({ ...milestone, description: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Дата начала</Label>
            <Input
              type="date"
              value={milestone.startDate}
              onChange={e => onChange({ ...milestone, startDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Дата окончания</Label>
            <Input
              type="date"
              value={milestone.endDate}
              onChange={e => onChange({ ...milestone, endDate: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium">Шаги</h4>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onAddStep('presentation')}>
                <Plus className="h-4 w-4 mr-2" />
                Презентация
              </Button>
              <Button variant="outline" size="sm" onClick={() => onAddStep('task')}>
                <Plus className="h-4 w-4 mr-2" />
                Задача
              </Button>
              <Button variant="outline" size="sm" onClick={() => onAddStep('survey')}>
                <Plus className="h-4 w-4 mr-2" />
                Опрос
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            {milestone.steps.map((step, stepIndex) => (
              <div key={step.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onSelectStep(step.id)}
                      disabled={selectedStep === step.id}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h5 className="font-medium">Шаг {stepIndex + 1}</h5>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Название</Label>
                    <Input
                      value={step.title}
                      onChange={e => onChange({
                        ...milestone,
                        steps: milestone.steps.map(s =>
                          s.id === step.id ? { ...s, title: e.target.value } : s
                        )
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Описание</Label>
                    <Textarea
                      value={step.description}
                      onChange={e => onChange({
                        ...milestone,
                        steps: milestone.steps.map(s =>
                          s.id === step.id ? { ...s, description: e.target.value } : s
                        )
                      })}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 