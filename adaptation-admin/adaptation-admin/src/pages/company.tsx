import { useState, useEffect } from 'react'
import { useStore } from '@/store/index'
import apiClient from '@/lib/api'
import { CompanyProfile, PlanType } from '@/types'
import { Button } from '@/components/ui/button'
import { Plus, Settings } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UsersTable } from '@/components/users-table'
import { PositionsTable } from '@/components/positions-table'
import { DepartmentsTable } from '@/components/departments-table'
import { CompanyPlanInfo } from '@/components/company-plan-info'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function CompanyPage() {
  const [activeTab, setActiveTab] = useState('users')
  const { currentCompanyProfile, setCurrentCompanyProfile } = useStore()
  const [companyDetails, setCompanyDetails] = useState<CompanyProfile | null>(currentCompanyProfile)
  const [isEditingDetails, setIsEditingDetails] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    industry: '',
    size: 'small' as CompanyProfile['size'],
  })

  useEffect(() => {
    if (currentCompanyProfile) {
      setCompanyDetails(currentCompanyProfile)
      setEditForm({
        name: currentCompanyProfile.name || '',
        description: currentCompanyProfile.description || '',
        industry: currentCompanyProfile.industry || '',
        size: currentCompanyProfile.size || 'small',
      })
    }
  }, [currentCompanyProfile])

  const handlePlanChange = async (planId: PlanType) => {
    if (currentCompanyProfile && companyDetails) {
      try {
        const updatedCompany = {
          ...companyDetails,
          plan: planId,
        }
        setCompanyDetails(updatedCompany)
        setCurrentCompanyProfile(updatedCompany)
      } catch (error) {
        console.error('Error updating company plan:', error)
      }
    }
  }

  const handleEditDetails = () => {
    setIsEditingDetails(true)
  }

  const handleCancelEdit = () => {
    if (currentCompanyProfile) {
      setEditForm({
        name: currentCompanyProfile.name || '',
        description: currentCompanyProfile.description || '',
        industry: currentCompanyProfile.industry || '',
        size: currentCompanyProfile.size || 'small',
      })
    }
    setIsEditingDetails(false)
  }

  const handleSaveDetails = async () => {
    if (!currentCompanyProfile) return

    try {
      setIsUpdating(true)
      const updatedCompany = await apiClient.updateCompanyProfile(currentCompanyProfile.id, {
        name: editForm.name,
        description: editForm.description,
        industry: editForm.industry,
        size: editForm.size,
      })

      setCompanyDetails(updatedCompany)
      setCurrentCompanyProfile(updatedCompany)
      setIsEditingDetails(false)
    } catch (error) {
      console.error('Error updating company details:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

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
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            <span>Настройки</span>
          </TabsTrigger>
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

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Информация о компании</CardTitle>
                      <CardDescription>
                        Основные данные вашей компании
                      </CardDescription>
                    </div>
                    {!isEditingDetails ? (
                      <Button variant="outline" onClick={handleEditDetails}>
                        Редактировать
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={handleCancelEdit}>
                          Отмена
                        </Button>
                        <Button onClick={handleSaveDetails} disabled={isUpdating}>
                          {isUpdating && (
                            <div className="inline-block animate-spin h-4 w-4 mr-2 border-t-2 border-current rounded-full" />
                          )}
                          Сохранить
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {!isEditingDetails ? (
                    <dl className="space-y-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Название</dt>
                        <dd className="mt-1 text-sm">{companyDetails?.name}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Отрасль</dt>
                        <dd className="mt-1 text-sm">{companyDetails?.industry || 'Не указано'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Размер</dt>
                        <dd className="mt-1 text-sm">
                          {companyDetails?.size === 'small' && 'Малый (до 50 сотрудников)'}
                          {companyDetails?.size === 'medium' && 'Средний (50-250 сотрудников)'}
                          {companyDetails?.size === 'large' && 'Крупный (250-1000 сотрудников)'}
                          {companyDetails?.size === 'enterprise' && 'Корпорация (1000+ сотрудников)'}
                          {!companyDetails?.size && 'Не указано'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Описание</dt>
                        <dd className="mt-1 text-sm whitespace-pre-line">
                          {companyDetails?.description || 'Описание не добавлено'}
                        </dd>
                      </div>
                    </dl>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="company-name">Название компании</Label>
                        <Input
                          id="company-name"
                          value={editForm.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="company-industry">Отрасль</Label>
                        <Input
                          id="company-industry"
                          value={editForm.industry}
                          onChange={(e) => handleInputChange('industry', e.target.value)}
                          placeholder="IT, Финансы, Ритейл и т.д."
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="company-size">Размер компании</Label>
                        <Select
                          value={editForm.size}
                          onValueChange={(value) => handleInputChange('size', value)}
                        >
                          <SelectTrigger id="company-size">
                            <SelectValue placeholder="Выберите размер компании" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Малый (до 50 сотрудников)</SelectItem>
                            <SelectItem value="medium">Средний (50-250 сотрудников)</SelectItem>
                            <SelectItem value="large">Крупный (250-1000 сотрудников)</SelectItem>
                            <SelectItem value="enterprise">Корпорация (1000+ сотрудников)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="company-description">Описание</Label>
                        <Textarea
                          id="company-description"
                          value={editForm.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder="Краткое описание вашей компании"
                          rows={4}
                          className="resize-none"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              {companyDetails && (
                <CompanyPlanInfo
                  company={companyDetails}
                  onPlanChange={handlePlanChange}
                />
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 