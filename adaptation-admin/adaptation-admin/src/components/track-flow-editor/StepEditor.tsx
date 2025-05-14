import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft } from 'lucide-react'
import { Step } from '@/types'

interface StepEditorProps {
  step: Step
  onChange: (step: Step) => void
  onBack: () => void
  children?: React.ReactNode
}

export const StepEditor: React.FC<StepEditorProps> = ({ step, onChange, onBack, children }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-medium">Редактирование шага</h3>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Название</Label>
          <Input
            value={step.title}
            onChange={e => onChange({ ...step, title: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Описание</Label>
          <Textarea
            value={step.description}
            onChange={e => onChange({ ...step, description: e.target.value })}
          />
        </div>
        {children}
      </div>
    </div>
  )
} 