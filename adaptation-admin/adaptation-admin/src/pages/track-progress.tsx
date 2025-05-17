import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { 
  Track, 
  Milestone, 
  Stage, 
  StageProgress, 
  StageStatus, 
  CurrentTrack,
  AvailableTrack
} from '@/types'
import { Button } from '@/components/ui/button'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  FileText, 
  Goal, 
  ListChecks, 
  UserRound,
  Check,
  AlertCircle,
  RefreshCw,
  Lock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { StageContent } from '@/components/track-progress/stage-content'
import { StageDetail } from '@/components/track-progress/stage-detail'
import { StagesList } from '@/components/track-progress/stages-list'
import { MobileLayout } from '@/components/mobile-layout'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CongratsScreen } from '@/components/congrats-screen'
import { setAuthToken } from '@/lib/api-init'
import { useStore } from '@/store'

export function TrackProgressPage() {
  const { employeeId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  // States for new API integration
  const [availableTracks, setAvailableTracks] = useState<AvailableTrack[]>([])
  const [currentTrack, setCurrentTrack] = useState<CurrentTrack | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [completedStages, setCompletedStages] = useState<Record<string, boolean>>({})
  const [showCongratulations, setShowCongratulations] = useState(false)
  const [trackDropdownOpen, setTrackDropdownOpen] = useState(false)
  
  // State to track whether we're in the stage details view
  const [selectedStage, setSelectedStage] = useState<{
    milestoneIndex: number;
    stageIndex: number;
  } | null>(null);
  
  // State to track landscape orientation
  const [isLandscapeMode, setIsLandscapeMode] = useState(false);
  
  // Проверка и восстановление авторизации при доступе сотрудника
  useEffect(() => {
    // First check localStorage for employee access mode
    const employeeAccessMode = localStorage.getItem('employee_access_mode');
    const storedEmployeeId = localStorage.getItem('current_employee_id');
    const accessLink = localStorage.getItem('employee_access_link');
    
    console.log('Checking employee access mode on TrackProgress mount:');
    console.log('employee_access_mode:', employeeAccessMode);
    console.log('current_employee_id:', storedEmployeeId);
    console.log('employee_access_link:', accessLink);
    
    // If we're in employee access mode
    if (employeeAccessMode === 'true' && accessLink) {
      console.log('Employee access mode detected - setting up authorization');
      
      // Generate temporary auth token
      const accessToken = `employee_access_${accessLink}`;
      
      // Setup auth token (this is needed for API requests)
      setAuthToken(accessToken);
      
      // Ensure localStorage values are set (in case they were somehow cleared)
      localStorage.setItem('employee_access_mode', 'true');
      if (storedEmployeeId) {
        localStorage.setItem('current_employee_id', storedEmployeeId);
      }
      localStorage.setItem('employee_access_link', accessLink);
      
      console.log('Employee authorization restored successfully');
    }
  }, []); // Only run once on mount
  
  // Fetch data from the new API
  const fetchAvailableTracks = async () => {
    try {
      const api = (await import('@/lib/api')).default;
      const tracks = await api.getAvailableTracks();
      setAvailableTracks(tracks);
      return tracks;
    } catch (error) {
      console.error('Error fetching available tracks:', error);
      return [];
    }
  };
  
  const fetchCurrentTrack = async () => {
    try {
      const api = (await import('@/lib/api')).default;
      const track = await api.getCurrentTrack();
      setCurrentTrack(track);
      return track;
    } catch (error) {
      console.error('Error fetching current track:', error);
      return null;
    }
  };
  
  const setActiveTrack = async (trackId: string) => {
    try {
      setIsLoading(true);
      const api = (await import('@/lib/api')).default;
      const track = await api.setCurrentTrack(trackId);
      setCurrentTrack(track);
      return track;
    } catch (error) {
      console.error('Error setting current track:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateStageProgress = async (stageId: string, progressData: Partial<StageProgress>) => {
    try {
      const { updateTrackProgress } = useStore()

      await updateTrackProgress(stageId, progressData);
      
      // Refresh current track to get updated progress
      await fetchCurrentTrack();
    } catch (error) {
      console.error('Error updating stage progress:', error);
    }
  };
  
  // Load tracks data from the new API
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // First load available tracks
        const tracks = await fetchAvailableTracks();
        
        // Then check if we should load a specific track
        const trackIdParam = searchParams.get('track');
        
        if (trackIdParam && tracks.some(t => t.id === trackIdParam)) {
          // If a valid track ID is in URL params, set it as active
          await setActiveTrack(trackIdParam);
        } else {
          // Otherwise just load the current track
          await fetchCurrentTrack();
        }
      } catch (error) {
        console.error('Error loading initial track data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, [searchParams]); // Reload when search params change
  
  // Инициализируем completedStages на основе данных из текущего трека
  useEffect(() => {
    if (currentTrack?.steps) {
      const completed: Record<string, boolean> = {};
      
      // Iterate through steps and extract completion status
      Object.entries(currentTrack.steps).forEach(([stageId, progress]) => {
        if (typeof progress === 'string') {
          // Handle the case where progress is a JSON string
          try {
            const parsedProgress = JSON.parse(progress);
            completed[stageId] = parsedProgress.summary?.status === 'completed';
          } catch (e) {
            console.error('Error parsing progress JSON:', e);
            completed[stageId] = false;
          }
        } else {
          // Handle the case where progress is already an object
          completed[stageId] = progress.summary?.status === 'completed';
        }
      });
      
      setCompletedStages(completed);
    }
  }, [currentTrack]);
  
  // Helper to check if all required stages are completed
  const checkAllStagesCompleted = (milestones: Milestone[], completionState: Record<string, boolean>) => {
    if (!milestones) return false;
    
    return milestones.every(milestone => 
      milestone.stages.every(stage => 
        !stage.required || completionState[stage.id]
      )
    );
  };

  // Get the current stage when in detail view
  const getStageDetails = () => {
    if (!selectedStage || !currentTrack?.milestones) return null;
    
    const { milestoneIndex, stageIndex } = selectedStage;
    if (
      milestoneIndex >= 0 && 
      milestoneIndex < currentTrack.milestones.length &&
      stageIndex >= 0 && 
      stageIndex < currentTrack.milestones[milestoneIndex].stages.length
    ) {
      return currentTrack.milestones[milestoneIndex].stages[stageIndex];
    }
    
    return null;
  };
  
  const currentStageDetails = getStageDetails();
  
  // Handler to go back to the stages list
  const handleBackToList = () => {
    setSelectedStage(null);
  };
  
  // Calculate overall progress
  const calculateProgress = () => {
    if (!currentTrack || !currentTrack.milestones) {
      return { completed: 0, total: 0, percent: 0 }
    }
    
    let totalStages = 0;
    let totalCompletedStages = 0;
    
    currentTrack.milestones.forEach(milestone => {
      if (milestone?.stages) {
        totalStages += milestone.stages.length;
        
        milestone.stages.forEach(stage => {
          if (completedStages[stage.id]) {
            totalCompletedStages++;
          }
        });
      }
    });
    
    return {
      completed: totalCompletedStages,
      total: totalStages,
      percent: totalStages ? Math.round((totalCompletedStages / totalStages) * 100) : 0
    };
  };

  const progress = calculateProgress();
  
  // Handle track selection with the new API
  const handleSwitchTrack = async (trackId: string) => {
    setTrackDropdownOpen(false);
    
    // Set the selected track as the current track in the API
    await setActiveTrack(trackId);
    
    // Update URL for tracking the selected track
    navigate(`/track-progress/${employeeId || ''}?track=${trackId}`, { replace: true });
  };
  
  // Handle stage completion with the new API
  const handleCompleteStage = async (stageId: string, completed: boolean) => {
    // Always set completed to true, no uncompleting
    if (!completed) return;
    
    // Update local state immediately for better UX
    setCompletedStages(prev => ({
      ...prev,
      [stageId]: completed
    }));
    
    // Create progress update object
    const progressUpdate: Partial<StageProgress> = {
      stageId,
      summary: {
        stageId,
        status: 'completed' as StageStatus,
        completedAt: new Date().toISOString()
      }
    };
    
    // Send progress update to API
    await updateStageProgress(stageId, progressUpdate);
    
    // Check if all stages are now completed
    const updatedCompletedStages = {
      ...completedStages,
      [stageId]: completed
    };
    
    // If all stages are completed, show congratulations
    if (currentTrack?.milestones && checkAllStagesCompleted(currentTrack.milestones, updatedCompletedStages)) {
      setTimeout(() => {
        setShowCongratulations(true);
      }, 500);
    }
  };
  
  const countCompletedStagesInMilestone = (milestone: Milestone) => {
    if (!milestone.stages) return { completed: 0, total: 0 }
    
    const total = milestone.stages.length
    const completed = milestone.stages.filter(stage => completedStages[stage.id]).length
    
    return { completed, total }
  };
  
  // Track Selector component for the header
  const TrackSelectorHeader = () => {
    if (availableTracks.length <= 1) return null;
    
    return (
      <div className="relative flex-grow max-w-[200px]">
        <div 
          className="flex items-center gap-1 border rounded-md py-1 px-2 cursor-pointer bg-background/80"
          onClick={() => setTrackDropdownOpen(!trackDropdownOpen)}
        >
          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
            {currentTrack?.title?.charAt(0) || 'T'}
          </div>
          <span className="font-medium text-sm truncate">{currentTrack?.title || "Выберите трек"}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-auto flex-shrink-0" />
        </div>
        
        {/* Выпадающий список треков адаптации */}
        {trackDropdownOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border rounded-lg shadow-lg">
            <div className="p-2 space-y-1">
              {/* Список доступных треков */}
              {availableTracks.map((availableTrack) => (
                <div 
                  key={availableTrack.id}
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer text-sm ${
                    currentTrack?.id === availableTrack.id 
                      ? 'bg-primary/10 text-primary' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => handleSwitchTrack(availableTrack.id)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                      {availableTrack.title.charAt(0)}
                    </div>
                    <span>{availableTrack.title}</span>
                  </div>
                  {currentTrack?.id === availableTrack.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Display loading state when switching tracks
  if (isLoading && currentTrack) {
    return (
      <MobileLayout 
        title={currentTrack.title}
        renderTrackSelector={<TrackSelectorHeader />}
      >
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <RefreshCw className="h-10 w-10 animate-spin text-primary mb-4 mx-auto" />
            <h3 className="font-medium mb-2">Загрузка трека</h3>
            <p className="text-sm text-muted-foreground">Пожалуйста, подождите...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }
  
  // Show congratulations screen when all stages are completed
  if (showCongratulations) {
    return <CongratsScreen employee={null} trackTitle={currentTrack?.title || ""} />;
  }

  // Handler for orientation change from StageDetail
  const handleOrientationChange = (isLandscape: boolean) => {
    setIsLandscapeMode(isLandscape);
  };

  return (
    <MobileLayout 
      title={selectedStage ? "" : currentTrack?.title || "Трек адаптации"}
      renderTrackSelector={availableTracks.length > 1 && !selectedStage ? <TrackSelectorHeader /> : null}
      // When in stage detail view, show back button to return to stages list
      backButton={selectedStage ? {
        onClick: handleBackToList,
        label: "К списку этапов"
      } : undefined}
      disableScroll={!!selectedStage}
      hideBottomNav={!!selectedStage}
      hideHeader={!!(selectedStage && isLandscapeMode)}
    >
      {/* Track selection screen */}
      {!currentTrack ? (
        <div className="flex flex-col items-center min-h-[80vh] p-4">
          {isLoading ? (
            <Card className="w-full max-w-[400px] mt-8">
              <CardHeader>
                <CardTitle>Загрузка...</CardTitle>
                <CardDescription>
                  Подождите, идет загрузка доступных треков адаптации
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-6">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : availableTracks.length === 0 ? (
            <Card className="w-full max-w-[400px] mt-8">
              <CardHeader>
                <CardTitle>Треки не найдены</CardTitle>
                <CardDescription>
                  Вам не назначены треки адаптации. Пожалуйста, обратитесь к HR-менеджеру.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <>
              <div className="text-center mb-8 mt-4">
                <h1 className="text-2xl font-bold mb-2">Выберите трек адаптации</h1>
                <p className="text-muted-foreground">
                  Выберите трек для начала или продолжения программы адаптации
                </p>
              </div>
              
              <div className="w-full max-w-[500px] space-y-4">
                {availableTracks.map(track => (
                  <Card 
                    key={track.id}
                    className="overflow-hidden transition-all hover:shadow-md cursor-pointer"
                    onClick={() => handleSwitchTrack(track.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                          {track.title.charAt(0)}
                        </div>
                        <CardTitle className="text-xl">{track.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {track.description && (
                        <p className="text-sm text-muted-foreground mb-4">{track.description}</p>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant={track.status === 'in_progress' ? 'default' : 'outline'}>
                            {track.status === 'in_progress' ? 'В процессе' : 'Не начат'}
                          </Badge>
                        </div>
                        {track.mentorName && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <UserRound className="h-4 w-4" />
                            <span>Ментор: {track.mentorName}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4 bg-muted/20">
                      <Button className="w-full">
                        {track.status === 'in_progress' ? 'Продолжить' : 'Начать'}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className={selectedStage ? "" : "px-3 pt-2 pb-1"}>
          {/* Loading state when switching tracks */}
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[80vh]">
              <div className="text-center">
                <RefreshCw className="h-10 w-10 animate-spin text-primary mb-4 mx-auto" />
                <h3 className="font-medium mb-2">Загрузка трека</h3>
                <p className="text-sm text-muted-foreground">Пожалуйста, подождите...</p>
              </div>
            </div>
          ) : (
            <>
              {/* If we're viewing a specific stage */}
              {selectedStage && currentStageDetails ? (
                <StageDetail
                  stage={currentStageDetails}
                  isCompleted={completedStages[currentStageDetails.id] || false}
                  onComplete={(completed: boolean) => handleCompleteStage(currentStageDetails.id, completed)}
                  onOrientationChange={handleOrientationChange}
                  currentTrack={currentTrack}
                />
              ) : (
                /* List of all stages */
                <StagesList
                  currentTrack={currentTrack}
                  completedStages={completedStages}
                  progress={progress}
                  onSelectStage={(milestoneIndex, stageIndex) => 
                    setSelectedStage({ milestoneIndex, stageIndex })
                  }
                />
              )}
            </>
          )}
        </div>
      )}
    </MobileLayout>
  );
} 