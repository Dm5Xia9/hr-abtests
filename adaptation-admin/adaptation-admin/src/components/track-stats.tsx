import { useStore } from '@/store/index'

export function TrackStats() {
  const { tracks, employees } = useStore()

  const stats = tracks.map((track) => {
    const assignedEmployees = employees.filter((e) => e.assignedTrackId === track.id)
    const completedEmployees = assignedEmployees.filter(
      (e) => e.adaptationStatus === 'completed'
    )
    const inProgressEmployees = assignedEmployees.filter(
      (e) => e.adaptationStatus === 'in_progress'
    )

    return {
      id: track.id,
      name: track.title,
      totalAssigned: assignedEmployees.length,
      completed: completedEmployees.length,
      inProgress: inProgressEmployees.length,
      completionRate:
        assignedEmployees.length > 0
          ? (completedEmployees.length / assignedEmployees.length) * 100
          : 0,
    }
  })

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Статистика треков</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="rounded-lg border bg-card p-4 text-card-foreground"
          >
            <h3 className="font-medium">{stat.name}</h3>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Всего назначено</span>
                <span className="font-medium">{stat.totalAssigned}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Завершено</span>
                <span className="font-medium">{stat.completed}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">В процессе</span>
                <span className="font-medium">{stat.inProgress}</span>
              </div>
              <div className="mt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Процент завершения</span>
                  <span className="font-medium">
                    {stat.completionRate.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-in-out"
                    style={{ width: `${stat.completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 