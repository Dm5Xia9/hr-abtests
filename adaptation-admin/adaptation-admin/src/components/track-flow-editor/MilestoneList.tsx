import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, GripVertical, Calendar, ChevronRight, MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Track, Milestone, Stage } from '@/types'
import { cn } from '@/lib/utils'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface MilestoneListProps {
  milestones: Milestone[]
  selectedMilestoneId: string | null
  onMilestoneSelect: (id: string | null) => void
  onDragEnd: (result: any) => void
  onChange: (track: Partial<Track>) => void
}

export function MilestoneList({
  milestones,
  selectedMilestoneId,
  onMilestoneSelect,
  onDragEnd,
  onChange
}: MilestoneListProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)

  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: crypto.randomUUID(),
      title: 'Новая веха',
      description: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      stages: []
    }
    onChange({ milestones: [...milestones, newMilestone] })
  }

  const deleteMilestone = (id: string) => {
    onChange({
      milestones: milestones.filter(m => m.id !== id)
    })
    if (selectedMilestoneId === id) {
      onMilestoneSelect(null)
    }
  }

  const duplicateMilestone = (id: string) => {
    const original = milestones.find(m => m.id === id)
    if (!original) return

    const copy: Milestone = {
      ...original,
      id: crypto.randomUUID(),
      title: `${original.title} (копия)`,
      stages: original.stages.map(stage => ({
        ...stage,
        id: crypto.randomUUID()
      }))
    }

    onChange({ milestones: [...milestones, copy] })
  }

  const openEditDialog = (milestone: Milestone) => {
    setEditingMilestone({ ...milestone })
    setShowEditDialog(true)
  }

  const saveEditingMilestone = () => {
    if (!editingMilestone) return

    const updatedMilestones = milestones.map(m => 
      m.id === editingMilestone.id ? editingMilestone : m
    )
    onChange({ milestones: updatedMilestones })
    setShowEditDialog(false)
    setEditingMilestone(null)
  }
  
  const handleMilestoneClick = (milestone: Milestone) => {
    onMilestoneSelect(milestone.id)
  }

  const handleInlineTitleChange = (id: string, title: string) => {
    const updatedMilestones = milestones.map(m => 
      m.id === id ? { ...m, title } : m
    )
    onChange({ milestones: updatedMilestones })
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-lg">Вехи</h2>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={addMilestone}
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить веху
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="milestones">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
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
                        "p-3 transition-colors",
                        selectedMilestoneId === milestone.id
                          ? "bg-primary/10 border-primary"
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
                          onClick={() => handleMilestoneClick(milestone)}
                        >
                          <div className="flex items-start justify-between">
                            <Input
                              value={milestone.title}
                              onChange={e => handleInlineTitleChange(milestone.id, e.target.value)}
                              onDoubleClick={(e: React.MouseEvent<HTMLInputElement>) => e.currentTarget.select()}
                              onClick={e => e.stopPropagation()}
                              className="h-7 text-sm font-medium p-1 bg-transparent border-transparent focus:bg-background focus:border-input"
                            />
                            <div className="flex items-center gap-1">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openEditDialog(milestone)}>
                                    Редактировать
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => duplicateMilestone(milestone.id)}>
                                    Дублировать
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => deleteMilestone(milestone.id)}
                                  >
                                    Удалить
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 ml-auto"
                                onClick={() => handleMilestoneClick(milestone)}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {format(new Date(milestone.startDate), 'd MMM', { locale: ru })} -{' '}
                              {format(new Date(milestone.endDate), 'd MMM', { locale: ru })}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {milestone.stages.length} {milestone.stages.length === 1 ? 'этап' : 
                              milestone.stages.length > 1 && milestone.stages.length < 5 ? 'этапа' : 'этапов'}
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

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактирование вехи</DialogTitle>
          </DialogHeader>
          {editingMilestone && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="title">Название</Label>
                <Input
                  id="title"
                  value={editingMilestone.title}
                  onChange={e => setEditingMilestone({...editingMilestone, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={editingMilestone.description}
                  onChange={e => setEditingMilestone({...editingMilestone, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Дата начала</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={editingMilestone.startDate}
                    onChange={e => setEditingMilestone({...editingMilestone, startDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Дата окончания</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={editingMilestone.endDate}
                    onChange={e => setEditingMilestone({...editingMilestone, endDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Отмена
                </Button>
                <Button onClick={saveEditingMilestone}>
                  Сохранить
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 