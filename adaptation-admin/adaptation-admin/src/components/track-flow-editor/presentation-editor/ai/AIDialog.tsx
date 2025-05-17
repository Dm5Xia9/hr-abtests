import React, { useState } from 'react';
import { AIModel } from '@/types/ai-presentation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { ModelSelector } from './ModelSelector';
import { DEFAULT_MODEL } from './AIModels';

interface AIDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (title: string, model: AIModel) => void;
  title?: string;
  model?: AIModel;
  mode: 'create' | 'rename';
}

export function AIDialog({
  isOpen,
  onClose,
  onConfirm,
  title = '',
  model = DEFAULT_MODEL,
  mode
}: AIDialogProps) {
  const [chatTitle, setChatTitle] = useState(title);
  const [chatModel, setChatModel] = useState<AIModel>(model);

  const handleConfirm = () => {
    if (chatTitle.trim()) {
      onConfirm(chatTitle, chatModel);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  // Сбросить состояние при закрытии
  React.useEffect(() => {
    if (isOpen) {
      setChatTitle(title);
      setChatModel(model);
    }
  }, [isOpen, title, model]);

  const dialogTitle = mode === 'create' 
    ? 'Новая генерация презентации' 
    : 'Переименовать генерацию';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Название
            </label>
            <Input
              value={chatTitle}
              onChange={(e) => setChatTitle(e.target.value)}
              placeholder="Введите название"
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
          
          {mode === 'create' && (
            <ModelSelector
              selectedModel={chatModel}
              onModelChange={setChatModel}
            />
          )}
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Отмена</Button>
          </DialogClose>
          <Button 
            onClick={handleConfirm}
            disabled={!chatTitle.trim()}
          >
            {mode === 'create' ? 'Создать' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 