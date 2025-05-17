import React, { useState, useEffect } from 'react';
import {
  AIChat,
  AIMessage,
  AIChatWithoutMessages,
  AIModel,
  AIPromptTemplate
} from '@/types/ai-presentation';
import { Slide, PresentationStage } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { AIChatComponent } from './AIChat';
import { AIChatList } from './AIChatList';
import { AIDialog } from './AIDialog';
import { PromptTemplates } from './PromptTemplates';
import { DEFAULT_MODEL } from './AIModels';
import { useToast } from '@/components/ui/use-toast';
import { Sparkles, MessageSquare, X, Plus } from 'lucide-react';

// Mock API для демонстрации. В реальном приложении будет использоваться API
const mockGeneratePresentation = async (prompt: string, model: AIModel): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const response = {
        slides: [
          {
            id: 'slide-' + Date.now() + '-1',
            type: 'text',
            content: JSON.stringify({
              time: Date.now(),
              blocks: [
                {
                  type: 'header',
                  data: {
                    text: 'Сгенерированная презентация',
                    level: 2
                  }
                },
                {
                  type: 'paragraph',
                  data: {
                    text: 'Это первый слайд, сгенерированный на основе запроса: ' + prompt
                  }
                }
              ],
              version: '2.26.5'
            })
          },
          {
            id: 'slide-' + Date.now() + '-2',
            type: 'text',
            content: JSON.stringify({
              time: Date.now(),
              blocks: [
                {
                  type: 'header',
                  data: {
                    text: 'Второй слайд',
                    level: 2
                  }
                },
                {
                  type: 'paragraph',
                  data: {
                    text: 'Содержимое второго слайда, сгенерированное с использованием модели: ' + model
                  }
                }
              ],
              version: '2.26.5'
            })
          }
        ],
        message: `Я создал презентацию из 2 слайдов на основе вашего запроса: "${prompt}". Презентация включает вводный слайд с заголовком и второй слайд с дополнительной информацией.`
      };
      
      resolve(JSON.stringify(response));
    }, 2000);
  });
};

// Функции для работы с LocalStorage
const CHATS_STORAGE_KEY = 'ai_presentation_chats';
const MESSAGES_STORAGE_KEY = 'ai_presentation_messages';

const saveChatsToStorage = (chats: AIChatWithoutMessages[]) => {
  localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats));
};

const saveMessagesToStorage = (chatId: string, messages: AIMessage[]) => {
  const allMessages = getMessagesFromStorage();
  allMessages[chatId] = messages;
  localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(allMessages));
};

const getChatsFromStorage = (): AIChatWithoutMessages[] => {
  const chats = localStorage.getItem(CHATS_STORAGE_KEY);
  return chats ? JSON.parse(chats) : [];
};

const getMessagesFromStorage = (): Record<string, AIMessage[]> => {
  const messages = localStorage.getItem(MESSAGES_STORAGE_KEY);
  return messages ? JSON.parse(messages) : {};
};

const getChatMessages = (chatId: string): AIMessage[] => {
  const allMessages = getMessagesFromStorage();
  return allMessages[chatId] || [];
};

interface PresentationAIGeneratorProps {
  stage: PresentationStage;
  onChange: (content: PresentationStage['content']) => void;
  onClose?: () => void;
}

