import { useState } from 'react'
import { useStore } from '@/store/index'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { PlusCircle, GridIcon, ListIcon, Edit, Eye } from 'lucide-react'
import { TrackCard } from '@/components/track-card'
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Track } from '@/types'

type ViewMode = 'grid' | 'table'
type StatusFilter = 'all' | 'active' | 'archived' | 'draft'

export function TracksPage() {
  const { tracks } = useStore()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Filter tracks based on selected status and search term
  const filteredTracks = tracks
    .filter(track => {
      if (statusFilter === 'all') return true
      if (statusFilter === 'active') return track.status === 'active'
      if (statusFilter === 'draft') return track.status === 'draft'
      return track.status === 'archived'
    })
    .filter(track => {
      if (!searchTerm.trim()) return true
      
      const search = searchTerm.toLowerCase()
      return (
        track.title.toLowerCase().includes(search) ||
        (track.position && track.position.toLowerCase().includes(search)) ||
        (track.tags && track.tags.some((tag: string) => tag.toLowerCase().includes(search)))
      )
    })

  // For demonstration, add some placeholder data for the UI
  const enhancedTracks = filteredTracks.map(track => enhanceTrack(track))

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Адаптационные треки</h1>
        <Button size="sm" asChild>
          <Link to="/tracks/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Новый трек
          </Link>
        </Button>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="Поиск по названию, позиции или тегу..."
            className="max-w-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select 
            value={statusFilter} 
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Фильтр по статусу" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Все треки</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="draft">Черновики</SelectItem>
                <SelectItem value="archived">Архивные</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <GridIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('table')}
          >
            <ListIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tracks Grid */}
      {viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enhancedTracks.map((track) => (
            <TrackCard key={track.id} track={track} />
          ))}
          {enhancedTracks.length === 0 && (
            <div className="col-span-full flex h-40 items-center justify-center rounded-lg border border-dashed">
              <p className="text-muted-foreground">Не найдено треков, соответствующих критериям</p>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Название</th>
                <th className="px-4 py-3 text-left font-medium">Должность</th>
                <th className="px-4 py-3 text-left font-medium">Статус</th>
                <th className="px-4 py-3 text-left font-medium">Этапов</th>
                <th className="px-4 py-3 text-left font-medium">Назначений</th>
                <th className="px-4 py-3 text-left font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {enhancedTracks.map((track) => (
                <tr key={track.id} className="border-b">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {track.icon && <span>{track.icon}</span>}
                      {track.title}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{track.position || '-'}</td>
                  <td className="px-4 py-3">
                    {track.status && (
                      <span className={`inline-block rounded-full px-2 py-1 text-xs ${
                        track.status === 'active' 
                          ? 'bg-primary/10 text-primary' 
                          : track.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-muted text-muted-foreground'
                      }`}>
                        {track.status === 'active' 
                          ? 'Активен' 
                          : track.status === 'draft' 
                            ? 'Черновик' 
                            : 'Архив'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {track.milestones.reduce((sum, m) => sum + (m.stages?.length || 0), 0)}
                  </td>
                  <td className="px-4 py-3">
                    {(track.monthlyAssignments || []).reduce((sum, val) => sum + val, 0)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/tracks/${track.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/tracks/${track.id}/edit`}>
                          <PlusCircle className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {enhancedTracks.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Не найдено треков, соответствующих критериям
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// Helper function to enhance tracks with sample data for UI demonstration
function enhanceTrack(track: Track): Track {
  // If the track already has all properties, return it as is
  if (
    track.position && 
    track.status && 
    track.monthlyAssignments && 
    track.tags
  ) {
    return track
  }
  
  // Otherwise add sample data with adjusted status probability
  return {
    ...track,
    position: track.position || 'Разработчик', 
    status: track.status || (Math.random() > 0.7 ? 
      (Math.random() > 0.5 ? 'draft' : 'archived') : 'active'),
    // Generate random monthly assignments
    monthlyAssignments: track.monthlyAssignments || 
      Array(6).fill(0).map(() => Math.floor(Math.random() * 5)),
    // Extract potential tags from the title
    tags: track.tags || track.title
      .toLowerCase()
      .split(' ')
      .filter(word => word.length > 3)
      .slice(0, 2)
  }
} 