import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UsersManagement } from '@/components/management/users-management'
import { PositionsManagement } from '@/components/management/positions-management'
import { DepartmentsManagement } from '@/components/management/departments-management'

export function ManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Управление компанией</h1>
        <p className="text-muted-foreground">
          Управление пользователями и справочниками
        </p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="users">Пользователи</TabsTrigger>
          <TabsTrigger value="positions">Должности</TabsTrigger>
          <TabsTrigger value="departments">Подразделения</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UsersManagement />
        </TabsContent>
        <TabsContent value="positions">
          <PositionsManagement />
        </TabsContent>
        <TabsContent value="departments">
          <DepartmentsManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
} 