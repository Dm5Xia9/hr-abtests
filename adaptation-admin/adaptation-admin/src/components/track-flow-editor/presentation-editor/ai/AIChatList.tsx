import React from 'react';
import { AIChatWithoutMessages, AIModel } from '@/types/ai-presentation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  MessageSquare, 
  Calendar, 
  Sparkles, 
  History, 
  MoreVertical, 
  Trash2,
  Edit
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { getModelById } from './AIModels';

interface AIChatListProps {
  chats: AIChatWithoutMessages[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onCreateChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string) => void;
}

export function AIChatList({
  chats,
  selectedChatId,
  onSelectChat,
  onCreateChat,
  onDeleteChat,
  onRenameChat
}: AIChatListProps) {
  return (
    <div className="flex flex-col h-full border-r">
      <div className="p-4 border-b">
        <Button 
          onClick={onCreateChat} 
          className="w-full"
          variant="default"
        >
          <Plus className="mr-2 h-4 w-4" />
          Новая генерация
        </Button>
      </div>
      
      <ScrollArea className="flex-1 pb-4">
        <div className="p-2 space-y-1">
          {chats.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Нет сохраненных чатов.<br />
              Создайте новый чат для генерации презентации.
            </div>
          ) : (
            chats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isSelected={chat.id === selectedChatId}
                onSelect={() => onSelectChat(chat.id)}
                onDelete={() => onDeleteChat(chat.id)}
                onRename={() => onRenameChat(chat.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface ChatListItemProps {
  chat: AIChatWithoutMessages;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: () => void;
}

function ChatListItem({
  chat,
  isSelected,
  onSelect,
  onDelete,
  onRename
}: ChatListItemProps) {
  const modelInfo = getModelById(chat.model);
  
  const formattedDate = formatDistanceToNow(
    new Date(chat.lastMessageTimestamp || chat.createdAt), 
    { addSuffix: true, locale: ru }
  );

  return (
    <div
      className={cn(
        "flex items-start justify-between p-3 rounded-md cursor-pointer transition-colors",
        isSelected 
          ? "bg-accent text-accent-foreground" 
          : "hover:bg-muted"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start space-x-3">
        <MessageSquare className="h-5 w-5 mt-0.5 flex-shrink-0" />
        
        <div className="space-y-1 min-w-0">
          <div className="font-medium truncate max-w-[150px]">
            {chat.title}
          </div>
          
          <div className="flex items-center text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 mr-1" />
            <span>{modelInfo.name}</span>
            <span className="mx-2">•</span>
            <Calendar className="h-3 w-3 mr-1" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRename(); }}>
            <Edit className="h-4 w-4 mr-2" />
            Переименовать
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Удалить
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 