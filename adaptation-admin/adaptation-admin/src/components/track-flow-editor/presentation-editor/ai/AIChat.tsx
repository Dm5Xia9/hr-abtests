import React, { useState, useRef, useEffect } from 'react';
import { AIChat, AIMessage, AIModel } from '@/types/ai-presentation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { Sparkles, Send, Loader2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getModelById } from './AIModels';

interface AIChatProps {
  chat: AIChat;
  onSendMessage: (message: string) => Promise<void>;
  onAcceptPresentation?: (messageId: string) => void;
  isLoading?: boolean;
  autoScrollToBottom?: boolean;
}

export function AIChatComponent({
  chat,
  onSendMessage,
  onAcceptPresentation,
  isLoading = false,
  autoScrollToBottom = true,
}: AIChatProps) {
  const [message, setMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Автоматическая прокрутка к последнему сообщению
  useEffect(() => {
    if (autoScrollToBottom && messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat.messages, autoScrollToBottom]);

  // Обработка отправки сообщения
  const handleSendMessage = async () => {
    if (message.trim() && !isLoading) {
      await onSendMessage(message);
      setMessage('');
      
      // Фокус обратно на поле ввода
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  // Обработка нажатия Enter для отправки (с Shift+Enter для новой строки)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Получение модели чата
  const model = getModelById(chat.model);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b p-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          <span className="font-medium">{model.name}</span>
        </div>
      </div>

      <ScrollArea 
        ref={scrollAreaRef} 
        className="flex-1 p-4"
      >
        <div className="space-y-4">
          {chat.messages.map((msg) => (
            <ChatMessage 
              key={msg.id} 
              message={msg} 
              onAcceptPresentation={onAcceptPresentation}
            />
          ))}
          {isLoading && (
            <div className="flex justify-center py-2">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          <div ref={messageEndRef} />
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Напишите запрос для генерации презентации..."
            className="min-h-[80px] resize-none pr-12"
            disabled={isLoading}
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-2 bottom-2"
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ChatMessageProps {
  message: AIMessage;
  onAcceptPresentation?: (messageId: string) => void;
}

function ChatMessage({ message, onAcceptPresentation }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  
  // Проверка, содержит ли сообщение JSON со слайдами 
  // (это упрощенная проверка, в реальном коде нужно добавить более точное определение)
  const hasPresentation = 
    message.role === 'assistant' && 
    message.content.includes('"slides":') && 
    message.content.includes('"type":');

  return (
    <div
      className={cn(
        "flex items-start gap-3",
        isUser ? "justify-end" : "justify-start",
        isSystem && "opacity-80"
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </Avatar>
      )}
      
      <div
        className={cn(
          "rounded-lg px-4 py-3 max-w-[85%]",
          isUser
            ? "bg-primary text-primary-foreground"
            : isSystem
            ? "bg-muted text-muted-foreground text-sm"
            : "bg-accent"
        )}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        
        {hasPresentation && onAcceptPresentation && (
          <div className="mt-3 pt-2 border-t border-border/20">
            <Button 
              size="sm" 
              onClick={() => onAcceptPresentation(message.id)}
              className="w-full"
            >
              Использовать эту презентацию
            </Button>
          </div>
        )}
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 bg-primary">
          <User className="h-4 w-4 text-primary-foreground" />
        </Avatar>
      )}
    </div>
  );
} 