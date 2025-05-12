import { useParams, useNavigate, Link } from 'react-router-dom'
import { useStore } from '@/store/index'
import { TrackFlowEditor } from '@/components/track-flow-editor'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Track } from '@/types'

export function TrackEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { tracks, updateTrackContent } = useStore()
  const track = tracks.find((t) => t.id === id)

  if (!track) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Track not found</h2>
          <p className="mt-2 text-muted-foreground">
            The track you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild className="mt-4">
            <Link to="/tracks">Back to Tracks</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handleSave = (updatedTrack: Track) => {
    updateTrackContent(updatedTrack)
    navigate(`/tracks/${track.id}`)
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b bg-background p-6">
        <div className="max-w-[2000px] mx-auto">
          <div className="flex items-center justify-between gap-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight">Edit Track</h2>
              <p className="text-sm text-muted-foreground">
                Edit adaptation track for new employees
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate(`/tracks/${track.id}`)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Track
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <TrackFlowEditor onSave={handleSave} initialTrack={track} />
      </div>
    </div>
  )
} 