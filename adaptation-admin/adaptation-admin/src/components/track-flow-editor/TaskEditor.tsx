import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from '@hello-pangea/dnd'
import { Plus, GripVertical, Trash2, CalendarIcon, Link } from 'lucide-react'
import { TaskStage, ChecklistItem } from '@/types'
import { cn } from '@/lib/utils'

interface TaskEditorProps {
  stage: TaskStage
  onChange: (content: TaskStage['content']) => void
}

export function TaskEditor({ stage, onChange }: TaskEditorProps) {
  const handleChange = (field: keyof TaskStage['content'], value: any) => {
    onChange({
      ...stage.content,
      [field]: value
    })
  }

  const handleAddChecklistItem = () => {
    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      text: '',
      completed: false
    }
    handleChange('checklist', [...(stage.content.checklist || []), newItem])
  }

  const handleUpdateChecklistItem = (id: string, updates: Partial<ChecklistItem>) => {
    const updatedItems = (stage.content.checklist || []).map(item =>
      item.id === id ? { ...item, ...updates } : item
    )
    handleChange('checklist', updatedItems)
  }

  const handleDeleteChecklistItem = (id: string) => {
    const updatedItems = (stage.content.checklist || []).filter(item => item.id !== id)
    handleChange('checklist', updatedItems)
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(stage.content.checklist || [])
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    handleChange('checklist', items)
  }

  return (
    <div className="px-6 py-4 h-full overflow-auto">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline">Срок выполнения</Label>
              <div className="flex">
                <Input
                  id="deadline"
                  type="date"
                  value={stage.content.deadline || ''}
                  onChange={e => handleChange('deadline', e.target.value)}
                  className="rounded-r-none"
                />
                <Button 
                  variant="outline" 
                  className="rounded-l-none border-l-0"
                  onClick={() => handleChange('deadline', null)}
                  type="button"
                  disabled={!stage.content.deadline}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="externalLink">Внешняя ссылка</Label>
              <div className="flex">
                <Input
                  id="externalLink"
                  value={stage.content.externalLink || ''}
                  onChange={e => handleChange('externalLink', e.target.value)}
                  placeholder="https://jira.example.com/TASK-123"
                  className="rounded-r-none"
                />
                <Button 
                  variant="outline" 
                  className="rounded-l-none border-l-0"
                  onClick={() => handleChange('externalLink', null)}
                  type="button"
                  disabled={!stage.content.externalLink}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Описание задачи</Label>
            <Textarea
              id="description"
              value={stage.content.description}
              onChange={e => handleChange('description', e.target.value)}
              rows={6}
              placeholder="Опишите задачу подробно..."
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Чек-лист</Label>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleAddChecklistItem}
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить пункт
            </Button>
          </div>

          <Card>
            <CardContent className="p-4">
              {(!stage.content.checklist || stage.content.checklist.length === 0) && (
                <div className="text-center py-6 text-muted-foreground">
                  <p>Чек-лист пуст</p>
                  <p className="text-sm">Добавьте пункты для разбивки задачи на подзадачи</p>
                </div>
              )}

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="checklist">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {(stage.content.checklist || []).map((item, index) => (
                        <Draggable
                          key={item.id}
                          draggableId={item.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="flex items-center gap-2 group"
                            >
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab opacity-50 group-hover:opacity-100"
                              >
                                <GripVertical className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <Checkbox
                                id={`item-${item.id}`}
                                checked={item.completed}
                                onCheckedChange={checked => 
                                  handleUpdateChecklistItem(item.id, { completed: !!checked })
                                }
                              />
                              <Input
                                value={item.text}
                                onChange={e => handleUpdateChecklistItem(item.id, { text: e.target.value })}
                                className={cn(
                                  "flex-1",
                                  item.completed && "line-through text-muted-foreground"
                                )}
                                placeholder="Описание задачи..."
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteChecklistItem(item.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 