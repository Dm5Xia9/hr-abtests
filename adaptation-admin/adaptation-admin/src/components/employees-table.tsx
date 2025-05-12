import { useState } from 'react'
import { useStore } from '@/store/index'
import { Button } from '@/components/ui/button'
import { AdaptationStatus } from '@/components/adaptation-status'
import { AssignTrackDialog } from '@/components/assign-track-dialog'
import { RemoveTrackDialog } from '@/components/remove-track-dialog'
import { UpdateTrackDialog } from '@/components/update-track-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function EmployeesTable() {
  const { employees, tracks } = useStore()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  const [dialogAction, setDialogAction] = useState<'assign' | 'remove' | 'update' | null>(null)

  const filteredEmployees = employees.filter((employee) => {
    if (statusFilter === 'all') return true
    return employee.adaptationStatus === statusFilter
  })

  const handleAction = (employeeId: string, action: 'assign' | 'remove' | 'update') => {
    setSelectedEmployeeId(employeeId)
    setDialogAction(action)
  }

  const handleCloseDialog = () => {
    setSelectedEmployeeId(null)
    setDialogAction(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Employees</h2>
        <div className="flex items-center space-x-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="not_started">Без трека адаптации</SelectItem>
              <SelectItem value="in_progress">В процессе</SelectItem>
              <SelectItem value="completed">Завершено</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">Полное имя</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Должность</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Подразделение</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Статус</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Трек</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Дата начала</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => {
              const assignedTrack = tracks.find((t) => t.id === employee.assignedTrackId)
              return (
                <tr key={employee.id} className="border-b">
                  <td className="px-4 py-3 text-sm">{employee.fullName}</td>
                  <td className="px-4 py-3 text-sm">{employee.position}</td>
                  <td className="px-4 py-3 text-sm">{employee.department}</td>
                  <td className="px-4 py-3 text-sm">
                    <AdaptationStatus status={employee.adaptationStatus} />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {assignedTrack ? assignedTrack.title : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">{employee.startDate || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end space-x-2">
                      {!employee.assignedTrackId ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(employee.id, 'assign')}
                        >
                          Назначить трек
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            Посмотреть
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction(employee.id, 'update')}
                          >
                            Обновить
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleAction(employee.id, 'remove')}
                          >
                            Удалить
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selectedEmployeeId && dialogAction === 'assign' && (
        <AssignTrackDialog
          employeeId={selectedEmployeeId}
          open={true}
          onClose={handleCloseDialog}
        />
      )}

      {selectedEmployeeId && dialogAction === 'remove' && (
        <RemoveTrackDialog
          employeeId={selectedEmployeeId}
          open={true}
          onClose={handleCloseDialog}
        />
      )}

      {selectedEmployeeId && dialogAction === 'update' && (
        <UpdateTrackDialog
          employeeId={selectedEmployeeId}
          open={true}
          onClose={handleCloseDialog}
        />
      )}
    </div>
  )
} 