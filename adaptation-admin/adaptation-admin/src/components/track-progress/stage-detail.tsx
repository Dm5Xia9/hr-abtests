import React, { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { CurrentTrack, Stage } from '@/types'
import { StageContent } from '@/components/track-progress/stage-content'
import { cn } from '@/lib/utils'

interface StageDetailProps {
  stage: Stage;
  isCompleted: boolean;
  onComplete: (completed: boolean) => void;
  onOrientationChange?: (isLandscape: boolean) => void;
  currentTrack: CurrentTrack;
}

export function StageDetail({ 
  stage, 
  isCompleted, 
  onComplete,
  onOrientationChange,
  currentTrack
}: StageDetailProps) {
  const [isLandscape, setIsLandscape] = useState(false);
  
  // Проверяем ориентацию при монтировании компонента
  useEffect(() => {
    const checkOrientation = () => {
      const newIsLandscape = window.innerWidth > window.innerHeight;
      setIsLandscape(newIsLandscape);
      if (onOrientationChange) {
        onOrientationChange(newIsLandscape);
      }
    };
    
    // Проверка сразу при монтировании
    checkOrientation();
    
    // Также установка события resize для обнаружения изменений вне CustomEvent
    window.addEventListener('resize', checkOrientation);
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
    };
  }, [onOrientationChange]);
  
  // Слушаем событие изменения ориентации от StageContent
  useEffect(() => {
    const handleOrientationChange = (e: CustomEvent) => {
      const newIsLandscape = e.detail.isLandscape;
      setIsLandscape(newIsLandscape);
      if (onOrientationChange) {
        onOrientationChange(newIsLandscape);
      }
    };
    
    window.addEventListener('orientationChange', handleOrientationChange as EventListener);
    
    return () => {
      window.removeEventListener('orientationChange', handleOrientationChange as EventListener);
    };
  }, [onOrientationChange]);
  
  return (
    <div className={cn(
      "min-h-[calc(100vh-30px)]",
      isLandscape ? "p-0" : "pb-8 px-2 pt-1"
    )}>
      {/* Stage content - without card wrapper */}
      <div className="pt-0">
        <StageContent 
          stage={stage} 
          isCompleted={isCompleted}
          onComplete={onComplete}
          currentTrack={currentTrack}
        />
      </div>
      
      {/* Status badge - hide in landscape mode */}
      {isCompleted && !isLandscape && (
        <div className="pt-2">
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="h-4 w-4 mr-1" />
            Выполнено
          </Badge>
        </div>
      )}
    </div>
  )
} 