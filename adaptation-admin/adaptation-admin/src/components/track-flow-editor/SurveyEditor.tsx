import { useState, useEffect } from 'react'
import { SurveyStep, FormComponent, TextFieldComponent, SelectComponent, RatingComponent } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Plus, GripVertical, Trash2, Type, List, Star, Edit, Eye, Moon, Sun, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeft } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { useTheme } from '@/components/theme-provider'

interface SurveyEditorProps {
  step: SurveyStep
  onChange: (step: SurveyStep) => void
}

export function SurveyEditor({ step, onChange }: SurveyEditorProps) {
  // Initialize content with defaults if undefined
  const [surveyContent, setSurveyContent] = useState({
    title: step.content?.title || '', 
    description: step.content?.description || '', 
    questions: step.content?.questions || []
  });

  useEffect(() => {
    // Обновляем локальное состояние, если изменились входные данные
    setSurveyContent({
      title: step.content?.title || '', 
      description: step.content?.description || '', 
      questions: step.content?.questions || []
    });
  }, [step.content]);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<FormComponent | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(true);

  // Функция для обновления контента и передачи изменений наверх
  const updateSurveyContent = (newContent: Partial<SurveyStep['content']>) => {
    const updatedContent = { ...surveyContent, ...newContent };
    setSurveyContent(updatedContent);
    
    onChange({
      ...step,
      content: updatedContent
    });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(surveyContent.questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    updateSurveyContent({ questions: items });
  }

  const addComponent = (type: 'text' | 'choice' | 'scale') => {
    const baseComponent = {
      id: crypto.randomUUID(),
      title: 'Новый вопрос',
      required: false
    }

    let newComponent: FormComponent;
    switch (type) {
      case 'text':
        newComponent = {
          ...baseComponent,
          type: 'text',
          multiline: false
        } as TextFieldComponent
        break
      case 'choice':
        newComponent = {
          ...baseComponent,
          type: 'choice',
          options: ['Вариант 1', 'Вариант 2'],
          multiple: false
        } as SelectComponent
        break
      case 'scale':
        newComponent = {
          ...baseComponent,
          type: 'scale',
          min: 1,
          max: 5
        } as RatingComponent
        break
    }

    // Добавляем отладочную информацию
    console.log('Добавляем новый вопрос:', newComponent);
    console.log('Текущие вопросы:', surveyContent.questions);
    
    // Создаем новый массив вопросов с добавленным компонентом
    const newQuestions = [...surveyContent.questions, newComponent];
    console.log('Обновленные вопросы:', newQuestions);
    
    // Обновляем состояние
    updateSurveyContent({ questions: newQuestions });
    
    // Закрываем диалог и выбираем новый вопрос
    setShowAddDialog(false);
    setSelectedQuestion(newComponent);
  }

  const updateComponent = (id: string, updates: Partial<FormComponent>) => {
    const updatedQuestions = surveyContent.questions.map(question => {
      if (question.id !== id) return question;
      
      // Ensure the updated component matches its original type
      const updatedComponent = { ...question, ...updates };
      
      let typedComponent: FormComponent;
      if (question.type === 'text') {
        typedComponent = updatedComponent as TextFieldComponent;
      } else if (question.type === 'choice') {
        typedComponent = updatedComponent as SelectComponent;
      } else {
        typedComponent = updatedComponent as RatingComponent;
      }
      
      return typedComponent;
    });

    updateSurveyContent({ questions: updatedQuestions });

    // Update selected question if it's being edited
    if (selectedQuestion?.id === id) {
      const updatedQuestion = updatedQuestions.find(q => q.id === id) || null;
      setSelectedQuestion(updatedQuestion);
    }
  }

  const removeComponent = (id: string) => {
    const updatedQuestions = surveyContent.questions.filter(q => q.id !== id);
    
    updateSurveyContent({ questions: updatedQuestions });
    
    if (selectedQuestion?.id === id) {
      setSelectedQuestion(null);
    }
  }

  const getQuestionTypeIcon = (type: FormComponent['type']) => {
    switch (type) {
      case 'text':
        return <Type className="h-4 w-4" />
      case 'choice':
        return <List className="h-4 w-4" />
      case 'scale':
        return <Star className="h-4 w-4" />
      default:
        return null
    }
  }

  const getQuestionTypeName = (type: FormComponent['type']) => {
    switch (type) {
      case 'text':
        return 'Текстовое поле'
      case 'choice':
        return 'Выбор из списка'
      case 'scale':
        return 'Оценка'
      default:
        return 'Неизвестный тип'
    }
  }

  const getQuestionPreview = (question: FormComponent) => {
    switch (question.type) {
      case 'text':
        const textQuestion = question as TextFieldComponent;
        return (
          <div className="p-2 overflow-hidden">
            <p className="text-sm font-medium">{question.title || 'Без заголовка'}</p>
            <p className="text-xs text-muted-foreground">
              {textQuestion.multiline ? 'Многострочное поле' : 'Однострочное поле'}
            </p>
          </div>
        )
      case 'choice':
        const choiceQuestion = question as SelectComponent;
        return (
          <div className="p-2 overflow-hidden">
            <p className="text-sm font-medium">{question.title || 'Без заголовка'}</p>
            <p className="text-xs text-muted-foreground">
              {choiceQuestion.options.length} вариантов
            </p>
          </div>
        )
      case 'scale':
        const scaleQuestion = question as RatingComponent;
        return (
          <div className="p-2 overflow-hidden">
            <p className="text-sm font-medium">{question.title || 'Без заголовка'}</p>
            <p className="text-xs text-muted-foreground">
              От {scaleQuestion.min} до {scaleQuestion.max}
            </p>
          </div>
        )
      default:
        return <div>Неизвестный тип вопроса</div>;
    }
  }

  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
  };

  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';
  
  // Функция для получения правильных цветов фона и текста в зависимости от темы
  const getThemeColors = () => {
    return {
      background: isDarkTheme ? 'bg-gray-900' : 'bg-gray-50',
      card: isDarkTheme ? 'bg-gray-800' : 'bg-white',
      border: isDarkTheme ? 'border-gray-700' : 'border-gray-200',
      muted: isDarkTheme ? 'text-gray-400' : 'text-gray-500',
      controlBg: isDarkTheme ? 'bg-gray-700' : 'bg-gray-100',
      badgeBg: {
        red: isDarkTheme ? 'bg-red-900/30' : 'bg-red-50',
        blue: isDarkTheme ? 'bg-blue-900/30' : 'bg-blue-50',
        green: isDarkTheme ? 'bg-green-900/30' : 'bg-green-50',
        purple: isDarkTheme ? 'bg-purple-900/30' : 'bg-purple-50',
      },
      badgeText: {
        red: isDarkTheme ? 'text-red-300' : 'text-red-600',
        blue: isDarkTheme ? 'text-blue-300' : 'text-blue-600',
        green: isDarkTheme ? 'text-green-300' : 'text-green-600',
        purple: isDarkTheme ? 'text-purple-300' : 'text-purple-600',
      }
    };
  };
  
  const colors = getThemeColors();
  
  // Переключатель темы в режиме предпросмотра для тестирования
  const [previewTheme, setPreviewTheme] = useState(theme);
  const togglePreviewTheme = () => {
    setPreviewTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };
  
  const SurveyPreview = () => {
    return (
      <div className={cn("flex-1 p-6 overflow-auto", colors.background)}>
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-end mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={togglePreviewTheme}
              className="flex items-center gap-2"
            >
              {previewTheme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4" />
                  <span>Светлая тема</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" />
                  <span>Темная тема</span>
                </>
              )}
            </Button>
          </div>
          
          <div className={cn("rounded-lg shadow p-6", colors.card, colors.border)}>
            <div className="space-y-8">
              <div className={cn("border-b pb-4 mb-6 text-center", colors.border)}>
                <h1 className="text-2xl font-bold mb-2">{surveyContent.title || 'Название опроса'}</h1>
                {surveyContent.description && (
                  <p className={colors.muted}>{surveyContent.description}</p>
                )}
              </div>
              
              {surveyContent.questions.length > 0 ? (
                <div className="space-y-8">
                  {surveyContent.questions.map((question, index) => (
                    <div key={question.id} className={cn("pb-6 border-b last:border-0", colors.border)}>
                      <div className="space-y-3">
                        <h3 className="text-lg font-medium flex items-start gap-2">
                          <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <div>
                            {question.title}
                            {question.required && (
                              <span className="text-destructive ml-1">*</span>
                            )}
                          </div>
                        </h3>
                        
                        <div className="pl-8 pt-2">
                          {question.type === 'text' && (
                            <div>
                              {(question as TextFieldComponent).multiline ? (
                                <Textarea 
                                  className={cn("w-full", colors.controlBg)}
                                  placeholder="Введите ваш ответ..."
                                  disabled
                                  rows={4}
                                />
                              ) : (
                                <Input 
                                  className={cn("w-full", colors.controlBg)}
                                  placeholder="Введите ваш ответ..."
                                  disabled
                                />
                              )}
                            </div>
                          )}
                          
                          {question.type === 'choice' && (
                            <div className="space-y-3 pl-1">
                              {(question as SelectComponent).options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center space-x-2">
                                  {(question as SelectComponent).multiple ? (
                                    <div className="flex items-center gap-2">
                                      <div className={cn("h-4 w-4 rounded border flex items-center justify-center", colors.border)}>
                                        {/* Empty checkbox */}
                                      </div>
                                      <Label className="cursor-default">{option}</Label>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <div className={cn("h-4 w-4 rounded-full border flex items-center justify-center", colors.border)}>
                                        {/* Empty radio button */}
                                      </div>
                                      <Label className="cursor-default">{option}</Label>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {question.type === 'scale' && (
                            <div className="pt-2">
                              <div className="flex justify-between w-full mb-2">
                                <span className={colors.muted}>
                                  {(question as RatingComponent).min}
                                </span>
                                <span className={colors.muted}>
                                  {(question as RatingComponent).max}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                {Array.from(
                                  { length: (question as RatingComponent).max - (question as RatingComponent).min + 1 }, 
                                  (_, i) => i + (question as RatingComponent).min
                                ).map((value) => (
                                  <div key={value} className="flex flex-col items-center">
                                    <div className={cn("w-6 h-6 rounded-full border flex items-center justify-center text-sm mb-1", colors.border, colors.controlBg)}>
                                      {value}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-end pt-4">
                    <Button variant="default">Отправить ответы</Button>
                  </div>
                </div>
              ) : (
                <div className={cn("text-center py-10", colors.muted)}>
                  <p>В этом опросе еще нет вопросов</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const QuestionsList = (
    <div className={cn(
      "border-r h-full flex flex-col transition-all duration-300 ease-in-out", 
      isLeftPanelVisible ? "w-64" : "w-0 overflow-hidden"
    )}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Вопросы ({surveyContent.questions.length})</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={togglePreviewMode}
              title={previewMode ? "Режим редактирования" : "Режим просмотра"}
            >
              {previewMode ? <Edit className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="w-4 h-4 mr-1" />
          Добавить вопрос
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="questions">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex-1 overflow-y-auto p-3 space-y-3"
            >
              {surveyContent.questions.map((question, index) => (
                <Draggable
                  key={question.id}
                  draggableId={question.id}
                  index={index}
                >
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={cn(
                        "overflow-hidden border transition-colors",
                        selectedQuestion?.id === question.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => setSelectedQuestion(question)}
                    >
                      <div className="p-2">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab p-1"
                            >
                              <GripVertical className="w-3 h-3 text-muted-foreground" />
                            </div>
                            <div className="bg-primary/10 text-primary w-5 h-5 rounded-full flex items-center justify-center text-xs">
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="flex items-center gap-1 text-xs bg-muted px-1.5 py-0.5 rounded mr-1">
                              {getQuestionTypeIcon(question.type)}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeComponent(question.id)
                              }}
                            >
                              <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <div className="pl-6">
                          <p className="text-sm font-medium line-clamp-2">{question.title || "Без заголовка"}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {question.required && (
                              <div className="bg-red-50 text-red-700 text-xs px-1 py-0.5 rounded">
                                Обяз.
                              </div>
                            )}
                            {question.type === 'choice' && (
                              <div className="bg-blue-50 text-blue-700 text-xs px-1 py-0.5 rounded">
                                {(question as SelectComponent).options.length} вар.
                              </div>
                            )}
                            {question.type === 'text' && (
                              <div className="bg-green-50 text-green-700 text-xs px-1 py-0.5 rounded">
                                {(question as TextFieldComponent).multiline ? 'Многостр.' : 'Однострочн.'}
                              </div>
                            )}
                            {question.type === 'scale' && (
                              <div className="bg-purple-50 text-purple-700 text-xs px-1 py-0.5 rounded">
                                {(question as RatingComponent).min}-{(question as RatingComponent).max}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              {surveyContent.questions.length === 0 && (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm">
                  <p>Нет вопросов</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setShowAddDialog(true)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Добавить вопрос
                  </Button>
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );

  const QuestionEditor = selectedQuestion ? (
    <div className="flex-1 p-6 overflow-auto">
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            {getQuestionTypeIcon(selectedQuestion.type)}
            <span>{getQuestionTypeName(selectedQuestion.type)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="question-title" className="text-base font-medium">Текст вопроса</Label>
              <Input
                id="question-title"
                value={selectedQuestion.title}
                onChange={e => updateComponent(selectedQuestion.id, { title: e.target.value })}
                placeholder="Введите вопрос..."
                className="text-base"
              />
            </div>

            <div className="flex items-center space-x-2 border-t border-b py-4">
              <Switch
                id="required"
                checked={selectedQuestion.required}
                onCheckedChange={(checked) => updateComponent(selectedQuestion.id, { required: checked })}
              />
              <Label htmlFor="required" className="font-medium">Обязательный вопрос</Label>
            </div>

            {selectedQuestion.type === 'text' && (
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Настройки текстового поля</h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="multiline"
                    checked={(selectedQuestion as TextFieldComponent).multiline}
                    onCheckedChange={(checked) => updateComponent(selectedQuestion.id, { multiline: checked })}
                  />
                  <Label htmlFor="multiline">Многострочное поле</Label>
                </div>
                
                <div className="pt-2">
                  <Label className="text-sm text-muted-foreground mb-1 block">Предпросмотр поля</Label>
                  {(selectedQuestion as TextFieldComponent).multiline ? (
                    <Textarea 
                      placeholder="Пользователь введет текст здесь..." 
                      className="bg-muted/30" 
                      readOnly 
                      rows={3}
                    />
                  ) : (
                    <Input 
                      placeholder="Пользователь введет текст здесь..." 
                      className="bg-muted/30" 
                      readOnly 
                    />
                  )}
                </div>
              </div>
            )}

            {selectedQuestion.type === 'choice' && (
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Варианты ответа</h3>
                <div className="space-y-3 border rounded-md p-3 bg-muted/10">
                  {(selectedQuestion as SelectComponent).options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2 group">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {(selectedQuestion as SelectComponent).multiple ? (
                            <div className="h-4 w-4 rounded border border-primary flex-shrink-0" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-primary flex-shrink-0" />
                          )}
                          <Input
                            value={option}
                            onChange={e => {
                              const newOptions = [...(selectedQuestion as SelectComponent).options];
                              newOptions[optionIndex] = e.target.value;
                              updateComponent(selectedQuestion.id, { options: newOptions });
                            }}
                            placeholder={`Вариант ${optionIndex + 1}`}
                            className="border-0 bg-transparent focus-visible:bg-background px-2"
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newOptions = (selectedQuestion as SelectComponent).options.filter((_, i) => i !== optionIndex);
                          updateComponent(selectedQuestion.id, { options: newOptions });
                        }}
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const options = [...(selectedQuestion as SelectComponent).options];
                      options.push(`Вариант ${options.length + 1}`);
                      updateComponent(selectedQuestion.id, { options });
                    }}
                    className="w-full mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить вариант
                  </Button>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="multiple"
                    checked={(selectedQuestion as SelectComponent).multiple}
                    onCheckedChange={(checked) => updateComponent(selectedQuestion.id, { multiple: checked })}
                  />
                  <Label htmlFor="multiple">Разрешить выбор нескольких вариантов</Label>
                </div>
              </div>
            )}

            {selectedQuestion.type === 'scale' && (
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Настройки шкалы</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min">Минимальное значение</Label>
                    <Input
                      id="min"
                      type="number"
                      value={(selectedQuestion as RatingComponent).min}
                      onChange={e => updateComponent(selectedQuestion.id, { min: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max">Максимальное значение</Label>
                    <Input
                      id="max"
                      type="number"
                      value={(selectedQuestion as RatingComponent).max}
                      onChange={e => updateComponent(selectedQuestion.id, { max: Number(e.target.value) })}
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t mt-4">
                  <Label className="text-sm text-muted-foreground mb-3 block">Предпросмотр шкалы</Label>
                  <div className="flex justify-between">
                    {Array.from(
                      { length: (selectedQuestion as RatingComponent).max - (selectedQuestion as RatingComponent).min + 1 }, 
                      (_, i) => i + (selectedQuestion as RatingComponent).min
                    ).map((value) => (
                      <div key={value} className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full border border-primary flex items-center justify-center text-sm mb-1 hover:bg-primary/10 cursor-pointer">
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  ) : (
    <div className={cn(
      "flex-1 flex items-center justify-center text-muted-foreground p-6 text-center transition-all duration-300",
      !isLeftPanelVisible && "pl-14"
    )}>
      <div className="max-w-md">
        {surveyContent.questions.length === 0 ? (
          <>
            <div className="mx-auto bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Plus className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium mb-2">Создайте первый вопрос</h3>
            <p className="text-muted-foreground mb-4">
              Ваш опрос пока не содержит вопросов. Нажмите кнопку ниже, чтобы добавить первый вопрос.
            </p>
            <Button 
              onClick={() => setShowAddDialog(true)}
              className="mx-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить вопрос
            </Button>
          </>
        ) : (
          <>
            <p>Выберите вопрос для редактирования или создайте новый</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Добавить вопрос
            </Button>
          </>
        )}
      </div>
    </div>
  );

  const SurveySettingsCard = (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Настройки опроса</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={togglePreviewMode}
            className="flex items-center gap-2"
          >
            {previewMode ? (
              <>
                <Edit className="h-4 w-4" />
                <span>Редактировать</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                <span>Предпросмотр</span>
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название опроса</Label>
            <Input
              id="title"
              value={surveyContent.title}
              onChange={e => updateSurveyContent({ title: e.target.value })}
              placeholder="Введите название опроса"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Описание опроса</Label>
            <Textarea
              id="description"
              value={surveyContent.description}
              onChange={e => updateSurveyContent({ description: e.target.value })}
              placeholder="Введите описание опроса"
              rows={3}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const LeftPanelToggle = (
    <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
      <Button 
        variant="secondary" 
        size="icon" 
        className={cn(
          "h-8 w-8 rounded-full shadow-md border transition-all duration-300",
          isLeftPanelVisible ? "ml-64 -translate-x-4" : "ml-2"
        )}
        onClick={() => setIsLeftPanelVisible(prev => !prev)}
        title={isLeftPanelVisible ? "Скрыть панель навигации" : "Показать панель навигации"}
      >
        {isLeftPanelVisible ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
      </Button>
      <span className={cn(
        "absolute whitespace-nowrap bg-secondary rounded px-2 py-1 text-xs font-medium top-10 left-1/2 -translate-x-1/2 opacity-0 transition-opacity",
        !isLeftPanelVisible && "opacity-100 delay-500"
      )}>
        {isLeftPanelVisible ? "" : "Панель скрыта"}
      </span>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {SurveySettingsCard}
      
      <div className="flex flex-1 h-[calc(100%-180px)] border rounded-md overflow-hidden relative">
        {previewMode ? (
          <SurveyPreview />
        ) : (
          <>
            {QuestionsList}
            {LeftPanelToggle}
            {QuestionEditor}
          </>
        )}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Выберите тип вопроса</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div 
              className="flex flex-col items-start gap-2 rounded-lg border p-4 hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors"
              onClick={() => addComponent('text')}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 text-green-700 p-2 rounded-md">
                    <Type className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Текстовое поле</h3>
                    <p className="text-sm text-muted-foreground">Короткий или длинный текстовый ответ</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div 
              className="flex flex-col items-start gap-2 rounded-lg border p-4 hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors"
              onClick={() => addComponent('choice')}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-700 p-2 rounded-md">
                    <List className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Выбор из списка</h3>
                    <p className="text-sm text-muted-foreground">Один или несколько вариантов ответа</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div 
              className="flex flex-col items-start gap-2 rounded-lg border p-4 hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors"
              onClick={() => addComponent('scale')}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 text-purple-700 p-2 rounded-md">
                    <Star className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Оценка</h3>
                    <p className="text-sm text-muted-foreground">Числовая шкала для оценки</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 