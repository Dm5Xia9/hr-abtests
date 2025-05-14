import { Track } from '@/types'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Eye, MoreHorizontal, CheckIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/index'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'

interface TrackUsageChartProps {
  data: number[]
  className?: string
}

export function TrackUsageChart({ data, className }: TrackUsageChartProps) {
  const max = Math.max(...data, 1)

  return (
    <div className={cn("flex h-8 items-end gap-[2px]", className)}>
      {data.map((value, index) => (
        <div 
          key={index}
          className="w-full bg-primary/70 rounded-sm"
          style={{ 
            height: `${(value / max) * 100}%`,
            minHeight: '2px'
          }}
          title={`${index + 1} месяц: ${value} назначений`}
        />
      ))}
    </div>
  )
}

interface TrackCardProps {
  track: Track
  className?: string
}

export function TrackCard({ track, className }: TrackCardProps) {
  const { updateTrackContent } = useStore()
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  
  // Default monthly data if none provided
  const usageData = track.monthlyAssignments || Array(6).fill(0)
  
  // Count stages
  const stagesCount = track.milestones.reduce((sum, milestone) => 
    sum + (milestone.stages?.length || 0), 0
  )

  // Function to update track status
  const handleStatusChange = async (newStatus: 'active' | 'archived' | 'draft') => {
    if (track.status === newStatus || isUpdating) return
    
    setIsUpdating(true)
    
    try {
      const updatedTrack = {
        ...track,
        status: newStatus
      }
      
      await updateTrackContent(updatedTrack)
      
      toast({
        title: 'Статус обновлен',
        description: `Трек переведен в статус "${
          newStatus === 'active' ? 'Активный' : 
          newStatus === 'draft' ? 'Черновик' : 'Архив'
        }"`,
      })
    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error)
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус трека',
        variant: 'destructive',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Get status badge color and label
  const getStatusBadge = () => {
    switch(track.status) {
      case 'active':
        return { variant: 'default' as const, label: 'Активен' }
      case 'archived':
        return { variant: 'secondary' as const, label: 'Архив' }
      case 'draft':
        return { variant: 'outline' as const, label: 'Черновик' }
      default:
        return { variant: 'default' as const, label: 'Активен' }
    }
  }

  const statusBadge = getStatusBadge()
  
  return (
    <div className={cn(
      "flex flex-col rounded-lg border bg-card p-5 text-card-foreground shadow-sm transition-all hover:shadow-md",
      className
    )}>
      <div className="mb-2 flex items-center gap-2">
        {track.icon && (
          <span className="text-xl">{track.icon}</span>
        )}
        <h3 className="flex-1 text-lg font-semibold">{track.title}</h3>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <span className="sr-only">Открыть меню</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => handleStatusChange('active')}
              className="cursor-pointer"
              disabled={isUpdating}
            >
              {isUpdating && track.status !== 'active' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckIcon 
                  className={cn(
                    "mr-2 h-4 w-4", 
                    track.status === 'active' ? 'opacity-100' : 'opacity-0'
                  )}
                />
              )}
              Активный
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusChange('draft')}
              className="cursor-pointer"
              disabled={isUpdating}
            >
              {isUpdating && track.status !== 'draft' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckIcon 
                  className={cn(
                    "mr-2 h-4 w-4", 
                    track.status === 'draft' ? 'opacity-100' : 'opacity-0'
                  )}
                />
              )}
              Черновик
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusChange('archived')}
              className="cursor-pointer"
              disabled={isUpdating}
            >
              {isUpdating && track.status !== 'archived' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckIcon 
                  className={cn(
                    "mr-2 h-4 w-4", 
                    track.status === 'archived' ? 'opacity-100' : 'opacity-0'
                  )}
                />
              )}
              Архив
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={`/tracks/${track.id}/edit`}>Редактировать</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Badge variant={statusBadge.variant}>
          {statusBadge.label}
        </Badge>
      </div>
      
      {track.position && (
        <p className="text-sm text-muted-foreground mb-3">{track.position}</p>
      )}
      
      <div className="mb-3">
        <TrackUsageChart data={usageData} className="mb-1" />
        <p className="text-xs text-muted-foreground">Активность за 6 месяцев</p>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div>
          <p className="text-muted-foreground">Этапов</p>
          <p className="font-medium">{stagesCount}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Назначений</p>
          <p className="font-medium">{usageData.reduce((sum, val) => sum + val, 0)}</p>
        </div>
      </div>
      
      {track.tags && track.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {track.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
      
      <div className="mt-auto flex items-center gap-2">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link to={`/tracks/${track.id}`}>
            <Eye className="mr-1 h-4 w-4" />
            Просмотр
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link to={`/tracks/${track.id}/edit`}>
            <Edit className="mr-1 h-4 w-4" />
            Изменить
          </Link>
        </Button>
      </div>
    </div>
  )
} 