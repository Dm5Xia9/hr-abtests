import { Stage, Employee, Track } from '@/types'

// Utility function to navigate to the next stage
export const navigateToNextStage = (
  currentStage: Stage, 
  employees: Employee[],
  tracks: Track[],
  employeeId?: string
) => {
  if (!employeeId) return;
  
  // Get the current employee and track
  const employee = employees.find(e => e.id === employeeId);
  if (!employee || !employee.assignedTracks || employee.assignedTracks.length === 0) return;
  
  const track = tracks.find(t => t.id === employee.assignedTracks[0].trackId);
  if (!track || !track.milestones) return;
  
  // Find the current milestone and stage
  let currentMilestoneIndex = -1;
  let currentStageIndex = -1;
  
  for (let i = 0; i < track.milestones.length; i++) {
    const milestone = track.milestones[i];
    const stageIndex = milestone.stages.findIndex(s => s.id === currentStage.id);
    
    if (stageIndex !== -1) {
      currentMilestoneIndex = i;
      currentStageIndex = stageIndex;
      break;
    }
  }
  
  if (currentMilestoneIndex === -1 || currentStageIndex === -1) return;
  
  // Get the current milestone and its stages
  const currentMilestone = track.milestones[currentMilestoneIndex];
  const stages = currentMilestone.stages;
  
  // Navigate to next stage if available
  if (currentStageIndex < stages.length - 1) {
    // Trigger navigation to the next stage in the current milestone
    const nextStageIndex = currentStageIndex + 1;
    
    // We use URL parameters but let React Router handle the navigation without page reload
    // Create a custom event to tell the parent component to navigate
    const navigateEvent = new CustomEvent('navigateToStage', { 
      detail: { 
        milestoneIndex: currentMilestoneIndex, 
        stageIndex: nextStageIndex 
      }
    });
    window.dispatchEvent(navigateEvent);
  } else if (currentMilestoneIndex < track.milestones.length - 1) {
    // If this is the last stage in the milestone, try to navigate to the first stage of the next milestone
    const navigateEvent = new CustomEvent('navigateToStage', { 
      detail: { 
        milestoneIndex: currentMilestoneIndex + 1, 
        stageIndex: 0
      }
    });
    window.dispatchEvent(navigateEvent);
  }
}; 