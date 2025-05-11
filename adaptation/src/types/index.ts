export type StepType = 'presentation' | 'task';
export type ComponentType = 'text' | 'quiz' | 'poll';

export interface Meeting {
  title: string;
  time: string;
  link: string;
}

export interface TextComponent {
  type: 'text';
  content: string;
}

export interface QuizComponent {
  type: 'quiz';
  question: string;
  options: string[];
  correct: number;
}

export interface PollComponent {
  type: 'poll';
  question: string;
  options: string[];
}

export type Component = TextComponent | QuizComponent | PollComponent;

export interface PresentationStep {
  id: string;
  type: 'presentation';
  title: string;
  components: Component[];
}

export interface TaskStep {
  id: string;
  type: 'task';
  title: string;
  description: string;
  meeting?: Meeting;
}

export type Step = PresentationStep | TaskStep;

export interface Track {
  steps: Step[];
}

export interface StepProgress {
  [key: string]: {
    completed: boolean;
    answers?: {
      [key: string]: string | number;
    };
  };
} 