import { useEffect, useState } from 'react'
import { CompanyProfile, SubscriptionPlan, PlanType } from '@/types'
import { getPlanById } from '@/data/subscriptionPlans'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StarIcon, CheckCircle, XCircle, CrownIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { SubscriptionPlanCard } from '@/components/subscription-plan-card'
import { subscriptionPlans } from '@/data/subscriptionPlans'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import apiClient from '@/lib/api'

interface CompanyPlanInfoProps {
  company: CompanyProfile
  onPlanChange?: (planId: PlanType) => void
}

export function CompanyPlanInfo({ company, onPlanChange }: CompanyPlanInfoProps) {
  const [plan, setPlan] = useState<SubscriptionPlan | undefined>(getPlanById(company.plan || 'free'))
  const [isChangePlanDialogOpen, setIsChangePlanDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(company.plan || 'free')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    setPlan(getPlanById(company.plan || 'free'))
  }, [company.plan])

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan.id)
  }

  const handleChangePlan = async () => {
    if (!onPlanChange || selectedPlan === company.plan) {
      setIsChangePlanDialogOpen(false)
      return
    }

    try {
      setIsUpdating(true)
      await apiClient.updateCompanyProfile(company.id, { plan: selectedPlan })
      onPlanChange(selectedPlan)
      setIsChangePlanDialogOpen(false)
    } catch (error) {
      console.error('Error updating plan:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getBgGradient = () => {
    switch (plan?.id) {
      case 'free': return 'bg-gradient-to-br from-gray-50 to-gray-100'
      case 'pro': return 'bg-gradient-to-br from-indigo-50 to-indigo-100'
      case 'business': return 'bg-gradient-to-br from-purple-50 to-purple-100'
      default: return 'bg-gradient-to-br from-gray-50 to-gray-100'
    }
  }

  const getBorderColor = () => {
    switch (plan?.id) {
      case 'free': return 'border-gray-200'
      case 'pro': return 'border-indigo-200'
      case 'business': return 'border-purple-200'
      default: return 'border-gray-200'
    }
  }

  const getBadgeColor = () => {
    switch (plan?.id) {
      case 'free': return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
      case 'pro': return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100'
      case 'business': return 'bg-purple-100 text-purple-800 hover:bg-purple-100'
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    }
  }

  const getIconColor = () => {
    switch (plan?.id) {
      case 'free': return 'text-gray-500'
      case 'pro': return 'text-indigo-500'
      case 'business': return 'text-purple-500'
      default: return 'text-gray-500'
    }
  }

  const getPlanIcon = () => {
    switch (plan?.id) {
      case 'free': return <StarIcon className={cn("h-5 w-5", getIconColor())} />
      case 'pro': return <StarIcon className={cn("h-5 w-5 fill-indigo-500", getIconColor())} />
      case 'business': return <CrownIcon className={cn("h-5 w-5", getIconColor())} />
      default: return <StarIcon className={cn("h-5 w-5", getIconColor())} />
    }
  }

  return (
    <>
      <Card className={cn("border", getBorderColor())}>
        <CardHeader className={cn("pb-2", getBgGradient())}>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">Тарифный план</CardTitle>
            <Badge variant="secondary" className={getBadgeColor()}>
              {getPlanIcon()}
              <span className="ml-1">{plan?.name || 'Базовый'}</span>
            </Badge>
          </div>
          <CardDescription>
            Информация о текущем тарифном плане и его возможностях
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Сотрудники</span>
              <span className="text-sm">
                {plan?.maxEmployees === -1 ? 'Без ограничений' : `До ${plan?.maxEmployees} сотрудников`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Треки адаптации</span>
              <span className="text-sm">
                {plan?.maxTracks === -1 ? 'Без ограничений' : `До ${plan?.maxTracks} треков`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Наставники</span>
              <span className="text-sm">
                {plan?.maxMentors === -1 ? 'Без ограничений' : `До ${plan?.maxMentors} наставников`}
              </span>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium text-sm mb-2">Включенные возможности:</h4>
              <ul className="space-y-2">
                {plan?.features.slice(0, 4).map((feature, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
                {plan?.features && plan.features.length > 4 && (
                  <li className="text-sm text-indigo-600 font-medium">
                    +{plan.features.length - 4} других возможностей
                  </li>
                )}
              </ul>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full mt-2" 
              onClick={() => setIsChangePlanDialogOpen(true)}
            >
              Изменить тарифный план
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isChangePlanDialogOpen} onOpenChange={setIsChangePlanDialogOpen}>
        <DialogContent className="sm:max-w-[1200px] max-w-[95vw] backdrop-blur-xl bg-white/90 border border-indigo-100 dark:bg-gray-900/90 dark:border-indigo-900">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Выбор тарифного плана
            </DialogTitle>
            <DialogDescription>
              Выберите подходящий тарифный план для вашей компании.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="cards" className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="cards" className="flex-1">Карточки</TabsTrigger>
              <TabsTrigger value="compare" className="flex-1">Сравнение</TabsTrigger>
            </TabsList>
            
            <TabsContent value="cards">
              <div className="grid grid-cols-3 gap-10 px-4 py-2">
                {subscriptionPlans.map((plan) => (
                  <SubscriptionPlanCard
                    key={plan.id}
                    plan={plan}
                    isSelected={selectedPlan === plan.id}
                    onSelect={handleSelectPlan}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="compare">
              <div className="border rounded-lg overflow-hidden px-4 py-2">
                <table className="w-full table-fixed">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-300 w-[30%]">Функция</th>
                      {subscriptionPlans.map(plan => (
                        <th key={plan.id} className="text-center p-4 text-sm font-medium text-gray-500 dark:text-gray-300 w-[23.33%]">
                          <div className="flex flex-col items-center">
                            <span className={`text-lg font-bold ${plan.id === 'free' ? 'text-gray-700' : plan.id === 'pro' ? 'text-indigo-600' : 'text-purple-600'} dark:text-white`}>
                              {plan.name}
                            </span>
                            <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {plan.price === 0 ? 'Бесплатно' : `${plan.price.toLocaleString('ru-RU')} ₽/мес`}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t dark:border-gray-700">
                      <td className="p-4 text-sm">Сотрудники</td>
                      {subscriptionPlans.map(plan => (
                        <td key={plan.id} className="p-4 text-sm text-center">
                          {plan.maxEmployees === -1 ? 'Неограниченно' : `До ${plan.maxEmployees}`}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t dark:border-gray-700">
                      <td className="p-4 text-sm">Треки адаптации</td>
                      {subscriptionPlans.map(plan => (
                        <td key={plan.id} className="p-4 text-sm text-center">
                          {plan.maxTracks === -1 ? 'Неограниченно' : `До ${plan.maxTracks}`}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t dark:border-gray-700">
                      <td className="p-4 text-sm">Наставники</td>
                      {subscriptionPlans.map(plan => (
                        <td key={plan.id} className="p-4 text-sm text-center">
                          {plan.maxMentors === -1 ? 'Неограниченно' : `До ${plan.maxMentors}`}
                        </td>
                      ))}
                    </tr>
                    
                    {/* Динамические возможности */}
                    {Array.from(new Set(subscriptionPlans.flatMap(p => p.features))).map((feature, idx) => (
                      <tr key={idx} className="border-t dark:border-gray-700">
                        <td className="p-4 text-sm">{feature}</td>
                        {subscriptionPlans.map(plan => (
                          <td key={plan.id} className="p-4 text-sm text-center">
                            {plan.features.includes(feature) ? (
                              <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-300 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsChangePlanDialogOpen(false)}
              className="sm:order-1 border-gray-300"
            >
              Отмена
            </Button>
            <Button 
              onClick={handleChangePlan}
              disabled={isUpdating || selectedPlan === company.plan}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white sm:order-2"
            >
              {isUpdating && (
                <div className="inline-block animate-spin h-4 w-4 mr-2 border-t-2 border-white rounded-full" />
              )}
              {selectedPlan === company.plan ? 'План уже выбран' : 'Изменить план'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 