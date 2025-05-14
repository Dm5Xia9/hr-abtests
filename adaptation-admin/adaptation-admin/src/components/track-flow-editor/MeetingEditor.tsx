import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MeetingStage } from '@/types'
import { Employee } from '@/types/index'
import { useStore } from '@/store/index'
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { CheckIcon, PlusCircle, X, Video, MonitorSmartphone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface MeetingEditorProps {
  stage: MeetingStage
  onChange: (content: MeetingStage['content']) => void
}

interface MeetingTool {
  value: 'google_meet' | 'telemost' | 'zoom' | 'teams' | 'other'
  label: string
  icon: React.ReactNode
  color: string
}

export function MeetingEditor({ stage, onChange }: MeetingEditorProps) {
  const { employees, departments } = useStore()
  const [open, setOpen] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)

  const handleContentChange = (field: keyof MeetingStage['content'], value: any) => {
    onChange({
      ...stage.content,
      [field]: value
    })
  }

  const handleAddParticipant = () => {
    if (selectedEmployeeId && !stage.content.participants?.includes(selectedEmployeeId)) {
      const updatedParticipants = [...(stage.content.participants || []), selectedEmployeeId]
      handleContentChange('participants', updatedParticipants)
      setSelectedEmployeeId(null)
    }
  }

  const handleRemoveParticipant = (employeeId: string) => {
    const updatedParticipants = (stage.content.participants || []).filter(id => id !== employeeId)
    handleContentChange('participants', updatedParticipants)
  }

  // Helper function to get department name by ID
  const getDepartmentName = (departmentId: string) => {
    const department = departments.find(d => d.id === departmentId)
    return department?.name || 'Unknown'
  }

  const meetingTools: MeetingTool[] = [
    { 
      value: 'google_meet', 
      label: 'Google Meet', 
      icon: 
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path 
            fill="#00832d" 
            d="M3.572 5.572a7.428 7.428 0 0 1 10.482 10.482"
          />
          <path 
            fill="#0066da" 
            d="M14.055 16.055a7.428 7.428 0 0 1-10.482-10.482"
          />
          <path 
            fill="#e94235" 
            d="M5.575 3.571C8.15 2.238 11.362 2.67 13.459 4.769c1.232 1.232 1.974 2.817 2.111 4.478"
          />
          <path 
            fill="#00AC47" 
            d="M15.57 9.247c.136 1.66-.122 3.38-1.112 4.949"
          />
          <path 
            fill="#EA8600" 
            d="M14.457 14.196c-1.66.992-3.38 1.25-5.041 1.112"
          />
          <path 
            fill="#00AC47" 
            d="M9.417 15.308c-1.66-.136-3.246-.878-4.477-2.111"
          />
          <path 
            fill="#4285f4" 
            d="M20.5 17l-6-10h-5v10h5v-3.5L19 17h1.5z"
          />
        </svg>,
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    { 
      value: 'telemost', 
      label: 'Телемост', 
      icon: 
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path 
            fill="#FF0000" 
            d="M12 3.5c-4.7 0-8.5 3.8-8.5 8.5s3.8 8.5 8.5 8.5 8.5-3.8 8.5-8.5-3.8-8.5-8.5-8.5z"
          />
          <path 
            fill="#FFFFFF" 
            d="M15 12l-5 3V9l5 3z"
          />
        </svg>,
      color: 'bg-red-50 hover:bg-red-100 border-red-200'
    },
    { 
      value: 'zoom', 
      label: 'Zoom', 
      icon: 
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path 
            fill="#2D8CFF" 
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8 16V8l6 4-6 4z"
          />
        </svg>,
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    { 
      value: 'teams', 
      label: 'Microsoft Teams', 
      icon: 
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path 
            fill="#5059C9" 
            d="M11.799 8.8h5.977c.6 0 1.1.5 1.1 1.1v4.3c0 .6-.5 1.1-1.1 1.1h-5.977a1.1 1.1 0 01-1.1-1.1v-4.3c0-.6.5-1.1 1.1-1.1z"
          />
          <path 
            fill="#7B83EB" 
            d="M5.024 8.8h5.977c.6 0 1.1.5 1.1 1.1v4.3c0 .6-.5 1.1-1.1 1.1H5.024a1.1 1.1 0 01-1.1-1.1v-4.3c0-.6.5-1.1 1.1-1.1z"
          />
          <path 
            fill="#5059C9" 
            d="M12.799 3.9a2 2 0 110 4 2 2 0 010-4z"
          />
          <path 
            fill="#7B83EB" 
            d="M6.024 5.9a2 2 0 110 4 2 2 0 010-4z"
          />
        </svg>,
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
    },
    { 
      value: 'other', 
      label: 'Другое', 
      icon: <MonitorSmartphone className="h-5 w-5 text-gray-600" />,
      color: 'bg-gray-50 hover:bg-gray-100 border-gray-200'
    }
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="meeting-description">Описание встречи</Label>
        <Textarea
          id="meeting-description"
          value={stage.content.description || ''}
          onChange={(e) => handleContentChange('description', e.target.value)}
          placeholder="Опишите цель и повестку встречи..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="meeting-date">Дата и время</Label>
        <Input
          id="meeting-date"
          type="datetime-local"
          value={stage.content.date || ''}
          onChange={(e) => handleContentChange('date', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="meeting-duration">Продолжительность (минут)</Label>
        <Input
          id="meeting-duration"
          type="number"
          min="5"
          step="5"
          value={stage.content.duration || 60}
          onChange={(e) => handleContentChange('duration', parseInt(e.target.value))}
        />
      </div>

      <div className="space-y-2">
        <Label>Инструмент для проведения встречи</Label>
        <div className="grid grid-cols-3 gap-2">
          {meetingTools.map((tool) => (
            <Button
              key={tool.value}
              type="button"
              variant="outline"
              className={cn(
                "flex flex-col items-center justify-center h-20 p-2 border-2",
                tool.color,
                stage.content.meetingTool === tool.value ? "border-primary ring-2 ring-primary/20" : "border-transparent"
              )}
              onClick={() => handleContentChange('meetingTool', tool.value)}
            >
              <div className="flex items-center justify-center mb-1">
                {tool.icon}
              </div>
              <span className="text-xs text-center mt-1">{tool.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="meeting-location">Место проведения</Label>
        <Input
          id="meeting-location"
          value={stage.content.location || ''}
          onChange={(e) => handleContentChange('location', e.target.value)}
          placeholder="Онлайн / Переговорная / Другое место"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Участники</CardTitle>
          <CardDescription>
            Выберите сотрудников, которые должны участвовать во встрече.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    role="combobox" 
                    aria-expanded={open} 
                    className="w-full justify-between"
                  >
                    {selectedEmployeeId 
                      ? employees.find(emp => emp.id === selectedEmployeeId)?.fullName
                      : "Выберите сотрудника..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput placeholder="Поиск сотрудника..." />
                    <CommandEmpty>Сотрудник не найден.</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        {employees.map((employee) => (
                          <CommandItem
                            key={employee.id}
                            value={employee.fullName}
                            onSelect={() => {
                              setSelectedEmployeeId(employee.id)
                              setOpen(false)
                            }}
                          >
                            <div className="flex flex-col">
                              <span>{employee.fullName}</span>
                              <span className="text-xs text-muted-foreground">
                                {getDepartmentName(employee.departmentId)}
                              </span>
                            </div>
                            <CheckIcon
                              className={cn(
                                "ml-auto h-4 w-4",
                                selectedEmployeeId === employee.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <Button onClick={handleAddParticipant} size="sm" disabled={!selectedEmployeeId}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Добавить
            </Button>
          </div>

          <div className="space-y-1">
            <Label>Добавленные участники</Label>
            <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[60px]">
              {(stage.content.participants || []).length === 0 ? (
                <p className="text-sm text-muted-foreground">Нет добавленных участников</p>
              ) : (
                (stage.content.participants || []).map((participantId) => {
                  const employee = employees.find(emp => emp.id === participantId)
                  return (
                    <Badge 
                      key={participantId} 
                      variant="secondary"
                      className="flex items-center gap-1 px-2 py-1"
                    >
                      {employee?.fullName || 'Unknown'}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-5 w-5 p-0 rounded-full"
                        onClick={() => handleRemoveParticipant(participantId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )
                })
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 