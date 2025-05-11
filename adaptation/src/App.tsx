import { useState, useEffect, useRef } from 'react';
import { Step, Milestone } from './types';
import { Presentation } from './components/Presentation';
import { Task } from './components/Task';
import { Survey } from './components/Survey';
import { MilestoneList } from './components/MilestoneList';
import track from './data/track.json';
import './styles/presentation.css';
import './styles/main.css';

const STORAGE_KEYS = {
  COMPLETED_STEPS: 'adaptation_completed_steps',
  CURRENT_STEP: 'adaptation_current_step',
  CURRENT_SLIDE: 'adaptation_current_slide'
};

export function App() {
  const [currentStepId, setCurrentStepId] = useState<string | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_STEP);
    return saved || null;
  });
  
  const [completedSteps, setCompletedSteps] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPLETED_STEPS);
    return saved ? JSON.parse(saved) : [];
  });

  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_SLIDE);
    return saved ? parseInt(saved) : 0;
  });

  const nextStepRef = useRef<HTMLDivElement>(null);

  // Сохраняем прогресс в localStorage при изменении
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPLETED_STEPS, JSON.stringify(completedSteps));
  }, [completedSteps]);

  // Сохраняем текущий этап в localStorage при изменении
  useEffect(() => {
    if (currentStepId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_STEP, currentStepId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_STEP);
    }
  }, [currentStepId]);

  // Сохраняем текущий слайд в localStorage при изменении
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_SLIDE, currentSlideIndex.toString());
  }, [currentSlideIndex]);

  const handleStepClick = (step: Step) => {
    setCurrentStepId(step.id);
    // Сбрасываем индекс слайда при переходе к новому этапу
    setCurrentSlideIndex(0);
  };

  const moveToNextStep = (currentStepId: string) => {
    // Находим текущую веху и этап
    let currentMilestoneIndex = -1;
    let currentStepIndex = -1;
    
    for (let i = 0; i < track.milestones.length; i++) {
      const stepIndex = track.milestones[i].steps.findIndex(s => s.id === currentStepId);
      if (stepIndex !== -1) {
        currentMilestoneIndex = i;
        currentStepIndex = stepIndex;
        break;
      }
    }

    if (currentMilestoneIndex === -1 || currentStepIndex === -1) return;

    const currentMilestone = track.milestones[currentMilestoneIndex];

    // Проверяем, есть ли следующий этап в текущей вехе
    if (currentStepIndex < currentMilestone.steps.length - 1) {
      // Переходим к следующему этапу в текущей вехе
      const nextStepId = currentMilestone.steps[currentStepIndex + 1].id;
      setCurrentStepId(nextStepId);
      setCurrentSlideIndex(0);
      // Добавляем небольшую задержку для обновления DOM
      setTimeout(() => {
        nextStepRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
      return;
    }

    // Если это последний этап в вехе и есть следующая веха
    if (currentMilestoneIndex < track.milestones.length - 1) {
      // Переходим к первому этапу следующей вехи
      const nextMilestone = track.milestones[currentMilestoneIndex + 1];
      if (nextMilestone.steps.length > 0) {
        const nextStepId = nextMilestone.steps[0].id;
        setCurrentStepId(nextStepId);
        setCurrentSlideIndex(0);
        // Добавляем небольшую задержку для обновления DOM
        setTimeout(() => {
          nextStepRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
    }
  };

  const handleStepComplete = (stepId: string) => {
    console.log('Completing step:', stepId);
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
    }
    moveToNextStep(stepId);
  };

  const getCurrentStep = () => {
    if (!currentStepId) return null;
    
    for (const milestone of track.milestones) {
      const step = milestone.steps.find(s => s.id === currentStepId);
      if (step) return step as Step;
    }
    return null;
  };

  const renderStep = (step: Step) => {
    switch (step.type) {
      case 'presentation':
        return (
          <Presentation
            content={step.content}
            onComplete={() => handleStepComplete(step.id)}
            currentSlideIndex={currentSlideIndex}
            onSlideChange={setCurrentSlideIndex}
          />
        );
      case 'task':
        return (
          <Task
            step={step}
            onComplete={() => handleStepComplete(step.id)}
            onNextStep={() => moveToNextStep(step.id)}
          />
        );
      case 'survey':
        return (
          <Survey
            content={step.content}
            onComplete={() => handleStepComplete(step.id)}
            onNextStep={() => moveToNextStep(step.id)}
          />
        );
      default:
        return null;
    }
  };

  const currentStep = getCurrentStep();

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-progress">
          <div className="progress-header">
            <div className="progress-title">Прогресс</div>
            <div className="progress-count">
              {completedSteps.length} из {track.milestones.reduce((acc, m) => acc + m.steps.length, 0)}
            </div>
          </div>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill"
              style={{ 
                width: `${(completedSteps.length / track.milestones.reduce((acc, m) => acc + m.steps.length, 0)) * 100}%` 
              }}
            />
          </div>
        </div>
        <MilestoneList
          milestones={track.milestones as Milestone[]}
          completedSteps={completedSteps}
          activeStepId={currentStepId}
          onStepClick={handleStepClick}
          nextStepRef={nextStepRef}
        />
      </div>
      <div className="main">
        {currentStep && (
          <div className="current-step-badge">
            {currentStep.title}
          </div>
        )}
        {currentStep ? (
          renderStep(currentStep)
        ) : (
          <div className="welcome-message">
            <h1>Добро пожаловать в адаптационный трек</h1>
            <p>Выберите этап из списка слева, чтобы начать</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;