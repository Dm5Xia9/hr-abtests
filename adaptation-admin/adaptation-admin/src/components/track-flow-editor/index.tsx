import { useState, useEffect } from 'react'
import { Track, Milestone, Step } from '@/types'
import { MilestoneSidebar } from './MilestoneSidebar'
import { StageList } from './StageList'
import { StageEditor } from './StageEditor'
import { Button } from '@/components/ui/button'
import { Eye, History, FileUp, Save } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface TrackFlowEditorProps {
  track?: Track
  initialTrack?: Track
  onChange?: (track: Track) => void
  onSave?: (track: Track) => void
}

export function TrackFlowEditor({ 
  track: propTrack, 
  initialTrack,
  onChange,
  onSave
}: TrackFlowEditorProps) {
  // Handle both prop patterns
  const [internalTrack, setInternalTrack] = useState<Track>(propTrack || initialTrack || {
    id: '',
    title: '',
    description: '',
    milestones: []
  })

  // Keep track in sync with prop changes
  useEffect(() => {
    if (propTrack) {
      setInternalTrack(propTrack)
    } else if (initialTrack) {
      setInternalTrack(initialTrack)
    }
  }, [propTrack, initialTrack])

  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null)
  const [selectedStage, setSelectedStage] = useState<string | null>(null)
  const [isPublished, setIsPublished] = useState(false)

  const selectedMilestoneObj = internalTrack.milestones.find(m => m.id === selectedMilestone)
  const selectedStageObj = selectedMilestoneObj?.steps.find(s => s.id === selectedStage)

  const handleChange = (updatedTrack: Track) => {
    setInternalTrack(updatedTrack)
    if (onChange) onChange(updatedTrack)
  }

  const handleSave = () => {
    if (onSave) onSave(internalTrack)
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left Sidebar */}
      <div className="w-80 border-r bg-background">
        <MilestoneSidebar
          milestones={internalTrack.milestones}
          selectedMilestone={selectedMilestone}
          onSelectMilestone={setSelectedMilestone}
          onChange={handleChange}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-14 border-b px-6 flex items-center justify-between bg-background">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Preview as Employee
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <History className="w-4 h-4 mr-2" />
                  Version History
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Version 1.0</DropdownMenuItem>
                <DropdownMenuItem>Version 0.9</DropdownMenuItem>
                <DropdownMenuItem>Version 0.8</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm">
              <FileUp className="w-4 h-4 mr-2" />
              Import Template
            </Button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="publish-mode"
                checked={isPublished}
                onCheckedChange={setIsPublished}
              />
              <Label htmlFor="publish-mode">
                {isPublished ? 'Published' : 'Draft'}
              </Label>
            </div>
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Stage List */}
          <div className="flex-1 p-6 overflow-y-auto">
            {selectedMilestoneObj && (
              <StageList
                milestone={selectedMilestoneObj}
                selectedStage={selectedStage}
                onSelectStage={setSelectedStage}
                onChange={handleChange}
              />
            )}
          </div>

          {/* Stage Editor */}
          {selectedStageObj && (
            <div className="w-96 border-l bg-background overflow-y-auto">
              <StageEditor
                stage={selectedStageObj}
                onChange={stage => {
                  const updatedMilestones = internalTrack.milestones.map(m => {
                    if (m.id !== selectedMilestone) return m
                    return {
                      ...m,
                      steps: m.steps.map(s => s.id === stage.id ? stage : s)
                    }
                  })
                  handleChange({ ...internalTrack, milestones: updatedMilestones })
                }}
                onClose={() => setSelectedStage(null)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 