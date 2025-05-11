import React, { RefObject, useState } from 'react';
import { Milestone, Step } from '../types';

interface MilestoneListProps {
  milestones: Milestone[];
  completedSteps: string[];
  activeStepId: string | null;
  onStepClick: (step: Step) => void;
  nextStepRef: RefObject<HTMLDivElement>;
}

const getStepIcon = (step: Step) => {
  switch (step.type) {
    case 'presentation':
      return '📊';
    case 'task':
      return '📝';
    case 'survey':
      return '📋';
    default:
      return '○';
  }
};

const getMilestoneIcon = (index: number, isCompleted: boolean) => {
  if (isCompleted) return '🏆';
  return ['🎯', '🚀', '💡', '⚡', '🌟'][index % 5];
};

export const MilestoneList: React.FC<MilestoneListProps> = ({
  milestones,
  completedSteps,
  activeStepId,
  onStepClick,
  nextStepRef
}) => {
  const [collapsedMilestones, setCollapsedMilestones] = useState<Set<string>>(() => {
    const completedMilestones = new Set<string>();
    milestones.forEach(milestone => {
      const hasActiveStep = milestone.steps.some(step => step.id === activeStepId);
      if (milestone.steps.every(step => completedSteps.includes(step.id)) && !hasActiveStep) {
        completedMilestones.add(milestone.id);
      }
    });
    return completedMilestones;
  });

  const toggleMilestone = (milestoneId: string) => {
    setCollapsedMilestones((prev: Set<string>) => {
      const newSet = new Set(prev);
      if (newSet.has(milestoneId)) {
        newSet.delete(milestoneId);
      } else {
        newSet.add(milestoneId);
      }
      return newSet;
    });
  };

  const isMilestoneCompleted = (milestone: Milestone) => {
    return milestone.steps.every(step => completedSteps.includes(step.id));
  };

  const isMilestoneActive = (milestone: Milestone) => {
    return milestone.steps.some(step => step.id === activeStepId);
  };

  const isMilestoneAvailable = (milestone: Milestone, index: number) => {
    if (index === 0) return true;
    const previousMilestone = milestones[index - 1];
    return isMilestoneCompleted(previousMilestone);
  };

  return (
    <div className="milestone-list">
      {milestones.map((milestone, index) => {
        const isCompleted = isMilestoneCompleted(milestone);
        const isActive = isMilestoneActive(milestone);
        const isAvailable = isMilestoneAvailable(milestone, index);
        const isCollapsed = collapsedMilestones.has(milestone.id);

        return (
          <div 
            key={milestone.id} 
            className={`milestone ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${!isAvailable ? 'locked' : ''}`}
          >
            <div 
              className="milestone-header"
              onClick={() => isAvailable && toggleMilestone(milestone.id)}
            >
              <div className="milestone-icon">
                {getMilestoneIcon(index, isCompleted)}
              </div>
              <div className="milestone-info">
                <h3 className="milestone-title">{milestone.title}</h3>
                <p className="milestone-description">{milestone.description}</p>
              </div>
              {isAvailable && (
                <button 
                  className={`milestone-toggle ${isCollapsed ? 'collapsed' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMilestone(milestone.id);
                  }}
                >
                  ▼
                </button>
              )}
            </div>
            {isAvailable && !isCollapsed && (
              <div className="milestone-steps">
                {milestone.steps.map(step => (
                  <div
                    key={step.id}
                    ref={step.id === activeStepId ? nextStepRef : null}
                    className={`step-item ${completedSteps.includes(step.id) ? 'completed' : ''} ${step.id === activeStepId ? 'active' : ''}`}
                    onClick={() => onStepClick(step)}
                  >
                    <div className="step-icon">
                      {getStepIcon(step)}
                    </div>
                    <div className="step-info">
                      <div className="step-title">{step.title}</div>
                      <div className="step-description">{step.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}; 