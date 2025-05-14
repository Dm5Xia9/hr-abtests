import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, GripVertical, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Track, Milestone } from '@/types'
import { cn } from '@/lib/utils'

interface MilestoneSidebarProps {
  milestones: Milestone[]
  selectedMilestone: string | null
  onSelectMilestone: (id: string | null) => void
  onChange: (track: Track) => void
}

export function MilestoneSidebar({
  milestones,
  selectedMilestone,
  onSelectMilestone,
  onChange
}: MilestoneSidebarProps) {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(milestones)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    onChange({ milestones: items } as Track)
  }

  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: crypto.randomUUID(),
      title: 'Новый этап',
      description: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      steps: []
    }
    onChange({ milestones: [...milestones, newMilestone] } as Track)
  }

  const updateMilestone = (id: string, updates: Partial<Milestone>) => {
    const updatedMilestones = milestones.map(m =>
      m.id === id ? { ...m, ...updates } : m
    )
    onChange({ milestones: updatedMilestones } as Track)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <Button
          variant="outline"
          className="w-full"
          onClick={addMilestone}
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить этап
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="milestones">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {milestones.map((milestone, index) => (
                <Draggable
                  key={milestone.id}
                  draggableId={milestone.id}
                  index={index}
                >
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={cn(
                        "p-4 cursor-pointer transition-colors",
                        selectedMilestone === milestone.id
                          ? "bg-primary/10 border-primary"
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => onSelectMilestone(milestone.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          {...provided.dragHandleProps}
                          className="mt-1"
                        >
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Input
                            value={milestone.title}
                            onChange={e => updateMilestone(milestone.id, { title: e.target.value })}
                            onClick={e => e.stopPropagation()}
                            className="h-8"
                          />
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {format(new Date(milestone.startDate), 'd MMM', { locale: ru })} -{' '}
                              {format(new Date(milestone.endDate), 'd MMM', { locale: ru })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
} 