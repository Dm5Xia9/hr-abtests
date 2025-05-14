import { LucideIcon } from 'lucide-react'

export interface Track {
  id: string
  title: string
  description: string
  milestones: Milestone[]
  position?: string
  status?: 'active' | 'archived' | 'draft'
  icon?: string
  tags?: string[]
  monthlyAssignments?: number[]
}

export interface BaseMilestone {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
}

export interface Milestone extends BaseMilestone {
  stages: Stage[]
}

export interface BaseStage {
  id: string
  type: 'presentation' | 'goal' | 'survey' | 'meeting'
  title: string
  description: string
  order: number
  required: boolean
  coinReward: number // Number of coins rewarded for completing the stage
  status?: {
    isCompleted: boolean
    completedAt?: string
    completedBy?: string
  }
}

export interface PresentationStage extends BaseStage {
  type: 'presentation'
  content: {
    slides: Slide[]
  }
}

export interface GoalStage extends BaseStage {
  type: 'goal'
  content: {
    description: string
    deadline?: string
    checklist?: ChecklistItem[]
    externalLink?: string
  }
}

export interface MeetingStage extends BaseStage {
  type: 'meeting'
  content: {
    description: string
    date?: string
    duration?: number
    location?: string
    participants?: string[]
    meetingTool?: 'google_meet' | 'telemost' | 'zoom' | 'teams' | 'other'
  }
}

export interface SurveyStage extends BaseStage {
  type: 'survey'
  content: {
    title: string
    description: string
    questions: SurveyQuestion[]
  }
}

export type Stage = PresentationStage | GoalStage | SurveyStage | MeetingStage

export type Slide = TextSlide | VideoSlide | ImageSlide | TestSlide

export interface BaseSlide {
  id: string
  type: 'text' | 'video' | 'image' | 'test'
}

export interface TextSlide extends BaseSlide {
  type: 'text'
  content: string
}

export interface VideoSlide extends BaseSlide {
  type: 'video'
  url: string
  caption?: string
}

export interface ImageSlide extends BaseSlide {
  type: 'image'
  url: string
  caption?: string
}

export interface TestSlide extends BaseSlide {
  type: 'test'
  question: string
  options: TestOption[]
  testType: 'single' | 'multiple'
  explanation?: string
}

export interface TestOption {
  id: string
  text: string
  isCorrect: boolean
}

export interface ChecklistItem {
  id: string
  text: string
  completed: boolean
  linkedStageId?: string
  type: 'manual' | 'linked'
}

export type SurveyQuestion = TextQuestion | ChoiceQuestion | ScaleQuestion

export interface BaseQuestion {
  id: string
  type: 'text' | 'choice' | 'scale'
  title: string
  required: boolean
}

export interface TextQuestion extends BaseQuestion {
  type: 'text'
  multiline?: boolean
}

export interface ChoiceQuestion extends BaseQuestion {
  type: 'choice'
  options: string[]
  multiple?: boolean
}

export interface ScaleQuestion extends BaseQuestion {
  type: 'scale'
  min: number
  max: number
  minLabel?: string
  maxLabel?: string
}

export interface StageType {
  label: string
  icon: LucideIcon
  color: string
}

export interface StageTypes {
  presentation: StageType
  goal: StageType
  survey: StageType
  meeting: StageType
}

// For backward compatibility with existing code - to be removed later
export type Step = Stage
export type ContentSlide = TextSlide
export type QuizSlide = ChoiceQuestion
export type FormComponent = SurveyQuestion
export type TextFieldComponent = TextQuestion
export type SelectComponent = ChoiceQuestion
export type RatingComponent = ScaleQuestion
export type PresentationStep = PresentationStage
export type TaskStep = GoalStage
export type SurveyStep = SurveyStage

// Re-export all types
export * from './types/index' 