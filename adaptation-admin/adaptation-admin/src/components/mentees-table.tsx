import { useStore } from '@/store'
import { Employee } from '@/types'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { 
  Eye, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle 
} from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface MenteesTableProps {
  mentees: Employee[]
  onSelect: (employeeId: string) => void
}

export function MenteesTable({ mentees, onSelect }: MenteesTableProps) {
  const { tracks } = useStore()
  
  // Функция для получения статуса адаптации в виде компонента
  const renderAdaptationStatus = (status: string) => {
    switch(status) {
      case 'not_started':
        return (
          <div className="flex items-center text-muted-foreground">
            <Clock className="w-4 h-4 mr-1" />
            <span>Не начата</span>
          </div>
        )
      case 'in_progress':
        return (
          <div className="flex items-center text-blue-500">
            <AlertCircle className="w-4 h-4 mr-1" />
            <span>В процессе</span>
          </div>
        )
      case 'completed':
        return (
          <div className="flex items-center text-green-500">
            <CheckCircle className="w-4 h-4 mr-1" />
            <span>Завершена</span>
          </div>
        )
      default:
        return null
    }
  }
  
  // Функция для получения прогресса адаптации
  const getAdaptationProgress = (employee: Employee) => {
    if (!employee.assignedTrackId || !employee.stepProgress) {
      return 0
    }
    
    const track = tracks.find(t => t.id === employee.assignedTrackId)
    if (!track) return 0
    
    // Считаем общее количество шагов в треке
    let totalSteps = 0
    track.milestones.forEach(milestone => {
      totalSteps += milestone.steps.length
    })
    
    // Считаем количество завершенных шагов
    const completedSteps = Object.values(employee.stepProgress).filter(
      step => step.completed
    ).length
    
    return totalSteps ? Math.round((completedSteps / totalSteps) * 100) : 0
  }
  
  const getTrackName = (trackId: string | undefined) => {
    if (!trackId) return 'Не назначен'
    const track = tracks.find(t => t.id === trackId)
    return track ? track.title : 'Неизвестный трек'
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Сотрудник</TableHead>
            <TableHead>Должность</TableHead>
            <TableHead>Трек адаптации</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Прогресс</TableHead>
            <TableHead>Дата начала</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mentees.map((mentee) => (
            <TableRow key={mentee.id}>
              <TableCell className="font-medium">{mentee.fullName}</TableCell>
              <TableCell>{mentee.position}</TableCell>
              <TableCell>{getTrackName(mentee.assignedTrackId)}</TableCell>
              <TableCell>
                {renderAdaptationStatus(mentee.adaptationStatus)}
              </TableCell>
              <TableCell>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{ width: `${getAdaptationProgress(mentee)}%` }}
                  ></div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {getAdaptationProgress(mentee)}%
                </span>
              </TableCell>
              <TableCell>
                {mentee.startDate ? (
                  format(new Date(mentee.startDate), 'dd MMM yyyy', { locale: ru })
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelect(mentee.id)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Детали
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 