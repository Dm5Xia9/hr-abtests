import React from 'react';
import ReactMarkdown from 'react-markdown';
import { TaskStep } from '../types';

interface TaskProps {
  step: TaskStep;
  onComplete: () => void;
  onNextStep?: () => void;
  isCompleted?: boolean;
}

export const Task: React.FC<TaskProps> = ({ step, onComplete, onNextStep, isCompleted }) => {
  const handleComplete = () => {
    if (isCompleted) {
      if (onNextStep) {
        onNextStep();
      }
      return;
    }
    onComplete();
    if (onNextStep) {
      onNextStep();
    }
  };

  return (
    <div className="task">
      <div className="task-header">
        <h2>{step.title}</h2>
      </div>
      <div className="task-content">
        {step.content.meeting && (
          <div className="task-meeting">
            <h3>Встреча</h3>
            <div className="meeting-details">
              <p>
                <span className="meeting-label">Место</span>
                <span>{step.content.meeting.location}</span>
              </p>
              <p>
                <span className="meeting-label">Дата</span>
                <span>{step.content.meeting.date}</span>
              </p>
              <p>
                <span className="meeting-label">Время</span>
                <span>{step.content.meeting.time}</span>
              </p>
              <p>
                <span className="meeting-label">Длительность</span>
                <span>{step.content.meeting.duration}</span>
              </p>
              <p>
                <span className="meeting-label">Участники</span>
                <span>{step.content.meeting.participants.join(', ')}</span>
              </p>
              {step.content.meeting.description && (
                <p>
                  <span className="meeting-label">Описание</span>
                  <span>{step.content.meeting.description}</span>
                </p>
              )}
            </div>
          </div>
        )}
        <div className="task-description">
          <ReactMarkdown>{step.content.description}</ReactMarkdown>
        </div>
        <button 
          className={`task-complete ${isCompleted ? 'completed' : ''}`} 
          onClick={handleComplete}
        >
          {isCompleted ? 'Перейти к следующему этапу' : 'Завершить задачу'}
        </button>
      </div>
    </div>
  );
}; 