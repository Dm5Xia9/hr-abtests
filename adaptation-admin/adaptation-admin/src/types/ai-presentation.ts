import { Slide } from '@/types';

export type AIModel = 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3' | 'gemini-pro';

export interface AIModelInfo {
  id: AIModel;
  name: string;
  description: string;
  maxTokens: number;
  contextLength: number;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface AIChat {
  id: string;
  title: string;
  model: AIModel;
  messages: AIMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface AIChatWithoutMessages {
  id: string;
  title: string;
  model: AIModel;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  lastMessageTimestamp: number;
}

export interface AIGenerationRequest {
  prompt: string;
  model: AIModel;
  presentationId?: string;
  chatId?: string;
}

export interface AIGenerationResponse {
  slides: Slide[];
  message: string;
}

export interface AIPromptTemplate {
  id: string;
  title: string;
  prompt: string;
  description: string;
}

export interface AISettings {
  defaultModel: AIModel;
  temperature: number;
  maxTokens: number;
} 