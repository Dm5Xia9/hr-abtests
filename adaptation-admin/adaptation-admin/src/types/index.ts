export type AdaptationStatus = 'not_started' | 'in_progress' | 'completed'

export type UserRole = 'admin' | 'manager' | 'observer'

export type NotificationType = 'track_assigned' | 'mentor_assigned' | 'task_completed' | 'adaptation_completed'

// Типы тарифных планов
export type PlanType = 'free' | 'pro' | 'business'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  date: string
  isRead: boolean
  employeeId: string
  data?: Record<string, any>
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
  lastLogin?: string
  currentCompanyProfileId?: string
}

export interface CompanyProfile {
  id: string
  name: string
  description?: string
  logoUrl?: string
  industry?: string
  size?: 'small' | 'medium' | 'large' | 'enterprise'
  plan?: PlanType
  planExpiresAt?: string
  createdAt: string
  updatedAt: string
  ownerId: string
}

export interface Position {
  id: string
  name: string
  description?: string
}

export interface Department {
  id: string
  name: string
  description?: string
}


export interface Article {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  createdAt: string
  updatedAt: string
  author: string
}


export interface Employee {
  id: string
  fullName: string
  positionId: string
  departmentId: string
  email: string
  phone?: string
  hireDate: string
  adaptationStatus: AdaptationStatus
  mentorId?: string
  assignedTrackId?: string
  startDate?: string
  stepProgress?: Record<string, StepProgress>
  accessLink?: string
}

export interface StepProgress {
  completed: boolean
  answers?: Record<string, string>
  completedAt?: string
  startedAt?: string
}

// Интерфейс для тарифных планов
export interface SubscriptionPlan {
  id: PlanType
  name: string
  price: number
  annualDiscount: number
  maxEmployees: number
  maxTracks: number
  maxMentors: number
  features: string[]
  isPopular?: boolean
  color: string
} 