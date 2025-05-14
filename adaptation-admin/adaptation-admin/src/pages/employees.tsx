import { EmployeesTable } from '@/components/employees-table'
import { AdaptationStats } from '@/components/adaptation-stats'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { PlusCircle } from 'lucide-react'
 
export function EmployeesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Сотрудники</h1>
        <Button size="sm" asChild>
          <Link to="/employees/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Добавить сотрудника
          </Link>
        </Button>
      </div>
      <AdaptationStats />
      <EmployeesTable />
    </div>
  )
} 