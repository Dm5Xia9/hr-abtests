import { useStore } from '@/store/index'
import { AdaptationStatus } from '@/types'

export function AdaptationStats() {
  const { employees } = useStore()

  const stats = employees.reduce(
    (acc, employee) => {
      acc[employee.adaptationStatus]++
      return acc
    },
    {
      not_started: 0,
      in_progress: 0,
      completed: 0,
    } as Record<AdaptationStatus, number>
  )

  const total = employees.length
  const getPercentage = (value: number) => ((value / total) * 100).toFixed(1)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg border bg-card p-4 text-card-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Без трека адаптации</p>
            <h3 className="text-2xl font-bold">{stats.not_started}</h3>
          </div>
          <div className="text-sm text-muted-foreground">
            {getPercentage(stats.not_started)}%
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 text-card-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">В процессе</p>
            <h3 className="text-2xl font-bold">{stats.in_progress}</h3>
          </div>
          <div className="text-sm text-muted-foreground">
            {getPercentage(stats.in_progress)}%
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 text-card-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Завершено</p>
            <h3 className="text-2xl font-bold">{stats.completed}</h3>
          </div>
          <div className="text-sm text-muted-foreground">
            {getPercentage(stats.completed)}%
          </div>
        </div>
      </div>
    </div>
  )
} 