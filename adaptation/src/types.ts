export interface Meeting {
  location: string;
  participants: string[];
  date: string;
  time: string;
  duration: string;
  description?: string;
}

export interface Slide {
  title: string;
  content: string;
  type?: 'quiz' | 'survey';
  theme?: 'light' | 'dark' | 'blue' | 'green';
  layout?: 'default' | 'split' | 'full' | 'code';
  image?: {
    url: string;
    alt: string;
    position?: 'left' | 'right' | 'top' | 'bottom';
  };
  code?: {
    language: string;
    code: string;
  };
}

export interface QuizSlide {
  type: 'quiz';
  title: string;
  content: {
    question: string;
    options: string[];
    correctAnswer: number;
  };
}

export interface SurveySlide {
  type: 'survey';
  title: string;
  content: {
    form: {
      components: FormComponent[];
    };
  };
}

export type FormComponent = 
  | TextFieldComponent 
  | SelectComponent 
  | RatingComponent;

interface BaseComponent {
  type: string;
  label: string;
  key: string;
  required?: boolean;
}

interface TextFieldComponent extends BaseComponent {
  type: 'textfield';
  placeholder?: string;
  multiline?: boolean;
}

interface SelectComponent extends BaseComponent {
  type: 'select';
  options: Array<{ label: string; value: string }>;
  multiple?: boolean;
}

interface RatingComponent extends BaseComponent {
  type: 'rating';
  maxRating: number;
}

export type PresentationSlide = Slide | QuizSlide | SurveySlide;

export interface PresentationContent {
  slides: PresentationSlide[];
  theme?: 'light' | 'dark' | 'blue' | 'green';
  defaultLayout?: 'default' | 'split' | 'full' | 'code';
}

export interface TaskContent {
  description: string;
  meeting?: Meeting;
}

export interface SurveyContent {
  title: string;
  description: string;
  form: {
    components: FormComponent[];
  };
}

export interface PresentationStep {
  id: string;
  type: 'presentation';
  title: string;
  description: string;
  content: PresentationContent;
}

export interface TaskStep {
  id: string;
  type: 'task';
  title: string;
  description: string;
  content: TaskContent;
}

export interface SurveyStep {
  id: string;
  type: 'survey';
  title: string;
  description: string;
  content: SurveyContent;
}

export type Step = PresentationStep | TaskStep | SurveyStep;

export interface StepProgress {
  stepId: string;
  completed: boolean;
  completedAt?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  steps: Step[];
  isCompleted?: boolean;
  isCollapsed?: boolean;
}

export interface Track {
  id: string;
  title: string;
  milestones: Milestone[];
} 