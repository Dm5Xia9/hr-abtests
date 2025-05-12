import { useState } from 'react'
import { useStore } from '@/store/index'
import { Track } from '@/types'
import { TrackFlowEditor } from './track-flow-editor'

interface CreateTrackFormProps {
  onSuccess: () => void
}

export function CreateTrackForm({ onSuccess }: CreateTrackFormProps) {
  const { setTracks, tracks } = useStore()

  const handleSave = (track: Track) => {
    setTracks([...tracks, track])
    onSuccess()
  }

  return <TrackFlowEditor onSave={handleSave} />
} 