import { Milestone } from "@/types"

export type AdaptationStatus = 'not_started' | 'in_progress' | 'completed'

export type UserRole = 'admin' | 'manager' | 'observer' | 'employee'

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

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface Employee {
  id: string; // required в TS обозначается отсутствием ?
  fullName: string;
  email: string;
  phone?: string | null;
  departmentId: string | null; // required в TS обозначается отсутствием ?
  positionId: string | null;
  hireDate: string;
  lastLogin?: string;
  role: UserRole
  currentCompanyId: string;
  createAt: string;
  assignedTracks: AssignedTrack[]; // IEnumerable<T> в TS обычно представляется как массив T[]
}


// Интерфейс для назначенного трека
export interface AssignedTrack {
  trackId: string
  startDate: string
  mentorId?: string,
  status: AdaptationStatus,
  assignedDate: string,
  completedDate?: string,
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

// Типы для календаря и встреч
export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: string
  end: string
  location?: string
  meetingType?: 'in_person' | 'google_meet' | 'telemost' | 'zoom' | 'teams' | 'other'
  meetingUrl?: string
  participants?: string[]
  isAllDay?: boolean
  stageId?: string  // ID этапа-встречи, если событие связано с этапом адаптации
  color?: string
  status?: 'scheduled' | 'completed' | 'cancelled'
  reminderSent?: boolean
}

export type CalendarView = 'month' | 'week' | 'day' | 'agenda' 

// Types for track API responses
export interface AvailableTrack {
  id: string;
  title: string;
  description: string;
  status: string;
  assignedDate: string;
  startDate: string;
  completedDate: string;
  mentorId: string;
  mentorName: string;
}

export interface CurrentTrack extends AvailableTrack {
  steps: Record<string, StageProgress>; // JSON string values keyed by step ID
  milestones: Milestone[]
}

// Track progress tracking types
export type StageStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped'

export interface StageProgressSummary {
  stageId: string;
  status: StageStatus;
  startedAt?: string;
  completedAt?: string;
  timeSpent?: number; // Time spent in seconds
  attempts?: number; // Number of attempts for tests/quizzes
  score?: number; // Score percentage for tests/quizzes
}

export interface PresentationProgress {
  slideViews: {
    slideId: string;
    viewCount: number;
    totalTimeViewed: number; // Time in seconds
    lastViewedAt: string;
    completedAt?: string;
  }[];
  currentSlide?: string;
  completed: boolean;
}

export interface GoalProgress {
  checklistItems: {
    itemId: string;
    completed: boolean;
    completedAt?: string;
  }[];
  notes?: string;
  attachments?: {
    name: string;
    url: string;
    uploadedAt: string;
  }[];
  completed: boolean;
}

export interface SurveyProgress {
  answers: Record<string, {
    questionId: string;
    value: string | string[] | number;
    answeredAt: string;
  }>;
  completed: boolean;
}

export interface MeetingProgress {
  scheduled: boolean;
  scheduledFor?: string;
  attendees?: string[];
  notes?: string;
  duration?: number; // Actual duration in minutes
  feedback?: {
    rating: number;
    comments?: string;
  };
  completed: boolean;
}

export interface TestProgress {
  answers: {
    questionId: string;
    selectedOptions: string[];
    isCorrect: boolean;
    timeToAnswer?: number; // Time in seconds
  }[];
  score: number;
  completed: boolean;
  attempts: number;
  lastAttemptAt: string;
}

export type StageProgress = {
  stageId: string;
  type: 'presentation' | 'goal' | 'survey' | 'meeting';
  summary: StageProgressSummary;
  detail: PresentationProgress | GoalProgress | SurveyProgress | MeetingProgress;
}

// export interface TrackProgress {
//   trackId: string;
//   userId: string;
//   status: AdaptationStatus;
//   startedAt: string;
//   lastActivityAt: string;
//   completedAt?: string;
//   currentStageId?: string;
//   overallProgress: number; // Percentage 0-100
//   stageProgress: Record<string, StageProgress>;
//   milestoneProgress: Record<string, {
//     milestoneId: string;
//     startedAt?: string;
//     completedAt?: string;
//     progress: number; // Percentage 0-100
//   }>;
// } 