import { Bell, BellOff, Check, Trash2 } from 'lucide-react'
import { useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Notification } from '@/types'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useState, useEffect } from 'react'

export function NotificationIcon() {
  const { notifications, markAllNotificationsAsRead, getUnreadNotificationsCount } = useStore()
  const [open, setOpen] = useState(false)
  const unreadCount = getUnreadNotificationsCount()
  
  // Проверяем наличие новых уведомлений каждые 30 секунд
  useEffect(() => {
    const checkInterval = setInterval(() => {
      // В реальном приложении здесь был бы запрос к API
      // Для локального хранилища ничего не делаем, так как уведомления
      // добавляются через действия в приложении
    }, 30000)
    
    return () => clearInterval(checkInterval)
  }, [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-5 h-5 flex items-center justify-center text-xs"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-sm font-medium">Уведомления</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => markAllNotificationsAsRead()}
              className="text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              Пометить все как прочитанные
            </Button>
          )}
        </div>
        <NotificationsList setOpen={setOpen} />
      </PopoverContent>
    </Popover>
  )
}

interface NotificationsListProps {
  setOpen: (open: boolean) => void
}

function NotificationsList({ setOpen }: NotificationsListProps) {
  const { 
    notifications, 
    markNotificationAsRead, 
    deleteNotification 
  } = useStore()
  
  if (notifications.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        <BellOff className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p>У вас нет уведомлений</p>
      </div>
    )
  }
  
  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-1 p-1">
        {notifications
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map((notification) => (
            <NotificationItem 
              key={notification.id} 
              notification={notification} 
              onRead={markNotificationAsRead}
              onDelete={deleteNotification}
              onClick={() => setOpen(false)}
            />
          ))}
      </div>
    </ScrollArea>
  )
}

interface NotificationItemProps {
  notification: Notification
  onRead: (id: string) => void
  onDelete: (id: string) => void
  onClick: () => void
}

function NotificationItem({ 
  notification, 
  onRead, 
  onDelete,
  onClick
}: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.isRead) {
      onRead(notification.id)
    }
    onClick()
  }
  
  return (
    <div 
      className={`
        flex items-start gap-2 p-3 text-sm cursor-pointer rounded-md
        ${notification.isRead ? 'bg-background' : 'bg-accent'}
        hover:bg-accent
      `}
      onClick={handleClick}
    >
      <div className="flex-1">
        <div className="font-medium">{notification.title}</div>
        <div className="text-muted-foreground line-clamp-2">{notification.message}</div>
        <div className="text-xs text-muted-foreground mt-1">
          {format(new Date(notification.date), 'dd MMMM, HH:mm', { locale: ru })}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-muted-foreground hover:text-destructive"
        onClick={(e) => {
          e.stopPropagation()
          onDelete(notification.id)
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
} 