import { useParams, useNavigate, Link } from 'react-router-dom'
import { useStore } from '@/store/index'
import { TrackFlowEditor } from '@/components/track-flow-editor'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Track } from '@/types'
import { CreateTrackForm } from '@/components/create-track-form'

export function TrackEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { tracks, updateTrackContent } = useStore()
  const track = tracks.find((t) => t.id === id)

  return (
    <div className="space-y-6">
      <CreateTrackForm onSuccess={() => navigate('/tracks')} initialTrack={track}/>
    </div>
  )
} 