import { useState, useCallback, useEffect, useRef } from 'react'
import { Track, Milestone, Stage } from '@/types'
// Временно игнорируем импорт компонентов, которые будут созданы позже
// @ts-ignore
import { MilestoneList } from './track-flow-editor/MilestoneList'
// @ts-ignore
import { StageList } from './track-flow-editor/StageList'
// @ts-ignore
import { StageEditor } from './track-flow-editor/StageEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PanelLeftClose, PanelLeft, Save, Edit, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { useStore } from '@/store/index'

interface TrackFlowEditorProps {
  track: Track
  onChange: (track: Track) => void
  onSave?: (track: Track) => Promise<void>
}

export const TrackFlowEditor: React.FC<TrackFlowEditorProps> = ({
  track,
  onChange,
  onSave
}) => {
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null)
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null)
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(true)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [trackTitle, setTrackTitle] = useState(track.title)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isTrackCreated, setIsTrackCreated] = useState(false)
  const [savedTrackId, setSavedTrackId] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { createTrack, updateTrackContent, tracks } = useStore()

  const selectedMilestone = track.milestones.find(m => m.id === selectedMilestoneId)
  const selectedStage = selectedMilestone?.stages?.find(s => s.id === selectedStageId)

  // Проверяем, существует ли трек в сторе (есть ли трек с таким же ID)
  const trackExistsInStore = tracks.some(t => t.id === track.id)

  // При первой загрузке отмечаем трек как созданный, если он уже существует в сторе
  useEffect(() => {
    if (trackExistsInStore && !isTrackCreated) {
      setIsTrackCreated(true)
      setSavedTrackId(track.id)
    }
  }, [trackExistsInStore, isTrackCreated, track.id])

  // Сбрасываем статус сохранения через 3 секунды
  useEffect(() => {
    if (saveStatus === 'success' || saveStatus === 'error') {
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current)
      }
      
      statusTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle')
      }, 3000)
    }
    
    return () => {
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current)
      }
    }
  }, [saveStatus])

  // Обновляем локальное состояние заголовка при изменении трека
  useEffect(() => {
    setTrackTitle(track.title)
  }, [track.title])

  // Настраиваем автосохранение
  useEffect(() => {
    // Функция сохранения
    const saveTrack = async () => {
      try {
        // Если ничего не изменилось с последнего сохранения, не сохраняем
        if (lastSaved && isSaving) return;
        
        setIsSaving(true)
        setSaveStatus('saving')
        
        // Проверяем, существует ли трек в базе данных или является новым
        if (onSave) {
          // Используем переданную функцию, если она предоставлена
          await onSave(track)
        } else {
          // Если трек еще не создан, создаем его
          if (!isTrackCreated && !trackExistsInStore) {
            console.log('Создаем новый трек:', track.id);
            const { id, ...trackWithoutId } = track;
            
            try {
              // Вызываем API для создания трека и получаем ответ
              await createTrack(trackWithoutId);
              
              // Проверяем, появился ли трек в сторе после создания
              // В идеале API должен возвращать ID, но если он не возвращает,
              // используем существующий ID для обновлений
              const createdTrack = tracks.find(t => 
                t.title === track.title && 
                t.description === track.description
              );
              
              if (createdTrack) {
                setSavedTrackId(createdTrack.id);
                // Обновляем локальное представление трека с новым ID
                onChange({ ...track, id: createdTrack.id });
              } else {
                // Если не нашли трек, используем текущий ID
                setSavedTrackId(track.id);
              }
              
              setIsTrackCreated(true);
            } catch (error) {
              setSaveStatus('error');
              throw error;
            }
          } else {
            // Иначе обновляем существующий трек
            console.log('Обновляем существующий трек:', savedTrackId || track.id);
            // Используем сохраненный ID, если он есть, иначе ID из текущего трека
            const trackToUpdate = { 
              ...track, 
              id: savedTrackId || track.id 
            };
            await updateTrackContent(trackToUpdate);
          }
        }
        
        setLastSaved(new Date())
        setSaveStatus('success')
        setIsSaving(false)
      } catch (error) {
        console.error('Ошибка при сохранении трека:', error)
        toast({
          title: 'Ошибка сохранения',
          description: error instanceof Error ? error.message : 'Не удалось сохранить трек адаптации',
          variant: 'destructive'
        })
        setSaveStatus('error')
        setIsSaving(false)
      }
    }

    // Очищаем предыдущий таймер при повторном запуске
    if (saveTimeoutRef.current) {
      clearInterval(saveTimeoutRef.current)
    }

    // Устанавливаем новый таймер автосохранения
    saveTimeoutRef.current = setInterval(saveTrack, 10000) // каждые 10 секунд

    // Очищаем таймер при размонтировании
    return () => {
      if (saveTimeoutRef.current) {
        clearInterval(saveTimeoutRef.current)
      }
    }
  }, [track, onSave, createTrack, updateTrackContent, toast, isTrackCreated, trackExistsInStore, lastSaved, isSaving, savedTrackId, onChange, tracks])

  const handleTrackChange = (updates: Partial<Track>) => {
    onChange({ ...track, ...updates })
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTrackTitle(e.target.value)
  }

  const handleTitleBlur = () => {
    handleTrackChange({ title: trackTitle })
    setIsEditingTitle(false)
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTrackChange({ title: trackTitle })
      setIsEditingTitle(false)
    } else if (e.key === 'Escape') {
      setTrackTitle(track.title)
      setIsEditingTitle(false)
    }
  }

  const startTitleEdit = () => {
    setIsEditingTitle(true)
    // Фокусируемся на инпуте после смены состояния
    setTimeout(() => {
      titleInputRef.current?.focus()
      titleInputRef.current?.select()
    }, 0)
  }

  const handleSaveNow = async () => {
    if (!isSaving) {
      try {
        setIsSaving(true)
        setSaveStatus('saving')
        
        if (onSave) {
          await onSave(track)
        } else {
          // Если трек еще не создан, создаем его
          if (!isTrackCreated && !trackExistsInStore) {
            console.log('Создаем новый трек (ручное сохранение):', track.id);
            const { id, ...trackWithoutId } = track;
            
            try {
              // Вызываем API для создания трека
              await createTrack(trackWithoutId);
              
              // Проверяем, появился ли трек в сторе после создания
              const createdTrack = tracks.find(t => 
                t.title === track.title && 
                t.description === track.description
              );
              
              if (createdTrack) {
                setSavedTrackId(createdTrack.id);
                // Обновляем локальное представление трека с новым ID
                onChange({ ...track, id: createdTrack.id });
              } else {
                // Если не нашли трек, используем текущий ID
                setSavedTrackId(track.id);
              }
              
              setIsTrackCreated(true);
            } catch (error) {
              setSaveStatus('error');
              throw error;
            }
          } else {
            // Иначе обновляем существующий трек
            console.log('Обновляем существующий трек (ручное сохранение):', savedTrackId || track.id);
            // Используем сохраненный ID, если он есть, иначе ID из текущего трека
            const trackToUpdate = { 
              ...track, 
              id: savedTrackId || track.id 
            };
            await updateTrackContent(trackToUpdate);
          }
        }
        
        setLastSaved(new Date())
        setSaveStatus('success')
        toast({
          title: 'Сохранено',
          description: 'Трек адаптации успешно сохранен'
        })
        setIsSaving(false)
      } catch (error) {
        console.error('Ошибка при сохранении трека:', error)
        toast({
          title: 'Ошибка сохранения',
          description: error instanceof Error ? error.message : 'Не удалось сохранить трек адаптации',
          variant: 'destructive'
        })
        setSaveStatus('error')
        setIsSaving(false)
      }
    }
  }

  const handleMilestoneChange = (id: string, updates: Partial<Milestone>) => {
    const updatedMilestones = track.milestones.map(m => 
      m.id === id ? { ...m, ...updates } : m
    )
    handleTrackChange({ milestones: updatedMilestones })
  }

  const handleMilestoneDragEnd = (result: any) => {
    if (!result.destination) return
    
    const items = Array.from(track.milestones)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    
    handleTrackChange({ milestones: items })
  }

  const handleStageDragEnd = (result: any) => {
    if (!result.destination || !selectedMilestone) return
    
    const items = Array.from(selectedMilestone.stages || [])
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    
    handleMilestoneChange(selectedMilestone.id, { stages: items })
  }

  const handleStageSelect = (stageId: string | null) => {
    setSelectedStageId(stageId)
  }

  const handleMilestoneSelect = (milestoneId: string | null) => {
    setSelectedMilestoneId(milestoneId)
    setSelectedStageId(null)
  }

  // Функция форматирования времени последнего сохранения
  const formatLastSavedTime = () => {
    if (!lastSaved) return '';
    
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(lastSaved);
  }

  // Получаем текст статуса сохранения
  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Сохранение...';
      case 'success':
        return `Сохранено в ${formatLastSavedTime()}`;
      case 'error':
        return 'Ошибка сохранения';
      default:
        return lastSaved ? `Сохранено в ${formatLastSavedTime()}` : '';
    }
  }

  // Получаем класс для текста статуса
  const getSaveStatusClass = () => {
    switch (saveStatus) {
      case 'saving':
        return 'text-muted-foreground';
      case 'success':
        return 'text-green-600 dark:text-green-500';
      case 'error':
        return 'text-red-600 dark:text-red-500';
      default:
        return 'text-muted-foreground';
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Шапка с названием трека */}
      <div className="border-b p-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-2 flex-1">
          {isEditingTitle ? (
            <div className="flex items-center gap-2 flex-1 max-w-2xl">
              <Input
                ref={titleInputRef}
                value={trackTitle}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                className="text-lg font-medium h-9"
                placeholder="Название трека адаптации"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleTitleBlur}
                className="h-8 w-8"
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div 
              className="flex items-center gap-2 cursor-pointer hover:text-primary group flex-1"
              onClick={startTitleEdit}
            >
              <h1 className="text-lg font-medium">{trackTitle || "Без названия"}</h1>
              <Edit className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {saveStatus === 'saving' && (
              <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin" />
            )}
            <span className={`text-xs ${getSaveStatusClass()} transition-colors`}>
              {getSaveStatusText()}
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSaveNow}
            disabled={isSaving}
            className="h-8"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </div>
      
      {/* Основной контент */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column - Milestones */}
        <div className={cn(
          "border-r h-full transition-all duration-300 ease-in-out",
          isLeftPanelVisible ? "w-64" : "w-0 overflow-hidden"
        )}>
          <MilestoneList 
            milestones={track.milestones}
            selectedMilestoneId={selectedMilestoneId}
            onMilestoneSelect={handleMilestoneSelect}
            onDragEnd={handleMilestoneDragEnd}
            onChange={handleTrackChange}
          />
        </div>
        
        {/* Middle Column - Stages */}
        <div className={cn(
          "border-r h-full transition-all duration-300 ease-in-out relative",
          isLeftPanelVisible ? "w-80" : "w-0 overflow-hidden"
        )}>
          {selectedMilestone ? (
            <>
              <StageList
                milestone={selectedMilestone}
                selectedStageId={selectedStageId}
                onStageSelect={handleStageSelect}
                onDragEnd={handleStageDragEnd}
                onChange={(updates) => handleMilestoneChange(selectedMilestone.id, updates)}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground p-4 text-center">
              Выберите веху в списке слева, чтобы увидеть и отредактировать её этапы
            </div>
          )}
        </div>
        
        {/* Toggle button positioned at center of screen */}
        {selectedStage && (
          <div className={cn(
            "fixed z-30 top-1/2 -translate-y-1/2 transition-all duration-300",
            isLeftPanelVisible ? "left-[144px]" : "left-4"
          )}>
            <Button 
              variant="outline" 
              size="icon" 
              className={cn(
                "h-8 w-8 rounded-full shadow-md border",
                isLeftPanelVisible && "translate-x-[0.25rem]"
              )}
              onClick={() => setIsLeftPanelVisible(prev => !prev)}
              title={isLeftPanelVisible ? "Скрыть панель навигации" : "Показать панель навигации"}
            >
              {isLeftPanelVisible ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
            </Button>
            <span className={cn(
              "absolute whitespace-nowrap bg-secondary rounded px-2 py-1 text-xs font-medium top-9 left-1/2 -translate-x-1/2 opacity-0 transition-opacity shadow-sm",
              !isLeftPanelVisible && "opacity-100 delay-500"
            )}>
              {isLeftPanelVisible ? "" : "Панель скрыта"}
            </span>
          </div>
        )}

        {/* Right Column - Stage Editor */}
        <div className="flex-1 h-full overflow-auto">
          {selectedStage ? (
            <StageEditor
              stage={selectedStage}
              milestone={selectedMilestone!}
              onChange={(updatedStage) => {
                if (!selectedMilestone) return
                
                const updatedStages = (selectedMilestone.stages || []).map(s => 
                  s.id === selectedStage.id ? { ...s, ...updatedStage } : s
                )
                
                handleMilestoneChange(selectedMilestone.id, { stages: updatedStages as Stage[] })
              }}
              onBack={() => setSelectedStageId(null)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground p-4 text-center">
              Выберите этап, чтобы отредактировать его содержимое
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 