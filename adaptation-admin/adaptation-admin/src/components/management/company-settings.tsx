import { useState, useEffect } from 'react'
import { useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CompanyPlanInfo } from '@/components/company-plan-info'
import { PlanType } from '@/types'
import apiClient from '@/lib/api'
import { toast } from 'sonner'
import { InfoIcon, Loader2 } from 'lucide-react'

export function CompanySettings() {
  const { currentCompanyProfile, setCurrentCompanyProfile } = useStore()
  const [companyName, setCompanyName] = useState('')
  const [companyDescription, setCompanyDescription] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)

  useEffect(() => {
    if (currentCompanyProfile) {
      setCompanyName(currentCompanyProfile.name || '')
      setCompanyDescription(currentCompanyProfile.description || '')
      setInitialLoad(false)
    }
  }, [currentCompanyProfile])

  const handleUpdateCompanyInfo = async () => {
    if (!currentCompanyProfile || !companyName.trim()) return

    try {
      setIsUpdating(true)
      const updatedCompany = await apiClient.updateCompanyProfile(currentCompanyProfile.id, {
        name: companyName.trim(),
        description: companyDescription.trim() || undefined,
      })

      setCurrentCompanyProfile(updatedCompany)
      toast.success('Информация о компании обновлена')
    } catch (error) {
      console.error('Error updating company info:', error)
      toast.error('Ошибка при обновлении информации о компании')
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePlanChange = (planId: PlanType) => {
    if (currentCompanyProfile) {
      setCurrentCompanyProfile({
        ...currentCompanyProfile,
        plan: planId
      })
      toast.success('Тарифный план обновлен')
    }
  }

  if (!currentCompanyProfile || initialLoad) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
          <CardDescription>
            Настройте основную информацию о вашей компании
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Название компании</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Введите название компании"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="companyDescription">Описание компании</Label>
            <Textarea
              id="companyDescription"
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              placeholder="Добавьте описание компании (необязательно)"
              rows={3}
            />
          </div>

          <div className="pt-2">
            <Button 
              onClick={handleUpdateCompanyInfo} 
              disabled={isUpdating || !companyName.trim()} 
              className="w-full sm:w-auto"
            >
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Сохранить изменения
            </Button>
          </div>
        </CardContent>
      </Card>

      <CompanyPlanInfo company={currentCompanyProfile} onPlanChange={handlePlanChange} />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Рекомендации</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
            <div className="flex">
              <div className="flex-shrink-0">
                <InfoIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Поддерживайте актуальность информации о компании. Это поможет вашим сотрудникам лучше понимать корпоративную культуру и ценности.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 