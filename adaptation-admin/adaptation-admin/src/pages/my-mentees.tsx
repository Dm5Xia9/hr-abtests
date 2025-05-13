import { useState } from 'react'
import { useStore } from '@/store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MenteesTable } from '@/components/mentees-table'
import { MenteeDetails } from '@/components/mentee-details'
import { Button } from '@/components/ui/button'
import { Users, UserCheck } from 'lucide-react'

export function MyMenteesPage() {
  const { employees, users } = useStore()
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  
  // В реальном приложении id текущего пользователя должен приходить из AuthContext
  // Для примера используем фиксированный ID пользователя
  const currentUserId = '2' // Иван Петров (менеджер)
  
  // Находим всех сотрудников, для которых текущий пользователь является ментором
  const myMentees = employees.filter(employee => employee.mentorId === currentUserId)
  
  const selectedEmployee = selectedEmployeeId 
    ? employees.find(employee => employee.id === selectedEmployeeId)
    : null
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Мои подопечные</h1>
          <p className="text-muted-foreground">
            Управление сотрудниками, для которых вы назначены ментором
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="bg-muted px-3 py-1 rounded-md text-sm flex items-center">
            <UserCheck className="w-4 h-4 mr-2" />
            <span>{myMentees.length} подопечных</span>
          </div>
        </div>
      </div>
      
      {myMentees.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>У вас пока нет подопечных</CardTitle>
            <CardDescription>
              Когда вас назначат ментором какого-либо сотрудника, вы увидите его здесь
            </CardDescription>
          </CardHeader>
        </Card>
      ) : selectedEmployee ? (
        <div className="space-y-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedEmployeeId(null)}
          >
            ← Вернуться к списку
          </Button>
          <MenteeDetails employee={selectedEmployee} />
        </div>
      ) : (
        <MenteesTable 
          mentees={myMentees} 
          onSelect={(employeeId) => setSelectedEmployeeId(employeeId)} 
        />
      )}
    </div>
  )
} 