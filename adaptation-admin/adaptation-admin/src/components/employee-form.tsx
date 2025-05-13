import React, { useState } from 'react'
import { useStore } from '@/store/index'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Combobox } from '@/components/ui/combobox'
import { format } from 'date-fns'
import InputMask from 'react-input-mask'

interface EmployeeFormProps {
  onSubmit: (formData: any) => void
  onCancel: () => void
}

export function EmployeeForm({ onSubmit, onCancel }: EmployeeFormProps) {
  const { positions, departments, addPosition, addDepartment } = useStore()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    hireDate: new Date().toISOString().split('T')[0],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCreatePosition = (name: string) => {
    const newPosition = addPosition({ name, description: '' })
    handleSelectChange('position', newPosition.name)
  }

  const handleCreateDepartment = (name: string) => {
    const newDepartment = addDepartment({ name, description: '' })
    handleSelectChange('department', newDepartment.name)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  // Подготовка данных для Combobox
  const positionItems = positions.map(pos => ({
    value: pos.name,
    label: pos.name
  }))

  const departmentItems = departments.map(dep => ({
    value: dep.name,
    label: dep.name
  }))

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullName">ФИО</Label>
        <Input
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="example@company.com"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Телефон</Label>
        <InputMask
          mask="+7 (999) 999-99-99"
          value={formData.phone}
          onChange={handleChange}
          id="phone"
          name="phone"
        >
          {(inputProps: any) => (
            <Input 
              {...inputProps}
              type="tel"
              placeholder="+7 (___) ___-__-__"
            />
          )}
        </InputMask>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="position">Должность</Label>
        <Combobox
          items={positionItems}
          value={formData.position}
          onChange={(value) => handleSelectChange('position', value)}
          placeholder="Выберите должность"
          emptyText="Должность не найдена"
          createNew={handleCreatePosition}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="department">Подразделение</Label>
        <Combobox
          items={departmentItems}
          value={formData.department}
          onChange={(value) => handleSelectChange('department', value)}
          placeholder="Выберите подразделение"
          emptyText="Подразделение не найдено"
          createNew={handleCreateDepartment}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="hireDate">Дата приема на работу</Label>
        <Input
          id="hireDate"
          name="hireDate"
          type="date"
          value={formData.hireDate}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit">Создать</Button>
      </div>
    </form>
  )
} 