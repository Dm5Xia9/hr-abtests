import { useState } from 'react'
import { useStore } from '@/store/index'
import { Button } from '@/components/ui/button'
import { AdaptationStatus } from '@/components/adaptation-status'
import { AssignTrackDialog } from '@/components/assign-track-dialog'
import { RemoveTrackDialog } from '@/components/remove-track-dialog'
import { UpdateTrackDialog } from '@/components/update-track-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AssignMentor } from '@/components/assign-mentor'
import { Link, User, FileText } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

export function EmployeesTable() {
  const { employees, tracks, users, positions, departments, generateAccessLink } = useStore()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  const [dialogAction, setDialogAction] = useState<'assign' | 'remove' | 'update' | 'mentor' | null>(null)

  const filteredEmployees = employees.filter((employee) => {
    if (statusFilter === 'all') return true
    return employee.adaptationStatus === statusFilter
  })

  const handleAction = (employeeId: string, action: 'assign' | 'remove' | 'update' | 'mentor') => {
    setSelectedEmployeeId(employeeId)
    setDialogAction(action)
  }

  const handleCloseDialog = () => {
    setSelectedEmployeeId(null)
    setDialogAction(null)
  }

  const handleGetAccessLink = async (employeeId: string) => {
    try {
      const link = await generateAccessLink(employeeId)
      await navigator.clipboard.writeText(link)
      toast.success('Ссылка скопирована в буфер обмена')
    } catch (error) {
      console.error('Failed to copy access link:', error)
      toast.error('Не удалось скопировать ссылку')
    }
  }
  
  const selectedEmployee = selectedEmployeeId 
    ? employees.find(e => e.id === selectedEmployeeId) 
    : null

  // Helper function to get position name by ID
  const getPositionName = (positionId: string) => {
    const position = positions.find(p => p.id === positionId)
    return position?.name || 'Unknown'
  }

  // Helper function to get department name by ID
  const getDepartmentName = (departmentId: string) => {
    const department = departments.find(d => d.id === departmentId)
    return department?.name || 'Unknown'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Сотрудники</h2>
        <div className="flex items-center space-x-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Фильтр по статусу" />
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
              <th className="px-4 py-3 text-left text-sm font-medium">Наставник</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => {
              const assignedTrack = tracks.find((t) => t.id === employee.assignedTrackId)
              const mentor = employee.mentorId 
                ? users.find(u => u.id === employee.mentorId) 
                : null
              return (
                <tr key={employee.id} className="border-b">
                  <td className="px-4 py-3 text-sm">{employee.fullName}</td>
                  <td className="px-4 py-3 text-sm">{getPositionName(employee.positionId)}</td>
                  <td className="px-4 py-3 text-sm">{getDepartmentName(employee.departmentId)}</td>
                  <td className="px-4 py-3 text-sm">
                    <AdaptationStatus status={employee.adaptationStatus} />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {assignedTrack ? assignedTrack.title : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {mentor ? mentor.name : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGetAccessLink(employee.id)}
                        title="Получить ссылку для сотрудника"
                      >
                        <Link className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          handleAction(employee.id, 'mentor')
                        }}
                        title="Назначить наставника"
                      >
                        <User className="h-4 w-4" />
                      </Button>
                      {!employee.assignedTrackId ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(employee.id, 'assign')}
                          title="Назначить трек"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Назначить трек
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction(employee.id, 'update')}
                            title="Обновить трек"
                          >
                            Обновить
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleAction(employee.id, 'remove')}
                            title="Удалить трек"
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
      
      {selectedEmployeeId && dialogAction === 'mentor' && selectedEmployee && (
        <AssignMentor
          employee={selectedEmployee}
          open={true}
          onOpenChange={handleCloseDialog}
        />
      )}
    </div>
  )
} 