import { useStore } from '@/store/index'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { TrackStats } from '@/components/track-stats'

export function TracksPage() {
  const { tracks } = useStore()

  return (
    <div className="space-y-6">

      <TrackStats />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm"
          >
            <div className="flex flex-col space-y-1.5">
              <h3 className="text-lg font-semibold">{track.title}</h3>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/tracks/${track.id}`}>Посмотреть</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 