export function PresentationAIGenerator({
  stage,
  onChange,
  onClose
}: PresentationAIGeneratorProps) {
  // State
  const [chats, setChats] = useState<AIChatWithoutMessages[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [currentChat, setCurrentChat] = useState<AIChat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'rename'>('create');
  const [activeTab, setActiveTab] = useState<'chat' | 'templates'>('chat');
  
  const { toast } = useToast();

  // Load chats from storage on mount
  useEffect(() => {
    const storedChats = getChatsFromStorage();
    setChats(storedChats);
    
    // Select first chat if available
    if (storedChats.length > 0) {
      setSelectedChatId(storedChats[0].id);
    }
  }, []);

  // Load current chat messages when selected chat changes
  useEffect(() => {
    if (selectedChatId) {
      const selectedChat = chats.find(chat => chat.id === selectedChatId);
      if (selectedChat) {
        const messages = getChatMessages(selectedChatId);
        setCurrentChat({
          ...selectedChat,
          messages
        });
      }
    } else {
      setCurrentChat(null);
    }
  }, [selectedChatId, chats]);

  // Handlers
  const handleCreateChat = () => {
    setDialogMode('create');
    setIsDialogOpen(true);
  };

  const handleRenameChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setDialogMode('rename');
    setIsDialogOpen(true);
  };

  const handleDialogConfirm = (title: string, model: AIModel) => {
    if (dialogMode === 'create') {
      const newChatId = `chat-${Date.now()}`;
      const newChat: AIChatWithoutMessages = {
        id: newChatId,
        title,
        model,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messageCount: 0,
        lastMessageTimestamp: Date.now()
      };
      
      const updatedChats = [newChat, ...chats];
      setChats(updatedChats);
      saveChatsToStorage(updatedChats);
      
      // Initialize with system message
      const systemMessage: AIMessage = {
        id: `msg-${Date.now()}`,
        role: 'system',
        content: 'Я помогу вам создать презентацию. Опишите, что вы хотите получить, и я сгенерирую слайды на основе вашего запроса.',
        timestamp: Date.now()
      };
      
      saveMessagesToStorage(newChatId, [systemMessage]);
      setSelectedChatId(newChatId);
    } else if (dialogMode === 'rename' && selectedChatId) {
      const updatedChats = chats.map(chat => 
        chat.id === selectedChatId 
          ? { ...chat, title, updatedAt: Date.now() } 
          : chat
      );
      
      setChats(updatedChats);
      saveChatsToStorage(updatedChats);
    }
  };

  const handleDeleteChat = (chatId: string) => {
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    setChats(updatedChats);
    saveChatsToStorage(updatedChats);
    
    // If deleted chat was selected, select another one or null
    if (selectedChatId === chatId) {
      setSelectedChatId(updatedChats.length > 0 ? updatedChats[0].id : null);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!currentChat) return;
    
    const userMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: Date.now()
    };
    
    // Добавляем сообщение пользователя
    const updatedMessages = [...currentChat.messages, userMessage];
    setCurrentChat({
      ...currentChat,
      messages: updatedMessages
    });
    saveMessagesToStorage(currentChat.id, updatedMessages);
    
    // Обновляем информацию о чате
    const updatedChats = chats.map(chat => 
      chat.id === currentChat.id 
        ? { 
            ...chat, 
            updatedAt: Date.now(),
            messageCount: chat.messageCount + 1,
            lastMessageTimestamp: Date.now()
          } 
        : chat
    );
    setChats(updatedChats);
    saveChatsToStorage(updatedChats);
    
    // Запускаем генерацию
    setIsLoading(true);
    try {
      const response = await mockGeneratePresentation(message, currentChat.model);
      const parsedResponse = JSON.parse(response);
      
      // Добавляем ответ ассистента
      const assistantMessage: AIMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: parsedResponse.message,
        timestamp: Date.now()
      };
      
      const finalMessages = [...updatedMessages, assistantMessage];
      setCurrentChat({
        ...currentChat,
        messages: finalMessages
      });
      saveMessagesToStorage(currentChat.id, finalMessages);
      
      // Обновляем информацию о чате
      const finalChats = updatedChats.map(chat => 
        chat.id === currentChat.id 
          ? { 
              ...chat, 
              messageCount: chat.messageCount + 1,
              lastMessageTimestamp: Date.now()
            } 
          : chat
      );
      setChats(finalChats);
      saveChatsToStorage(finalChats);
    } catch (error) {
      console.error('Error generating presentation:', error);
      toast({
        title: 'Ошибка генерации',
        description: 'Не удалось сгенерировать презентацию. Попробуйте еще раз.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptPresentation = async (messageId: string) => {
    if (!currentChat) return;
    
    const message = currentChat.messages.find(msg => msg.id === messageId);
    if (!message) return;
    
    try {
      // Парсим ответ, который содержит слайды
      // Это упрощенный пример - в реальности нужно более надежное определение
      const assistantResponseMessage = currentChat.messages
        .filter(msg => msg.role === 'assistant')
        .find(msg => msg.id === messageId);
      
      if (!assistantResponseMessage) {
        throw new Error('Message not found');
      }
      
      // Мок генерации - в реальном приложении здесь будет правильный парсинг
      const response = await mockGeneratePresentation('', currentChat.model);
      const parsedResponse = JSON.parse(response);
      
      // Обновляем слайды презентации
      onChange({
        slides: [...stage.content.slides, ...parsedResponse.slides]
      });
      
      toast({
        title: 'Презентация добавлена',
        description: 'Сгенерированные слайды добавлены в презентацию.',
      });
      
      // Закрываем генератор, если задана функция
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error applying presentation:', error);
      toast({
        title: 'Ошибка применения',
        description: 'Не удалось добавить слайды в презентацию.',
        variant: 'destructive'
      });
    }
  };

  const handleSelectTemplate = (template: AIPromptTemplate) => {
    if (!currentChat) {
      // Если нет активного чата, предложим создать новый
      handleCreateChat();
      return;
    }
    
    // Заменяем подстроку {тема} на название презентации
    const prompt = template.prompt.replace('{тема}', stage.title);
    
    // Вставляем текст в поле ввода сообщения
    // Для простоты этого примера, просто отправляем сообщение
    handleSendMessage(prompt);
  };

  const handleCopyTemplate = (template: AIPromptTemplate) => {
    const prompt = template.prompt.replace('{тема}', stage.title);
    navigator.clipboard.writeText(prompt);
    
    toast({
      title: 'Шаблон скопирован',
      description: 'Шаблон скопирован в буфер обмена.',
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-medium">AI-генерация презентации</h2>
        </div>
        
        {onClose && (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar с списком чатов */}
        <div className="w-72 flex-shrink-0 border-r">
          <AIChatList
            chats={chats}
            selectedChatId={selectedChatId}
            onSelectChat={setSelectedChatId}
            onCreateChat={handleCreateChat}
            onDeleteChat={handleDeleteChat}
            onRenameChat={handleRenameChat}
          />
        </div>
        
        {/* Область чата или шаблонов */}
        <div className="flex-1 flex flex-col">
          {selectedChatId && currentChat ? (
            <Tabs 
              defaultValue="chat" 
              className="flex flex-col flex-1"
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as 'chat' | 'templates')}
            >
              <div className="flex items-center justify-center border-b">
                <TabsList className="grid grid-cols-2 m-2">
                  <TabsTrigger value="chat" className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Чат
                  </TabsTrigger>
                  <TabsTrigger value="templates" className="flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Шаблоны
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="chat" className="flex-1 flex flex-col">
                <AIChatComponent
                  chat={currentChat}
                  onSendMessage={handleSendMessage}
                  onAcceptPresentation={handleAcceptPresentation}
                  isLoading={isLoading}
                />
              </TabsContent>
              
              <TabsContent value="templates" className="flex-1 overflow-y-auto p-4">
                <PromptTemplates
                  onSelectTemplate={handleSelectTemplate}
                  onCopyTemplate={handleCopyTemplate}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex items-center justify-center flex-1 p-8 text-center">
              <div className="max-w-md space-y-4">
                <Sparkles className="h-12 w-12 text-blue-500 mx-auto" />
                <h3 className="text-xl font-medium">
                  Начните генерацию презентации
                </h3>
                <p className="text-muted-foreground">
                  Создайте новый чат и опишите, какую презентацию вы хотите получить.
                  AI поможет вам сгенерировать слайды на основе вашего запроса.
                </p>
                <Button onClick={handleCreateChat}>
                  <Plus className="mr-2 h-4 w-4" />
                  Создать новый чат
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <AIDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleDialogConfirm}
        title={dialogMode === 'rename' && selectedChatId 
          ? chats.find(chat => chat.id === selectedChatId)?.title 
          : ''}
        model={dialogMode === 'rename' && selectedChatId 
          ? chats.find(chat => chat.id === selectedChatId)?.model || DEFAULT_MODEL
          : DEFAULT_MODEL}
        mode={dialogMode}
      />
    </div>
  );
} 