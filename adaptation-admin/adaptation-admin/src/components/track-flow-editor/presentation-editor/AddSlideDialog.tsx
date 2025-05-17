import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slide } from '@/types';
import { FileText, ImageIcon, Video, HelpCircle } from 'lucide-react';

interface AddSlideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSlide: (type: Slide['type']) => void;
}

export function AddSlideDialog({ open, onOpenChange, onAddSlide }: AddSlideDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Выберите тип слайда</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 p-4">
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center p-4 h-auto gap-2"
            onClick={() => onAddSlide('text')}
          >
            <FileText className="h-8 w-8 text-blue-500" />
            <span>Текстовый слайд</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center p-4 h-auto gap-2"
            onClick={() => onAddSlide('image')}
          >
            <ImageIcon className="h-8 w-8 text-green-500" />
            <span>Изображение</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center p-4 h-auto gap-2"
            onClick={() => onAddSlide('video')}
          >
            <Video className="h-8 w-8 text-red-500" />
            <span>Видео</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center p-4 h-auto gap-2"
            onClick={() => onAddSlide('test')}
          >
            <HelpCircle className="h-8 w-8 text-orange-500" />
            <span>Тест</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 