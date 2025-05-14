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
  AlertCircle,
  ChevronRight,
  Briefcase,
  BookOpen,
  Building
} from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface MenteesTableProps {
  mentees: Employee[]
  onSelect: (employeeId: string) => void
}

export function MenteesTable({ mentees, onSelect }: MenteesTableProps) {
  const { tracks, positions, departments } = useStore()
  
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
  
  // Функция для получения статуса в виде бейджа
  const renderStatusBadge = (status: string) => {
    switch(status) {
      case 'not_started':
        return (
          <Badge variant="outline" className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Не начата
          </Badge>
        )
      case 'in_progress':
        return (
          <Badge className="bg-blue-500 flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            В процессе
          </Badge>
        )
      case 'completed':
        return (
          <Badge className="bg-green-500 flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            Завершена
          </Badge>
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
    track.milestones.forEach((milestone: any) => {
      if (milestone.steps && Array.isArray(milestone.steps)) {
        totalSteps += milestone.steps.length
      }
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
  
  // Helper function to get position name by ID
  const getPositionName = (positionId: string | undefined) => {
    if (!positionId) return 'Неизвестная должность'
    const position = positions.find(p => p.id === positionId)
    return position ? position.name : 'Неизвестная должность'
  }
  
  // Helper function to get department name by ID
  const getDepartmentName = (departmentId: string | undefined) => {
    if (!departmentId) return 'Неизвестный отдел'
    const department = departments.find(d => d.id === departmentId)
    return department ? department.name : 'Неизвестный отдел'
  }
  
  return (
    <>
      {/* Мобильная версия - карточки */}
      <div className="space-y-4 md:hidden">
        {mentees.map((mentee) => (
          <Card 
            key={mentee.id} 
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => onSelect(mentee.id)}
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-medium">{mentee.fullName}</h3>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center text-sm">
                  <Briefcase className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-muted-foreground">Должность:</span>
                </div>
                <div className="text-sm">{getPositionName(mentee.positionId)}</div>
                
                <div className="flex items-center text-sm">
                  <Building className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-muted-foreground">Отдел:</span>
                </div>
                <div className="text-sm">{getDepartmentName(mentee.departmentId)}</div>
                
                <div className="flex items-center text-sm">
                  <BookOpen className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-muted-foreground">Трек:</span>
                </div>
                <div className="text-sm">{getTrackName(mentee.assignedTrackId)}</div>
              </div>
              
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Статус:</span>
                  {renderStatusBadge(mentee.adaptationStatus)}
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Прогресс:</span>
                    <span className="text-sm font-medium">{getAdaptationProgress(mentee)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${getAdaptationProgress(mentee)}%` }}
                    ></div>
                  </div>
                </div>
                
                {mentee.startDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Дата начала:</span>
                    <div className="text-sm flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                      {format(new Date(mentee.startDate), 'dd MMM yyyy', { locale: ru })}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Десктопная версия - таблица */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Сотрудник</TableHead>
              <TableHead>Должность</TableHead>
              <TableHead>Отдел</TableHead>
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
                <TableCell>{getPositionName(mentee.positionId)}</TableCell>
                <TableCell>{getDepartmentName(mentee.departmentId)}</TableCell>
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
    </>
  )
} 