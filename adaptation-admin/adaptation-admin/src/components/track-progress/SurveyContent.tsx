import { useState, useEffect, useRef } from 'react'
import { SurveyStage, TextQuestion, ChoiceQuestion, ScaleQuestion } from '@/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  CheckCircle, 
  AlertCircle,
  Check as CheckIcon
} from 'lucide-react'
import { useStore } from '@/store/index'
import { useParams } from 'react-router-dom'
import { navigateToNextStage } from '@/utils/navigation'

interface SurveyContentProps {
  stage: SurveyStage
  isCompleted: boolean
  onComplete: (completed: boolean) => void
}

export function SurveyContent({ stage, isCompleted, onComplete }: SurveyContentProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [activeQuestion, setActiveQuestion] = useState(0)
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false)
  const [progressPercent, setProgressPercent] = useState(0)
  const [animatingAnswer, setAnimatingAnswer] = useState<string | null>(null)
  
  // Get access to the track data and navigation methods
  const { employees, tracks } = useStore()
  const { employeeId } = useParams()
  
  // References for scroll animations
  const questionsContainerRef = useRef<HTMLDivElement>(null)
  
  // Calculate progress on answers change
  useEffect(() => {
    if (!stage.content.questions || stage.content.questions.length === 0) {
      setProgressPercent(isCompleted ? 100 : 0);
      return;
    }
    
    // Count required questions and answered required questions
    const requiredQuestions = stage.content.questions.filter(q => q.required);
    const answeredRequiredQuestions = requiredQuestions.filter(q => {
      const answer = answers[q.id];
      
      if (q.type === 'text') {
        return !!answer && answer.trim() !== '';
      } else if (q.type === 'choice') {
        if ((q as ChoiceQuestion).multiple) {
          return answer && Array.isArray(answer) && answer.length > 0;
        } else {
          return !!answer;
        }
      } else if (q.type === 'scale') {
        return typeof answer === 'number';
      }
      
      return false;
    });
    
    // If no required questions, calculate based on all questions
    const totalItems = requiredQuestions.length || stage.content.questions.length;
    const completedItems = requiredQuestions.length ? 
      answeredRequiredQuestions.length : 
      Object.keys(answers).length;
    
    const newProgress = Math.round((completedItems / totalItems) * 100);
    
    // Animate progress change
    const startValue = progressPercent;
    const endValue = newProgress;
    const duration = 600; // milliseconds
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
  }, [answers, stage.content.questions, isCompleted, progressPercent]);
  
  // Handle text input with animation
  const handleTextInput = (questionId: string, value: string) => {
    setAnimatingAnswer(questionId);
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Remove animation after a short delay
    setTimeout(() => {
      setAnimatingAnswer(null);
    }, 300);
  }
  
  // Handle choice input with animation
  const handleChoiceInput = (questionId: string, value: string, multiple: boolean) => {
    setAnimatingAnswer(questionId);
    
    if (multiple) {
      setAnswers(prev => {
        const current = prev[questionId] || [];
        if (current.includes(value)) {
          return {
            ...prev,
            [questionId]: current.filter((v: string) => v !== value)
          }
        } else {
          return {
            ...prev,
            [questionId]: [...current, value]
          }
        }
      });
    } else {
      setAnswers(prev => ({
        ...prev,
        [questionId]: value
      }));
    }
    
    // Remove animation after a short delay
    setTimeout(() => {
      setAnimatingAnswer(null);
    }, 300);
  }
  
  // Handle scale input with animation
  const handleScaleInput = (questionId: string, value: number) => {
    setAnimatingAnswer(questionId);
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Remove animation after a short delay
    setTimeout(() => {
      setAnimatingAnswer(null);
    }, 300);
  }
  
  // Smooth scroll to next question
  const scrollToNextQuestion = (index: number) => {
    if (!questionsContainerRef.current) return;
    
    const container = questionsContainerRef.current;
    const questionElements = container.querySelectorAll('.survey-question');
    
    if (index < questionElements.length) {
      const targetQuestion = questionElements[index];
      
      container.scrollTo({
        top: targetQuestion.getBoundingClientRect().top + container.scrollTop - 100,
        behavior: 'smooth'
      });
      
      setActiveQuestion(index);
    }
  };
  
  // Handle survey submission
  const handleSubmit = () => {
    // If already completed, don't allow uncompleting
    if (isCompleted) {
      return;
    }
    
    // Show completion animation
    setShowCompletionAnimation(true);
    
    // Complete after animation finishes
    setTimeout(() => {
    // Complete the current stage (always set to true, no uncompleting)
    onComplete(true);
    
      // Proceed to the next stage after completion
    setTimeout(() => {
      navigateToNextStage(stage, employees, tracks, employeeId);
      }, 500);
    }, 1500);
  }
  
  // Check if all required questions are answered
  const canSubmit = () => {
    return stage.content.questions.every(question => {
      if (!question.required) return true;
      
      const answer = answers[question.id];
      if (question.type === 'text') {
        return !!answer && answer.trim() !== '';
      } else if (question.type === 'choice') {
        if ((question as ChoiceQuestion).multiple) {
          return answer && Array.isArray(answer) && answer.length > 0;
        } else {
          return !!answer;
        }
      } else if (question.type === 'scale') {
        return typeof answer === 'number';
      }
      
      return false;
    });
  };
  
  // Count answered and total questions
  const answeredQuestions = stage.content.questions.filter(q => {
    const answer = answers[q.id];
    return answer !== undefined && 
      (typeof answer === 'number' || 
      (typeof answer === 'string' && answer.trim() !== '') || 
      (Array.isArray(answer) && answer.length > 0));
  }).length;
  
  const totalQuestions = stage.content.questions.length;

  return (
    <div className="flex flex-col min-h-[calc(100vh-250px)]">
      {/* Completion animation overlay */}
      {showCompletionAnimation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <CheckIcon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-medium text-center mb-2">Опрос завершен!</h3>
            <p className="text-muted-foreground text-center mb-4">Спасибо за ваши ответы</p>
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
                  {isCompleted ? "Опрос завершен" : "Заполнение опроса"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {answeredQuestions}/{totalQuestions} вопросов
                </span>
              </div>
            </div>
            
        {isCompleted && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" /> Отправлено
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
        
        {/* Survey description */}
        <div className="bg-muted/30 rounded-lg border p-4 transition-all duration-300 hover:shadow-md">
          <h3 className="text-base font-medium mb-2">{stage.content.title}</h3>
        <div className="prose prose-sm max-w-none text-sm">
          <div dangerouslySetInnerHTML={{ __html: stage.content.description }} />
          </div>
        </div>
        
        {/* Questions */}
        <div className="space-y-8 pt-2 pb-24" ref={questionsContainerRef}>
          {stage.content.questions.map((question, index) => (
            <div 
              key={question.id} 
              className={cn(
                "survey-question space-y-3 rounded-lg border p-4 transition-all duration-300",
                activeQuestion === index && "border-primary/30 bg-primary/5 shadow-sm",
                isCompleted && "opacity-80"
              )}
              onClick={() => scrollToNextQuestion(index)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary mr-3 mt-0.5 flex-shrink-0">
                  {index + 1}
                </div>
                  <div className="space-y-1 flex-1">
                    <h4 className="text-sm font-medium">{question.title}</h4>
                    {question.required && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <AlertCircle className="h-3 w-3 mr-1 text-red-500" />
                        <span>Обязательный вопрос</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {answers[question.id] !== undefined && (
                  <div className="flex-shrink-0">
                    <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckIcon className="h-3 w-3 text-green-600" />
                    </div>
                  </div>
                )}
              </div>
              
              {question.type === 'text' && (
                <div className="pt-2 pl-9">
                <Textarea 
                  placeholder="Ваш ответ"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleTextInput(question.id, e.target.value)}
                  rows={(question as TextQuestion).multiline ? 4 : 2}
                  disabled={isCompleted}
                    className={cn(
                      "text-sm resize-none transition-all duration-300 focus:border-primary focus:ring-primary",
                      answers[question.id] && "border-green-200"
                    )}
                />
                </div>
              )}
              
              {question.type === 'choice' && (
                (question as ChoiceQuestion).multiple ? (
                  <div className="space-y-2 pt-2 pl-9">
                    {(question as ChoiceQuestion).options.map((option, i) => {
                      const isChecked = Array.isArray(answers[question.id]) && 
                        answers[question.id]?.includes(option);
                        
                      return (
                        <div 
                          key={i} 
                          className={cn(
                            "flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-md transition-all duration-200",
                            isChecked && "bg-primary/5 border border-primary/20"
                          )}
                        >
                        <Checkbox 
                          id={`${question.id}-${i}`} 
                            checked={isChecked}
                          onCheckedChange={() => handleChoiceInput(question.id, option, true)}
                          disabled={isCompleted}
                            className={cn(
                              isChecked && "text-primary border-primary"
                            )}
                        />
                          <Label 
                            htmlFor={`${question.id}-${i}`} 
                            className="text-sm flex-1 cursor-pointer"
                          >
                          {option}
                        </Label>
                          
                          {isChecked && (
                            <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center">
                              <CheckIcon className="h-2.5 w-2.5 text-primary" />
                      </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {Array.isArray(answers[question.id]) && answers[question.id]?.length > 0 && (
                      <div className="text-xs text-muted-foreground pt-1 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                        Выбрано: {answers[question.id].length} 
                        {answers[question.id].length === 1 ? " вариант" : 
                          answers[question.id].length < 5 ? " варианта" : " вариантов"}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1 pt-2 pl-9">
                  <RadioGroup 
                    value={answers[question.id]} 
                    onValueChange={(value: string) => handleChoiceInput(question.id, value, false)}
                    disabled={isCompleted}
                      className="space-y-1.5"
                    >
                      {(question as ChoiceQuestion).options.map((option, i) => {
                        const isSelected = answers[question.id] === option;
                        
                        return (
                          <div 
                            key={i} 
                            className={cn(
                              "flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-md transition-all duration-200",
                              isSelected && "bg-primary/5 border border-primary/20"
                            )}
                          >
                        <RadioGroupItem id={`${question.id}-${i}`} value={option} />
                            <Label 
                              htmlFor={`${question.id}-${i}`} 
                              className="text-sm flex-1 cursor-pointer"
                            >
                          {option}
                        </Label>
                            
                            {isSelected && (
                              <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center">
                                <CheckIcon className="h-2.5 w-2.5 text-primary" />
                      </div>
                            )}
                          </div>
                        );
                      })}
                  </RadioGroup>
                  </div>
                )
              )}
              
              {question.type === 'scale' && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs text-muted-foreground px-1">
                    <span>{(question as ScaleQuestion).minLabel || (question as ScaleQuestion).min}</span>
                    <span>{(question as ScaleQuestion).maxLabel || (question as ScaleQuestion).max}</span>
                  </div>
                  <Slider
                    min={(question as ScaleQuestion).min}
                    max={(question as ScaleQuestion).max}
                    step={1}
                    value={[answers[question.id] || (question as ScaleQuestion).min]}
                    onValueChange={(values: number[]) => handleScaleInput(question.id, values[0])}
                    disabled={isCompleted}
                  />
                  <div className="text-center text-sm font-medium">
                    {answers[question.id] || ''}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Submit button */}
      <div className="mt-auto mb-0 grid grid-cols-1 gap-3 pt-4 sticky bottom-0 bg-background pb-2">
        <Button 
          onClick={handleSubmit}
          variant={isCompleted ? "outline" : "default"}
          disabled={!isCompleted && !canSubmit() || isCompleted}
          size="lg"
          className="w-full"
        >
          {isCompleted ? (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              Отправлено
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              Отправить ответы
            </>
          )}
        </Button>
      </div>
    </div>
  )
} 