export type AdaptationStatus = 'not_started' | 'in_progress' | 'completed'

export interface Track {
  id: string
  title: string
  milestones: Milestone[]
}

export interface Milestone {
  id: string
  title: string
  description: string
  steps: Step[]
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

export type Step = PresentationStep | TaskStep | SurveyStep

export interface BaseStep {
  id: string
  type: 'presentation' | 'task' | 'survey'
  title: string
  description: string
}

export interface PresentationStep extends BaseStep {
  type: 'presentation'
  content: {
    slides: (ContentSlide | QuizSlide)[]
  }
}

export interface TaskStep extends BaseStep {
  type: 'task'
  content: {
    description: string
    meeting?: {
      title?: string
      date: string
      time: string
      duration?: string
      location: string
      participants: string[]
    }
  }
}

export interface SurveyStep extends BaseStep {
  type: 'survey'
  content: {
    title: string
    description: string
    form: {
      components: FormComponent[]
    }
  }
}

export interface ContentSlide {
  title: string
  content: string
}

export interface QuizSlide {
  type: 'quiz'
  title: string
  content: {
    question: string
    options: string[]
    correctAnswer: number
  }
}

export type FormComponent = TextFieldComponent | SelectComponent | RatingComponent

export interface BaseFormComponent {
  type: string
  label: string
  key: string
  required: boolean
}

export interface TextFieldComponent extends BaseFormComponent {
  type: 'textfield'
  multiline?: boolean
  placeholder?: string
}

export interface SelectComponent extends BaseFormComponent {
  type: 'select'
  options: Array<{
    label: string
    value: string
  }>
}

export interface RatingComponent extends BaseFormComponent {
  type: 'rating'
  min?: number
  max?: number
}

export interface Employee {
  id: string
  fullName: string
  position: string
  department: string
  adaptationStatus: AdaptationStatus
  assignedTrackId?: string
  startDate?: string
  stepProgress?: Record<string, StepProgress>
}

export interface StepProgress {
  completed: boolean
  answers?: Record<string, string>
} 