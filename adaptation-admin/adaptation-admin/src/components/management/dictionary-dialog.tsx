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
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('Form submission started')
    e.preventDefault()
    console.log('Default form behavior prevented')
    
    if (isSubmitting) {
      console.log('Form is already submitting, ignoring')
      return
    }
    
    setIsSubmitting(true)
    console.log('Set submitting state to true')
    
    try {
      let newItem;
      console.log('Starting API operation for type:', type)
      
      if (type === 'position') {
        if (item) {
          console.log('Updating existing position:', item)
          const updatedPosition = {
            ...item as Position,
            ...formData,
          }
          console.log('Calling updatePosition with:', updatedPosition)
          await updatePosition(updatedPosition)
          console.log('Position updated successfully')
          newItem = updatedPosition
        } else {
          console.log('Creating new position with data:', formData)
          newItem = await addPosition(formData)
          console.log('New position created:', newItem)
        }
      } else {
        if (item) {
          console.log('Updating existing department:', item)
          const updatedDepartment = {
            ...item as Department,
            ...formData,
          }
          console.log('Calling updateDepartment with:', updatedDepartment)
          await updateDepartment(updatedDepartment)
          console.log('Department updated successfully')
          newItem = updatedDepartment
        } else {
          console.log('Creating new department with data:', formData)
          newItem = await addDepartment(formData)
          console.log('New department created:', newItem)
        }
      }
      
      console.log('API operation completed successfully')
      console.log('Closing dialog')
      onOpenChange(false)
      
      if (onItemAdded && newItem) {
        console.log('Calling onItemAdded callback with:', newItem)
        onItemAdded(newItem)
      }
    } catch (error) {
      console.error('Error during form submission:', error)
      if (error instanceof Error) {
        console.error('Error name:', error.name)
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      }
    } finally {
      console.log('Setting submitting state to false')
      setIsSubmitting(false)
    }
  }

  const title = type === 'position' ? 'должность' : 'подразделение'

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        if (!newOpen && isSubmitting) {
          return; // Prevent closing while submitting
        }
        onOpenChange(newOpen);
      }}
    >
      <DialogContent onPointerDownOutside={(e) => {
        if (isSubmitting) {
          e.preventDefault();
        }
      }}>
        <DialogHeader>
          <DialogTitle>
            {item ? `Редактировать ${title}` : `Добавить ${title}`}
          </DialogTitle>
        </DialogHeader>
        
        <div onKeyDown={(e) => {
          if (e.key === 'Enter' && isSubmitting) {
            e.preventDefault();
          }
        }}>
          <form 
            onSubmit={handleSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isSubmitting) {
                e.preventDefault();
              }
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Отмена
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                onClick={(e) => {
                  if (isSubmitting) {
                    e.preventDefault();
                  }
                }}
              >
                {isSubmitting ? 'Сохранение...' : (item ? 'Сохранить' : 'Добавить')}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
} 