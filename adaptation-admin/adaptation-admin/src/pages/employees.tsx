import { EmployeesTable } from '@/components/employees-table'
import { AdaptationStats } from '@/components/adaptation-stats'

export function EmployeesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Employees</h1>
      </div>
      <AdaptationStats />
      <EmployeesTable />
    </div>
  )
} 