import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TestOption, TestSlide } from '@/types';
import { Plus, Trash2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../RadioGroup';

interface TestSlideEditorProps {
  slide: TestSlide;
  onChange: (id: string, updates: Partial<TestSlide>) => void;
}

export function TestSlideEditor({ slide, onChange }: TestSlideEditorProps) {
  const handleTestTypeChange = (value: 'single' | 'multiple') => {
    // If changing from multiple to single, make sure only one answer is marked as correct
    if (value === 'single') {
      const correctOptions = slide.options.filter(o => o.isCorrect);
      if (correctOptions.length > 1) {
        const updatedOptions = [...slide.options];
        // Keep only the first correct answer
        updatedOptions.forEach((option, index) => {
          if (option.isCorrect && index > updatedOptions.findIndex(o => o.isCorrect)) {
            option.isCorrect = false;
          }
        });
        
        onChange(slide.id, { 
          testType: value,
          options: updatedOptions
        });
        return;
      }
    }
    
    onChange(slide.id, { testType: value });
  };
  
  const handleAddOption = () => {
    const newOption: TestOption = {
      id: crypto.randomUUID(),
      text: '',
      isCorrect: false
    };
    
    onChange(slide.id, { 
      options: [...slide.options, newOption]
    });
  };
  
  const handleDeleteOption = (optionId: string) => {
    if (slide.options.length <= 2) {
      // Должно остаться как минимум 2 варианта ответа
      return;
    }
    
    onChange(slide.id, { 
      options: slide.options.filter(option => option.id !== optionId)
    });
  };
  
  const handleOptionChange = (optionId: string, updates: Partial<TestOption>) => {
    const updatedOptions = slide.options.map(option => 
      option.id === optionId ? { ...option, ...updates } : option
    );
    
    // Для одиночного выбора только один ответ может быть правильным
    if (slide.testType === 'single' && updates.isCorrect === true) {
      updatedOptions.forEach(option => {
        if (option.id !== optionId) {
          option.isCorrect = false;
        }
      });
    }
    
    onChange(slide.id, { options: updatedOptions });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="test-type">Тип теста</Label>
        <Select
          value={slide.testType}
          onValueChange={(value) => handleTestTypeChange(value as 'single' | 'multiple')}
        >
          <SelectTrigger id="test-type">
            <SelectValue placeholder="Выберите тип теста" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Один правильный ответ</SelectItem>
            <SelectItem value="multiple">Несколько правильных ответов</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="test-question">Вопрос</Label>
        <Textarea
          id="test-question"
          value={slide.question}
          onChange={e => onChange(slide.id, { question: e.target.value })}
          placeholder="Введите вопрос теста..."
          rows={3}
        />
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Варианты ответов</Label>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleAddOption}
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить вариант
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-4 space-y-4">
            {slide.options.map((option, index) => (
              <div key={option.id} className="flex items-start gap-2">
                <div className="mt-2">
                  {slide.testType === 'single' ? (
                    <RadioGroup
                      value={option.isCorrect ? option.id : ''}
                      onValueChange={(value) => handleOptionChange(option.id, { isCorrect: value === option.id })}
                      className="flex"
                    >
                      <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                    </RadioGroup>
                  ) : (
                    <Checkbox
                      checked={option.isCorrect}
                      onCheckedChange={(checked) => 
                        handleOptionChange(option.id, { isCorrect: checked === true })
                      }
                      id={`option-${option.id}`}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    value={option.text}
                    onChange={e => handleOptionChange(option.id, { text: e.target.value })}
                    placeholder={`Вариант ${index + 1}`}
                    className="flex-1"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteOption(option.id)}
                  disabled={slide.options.length <= 2}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="test-explanation">Пояснение (необязательно)</Label>
        <Textarea
          id="test-explanation"
          value={slide.explanation || ''}
          onChange={e => onChange(slide.id, { explanation: e.target.value })}
          placeholder="Добавьте пояснение, которое будет показано после ответа..."
          rows={3}
        />
      </div>
    </div>
  );
} 