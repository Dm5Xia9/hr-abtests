import { UserCoins } from '@/components/gamification/UserCoins'
import { Leaderboard } from '@/components/gamification/Leaderboard'
import { Coins, Target, Trophy, Users } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

// Placeholder data - would come from API in real app
const userData = {
  coins: 720,
  userName: 'Иван Петров',
  nextRewardAt: 1000,
  level: 2,
  completedStages: 12,
  totalStages: 25,
  rank: 4,
  totalUsers: 28
}

export function TrackGamificationDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <UserCoins 
        coins={userData.coins}
        userName={userData.userName}
        nextRewardAt={userData.nextRewardAt}
        level={userData.level}
      />
      
      <div className="grid gap-4">
        <StatCard 
          title="Выполнено этапов"
          value={`${userData.completedStages}/${userData.totalStages}`}
          description="Прогресс по адаптации"
          icon={<Target className="h-4 w-4" />}
        />
        
        <StatCard 
          title="Ваш рейтинг"
          value={`${userData.rank} из ${userData.totalUsers}`}
          description="Позиция в таблице лидеров"
          icon={<Trophy className="h-4 w-4" />}
        />
      </div>
      
      <Leaderboard className="lg:row-span-2" />
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  description: string
  icon: React.ReactNode
}

function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <div className="h-4 w-4 text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  )
} 