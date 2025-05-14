import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Coins, Trophy, Award, Users, Medal } from 'lucide-react'

// Placeholder user data - would be fetched from API in a real app
const users = [
  {
    id: '1',
    name: 'Иван Иванов',
    avatar: 'https://i.pravatar.cc/150?img=1',
    email: 'ivan@example.com',
    department: 'Инженерный',
    position: 'Старший инженер',
    coins: 850,
    completedStages: 12,
  },
  {
    id: '2',
    name: 'Мария Петрова',
    avatar: 'https://i.pravatar.cc/150?img=5',
    email: 'maria@example.com',
    department: 'Маркетинг',
    position: 'Маркетолог',
    coins: 720,
    completedStages: 9,
  },
  {
    id: '3',
    name: 'Алексей Смирнов',
    avatar: 'https://i.pravatar.cc/150?img=3',
    email: 'alex@example.com',
    department: 'Разработка',
    position: 'Frontend разработчик',
    coins: 620,
    completedStages: 8,
  },
  {
    id: '4',
    name: 'Екатерина Соколова',
    avatar: 'https://i.pravatar.cc/150?img=4',
    email: 'kate@example.com',
    department: 'HR',
    position: 'HR-менеджер',
    coins: 570,
    completedStages: 7,
  },
  {
    id: '5',
    name: 'Дмитрий Козлов',
    avatar: 'https://i.pravatar.cc/150?img=6',
    email: 'dmitry@example.com',
    department: 'Продажи',
    position: 'Менеджер по продажам',
    coins: 510,
    completedStages: 6,
  },
]

interface LeaderboardProps {
  className?: string
}

export function Leaderboard({ className }: LeaderboardProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('month')
  
  const getTopUsers = () => {
    // In a real app, this would filter based on the selected period
    return [...users].sort((a, b) => b.coins - a.coins)
  }
  
  const getMedalColor = (index: number) => {
    switch (index) {
      case 0: return 'text-yellow-500'
      case 1: return 'text-slate-400'
      case 2: return 'text-amber-700'
      default: return 'text-muted-foreground'
    }
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Таблица лидеров
            </CardTitle>
            <CardDescription>
              Сотрудники, заработавшие больше всего монет
            </CardDescription>
          </div>
          <Tabs 
            value={period} 
            onValueChange={(value: string) => setPeriod(value as 'week' | 'month' | 'all')}
            className="w-auto"
          >
            <TabsList className="grid grid-cols-3 h-8">
              <TabsTrigger value="week" className="text-xs px-2">Неделя</TabsTrigger>
              <TabsTrigger value="month" className="text-xs px-2">Месяц</TabsTrigger>
              <TabsTrigger value="all" className="text-xs px-2">Всё время</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {getTopUsers().map((user, index) => (
            <div key={user.id} className="flex items-center gap-4">
              <div className="flex-none w-8 text-center">
                {index <= 2 ? (
                  <Medal className={`h-6 w-6 ${getMedalColor(index)}`} />
                ) : (
                  <span className="text-lg font-bold text-muted-foreground">{index + 1}</span>
                )}
              </div>
              <Avatar className="h-10 w-10 flex-none">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.department}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="bg-amber-50 border-amber-200 gap-1 font-bold">
                  <Coins className="h-3.5 w-3.5 text-amber-500" />
                  {user.coins}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 