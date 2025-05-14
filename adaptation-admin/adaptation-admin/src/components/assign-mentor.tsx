import React, { useState, useEffect } from 'react'
import { useStore } from '@/store/index'
import { Employee, User } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface AssignMentorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Employee
}

export function AssignMentor({ open, onOpenChange, employee }: AssignMentorProps) {
  const { users, assignMentor } = useStore()
  const [selectedMentorId, setSelectedMentorId] = useState<string | undefined>(
    employee.mentorId
  )

  useEffect(() => {
    setSelectedMentorId(employee.mentorId)
  }, [employee.mentorId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedMentorId) {
      try {
        await assignMentor(employee.id, selectedMentorId)
        onOpenChange(false)
      } catch (error) {
        console.error('Failed to assign mentor:', error)
      }
    }
  }

  const potentialMentors = users.filter(user => 
    user.role === 'manager' || user.role === 'admin'
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Назначить наставника</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="mentor">Наставник</Label>
              <Select
                value={selectedMentorId}
                onValueChange={setSelectedMentorId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите наставника" />
                </SelectTrigger>
                <SelectContent>
                  {potentialMentors.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.role === 'admin' ? 'Администратор' : 'Руководитель'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={!selectedMentorId}>
              Назначить
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 