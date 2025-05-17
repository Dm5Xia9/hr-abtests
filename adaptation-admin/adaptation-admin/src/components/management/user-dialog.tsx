import React, { useState, useEffect } from 'react'
import { useStore } from '@/store/index'
import { Employee, UserRole } from '@/types'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: Employee | null
}

export function UserDialog({ open, onOpenChange, user }: UserDialogProps) {
  const { addUser, updateUser } = useStore()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'observer' as UserRole,
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.fullName,
        email: user.email,
        role: user.role,
      })
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'observer' as UserRole,
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (role: UserRole) => {
    setFormData(prev => ({ ...prev, role }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (user) {
      updateUser({
        ...user,
        ...formData,
        fullName: formData.name,
      })
    } else {
      addUser({
        ...formData,
        fullName: formData.name,
        departmentId: null,
        positionId: null,
        hireDate: new Date().toISOString(),
        currentCompanyId: '',
        createAt: new Date().toISOString(),
        assignedTracks: []
      })
    }
    
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {user ? 'Редактировать пользователя' : 'Добавить пользователя'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="role">Роль</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => handleRoleChange(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Администратор</SelectItem>
                  <SelectItem value="manager">Руководитель</SelectItem>
                  <SelectItem value="observer">Наблюдатель</SelectItem>
                  <SelectItem value="employee">Сотрудник</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              {user ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 