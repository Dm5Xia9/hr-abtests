import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/index'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'

export function CreateEmployeePage() {
  const navigate = useNavigate()
  const { setEmployees, employees } = useStore()
  const [formData, setFormData] = useState({
    fullName: '',
    position: '',
    department: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newEmployee = {
      id: String(Date.now()),
      ...formData,
      adaptationStatus: 'not_started' as const,
    }
    setEmployees([...employees, newEmployee])
    navigate('/employees')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b bg-background p-6">
        <div className="max-w-[2000px] mx-auto">
          <div className="flex items-center justify-between gap-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight">
                Добавить сотрудника
              </h2>
            </div>
            <Button variant="outline" onClick={() => navigate('/employees')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
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
              <Label htmlFor="position">Должность</Label>
              <Input
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Отдел</Label>
              <Input
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Добавить
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
} 