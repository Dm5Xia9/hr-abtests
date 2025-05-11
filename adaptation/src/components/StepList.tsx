import { Step, StepProgress } from '../types';
import { CheckCircle2, Circle, Presentation, ClipboardList, ChevronRight } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

interface StepListProps {
  steps: Step[];
  progress: StepProgress[];
  onStepClick: (step: Step) => void;
  activeStepId?: string;
}

export function StepList({ steps, progress, onStepClick, activeStepId }: StepListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeStepId && listRef.current) {
      const activeElement = listRef.current.querySelector(`[data-step-id="${activeStepId}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeStepId]);

  return (
    <div className="step-list" ref={listRef}>
      {steps.map((step) => {
        const stepProgress = progress.find(p => p.stepId === step.id);
        const isCompleted = stepProgress?.completed || false;
        
        return (
          <div
            key={step.id}
            className={`step-item ${isCompleted ? 'completed' : ''} ${activeStepId === step.id ? 'active' : ''}`}
            onClick={() => onStepClick(step)}
            data-step-id={step.id}
          >
            <div className="step-icon">
              {isCompleted ? '✓' : '○'}
            </div>
            <div className="step-info">
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
} 