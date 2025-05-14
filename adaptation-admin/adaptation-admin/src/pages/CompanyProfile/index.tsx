import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import apiClient from '@/lib/api'
import useApi from '@/hooks/useApi'
import { CompanyProfile, SubscriptionPlan, PlanType } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Building, Plus, ArrowRight, BriefcaseIcon, FactoryIcon, UsersIcon, Info, CheckCircle, ChevronRight, ArrowLeft } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { SubscriptionPlanCard } from '@/components/subscription-plan-card'
import { subscriptionPlans } from '@/data/subscriptionPlans'
import { Badge } from '@/components/ui/badge'

const CompanyProfilePage = () => {
  const [companyProfiles, setCompanyProfiles] = useState<CompanyProfile[]>([])
  const [isCreatingCompany, setIsCreatingCompany] = useState(false)
  const [companyCreated, setCompanyCreated] = useState<CompanyProfile | null>(null)
  const [isChangingPlan, setIsChangingPlan] = useState(false)
  const [newCompanyForm, setNewCompanyForm] = useState({
    name: '',
    description: '',
    industry: '',
    size: 'small' as CompanyProfile['size'],
    plan: 'free' as PlanType,
  })
  const [isLoading, setIsLoading] = useState(false)
  const { error, setError } = useApi()
  const navigate = useNavigate()
  const { users, setCurrentCompanyProfile } = useStore()
  
  useEffect(() => {
    loadCompanyProfiles()
  }, [])
  
  const loadCompanyProfiles = async () => {
    try {
      setIsLoading(true)
      const profiles = await apiClient.getUserCompanyProfiles()
      setCompanyProfiles(profiles)
      
      // Если есть только один профиль и это не страница выбора компании,
      // автоматически выбираем его
      if (profiles.length === 1 && window.location.pathname !== '/company-profile') {
        handleSelectCompany(profiles[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить профили компаний')
    } finally {
      setIsLoading(false)
    }
  }
  
  const clearCompanyCache = () => {
    // Keep the auth token, but clear the application data cache
    const authToken = localStorage.getItem('auth_token')
    localStorage.clear()
    if (authToken) {
      localStorage.setItem('auth_token', authToken)
    }
  }
  
  const handleSelectCompany = async (companyId: string) => {
    try {
      setIsLoading(true)
      const { companyProfile } = await apiClient.switchCompanyProfile(companyId)
            
      // Clear localStorage cache except auth token
      clearCompanyCache()
      setCurrentCompanyProfile(companyProfile)
      
      navigate('/')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при выборе компании')
      setIsLoading(false)
    }
  }
  
  const handleCreateCompany = async () => {
    try {
      if (!newCompanyForm.name) {
        setError('Укажите название компании')
        return
      }
      
      setIsLoading(true)
      const newCompany = await apiClient.createCompanyProfile({
        name: newCompanyForm.name,
        description: newCompanyForm.description,
        industry: newCompanyForm.industry,
        size: newCompanyForm.size,
        plan: 'free', // Always start with free plan
        ownerId: users[0]?.id,
      } as Omit<CompanyProfile, 'id'>)
      
      setIsCreatingCompany(false)
      setCompanyCreated(newCompany)
      setIsChangingPlan(true)
      
      // Добавляем новую компанию в список 
      setCompanyProfiles(prev => [...prev, newCompany])
      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при создании компании')
      setIsLoading(false)
    }
  }
  
  // Создать и сразу выбрать компанию
  const handleCreateAndSelectCompany = async () => {
    try {
      if (!newCompanyForm.name) {
        setError('Укажите название компании')
        return
      }
      
      setIsLoading(true)
      const newCompany = await apiClient.createCompanyProfile({
        name: newCompanyForm.name,
        description: newCompanyForm.description,
        industry: newCompanyForm.industry,
        size: newCompanyForm.size,
        plan: 'free', // Always start with free plan
        ownerId: users[0]?.id,
      } as Omit<CompanyProfile, 'id'>)
      
      // Выбираем созданную компанию 
      const { companyProfile } = await apiClient.switchCompanyProfile(newCompany.id)
      setCurrentCompanyProfile(companyProfile)
      
      // Clear localStorage cache except auth token
      clearCompanyCache()
      
      // Закрываем диалог и очищаем форму
      setIsCreatingCompany(false)
      setCompanyCreated(newCompany)
      setIsChangingPlan(true)
      setNewCompanyForm({
        name: '',
        description: '',
        industry: '',
        size: 'small',
        plan: 'free',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при создании компании')
      setIsLoading(false)
    }
  }

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setNewCompanyForm(prev => ({
      ...prev,
      plan: plan.id,
    }))
  }

  const handleUpdateCompanyPlan = async () => {
    try {
      if (companyCreated) {
        // Отложенное обновление тарифного плана
        apiClient.updateCompanyProfile(companyCreated.id, { plan: newCompanyForm.plan })
          .then(() => {
            // Обновляем компанию в списке когда обновление завершится
            setCompanyProfiles(prev => prev.map(company => 
              company.id === companyCreated.id 
                ? { ...company, plan: newCompanyForm.plan } 
                : company
            ))
          })
          .catch(err => {
            console.error('Ошибка при обновлении тарифа:', err)
          })
      }
      // Сразу закрываем диалог и переходим на главную
      setIsChangingPlan(false)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при обновлении тарифа')
    }
  }

  const handleSkipPlanSelection = () => {
    setIsChangingPlan(false)
    setCompanyCreated(null)
    navigate('/')
  }

  const handleFormChange = (field: string, value: string) => {
    setNewCompanyForm(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCancelCreation = () => {
    setIsCreatingCompany(false)
    setNewCompanyForm({
      name: '',
      description: '',
      industry: '',
      size: 'small',
      plan: 'free',
    })
  }

  const renderCompanyList = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {companyProfiles.map((company, index) => (
        <motion.div 
          key={company.id}
          whileHover={{ 
            y: -5,
            scale: 1.02,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            "relative overflow-hidden rounded-xl cursor-pointer bg-white dark:bg-gray-800",
            getCompanyCardBorderColor(index)
          )}
          onClick={() => handleSelectCompany(company.id)}
          style={{ 
            background: getCompanyCardBackground(index),
            backdropFilter: 'blur(16px)',
            borderWidth: '1px',
            '--card-gradient': `${getCompanyCardBackground(index % 6)}`,
          } as React.CSSProperties}
        >
          {/* Блики стекла */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/30 to-transparent opacity-20 dark:from-white/10"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-white/10 -mr-32 -mb-32 blur-2xl"></div>
          
          <div className="p-6 relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{company.name}</h3>
                {company.industry && (
                  <p className="text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                    {company.industry}
                  </p>
                )}
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-2 rounded-full bg-white/40 dark:bg-gray-700/60 backdrop-blur-sm">
                    {getCompanySizeIcon(company.size || 'small')}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getCompanySizeLabel(company.size || 'small')}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            <div className="mb-6 min-h-[60px]">
              {company.description ? (
                <p className="text-gray-600 dark:text-gray-300 text-sm">{company.description}</p>
              ) : (
                <p className="text-gray-400 dark:text-gray-500 text-sm italic">Нет описания</p>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-indigo-600 dark:text-indigo-400">
                <ArrowRight className="h-4 w-4 mr-1" />
                <span>Выбрать</span>
              </div>
              
              <div className="flex items-center">
                {/* План компании */}
                {company.plan && (
                  <Badge className={cn(
                    "mr-2",
                    company.plan === 'free' ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200" : 
                    company.plan === 'pro' ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200" :
                    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                  )}>
                    {company.plan === 'free' ? "Базовый" : 
                     company.plan === 'pro' ? "Профессиональный" :
                     "Корпоративный"}
                  </Badge>
                )}
                <div className="flex items-center bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 rounded-full px-3 py-1 text-xs font-medium">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  <span>Готово к работе</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
      
      {/* Карточка для создания новой компании */}
      <motion.div
        whileHover={{ 
          y: -5,
          scale: 1.02,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative overflow-hidden rounded-xl cursor-pointer border border-dashed border-indigo-300 dark:border-indigo-700/70 bg-white/50 dark:bg-gray-800/50"
        onClick={() => setIsCreatingCompany(true)}
        style={{ 
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Блики стекла */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/30 to-transparent opacity-20 dark:from-white/10"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-white/10 -mr-32 -mb-32 blur-2xl"></div>
        
        <div className="p-6 flex flex-col items-center justify-center text-center h-full min-h-[220px] relative z-10">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/60 rounded-full flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">Новая компания</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Создайте новую компанию для работы с другими проектами
          </p>
          <div className="flex items-center text-sm text-indigo-600 dark:text-indigo-400 font-medium">
            <Plus className="h-4 w-4 mr-1" />
            <span>Создать компанию</span>
          </div>
        </div>
      </motion.div>
    </div>
  )

  const renderCompanyCreationForm = () => (
    <motion.div 
      className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            Создание новой компании
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Заполните информацию о вашей компании
          </p>
        </div>
      </div>
      
      <div className="grid gap-5 py-4">
        <div className="grid gap-2">
          <Label htmlFor="company-name" className="font-medium dark:text-gray-200">
            Название компании <span className="text-red-500 dark:text-red-400">*</span>
          </Label>
          <Input
            id="company-name"
            value={newCompanyForm.name}
            onChange={(e) => handleFormChange('name', e.target.value)}
            placeholder="ООО Моя Компания"
            className="border-gray-300 dark:border-gray-600 dark:bg-gray-800/70 dark:placeholder:text-gray-500"
          />
          <p className="text-gray-500 dark:text-gray-400 text-xs">Укажите официальное название вашей компании</p>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="company-industry" className="font-medium dark:text-gray-200">Отрасль</Label>
          <Input
            id="company-industry"
            value={newCompanyForm.industry}
            onChange={(e) => handleFormChange('industry', e.target.value)}
            placeholder="IT, Финансы, Ритейл и т.д."
            className="border-gray-300 dark:border-gray-600 dark:bg-gray-800/70 dark:placeholder:text-gray-500"
          />
          <p className="text-gray-500 dark:text-gray-400 text-xs">Укажите основную отрасль деятельности компании</p>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="company-description" className="font-medium dark:text-gray-200">Описание</Label>
          <Textarea
            id="company-description"
            value={newCompanyForm.description}
            onChange={(e) => handleFormChange('description', e.target.value)}
            placeholder="Краткое описание вашей компании"
            rows={3}
            className="border-gray-300 dark:border-gray-600 dark:bg-gray-800/70 dark:placeholder:text-gray-500 resize-none"
          />
          <p className="text-gray-500 dark:text-gray-400 text-xs">Добавьте краткое описание деятельности компании</p>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="company-size" className="font-medium dark:text-gray-200">Размер компании</Label>
          <Select
            value={newCompanyForm.size}
            onValueChange={(value) => handleFormChange('size', value)}
          >
            <SelectTrigger className="border-gray-300 dark:border-gray-600 dark:bg-gray-800/70">
              <SelectValue placeholder="Выберите размер компании" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Малый (до 50 сотрудников)</SelectItem>
              <SelectItem value="medium">Средний (50-250 сотрудников)</SelectItem>
              <SelectItem value="large">Крупный (250-1000 сотрудников)</SelectItem>
              <SelectItem value="enterprise">Корпорация (1000+ сотрудников)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-gray-500 dark:text-gray-400 text-xs">Выберите примерный размер компании по количеству сотрудников</p>
        </div>
      </div>
      
      <div className="flex flex-col-reverse sm:flex-row justify-between mt-8 gap-4">
        <Button
          variant="outline"
          onClick={handleCancelCreation}
          className="border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад к списку
        </Button>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleCreateCompany}
            disabled={isLoading || !newCompanyForm.name}
            variant="secondary"
            className="w-full sm:w-auto dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            {isLoading && (
              <div className="inline-block animate-spin h-4 w-4 mr-2 border-t-2 border-gray-600 dark:border-gray-300 rounded-full" />
            )}
            Создать
          </Button>
          <Button 
            onClick={handleCreateAndSelectCompany}
            disabled={isLoading || !newCompanyForm.name}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white w-full sm:w-auto dark:from-indigo-500 dark:to-purple-500 dark:hover:from-indigo-600 dark:hover:to-purple-600"
          >
            {isLoading && (
              <div className="inline-block animate-spin h-4 w-4 mr-2 border-t-2 border-white rounded-full" />
            )}
            Создать и выбрать
          </Button>
        </div>
      </div>
    </motion.div>
  )

  const renderPlanSelectionDialog = () => (
    <motion.div 
      className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            Выбор тарифного плана
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Выберите подходящий тарифный план для вашей компании
          </p>
        </div>
      </div>
      
      <div className="py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {subscriptionPlans.map((plan) => (
            <SubscriptionPlanCard
              key={plan.id}
              plan={plan}
              isSelected={newCompanyForm.plan === plan.id}
              onSelect={handleSelectPlan}
            />
          ))}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between mt-8 gap-4">
        <Button
          variant="outline"
          onClick={handleSkipPlanSelection}
          className="border-gray-300 dark:border-gray-600"
        >
          Пропустить
        </Button>
        <Button 
          onClick={handleUpdateCompanyPlan}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white dark:from-indigo-500 dark:to-purple-500 dark:hover:from-indigo-600 dark:hover:to-purple-600"
        >
          Выбрать тариф
        </Button>
      </div>
    </motion.div>
  )

  // Получаем иконку размера компании
  const getCompanySizeIcon = (size: CompanyProfile['size']) => {
    switch (size) {
      case 'small':
        return <BriefcaseIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
      case 'medium':
        return <Building className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />;
      case 'large':
        return <FactoryIcon className="h-5 w-5 text-purple-500 dark:text-purple-400" />;
      case 'enterprise':
        return <UsersIcon className="h-5 w-5 text-amber-500 dark:text-amber-400" />;
      default:
        return <BriefcaseIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
    }
  };

  // Получаем название размера компании
  const getCompanySizeLabel = (size: CompanyProfile['size']) => {
    switch (size) {
      case 'small': return 'Малый (до 50 сотрудников)';
      case 'medium': return 'Средний (50-250 сотрудников)';
      case 'large': return 'Крупный (250-1000 сотрудников)';
      case 'enterprise': return 'Корпорация (1000+ сотрудников)';
      default: return 'Не указан';
    }
  };

  // Генерируем градиентный фон для каждой карточки
  const getCompanyCardBackground = (index: number) => {
    const backgrounds = [
      'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
      'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(217, 70, 239, 0.1) 100%)',
      'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(248, 113, 113, 0.1) 100%)',
      'linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
      'linear-gradient(135deg, rgba(132, 204, 22, 0.1) 0%, rgba(101, 163, 13, 0.1) 100%)',
      'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.1) 100%)',
    ];
    
    // Для темного режима используем другие цвета
    const darkBackgrounds = [
      'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
      'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(217, 70, 239, 0.15) 100%)',
      'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(248, 113, 113, 0.15) 100%)',
      'linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
      'linear-gradient(135deg, rgba(132, 204, 22, 0.15) 0%, rgba(101, 163, 13, 0.15) 100%)',
      'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(234, 88, 12, 0.15) 100%)',
    ];
    
    return `var(--card-gradient, ${backgrounds[index % backgrounds.length]})`; 
  };
  
  // Цвета для границ карточек
  const getCompanyCardBorderColor = (index: number) => {
    const colors = [
      'border-blue-200 dark:border-blue-800/50',
      'border-purple-200 dark:border-purple-800/50',
      'border-pink-200 dark:border-pink-800/50',
      'border-teal-200 dark:border-teal-800/50',
      'border-lime-200 dark:border-lime-800/50',
      'border-orange-200 dark:border-orange-800/50',
    ];
    
    return colors[index % colors.length];
  };

  const renderContent = () => {
    if (isLoading && companyProfiles.length === 0) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 dark:border-indigo-400"></div>
          <span className="ml-3 text-indigo-600 dark:text-indigo-400">Загрузка данных...</span>
        </div>
      );
    }
    
    if (!isLoading && companyProfiles.length === 0 && !isCreatingCompany && !isChangingPlan) {
      return (
        <div className="bg-white dark:bg-gray-800 backdrop-blur-lg bg-opacity-70 dark:bg-opacity-70 rounded-xl shadow-lg p-10 max-w-2xl mx-auto text-center border border-white dark:border-gray-700">
          <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl font-semibold mb-4 dark:text-white">У вас ещё нет компаний</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Создайте вашу первую компанию для начала работы с системой адаптации сотрудников. 
            Вы сможете добавить сотрудников, треки адаптации и многое другое.
          </p>
          <Button 
            onClick={() => setIsCreatingCompany(true)} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-md font-medium"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Создать компанию
          </Button>
        </div>
      );
    }
    
    if (isCreatingCompany) {
      return renderCompanyCreationForm();
    }

    if (isChangingPlan) {
      return renderPlanSelectionDialog();
    }
    
    return renderCompanyList();
  };
  
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-gray-50 dark:from-gray-900 dark:to-gray-950">
        <div className="container max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-4">
              {isCreatingCompany 
                ? "Создание компании"
                : isChangingPlan
                ? "Выбор тарифа"
                : "Выберите компанию"}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
              {isCreatingCompany 
                ? "Заполните данные для создания новой компании в системе"
                : isChangingPlan
                ? "Выберите подходящий тарифный план для вашей компании"
                : "Выберите существующую компанию или создайте новую для продолжения работы в системе"}
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 rounded-lg text-red-700 dark:text-red-300 text-sm mb-8 max-w-2xl mx-auto flex items-center">
              <Info className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {renderContent()}
        </div>
      </div>
    </TooltipProvider>
  )
}

export default CompanyProfilePage 