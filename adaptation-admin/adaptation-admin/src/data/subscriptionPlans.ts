import { SubscriptionPlan } from '@/types'

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Базовый',
    price: 0,
    annualDiscount: 0,
    maxEmployees: 10,
    maxTracks: 3,
    maxMentors: 2,
    color: 'gray',
    features: [
      'До 10 сотрудников',
      'До 3 треков адаптации',
      'До 2 наставников',
      'Базовая аналитика',
      'Email-поддержка',
      'Основные шаблоны адаптации'
    ]
  },
  {
    id: 'pro',
    name: 'Профессиональный',
    price: 2990,
    annualDiscount: 20,
    maxEmployees: 50,
    maxTracks: 10,
    maxMentors: 10,
    isPopular: true,
    color: 'indigo',
    features: [
      'До 50 сотрудников',
      'До 10 треков адаптации',
      'До 10 наставников',
      'Расширенная аналитика и отчеты',
      'Приоритетная поддержка',
      'Библиотека шаблонов адаптации',
      'Настраиваемые опросы обратной связи',
      'Интеграция с HR-системами',
      'API для интеграции'
    ]
  },
  {
    id: 'business',
    name: 'Корпоративный',
    price: 7990,
    annualDiscount: 20,
    maxEmployees: -1, // Неограниченно
    maxTracks: -1, // Неограниченно
    maxMentors: -1, // Неограниченно
    color: 'purple',
    features: [
      'Неограниченное количество сотрудников',
      'Неограниченное количество треков',
      'Неограниченное количество наставников',
      'Премиум-аналитика и отчеты',
      'Персональный менеджер',
      'Приоритетная техническая поддержка 24/7',
      'Полный набор шаблонов адаптации',
      'Настраиваемый брендинг',
      'Расширенный API и webhooks',
      'Обучение и консультации',
      'Многокомпонентная интеграция'
    ]
  }
]

export const getPlanFeatureComparison = () => {
  const allFeatures = new Set<string>()
  
  // Собираем все уникальные фичи
  subscriptionPlans.forEach(plan => 
    plan.features.forEach(feature => allFeatures.add(feature))
  )
  
  // Создаем таблицу сравнения
  const comparisonTable = Array.from(allFeatures).map(feature => {
    const result: Record<string, any> = { feature }
    
    subscriptionPlans.forEach(plan => {
      result[plan.id] = plan.features.includes(feature)
    })
    
    return result
  })
  
  return comparisonTable
}

export const getPlanById = (id: string): SubscriptionPlan | undefined => {
  return subscriptionPlans.find(plan => plan.id === id)
}

export const formatPrice = (price: number) => {
  if (price === 0) return 'Бесплатно'
  return `${price.toLocaleString('ru-RU')} ₽`
}

export const getAnnualPrice = (plan: SubscriptionPlan) => {
  if (plan.price === 0) return 'Бесплатно'
  
  const monthlyPrice = plan.price
  const annualPrice = monthlyPrice * 12 * (1 - plan.annualDiscount / 100)
  
  return `${Math.round(annualPrice).toLocaleString('ru-RU')} ₽`
} 