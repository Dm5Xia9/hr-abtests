import { useState } from 'react'
import { useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { BellOff, Check, Trash2, Bell } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Notification as NotificationType } from '@/types'
import { MobileLayout } from '@/components/mobile-layout'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function MobileNotificationsPage() {
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
  
  const renderContent = () => {
    if (notifications.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <BellOff className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-medium mb-2 text-center">У вас нет уведомлений</h2>
          <p className="text-muted-foreground text-center text-sm px-4">
            Здесь будут отображаться уведомления о назначении треков адаптации и ментора
          </p>
        </div>
      )
    }

    if (filteredNotifications.length === 0) {
      return (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            {filter === 'unread' 
              ? 'У вас нет непрочитанных уведомлений'
              : 'У вас нет уведомлений'}
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-3 mt-4">
        {filteredNotifications.map((notification) => (
          <NotificationCard 
            key={notification.id} 
            notification={notification}
            onRead={markNotificationAsRead}
            onDelete={deleteNotification}
          />
        ))}
      </div>
    )
  }
  
  return (
    <MobileLayout title="Уведомления">
      <div className="p-4 space-y-4">
        {/* Tabs for filtering */}
        <div className="flex justify-between items-center">
          <Tabs defaultValue={filter} onValueChange={(value) => setFilter(value as 'all' | 'unread')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">
                Все <span className="ml-1 text-xs">({notifications.length})</span>
              </TabsTrigger>
              <TabsTrigger value="unread" disabled={unreadCount === 0}>
                Непрочитанные <span className="ml-1 text-xs">({unreadCount})</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Mark all as read button */}
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => markAllNotificationsAsRead()}
            className="w-full"
          >
            <Check className="h-4 w-4 mr-2" />
            Отметить все как прочитанные
          </Button>
        )}
        
        {/* Notifications list */}
        {renderContent()}
      </div>
    </MobileLayout>
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
        border rounded-lg p-3
        ${notification.isRead ? 'bg-background' : 'bg-accent/50'}
      `}
    >
      <div className="flex items-start mb-2">
        <div className="mr-3 mt-1">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between">
            <h3 className="font-medium text-sm">{notification.title}</h3>
            {!notification.isRead && (
              <Badge variant="secondary" className="ml-2 text-xs">Новое</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {format(new Date(notification.date), 'dd MMMM, HH:mm', { locale: ru })}
          </p>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 mt-2 border-t pt-2">
        {!notification.isRead && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRead}
            className="h-8 px-2 text-xs"
          >
            <Check className="h-3 w-3 mr-1" />
            Прочитано
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(notification.id)}
          className="h-8 px-2 text-destructive hover:text-destructive text-xs"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
} 