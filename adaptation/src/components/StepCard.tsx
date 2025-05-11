import { Step } from '../types';
import { Presentation } from './Presentation';
import { Task } from './Task';
import { Survey } from './Survey';

interface StepCardProps {
  step: Step;
  onComplete: () => void;
}

export function StepCard({ step, onComplete }: StepCardProps) {
  const renderContent = () => {
    switch (step.type) {
      case 'presentation':
        return <Presentation content={step.content} onComplete={onComplete} />;
      case 'task':
        return <Task content={step.content} onComplete={onComplete} />;
      case 'survey':
        return <Survey content={step.content} onComplete={onComplete} />;
      default:
        return null;
    }
  };

  return (
    <div className="step-card">
      <div className="step-header">
        <h2 className="step-title">{step.title}</h2>
        <p className="step-description">{step.description}</p>
      </div>
      <div className="step-content">
        {renderContent()}
      </div>
    </div>
  );
} 