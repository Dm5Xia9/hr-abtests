import { Stage, GoalStage, Milestone, ChecklistItem } from '@/types';

/**
 * Updates linked checklist items when a stage is completed
 * This function should be called when a stage is marked as completed
 */
export function updateLinkedChecklist(
  milestone: Milestone, 
  completedStageId: string, 
  isCompleted: boolean
): Milestone {
  const updatedStages = milestone.stages.map(stage => {
    // Only process goal stages that have a checklist
    if (stage.type !== 'goal' || !stage.content.checklist?.length) {
      return stage;
    }
    
    // Look for checklist items linked to the completed stage
    const goalStage = stage as GoalStage;
    let hasChanges = false;
    
    // We can safely use non-null assertion because we checked for the existence above
    const updatedChecklist = goalStage.content.checklist!.map(item => {
      if (item.type === 'linked' && item.linkedStageId === completedStageId) {
        hasChanges = true;
        return { ...item, completed: isCompleted };
      }
      return item;
    });
    
    // Only update if there were changes
    if (hasChanges) {
      return {
        ...stage,
        content: {
          ...goalStage.content,
          checklist: updatedChecklist
        }
      };
    }
    
    return stage;
  });
  
  return {
    ...milestone,
    stages: updatedStages
  };
}

/**
 * Gets all goal stages that have checklist items linked to the given stage
 */
export function getGoalStagesWithLinksTo(
  milestone: Milestone,
  stageId: string
): GoalStage[] {
  return milestone.stages.filter(stage => {
    if (stage.type !== 'goal') return false;
    
    const goalStage = stage as GoalStage;
    if (!goalStage.content.checklist?.length) return false;
    
    return goalStage.content.checklist.some(
      item => item.type === 'linked' && item.linkedStageId === stageId
    );
  }) as GoalStage[];
} 