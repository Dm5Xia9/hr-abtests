import { useState } from 'react'
import { useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { BellOff, Check, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Notification as NotificationType } from '@/types'

export function NotificationsPage() {
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    deleteNotification,
    getUnreadNotificationsCount
  } = useStore()
  
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  
  const filteredNotifications = notifications
    .filter(n => filter === 'all' || !n.isRead)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  const unreadCount = getUnreadNotificationsCount()
  
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <BellOff className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-medium mb-2">У вас нет уведомлений</h2>
        <p className="text-muted-foreground">
          Здесь будут отображаться уведомления о назначении треков адаптации и ментора
        </p>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Уведомления</h1>
        <div className="flex space-x-2">
          <div className="flex border rounded-md overflow-hidden">
            <Button 
              variant={filter === 'all' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setFilter('all')}
              className="rounded-none"
            >
              Все ({notifications.length})
            </Button>
            <Button 
              variant={filter === 'unread' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setFilter('unread')}
              className="rounded-none"
              disabled={unreadCount === 0}
            >
              Непрочитанные ({unreadCount})
            </Button>
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => markAllNotificationsAsRead()}
            >
              <Check className="h-4 w-4 mr-2" />
              Отметить все как прочитанные
            </Button>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        {filteredNotifications.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              {filter === 'unread' 
                ? 'У вас нет непрочитанных уведомлений'
                : 'У вас нет уведомлений'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationCard 
              key={notification.id} 
              notification={notification}
              onRead={markNotificationAsRead}
              onDelete={deleteNotification}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface NotificationCardProps {
  notification: NotificationType
  onRead: (id: string) => void
  onDelete: (id: string) => void
}

function NotificationCard({ notification, onRead, onDelete }: NotificationCardProps) {
  const handleRead = () => {
    if (!notification.isRead) {
      onRead(notification.id)
    }
  }
  
  return (
    <div 
      className={`
        border rounded-lg p-4
        ${notification.isRead ? 'bg-background' : 'bg-accent'}
      `}
    >
      <div className="flex justify-between mb-2">
        <h3 className="font-medium">{notification.title}</h3>
        <div className="flex space-x-2">
          {!notification.isRead && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRead}
              className="h-8 px-2"
            >
              <Check className="h-4 w-4 mr-1" />
              Прочитано
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(notification.id)}
            className="h-8 px-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-2">
        {notification.message}
      </p>
      
      <p className="text-xs text-muted-foreground">
        {format(new Date(notification.date), 'dd MMMM yyyy, HH:mm', { locale: ru })}
      </p>
    </div>
  )
} 