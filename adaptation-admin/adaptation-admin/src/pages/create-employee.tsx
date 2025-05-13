import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/index'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { EmployeeForm } from '@/components/employee-form'

export function CreateEmployeePage() {
  const navigate = useNavigate()
  const { addEmployee } = useStore()

  const handleSubmit = (formData: any) => {
    addEmployee(formData)
    navigate('/employees')
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
          <EmployeeForm 
            onSubmit={handleSubmit}
            onCancel={() => navigate('/employees')}
          />
        </div>
      </div>
    </div>
  )
} 