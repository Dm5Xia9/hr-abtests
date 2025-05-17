import { useState, useEffect } from 'react'
import { GoalStage, ChecklistItem, StageStatus, GoalProgress, StageProgressSummary, CurrentTrack } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { 
  CheckCircle, 
  Calendar, 
  FileText,
  CheckSquare,
  ArrowDown,
  Check as CheckIcon
} from 'lucide-react'
import { useStore } from '@/store/index'
import { useParams } from 'react-router-dom'
import { navigateToNextStage } from '@/utils/navigation'
import api from '@/lib/api'

interface GoalContentProps {
  stage: GoalStage
  isCompleted: boolean
  onComplete: (completed: boolean) => void,
  currentTrack: CurrentTrack
}

export function GoalContent({ stage, isCompleted, onComplete, currentTrack }: GoalContentProps) {
  const [checklist, setChecklist] = useState<Record<string, boolean>>(() => {
    console.log("Initializing checklist state from stage:", stage.id);
    const initialState: Record<string, boolean> = {}
    if (stage.content.checklist) {
      stage.content.checklist.forEach(item => {
        initialState[item.id] = item.completed || false;
        console.log(`Item ${item.id} initial state:`, item.completed);
      })
    }
    return initialState
  })
  
  const [linkedItemsChecked, setLinkedItemsChecked] = useState(false)
  const [showCompleteAnimation, setShowCompleteAnimation] = useState(false)
  const [progressPercent, setProgressPercent] = useState(0)
  const [animatingItems, setAnimatingItems] = useState<Record<string, boolean>>({})
  const [linkedItemsAnimating, setLinkedItemsAnimating] = useState<string[]>([])
  
  // Get access to the track data and navigation methods
  const { employees, tracks, updateTrackProgress } = useStore()
  const { currentUser } = useStore()
  const employeeId = currentUser?.id
  // Calculate progress percentage
  useEffect(() => {
    if (!stage.content.checklist || stage.content.checklist.length === 0) {
      setProgressPercent(isCompleted ? 100 : 0);
      return;
    }
    
    const totalItems = stage.content.checklist.length;
    const completedItems = stage.content.checklist.filter(item => checklist[item.id]).length;
    const newProgress = Math.round((completedItems / totalItems) * 100);
    
    console.log(`Progress calculation: ${completedItems}/${totalItems} items completed = ${newProgress}%`);
    
    // Animate progress change
    const startValue = progressPercent;
    const endValue = newProgress;
    const duration = 800; // milliseconds
    const startTime = performance.now();
    
    const animateProgress = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress); // Exponential easing
      
      const currentValue = startValue + (endValue - startValue) * easedProgress;
      setProgressPercent(Math.round(currentValue));
      
      if (progress < 1) {
        requestAnimationFrame(animateProgress);
      }
    };
    
    requestAnimationFrame(animateProgress);
    
    // Проверяем, выполнены ли все элементы чеклиста
    const allItemsCompleted = totalItems > 0 && completedItems === totalItems;
    if (allItemsCompleted && !isCompleted) {
      console.log("All items completed, ready for user to finish");
      // Не выполняем автоматическое завершение, пользователь сделает это сам кнопкой
    }
  }, [checklist, stage.content.checklist, isCompleted, onComplete]);

  // Improved logic for checking linked checklist items when component mounts
  useEffect(() => {
    // Only run once when the component mounts
    if (!stage.content.checklist || !employeeId || linkedItemsChecked) return;
    
    const linkedItems = stage.content.checklist.filter(item => 
      item.type === 'linked' && item.linkedStageId
    );
    
    if (linkedItems.length === 0) {
      setLinkedItemsChecked(true);
      return;
    }
    
    console.log("Checking linked items:", linkedItems);
    
    // Set this to true immediately to ensure this effect runs only once
    setLinkedItemsChecked(true);
    
    // Track which items need animation
    const itemsToAnimate: string[] = [];
    let hasUpdatedAnyItems = false;
    
    // Debug: Check what steps we have in the current track
    console.log("Current track steps:", Object.keys(currentTrack.steps));
    
    // Check each linked item with a slight delay to create a cascading animation effect
    linkedItems.forEach((item, index) => {
      if (!item.linkedStageId) return;
      
      setTimeout(() => {
        // Check if linked stage is completed using currentTrack.steps
        const linkedStageProgress = item.linkedStageId ? currentTrack.steps[item.linkedStageId] : undefined;
        console.log(linkedStageProgress); 
        const linkedStageCompleted = linkedStageProgress?.summary.status === 'completed';
        console.log("Linked stage completed:", linkedStageCompleted); 

        let linkedStageName = "связанный этап";
        
        // Try to find the stage in milestones to get the name (for display purposes only)
        for (const milestone of currentTrack.milestones) {
          const linkedStage = milestone.stages.find(s => s.id === item.linkedStageId);
          if (linkedStage) {
            linkedStageName = linkedStage.title || "этап";
            break;
          }
        }
        
        console.log(`Checking linked stage ${item.linkedStageId} (${linkedStageName}):`, 
          linkedStageProgress ? `status: ${linkedStageProgress.summary?.status}` : "not found", 
          "completed:", linkedStageCompleted);

        // If linked stage is completed but checklist item is not marked as completed
        if (linkedStageCompleted && !checklist[item.id]) {
          hasUpdatedAnyItems = true;

          // Add this item to the animating list
          setLinkedItemsAnimating(prev => [...prev, item.id]);
          
          // After animation duration, update the actual state
          setTimeout(() => {
            setChecklist(prev => ({
              ...prev,
              [item.id]: true
            }));
            
            // Update the original checklist item to persist this change
            if (stage.content.checklist) {
              const checklistIndex = stage.content.checklist.findIndex(i => i.id === item.id);
              if (checklistIndex !== -1) {
                stage.content.checklist[checklistIndex].completed = true;
              }
            }
            
            // Remove from animating list
            setLinkedItemsAnimating(prev => prev.filter(id => id !== item.id));
            
            // Оставим обновление состояния только в локальном компоненте
            // без вызова API-функции обновления 
            
            // Если в будущем понадобится сохранять состояние через API:
            // updateTrackProgress(employeeId, stage.id, false);
          }, 800); // Animation duration
        }
      }, index * 300); // Stagger the animations
    });
    
    // Отправляем обновление в API только после завершения всех анимаций
    if (hasUpdatedAnyItems) {
      const lastItemIndex = linkedItems.length - 1;
      setTimeout(() => {
        // Проверяем, все ли элементы чеклиста теперь отмечены
        const allCompleted = stage.content.checklist?.every(item => 
          item.id in checklist ? checklist[item.id] : item.completed
        ) || false;
        
        console.log("Preparing to save linked items state to API");
        
        // Отправляем обновление в API только после завершения всех анимаций
        if (updateTrackProgress && employeeId) {
          try {
            const checklistItems = stage.content.checklist?.map(item => ({
              itemId: item.id,
              completed: item.id in checklist ? checklist[item.id] : item.completed,
              completedAt: item.id in checklist && checklist[item.id] ? new Date().toISOString() : undefined
            })) || [];
            
            const summary: StageProgressSummary = {
              stageId: stage.id,
              status: allCompleted ? 'completed' : 'in_progress',
              completedAt: allCompleted ? new Date().toISOString() : undefined,
              startedAt: new Date().toISOString()
            };
            
            const detail: GoalProgress = {
              checklistItems,
              completed: allCompleted,
            };
            
            const updateData = {
              stageId: stage.id,
              type: 'goal' as const,
              summary,
              detail
            };
            
            console.log("Sending linked items update to API:", JSON.stringify(updateData));
            
            updateTrackProgress(stage.id, updateData)
              .then(() => {
                console.log('Linked items API update successful, all completed:', allCompleted);
                
                // Если все пункты выполнены, только сообщаем в консоль
                if (allCompleted && !isCompleted) {
                  console.log("All linked items completed, ready for user to finish");
                }
              })
              .catch(error => {
                console.error("API update for linked items failed:", error);
              });
          } catch (error) {
            console.error("Error preparing linked items update data:", error);
          }
        }
      }, lastItemIndex * 300 + 1000); // Задержка = время всех анимаций + финальная анимация
    }
    
  }, [stage, employeeId, currentTrack, isCompleted, onComplete, checklist]);
  
  const handleCheckItem = (itemId: string) => {
    // Don't allow toggling linked items - they're automated
    const item = stage.content.checklist?.find(i => i.id === itemId);
    if (item?.type === 'linked') return;
    
    console.log("Handling click on checklist item:", itemId);
    
    // Set this item to animating state
    setAnimatingItems(prev => ({
      ...prev,
      [itemId]: true
    }));
    
    // After animation duration, update the actual state
    setTimeout(() => {
      // Toggle the item's checked state
      const newCheckedState = !checklist[itemId];
      console.log(`Changing state for ${itemId} from ${checklist[itemId]} to ${newCheckedState}`);
      
      setChecklist(prev => {
        const updated = {
          ...prev,
          [itemId]: newCheckedState
        };
        console.log("Updated checklist state:", updated);
        return updated;
      });
      
      // Update the original checklist item to persist this change
      if (stage.content.checklist) {
        const checklistIndex = stage.content.checklist.findIndex(i => i.id === itemId);
        if (checklistIndex !== -1) {
          stage.content.checklist[checklistIndex].completed = newCheckedState;
          console.log("Updated original checklist item.completed =", newCheckedState);
        }
        
        
        // Save to API - don't change overall completion status
        if (updateTrackProgress && employeeId) {
          // Check if all items are now completed
          const allItemsCompleted = stage.content.checklist.every(item => {
            // For the current item being changed, use the new state
            if (item.id === itemId) {
              return newCheckedState;
            }
            // For all other items, use their current state
            return checklist[item.id];
          });
          
          console.log("All items completed?", allItemsCompleted);
          
          try {
            // Создаем массив элементов чеклиста с текущими состояниями
            const checklistItems = stage.content.checklist.map(item => {
              const isCompleted = item.id === itemId ? newCheckedState : checklist[item.id];
              return {
                itemId: item.id,
                completed: isCompleted,
                completedAt: isCompleted ? new Date().toISOString() : undefined
              };
            });
            
            // Формируем объект обновления
            const summary: StageProgressSummary = {
              stageId: stage.id,
              status: allItemsCompleted ? 'completed' : 'in_progress',
              completedAt: allItemsCompleted ? new Date().toISOString() : undefined
            };
            
            const detail: GoalProgress = {
              checklistItems,
              completed: allItemsCompleted
            };
            
            const updateData = {
              stageId: stage.id,
              type: 'goal' as const,
              summary,
              detail
            };
            
            console.log("Sending update to API:", JSON.stringify(updateData));
            
            // Отправляем обновление на сервер
            updateTrackProgress(stage.id, updateData)
              .then(() => {
                console.log("API update successful");
                
                // Если все пункты выполнены, сообщаем в консоль
                if (allItemsCompleted && !isCompleted) {
                  console.log("All linked items completed, ready for user to finish");
                }
              })
              .catch(error => {
                console.error("API update failed:", error);
              });
          } catch (error) {
            console.error("Error preparing or sending update:", error);
          }
          
          console.log(`Updated checklist item ${itemId} to ${newCheckedState}, all completed: ${allItemsCompleted}`);
        }
      }
      
      // Remove animating state
      setTimeout(() => {
        setAnimatingItems(prev => {
          const newState = { ...prev };
          delete newState[itemId];
          return newState;
        });
      }, 300);
    }, 300);
  }
  
  const allChecklistItemsCompleted = stage.content.checklist ? 
    stage.content.checklist.every(item => checklist[item.id]) : 
    false;

  // Log when the component renders with stages
  useEffect(() => {
    console.log("GoalContent rendered with stage:", stage.id);
    console.log("Current checklist state:", checklist);
    console.log("Is stage completed:", isCompleted);
    
    if (stage.content.checklist) {
      console.log("Checklist items:", stage.content.checklist.length);
      stage.content.checklist.forEach(item => {
        console.log(`Item ${item.id}: ${item.text} - completed: ${item.completed}`);
      });
    }
  }, []);

  return (
    <div className="flex flex-col min-h-[calc(100vh-250px)]">
      {/* Complete animation overlay */}
      {showCompleteAnimation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-lg p-8 shadow-xl transform animate-scale-up flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-500 animate-bounce" />
            </div>
            <h3 className="text-xl font-medium text-center mb-2">Задача выполнена!</h3>
            <p className="text-muted-foreground text-center mb-4">Отличная работа, все пункты чек-листа выполнены</p>
          </div>
        </div>
      )}
      
      <div className="flex-1 space-y-4">
        {/* Progress bar and status */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pb-2 pt-1 rounded-md">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="relative h-8 w-8 flex-shrink-0">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden"
                    style={{ 
                      background: `conic-gradient(theme(colors.primary.DEFAULT) ${progressPercent}%, transparent 0%)` 
                    }}
                  >
                    <div className="h-6 w-6 rounded-full bg-background flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {progressPercent}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {isCompleted ? "Задача выполнена" : "В процессе"}
                </span>
                {stage.content.checklist && (
                  <span className="text-xs text-muted-foreground">
                    {stage.content.checklist.filter(item => checklist[item.id]).length}/{stage.content.checklist.length} выполнено
                  </span>
                )}
              </div>
            </div>
            
            {isCompleted && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 animate-pulse-slow">
                <CheckCircle className="h-3 w-3 mr-1" /> Выполнено
              </Badge>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-1000 ease-out origin-left"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
        
        {/* Goal description with card styling */}
        <div className="bg-muted/30 rounded-lg border p-4 transition-all duration-300 hover:shadow-md">
          <h3 className="text-base font-medium mb-2">Описание задачи</h3>
          <div className="prose prose-sm max-w-none text-sm">
            <div dangerouslySetInnerHTML={{ __html: stage.content.description }} />
          </div>
        </div>
        
        {/* Metadata in more visual cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {stage.content.deadline && (
            <div className="flex items-start space-x-3 p-3 rounded-lg border border-primary/10 bg-primary/5 transition-all duration-300 hover:shadow-sm">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-primary/70 font-medium">Срок выполнения</span>
                <div className="text-sm font-medium">
                  {format(new Date(stage.content.deadline), 'dd.MM.yyyy')}
                </div>
              </div>
            </div>
          )}
            
          {stage.content.externalLink && (
            <div className="flex items-start space-x-3 p-3 rounded-lg border border-primary/10 bg-primary/5 transition-all duration-300 hover:shadow-sm">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-primary/70 font-medium">Материалы</span>
                <div className="text-sm">
                  <a 
                    href={stage.content.externalLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline flex items-center"
                  >
                    Открыть ресурс
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Checklist with animations */}
        {stage.content.checklist && stage.content.checklist.length > 0 && (
          <div className="space-y-2 pt-2">
            <h3 className="text-sm font-medium flex items-center">
              <CheckSquare className="h-4 w-4 mr-2 text-primary" />
              Чек-лист задачи
            </h3>
            
            <div className="space-y-2">
              {stage.content.checklist.map((item, index) => {
                const isChecked = checklist[item.id];
                const isAnimating = animatingItems[item.id];
                
                return (
                  <div 
                    key={item.id} 
                    className={cn(
                      "flex items-start space-x-2 p-3 rounded-md transition-all duration-300",
                      isChecked 
                        ? "bg-green-50 border border-green-200" 
                        : "bg-background border hover:border-primary/20",
                      isAnimating && "animate-pulse",
                      linkedItemsAnimating.includes(item.id) && "animate-pulse bg-green-50/50"
                    )}
                  >
                    <div className="pt-0.5">
                      <Checkbox 
                        id={item.id} 
                        checked={isChecked} 
                        onCheckedChange={() => handleCheckItem(item.id)}
                        disabled={item.type === 'linked'}
                        className={cn(
                          "transition-all duration-300",
                          isChecked ? "text-green-500 border-green-500" : ""
                        )}
                      />
                    </div>
                    <div className="flex flex-col">
                      <Label 
                        htmlFor={item.id} 
                        className={cn(
                          "text-sm flex-1 cursor-pointer transition-all duration-300",
                          item.type === 'linked' ? 'text-muted-foreground' : '',
                          isChecked && 'line-through text-muted-foreground'
                        )}
                      >
                        {item.text}
                      </Label>
                      
                      {item.type === 'linked' && (
                        <span className="text-xs text-muted-foreground mt-0.5 flex items-center">
                          <ArrowDown className="h-3 w-3 mr-1" />
                          {linkedItemsAnimating.includes(item.id) 
                            ? "Проверка выполнения..." 
                            : "Завершается автоматически"}
                        </span>
                      )}
                    </div>
                    
                    {isChecked && (
                      <div className="ml-auto">
                        <div className={cn(
                          "h-5 w-5 rounded-full bg-green-100 flex items-center justify-center",
                          isAnimating ? "animate-scale-up" : "animate-delayed-fadeIn"
                        )}>
                          <CheckIcon className="h-3 w-3 text-green-600" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* Complete button (hidden if all checklist items are completed) */}
      {!allChecklistItemsCompleted && !isCompleted && (
        <div className="mt-auto mb-0 grid grid-cols-1 gap-3 pt-4 sticky bottom-0 bg-background pb-2">
          <div className="text-center text-sm text-muted-foreground mb-1">
            Выполните все пункты чек-листа для завершения задачи
          </div>
        </div>
      )}

      {/* Complete button - shown ONLY when all checklist items are completed but stage is not marked as completed */}
      {allChecklistItemsCompleted && !isCompleted && (
        <div className="mt-auto mb-0 grid grid-cols-1 gap-3 pt-4 sticky bottom-0 bg-background pb-2">
          <div className="text-center mb-3">
            <div className="text-sm text-green-600 mb-2 bg-green-50 inline-block px-3 py-1 rounded-full">
              Все пункты чек-листа выполнены!
            </div>
          </div>
          
          <Button
            variant="default"
            className="bg-gradient-to-r from-primary to-green-500 hover:from-primary/90 hover:to-green-500/90 text-white font-medium py-6"
            onClick={() => {
              setShowCompleteAnimation(true);
              
              // Отправляем обновление в API
              if (updateTrackProgress && employeeId && stage.content.checklist) {
                try {
                  const checklistItems = stage.content.checklist.map(item => ({
                    itemId: item.id,
                    completed: checklist[item.id],
                    completedAt: checklist[item.id] ? new Date().toISOString() : undefined
                  }));
                  
                  const summary: StageProgressSummary = {
                    stageId: stage.id,
                    status: 'completed',
                    completedAt: new Date().toISOString(),
                    startedAt: new Date().toISOString() // TODO: можно заменить на реальное время начала
                  };
                  
                  const detail: GoalProgress = {
                    checklistItems,
                    completed: true
                  };
                  
                  const updateData = {
                    stageId: stage.id,
                    type: 'goal' as const,
                    summary,
                    detail
                  };
                  
                  console.log("Completing stage, sending update to API:", JSON.stringify(updateData));
                  
                  updateTrackProgress(stage.id, updateData)
                    .then(() => {
                      console.log("Stage completion API update successful");
                      
                      setTimeout(() => {
                        onComplete(true);
                      }, 1000);
                    })
                    .catch(error => {
                      console.error("Stage completion API update failed:", error);
                      // Even if API fails, still complete the stage
                      setTimeout(() => {
                        onComplete(true);
                      }, 1000);
                    });
                } catch (error) {
                  console.error("Error preparing completion data:", error);
                  // Even if there's an error, complete the stage
                  setTimeout(() => {
                    onComplete(true);
                  }, 1000);
                }
              } else {
                // If no API or user ID, just complete the stage
                setTimeout(() => {
                  onComplete(true);
                }, 1000);
              }
            }}
          >
            Завершить задачу
          </Button>
        </div>
      )}
    </div>
  )
} 