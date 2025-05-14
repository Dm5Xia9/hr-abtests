import { useState, useEffect } from 'react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from '@hello-pangea/dnd'
import { Plus, GripVertical, Trash2, CalendarIcon, Link as LinkIcon, Target, ArrowUpRight } from 'lucide-react'
import { GoalStage, ChecklistItem, Milestone, Stage } from '@/types'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface GoalEditorProps {
  stage: GoalStage
  milestone: Milestone
  onChange: (content: GoalStage['content']) => void
}

export function GoalEditor({ stage, milestone, onChange }: GoalEditorProps) {
  const handleChange = (field: keyof GoalStage['content'], value: any) => {
    onChange({
      ...stage.content,
      [field]: value
    })
  }

  /**
   * Checklist items can be of two types:
   * 1. manual - Regular checklist items that users check manually
   * 2. linked - Linked to another stage in the current milestone, automatically checked when that stage is completed
   * 
   * When a stage is completed, all linked checklist items that reference that stage
   * will be automatically marked as completed. See updateLinkedChecklist in utils/checklist.ts
   */
  const handleAddChecklistItem = (type: 'manual' | 'linked' = 'manual') => {
    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      text: '',
      completed: false,
      type
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

  // Get available stages for linking (all stages in the milestone except the current one)
  const availableStages = milestone.stages.filter(s => s.id !== stage.id);

  // Run once to migrate existing checklist items to include the "type" field
  useEffect(() => {
    if (stage.content.checklist && stage.content.checklist.length > 0) {
      let needsUpdate = false;
      
      const migratedChecklist = stage.content.checklist.map(item => {
        if (item.type === undefined) {
          needsUpdate = true;
          return { ...item, type: 'manual' as const };
        }
        return item;
      });
      
      if (needsUpdate) {
        handleChange('checklist', migratedChecklist);
      }
    }
  }, []);

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
            <Label htmlFor="description">Описание цели</Label>
            <Textarea
              id="description"
              value={stage.content.description}
              onChange={e => handleChange('description', e.target.value)}
              rows={6}
              placeholder="Опишите цель подробно..."
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Чек-лист</Label>
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleAddChecklistItem('linked')}
                  >
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Связать с этапом
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Связать пункт с другим этапом в этой вехе</p>
                </TooltipContent>
              </Tooltip>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleAddChecklistItem('manual')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить пункт
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-4">
              {(!stage.content.checklist || stage.content.checklist.length === 0) && (
                <div className="text-center py-6 text-muted-foreground">
                  <p>Чек-лист пуст</p>
                  <p className="text-sm">Добавьте пункты для разбивки цели на задачи</p>
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
                              {item.type === 'manual' ? (
                                <>
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
                                </>
                              ) : (
                                <>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center justify-center h-4 w-4 text-primary">
                                        <LinkIcon className="h-3 w-3" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs">Автоматически отмечается при выполнении связанного этапа</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <Select
                                    value={item.linkedStageId || ''}
                                    onValueChange={(value) => 
                                      handleUpdateChecklistItem(item.id, { 
                                        linkedStageId: value,
                                        // Get the title of the linked stage to use as the text
                                        text: value ? `Этап "${milestone.stages.find(s => s.id === value)?.title || ''}" выполнен` : ''
                                      })
                                    }
                                  >
                                    <SelectTrigger className={cn(
                                      "flex-1",
                                      item.completed && "line-through text-muted-foreground"
                                    )}>
                                      <SelectValue placeholder="Выберите этап для связи..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableStages.map(stageOption => (
                                        <SelectItem key={stageOption.id} value={stageOption.id}>
                                          {stageOption.title}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </>
                              )}
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