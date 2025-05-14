import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/index'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { EmployeeForm } from '@/components/employee-form'


export function CreateEmployeePage() {
  const navigate = useNavigate()
  const { addEmployee, positions, departments } = useStore()

    // Helper function to get position name by ID
    const getPosition = (positionName: string) => {
      const position = positions.find(p => p.name === positionName)
      return position
    }
  
    // Helper function to get department name by ID
    const getDepartment = (departmentName: string) => {
      const department = departments.find(d => d.name === departmentName)
      return department
    }
  
  const handleSubmit = (formData: any) => {
    addEmployee({
      fullName: formData.fullName,
      positionId: getPosition(formData.position)?.id || '',
      departmentId: getDepartment(formData.department)?.id || '',
      email: formData.email,
      hireDate: formData.hireDate,
      phone: formData.phone,
      stepProgress: {},
    })
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