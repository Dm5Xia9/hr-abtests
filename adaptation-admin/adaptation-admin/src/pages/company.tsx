import { useState } from 'react'
import { useStore } from '@/store/index'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UsersTable } from '@/components/users-table'
import { PositionsTable } from '@/components/positions-table'
import { DepartmentsTable } from '@/components/departments-table'

export function CompanyPage() {
  const [activeTab, setActiveTab] = useState('users')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Управление компанией</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users">Пользователи</TabsTrigger>
          <TabsTrigger value="positions">Должности</TabsTrigger>
          <TabsTrigger value="departments">Подразделения</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => {}}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить пользователя
            </Button>
          </div>
          <UsersTable />
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => {}}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить должность
            </Button>
          </div>
          <PositionsTable />
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => {}}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить подразделение
            </Button>
          </div>
          <DepartmentsTable />
        </TabsContent>
      </Tabs>
    </div>
  )
} 