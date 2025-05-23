import { useState } from 'react'
import { useStore } from '@/store'
import { Employee } from '@/types'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  Circle, 
  Check, 
  X, 
  FileText, 
  Calendar, 
  Mail, 
  Phone, 
  Clock,
  Building,
  User,
  CheckCircle2
} from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface MenteeDetailsProps {
  employee: Employee
}

export function MenteeDetails({ employee }: MenteeDetailsProps) {
  const { tracks, updateStepProgress, employees, positions, departments } = useStore()
  const [activeTab, setActiveTab] = useState('info')
  
  const track = employee.assignedTrackId 
    ? tracks.find(t => t.id === employee.assignedTrackId) 
    : null
  
  // Собираем все задачи (встречи) из трека
  const getAllTasks = () => {
    if (!track || !track.milestones) return []
    
    const tasks: Array<{
      id: string
      title: string
      milestoneTitle: string
      step: any
      completed: boolean
      completedAt?: string
    }> = []
    
    track.milestones.forEach((milestone: any) => {
      if (milestone && milestone.steps && Array.isArray(milestone.steps)) {
        milestone.steps.forEach((step: any) => {
          if (step && step.type === 'task') {
            const taskStep: any = step
            const stepProgress = employee.stepProgress?.[step.id]
            
            tasks.push({
              id: step.id,
              title: step.title,
              milestoneTitle: milestone.title,
              step: taskStep,
              completed: stepProgress?.completed || false,
              completedAt: stepProgress?.completedAt
            })
          }
        })
      }
    })
    
    return tasks
  }
  
  // Получаем ответы сотрудника на опросы
  const getSurveyAnswers = () => {
    if (!track || !track.milestones || !employee.stepProgress) return []
    
    const answers: Array<{
      stepId: string
      stepTitle: string
      milestoneTitle: string
      answers: Record<string, string>
    }> = []
    
    track.milestones.forEach((milestone: any) => {
      if (milestone && milestone.steps && Array.isArray(milestone.steps)) {
        milestone.steps.forEach((step: any) => {
          if (step && step.type === 'survey' && 
              employee.stepProgress?.[step.id]?.completed && 
              employee.stepProgress[step.id].answers) {
            answers.push({
              stepId: step.id,
              stepTitle: step.title,
              milestoneTitle: milestone.title,
              answers: employee.stepProgress[step.id].answers || {}
            })
          }
        })
      }
    })
    
    return answers
  }
  
  // Отметить задачу как выполненную
  const markTaskCompleted = async (taskId: string) => {
    try {
      await updateStepProgress(employee.id, taskId, true);
    } catch (error) {
      console.error('Error marking task as completed:', error);
    }
  }
  
  // Отметить задачу как не выполненную
  const markTaskIncomplete = async (taskId: string) => {
    try {
      await updateStepProgress(employee.id, taskId, false);
    } catch (error) {
      console.error('Error marking task as incomplete:', error);
    }
  }
  
  // Получаем текущий прогресс
  const getCurrentProgress = () => {
    if (!track || !track.milestones || !employee.stepProgress) return { completed: 0, total: 0 }
    
    let totalSteps = 0
    track.milestones.forEach((milestone: any) => {
      if (milestone && milestone.steps && Array.isArray(milestone.steps)) {
        totalSteps += milestone.steps.length
      }
    })
    
    const completedSteps = Object.values(employee.stepProgress).filter(
      step => step.completed
    ).length
    
    return { 
      completed: completedSteps, 
      total: totalSteps,
      percent: totalSteps ? Math.round((completedSteps / totalSteps) * 100) : 0
    }
  }
  
  // Получаем информацию о прохождении шагов
  const getStepsProgress = () => {
    if (!track || !track.milestones) return []
    
    const stepsProgress: Array<{
      id: string
      title: string
      type: string
      milestoneId: string
      milestoneTitle: string
      completed: boolean
      completedAt?: string
      timeToComplete?: string
    }> = []
    
    track.milestones.forEach((milestone: any) => {
      if (milestone && milestone.steps && Array.isArray(milestone.steps)) {
        milestone.steps.forEach((step: any) => {
          if (step) {
            const stepProgress = employee.stepProgress?.[step.id]
            const timeToComplete = getTimeToComplete(step.id)
            
            stepsProgress.push({
              id: step.id,
              title: step.title,
              type: step.type,
              milestoneId: milestone.id,
              milestoneTitle: milestone.title,
              completed: stepProgress?.completed || false,
              completedAt: stepProgress?.completedAt,
              timeToComplete
            })
          }
        })
      }
    })
    
    return stepsProgress
  }
  
  // Рассчитываем время прохождения шага
  const getTimeToComplete = (stepId: string) => {
    const stepProgress = employee.stepProgress?.[stepId]
    if (!stepProgress || !stepProgress.completed || !stepProgress.startedAt || !stepProgress.completedAt) {
      return undefined
    }
    
    try {
      const startDate = new Date(stepProgress.startedAt)
      const completionDate = new Date(stepProgress.completedAt)
      
      const diffTime = Math.abs(completionDate.getTime() - startDate.getTime())
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) {
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
        if (diffHours === 0) {
          const diffMinutes = Math.floor(diffTime / (1000 * 60))
          return `${diffMinutes} мин.`
        }
        return `${diffHours} ч.`
      }
      return `${diffDays} д.`
    } catch (error) {
      console.error('Error calculating time to complete:', error)
      return undefined
    }
  }
  
  const tasks = getAllTasks()
  const surveyAnswers = getSurveyAnswers()
  const progress = getCurrentProgress()
  const stepsProgress = getStepsProgress()
  
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
    <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-4 w-full flex flex-wrap sm:flex-nowrap">
        <TabsTrigger value="info" className="flex-1">Информация</TabsTrigger>
        <TabsTrigger value="tasks" className="flex-1">Задачи</TabsTrigger>
        <TabsTrigger value="results" className="flex-1">Результаты</TabsTrigger>
        <TabsTrigger value="progress" className="flex-1">Прогресс</TabsTrigger>
      </TabsList>
      
      <TabsContent value="info">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Личная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">ФИО</div>
                  <div className="font-medium flex items-center">
                    <User className="w-4 h-4 mr-2 text-muted-foreground" />
                    {employee.fullName}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Должность</div>
                  <div className="font-medium flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-muted-foreground" />
                    {getPositionName(employee.positionId)}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Подразделение</div>
                  <div className="font-medium flex items-center">
                    <Building className="w-4 h-4 mr-2 text-muted-foreground" />
                    {getDepartmentName(employee.departmentId)}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Дата приема</div>
                  <div className="font-medium flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                    {format(new Date(employee.hireDate), 'dd MMMM yyyy', { locale: ru })}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Электронная почта</div>
                  <div className="font-medium flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                    {employee.email}
                  </div>
                </div>
                
                {employee.phone && (
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Телефон</div>
                    <div className="font-medium flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                      {employee.phone}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Адаптация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Статус</div>
                <div className="font-medium">
                  {employee.adaptationStatus === 'not_started' && (
                    <Badge variant="outline" className="flex items-center w-fit">
                      <Clock className="w-3 h-3 mr-1" />
                      Не начата
                    </Badge>
                  )}
                  {employee.adaptationStatus === 'in_progress' && (
                    <Badge className="bg-blue-500 flex items-center w-fit">
                      <Circle className="w-3 h-3 mr-1 animate-pulse" />
                      В процессе
                    </Badge>
                  )}
                  {employee.adaptationStatus === 'completed' && (
                    <Badge className="bg-green-500 flex items-center w-fit">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Завершена
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Трек адаптации</div>
                <div className="font-medium">
                  {track ? track.title : 'Не назначен'}
                </div>
              </div>
              
              {employee.startDate && (
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Дата начала</div>
                  <div className="font-medium">
                    {format(new Date(employee.startDate), 'dd MMMM yyyy', { locale: ru })}
                  </div>
                </div>
              )}
              
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Прогресс</div>
                <div className="font-medium">
                  <div className="w-full bg-muted rounded-full h-2.5 mb-1">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{ width: `${progress.percent}%` }}
                    ></div>
                  </div>
                  <span className="text-xs">
                    {progress.completed} из {progress.total} шагов ({progress.percent}%)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="tasks">
        <Card>
          <CardHeader>
            <CardTitle>Задачи</CardTitle>
            <CardDescription>Все задачи в треке адаптации</CardDescription>
          </CardHeader>
          <CardContent>
            {!track ? (
              <Alert className="mb-4">
                <AlertTitle>Трек не назначен</AlertTitle>
                <AlertDescription>
                  Сотруднику не назначен трек адаптации. Задачи будут отображаться после назначения трека.
                </AlertDescription>
              </Alert>
            ) : tasks.length === 0 ? (
              <Alert className="mb-4">
                <AlertDescription>
                  В треке адаптации нет задач.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {/* Мобильная версия - карточки задач */}
                <div className="space-y-4 md:hidden">
                  {tasks.map(task => (
                    <Card key={task.id} className="overflow-hidden">
                      <div className={`h-2 w-full ${task.completed ? 'bg-green-500' : 'bg-muted'}`}></div>
                      <CardContent className="p-4 space-y-3 mt-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-base font-medium">{task.title}</h3>
                            <p className="text-sm text-muted-foreground">{task.milestoneTitle}</p>
                          </div>
                          {task.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          )}
                        </div>
                        
                        {task.step.content && task.step.content.meeting && (
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>
                              {task.step.content.meeting.date ? (
                                <>
                                  {format(new Date(task.step.content.meeting.date), 'dd MMM yyyy', { locale: ru })},
                                  {' '}{task.step.content.meeting.time}
                                </>
                              ) : (
                                <span className="text-muted-foreground">Дата не указана</span>
                              )}
                            </span>
                          </div>
                        )}

                        {task.completed && task.completedAt && (
                          <div className="text-sm text-muted-foreground">
                            Завершено: {format(new Date(task.completedAt), 'dd MMM yyyy', { locale: ru })}
                          </div>
                        )}
                        
                        <div className="pt-2">
                          {task.completed ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markTaskIncomplete(task.id)}
                              className="w-full"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Отметить как незавершенную
                            </Button>
                          ) : (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => markTaskCompleted(task.id)}
                              className="w-full"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Отметить как выполненную
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* Десктопная версия - таблица */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Статус</TableHead>
                        <TableHead>Задача</TableHead>
                        <TableHead>Этап</TableHead>
                        <TableHead>Дата встречи</TableHead>
                        <TableHead>Дата завершения</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.map(task => (
                        <TableRow key={task.id}>
                          <TableCell>
                            {task.completed ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{task.title}</TableCell>
                          <TableCell>{task.milestoneTitle}</TableCell>
                          <TableCell>
                            {task.step.content && task.step.content.meeting ? (
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                                {task.step.content.meeting.date ? (
                                  <>
                                    {format(new Date(task.step.content.meeting.date), 'dd MMM yyyy', { locale: ru })},
                                    {' '}{task.step.content.meeting.time}
                                  </>
                                ) : (
                                  <span className="text-muted-foreground">Дата не указана</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {task.completed && task.completedAt ? (
                              format(new Date(task.completedAt), 'dd MMM yyyy', { locale: ru })
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {task.completed ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markTaskIncomplete(task.id)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Отметить как незавершенную
                              </Button>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => markTaskCompleted(task.id)}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Отметить как выполненную
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="results">
        <Card>
          <CardHeader>
            <CardTitle>Результаты опросов</CardTitle>
            <CardDescription>Ответы сотрудника на опросы в треке адаптации</CardDescription>
          </CardHeader>
          <CardContent>
            {!track ? (
              <Alert className="mb-4">
                <AlertTitle>Трек не назначен</AlertTitle>
                <AlertDescription>
                  Сотруднику не назначен трек адаптации. Результаты опросов будут отображаться после назначения трека.
                </AlertDescription>
              </Alert>
            ) : surveyAnswers.length === 0 ? (
              <Alert className="mb-4">
                <AlertDescription>
                  Сотрудник еще не заполнил ни одного опроса.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-6">
                {surveyAnswers.map(survey => (
                  <div key={survey.stepId} className="border rounded-lg p-4">
                    <div className="mb-4">
                      <h3 className="text-lg font-medium">{survey.stepTitle}</h3>
                      <p className="text-sm text-muted-foreground">{survey.milestoneTitle}</p>
                    </div>
                    
                    {/* Мобильная версия - список */}
                    <div className="space-y-3 md:hidden">
                      {Object.entries(survey.answers).map(([key, value]) => (
                        <div key={key} className="pb-3 border-b border-muted last:border-0">
                          <div className="font-medium mb-1">{key.replace(/_/g, ' ')}</div>
                          <div className="text-sm">{value}</div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Десктопная версия - таблица */}
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Вопрос</TableHead>
                            <TableHead>Ответ</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(survey.answers).map(([key, value]) => (
                            <TableRow key={key}>
                              <TableCell className="font-medium">
                                {key.replace(/_/g, ' ')}
                              </TableCell>
                              <TableCell>{value}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="progress">
        <Card>
          <CardHeader>
            <CardTitle>Прогресс по треку адаптации</CardTitle>
            <CardDescription>Детальный прогресс по шагам и этапам</CardDescription>
          </CardHeader>
          <CardContent>
            {!track ? (
              <Alert className="mb-4">
                <AlertTitle>Трек не назначен</AlertTitle>
                <AlertDescription>
                  Сотруднику не назначен трек адаптации. Прогресс будет отображаться после назначения трека.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-6">
                {track && track.milestones && Array.isArray(track.milestones) ? track.milestones.map((milestone: any) => (
                  <div key={milestone.id} className="border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">{milestone.title}</h3>
                    
                    <div className="space-y-2">
                      {milestone.steps && Array.isArray(milestone.steps) && milestone.steps.map((step: any) => {
                        const stepData = stepsProgress.find(s => s.id === step.id)
                        const isCompleted = stepData?.completed || false
                        
                        return (
                          <div key={step.id} className="flex flex-col gap-1 p-3 rounded-md hover:bg-muted border-l-4 border-transparent hover:border-primary">
                            <div className="flex items-center gap-2">
                              {isCompleted ? (
                                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                              ) : (
                                <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                              )}
                              <div className="flex-1">
                                <div className="font-medium">{step.title}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <span className="capitalize">{step.type}</span>
                                  {isCompleted && stepData?.completedAt && (
                                    <>
                                      <span className="mx-1">•</span>
                                      <span>Завершено: {format(new Date(stepData.completedAt), 'dd MMM yyyy', { locale: ru })}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              {stepData?.timeToComplete && (
                                <Badge variant="outline" className="ml-auto">
                                  {stepData.timeToComplete}
                                </Badge>
                              )}
                            </div>
                            
                            {isCompleted && !stepData?.timeToComplete && (
                              <div className="ml-7 text-xs text-muted-foreground">
                                Нет данных о времени прохождения
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )) : <Alert className="mb-4"><AlertDescription>Невозможно отобразить прогресс. Структура трека повреждена.</AlertDescription></Alert>}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
} 