import { TrackStep } from '@/types'

interface TaskProgressProps {
  step: TrackStep
}

export function TaskProgress({ step }: TaskProgressProps) {
  const completedTasks = step.tasks.filter((task) => task.isCompleted).length
  const totalTasks = step.tasks.length
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {completedTasks} of {totalTasks} tasks completed
        </span>
        <span className="font-medium">{Math.round(progress)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
} 