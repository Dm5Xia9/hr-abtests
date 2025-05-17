import { AIModel, AIModelInfo } from '@/types/ai-presentation';

export const AI_MODELS: Record<AIModel, AIModelInfo> = {
  'gpt-4': {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Мощный языковой AI от OpenAI с расширенными возможностями понимания контекста и генерации контента.',
    maxTokens: 8192,
    contextLength: 8192
  },
  'gpt-3.5-turbo': {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Более быстрая и доступная модель от OpenAI с хорошим балансом качества и производительности.',
    maxTokens: 4096,
    contextLength: 4096
  },
  'claude-3': {
    id: 'claude-3',
    name: 'Claude 3',
    description: 'Мощная языковая модель от Anthropic с улучшенными диалоговыми возможностями и пониманием инструкций.',
    maxTokens: 4096,
    contextLength: 8192
  },
  'gemini-pro': {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    description: 'Современная мультимодальная модель от Google с глубоким пониманием контекста и визуальной информации.',
    maxTokens: 4096,
    contextLength: 8192
  }
};

export const DEFAULT_MODEL: AIModel = 'gpt-4';

export const getModelById = (id: AIModel): AIModelInfo => {
  return AI_MODELS[id] || AI_MODELS[DEFAULT_MODEL];
};

export const getAvailableModels = (): AIModelInfo[] => {
  return Object.values(AI_MODELS);
}; 