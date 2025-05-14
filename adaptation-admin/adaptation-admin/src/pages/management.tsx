import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UsersManagement } from '@/components/management/users-management'
import { PositionsManagement } from '@/components/management/positions-management'
import { DepartmentsManagement } from '@/components/management/departments-management'
import { CompanySettings } from '@/components/management/company-settings'

export function ManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Управление компанией</h1>
        <p className="text-muted-foreground">
          Управление пользователями, справочниками и настройками компании
        </p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid grid-cols-4 max-w-2xl">
          <TabsTrigger value="users">Пользователи</TabsTrigger>
          <TabsTrigger value="positions">Должности</TabsTrigger>
          <TabsTrigger value="departments">Подразделения</TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
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
        <TabsContent value="settings">
          <CompanySettings />
        </TabsContent>
      </Tabs>
    </div>
  )
} 