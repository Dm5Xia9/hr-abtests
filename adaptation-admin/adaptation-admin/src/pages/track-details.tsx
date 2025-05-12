import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '@/store/index'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { AdaptationStatus } from '@/components/adaptation-status'
import { TaskProgress } from '@/components/task-progress'
import { Pencil } from 'lucide-react'

export function TrackDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { tracks, employees } = useStore()
  const track = tracks.find((t) => t.id === id)
  const assignedEmployees = employees.filter((e) => e.assignedTrackId === id)

  if (!track) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Track not found </h2>
          <p className="mt-2 text-muted-foreground">
            The track you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild className="mt-4">
            <Link to="/tracks">Back to Tracks</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handleEdit = () => {
    navigate(`/tracks/${track.id}/edit`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{track.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleEdit} variant="outline">
            <Pencil className="mr-2 h-4 w-4" />
            Редактировать
          </Button>
          <Button variant="outline" asChild>
            <Link to="/tracks">Назад</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Вехи</h2>
          <div className="space-y-4">
            {track.milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="rounded-lg border bg-card p-4 text-card-foreground"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{milestone.title}</h3>
                  <span className="text-sm text-muted-foreground">
                    {milestone.steps.length} steps
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {milestone.description}
                </p>
                <div className="mt-4 space-y-4">
                  {milestone.steps.map((step) => (
                    <div
                      key={step.id}
                      className="rounded-lg border bg-card p-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{step.title}</h4>
                        <span className="text-sm text-muted-foreground">
                          {step.type}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {step.description}
                      </p>
                      {step.type === 'presentation' && (
                        <div className="mt-4">
                          <h5 className="text-sm font-medium mb-2">Слайды:</h5>
                          <div className="space-y-2">
                            {step.content.slides.map((slide, index) => (
                              <div key={index} className="text-sm">
                                {slide.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {step.type === 'task' && (
                        <div className="mt-4">
                          <h5 className="text-sm font-medium mb-2">Задача:</h5>
                          <p className="text-sm">{step.content.description}</p>
                          {step.content.meeting && (
                            <div className="mt-2 text-sm">
                              <p>Meeting: {step.content.meeting.location}</p>
                              <p>Date: {step.content.meeting.date}</p>
                              <p>Time: {step.content.meeting.time}</p>
                              <p>Duration: {step.content.meeting.duration}</p>
                            </div>
                          )}
                        </div>
                      )}
                      {step.type === 'survey' && (
                        <div className="mt-4">
                          <h5 className="text-sm font-medium mb-2">Форма опроса:</h5>
                          <div className="space-y-2">
                            {step.content.form.components.map((component, index) => (
                              <div key={index} className="text-sm">
                                {component.label} {component.required && '(Required)'}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Сотрудники</h2>
          <div className="space-y-4">
            {assignedEmployees.map((employee) => (
              <div
                key={employee.id}
                className="rounded-lg border bg-card p-4 text-card-foreground"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{employee.fullName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {employee.position} • {employee.department}
                    </p>
                  </div>
                  <AdaptationStatus status={employee.adaptationStatus} />
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Started on {employee.startDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 