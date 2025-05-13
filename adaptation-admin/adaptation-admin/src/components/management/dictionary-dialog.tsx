import React, { useState, useEffect } from 'react'
import { useStore } from '@/store/index'
import { Position, Department } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface DictionaryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: Position | Department | null
  type: 'position' | 'department'
  onItemAdded?: (item: Position | Department) => void
}

export function DictionaryDialog({ open, onOpenChange, item, type, onItemAdded }: DictionaryDialogProps) {
  const { 
    addPosition, 
    updatePosition, 
    addDepartment, 
    updateDepartment 
  } = useStore()
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description || '',
      })
    } else {
      setFormData({
        name: '',
        description: '',
      })
    }
  }, [item])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    let newItem;
    
    if (type === 'position') {
      if (item) {
        const updatedPosition = {
          ...item as Position,
          ...formData,
        }
        updatePosition(updatedPosition)
        newItem = updatedPosition
      } else {
        newItem = addPosition(formData)
      }
    } else {
      if (item) {
        const updatedDepartment = {
          ...item as Department,
          ...formData,
        }
        updateDepartment(updatedDepartment)
        newItem = updatedDepartment
      } else {
        newItem = addDepartment(formData)
      }
    }
    
    onOpenChange(false)
    
    if (onItemAdded && newItem) {
      onItemAdded(newItem)
    }
  }

  const title = type === 'position' ? 'должность' : 'подразделение'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {item ? `Редактировать ${title}` : `Добавить ${title}`}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Название</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Описание (необязательно)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              {item ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 