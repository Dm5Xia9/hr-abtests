import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AIPromptTemplate } from '@/types/ai-presentation';
import { LightbulbIcon, Copy, ArrowRight } from 'lucide-react';

const DEFAULT_TEMPLATES: AIPromptTemplate[] = [
  {
    id: 'basic-presentation',
    title: 'Базовая презентация',
    description: 'Создает простую информационную презентацию с основными разделами.',
    prompt: 'Создай презентацию на тему "{тема}". Презентация должна включать введение, основные разделы и заключение.'
  },
  {
    id: 'onboarding',
    title: 'Адаптация новых сотрудников',
    description: 'Презентация для знакомства новых сотрудников с компанией.',
    prompt: 'Создай презентацию для адаптации новых сотрудников на тему "{тема}". Включи информацию о компании, команде, процессах и полезные ресурсы.'
  },
  {
    id: 'training',
    title: 'Обучающая презентация',
    description: 'Структурированный обучающий материал с проверкой знаний.',
    prompt: 'Создай обучающую презентацию на тему "{тема}". Включи введение, теоретический материал, практические примеры и тестовые вопросы для проверки знаний.'
  },
  {
    id: 'product-overview',
    title: 'Обзор продукта',
    description: 'Презентация с описанием продукта, его преимуществ и функций.',
    prompt: 'Создай презентацию с обзором продукта "{тема}". Включи описание, ключевые функции, преимущества и примеры использования.'
  },
  {
    id: 'process-explanation',
    title: 'Описание процесса',
    description: 'Визуализация и объяснение рабочего процесса.',
    prompt: 'Создай презентацию, описывающую процесс "{тема}". Разбей процесс на шаги, объясни каждый этап и добавь советы по оптимизации.'
  }
];

interface PromptTemplatesProps {
  onSelectTemplate: (template: AIPromptTemplate) => void;
  onCopyTemplate: (template: AIPromptTemplate) => void;
}

export function PromptTemplates({
  onSelectTemplate,
  onCopyTemplate
}: PromptTemplatesProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <LightbulbIcon className="h-5 w-5 text-amber-500" />
        <h3 className="text-md font-medium">Шаблоны подсказок</h3>
      </div>
      
      <ScrollArea className="h-[300px] pr-3">
        <div className="space-y-3">
          {DEFAULT_TEMPLATES.map((template) => (
            <Card key={template.id} className="border shadow-sm">
              <CardHeader className="py-4">
                <CardTitle className="text-md">{template.title}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="py-2">
                <div className="text-sm bg-muted p-3 rounded-md">
                  {template.prompt}
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-4 flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onCopyTemplate(template)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Копировать
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => onSelectTemplate(template)}
                >
                  Использовать
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
} 