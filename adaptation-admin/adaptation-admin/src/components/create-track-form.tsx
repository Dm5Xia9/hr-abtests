import { useState } from 'react'
import { useStore } from '@/store/index'
import type { Track } from '../types'
import { TrackFlowEditor } from './track-flow-editor'
import { useToast } from '@/components/ui/use-toast'

interface CreateTrackFormProps {
  onSuccess: () => void
  initialTrack?: Track
}

export function CreateTrackForm({ onSuccess, initialTrack }: CreateTrackFormProps) {
  const { createTrack } = useStore()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [track, setTrack] = useState<Track>(initialTrack || {
    id: crypto.randomUUID(),
    title: '',
    description: '',
    milestones: []
  })

  const handleSave = async () => {
    try {
      setIsSubmitting(true)
      const { id, ...trackWithoutId } = track
      await createTrack(trackWithoutId)
      toast({
        title: "Success",
        description: "Track created successfully",
      })
      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create track",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <TrackFlowEditor
        track={track}
        onChange={setTrack}
      />
    </div>
  )
} 