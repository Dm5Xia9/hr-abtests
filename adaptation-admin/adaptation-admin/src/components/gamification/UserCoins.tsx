import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Coins, 
  Gem, 
  Trophy, 
  Award, 
  Gift, 
  ChevronRight, 
  Star 
} from 'lucide-react'

interface UserCoinsProps {
  className?: string
  coins: number
  userName: string
  nextRewardAt: number
  level: number
}

export function UserCoins({ 
  className, 
  coins = 0, 
  userName = 'Сотрудник', 
  nextRewardAt = 1000, 
  level = 1 
}: UserCoinsProps) {
  const progressPercent = Math.min(100, (coins / nextRewardAt) * 100)
  
  const rewards = [
    { coins: 500, name: 'Серебряный значок', icon: <Award className="h-4 w-4" /> },
    { coins: 1000, name: 'Золотой значок', icon: <Trophy className="h-4 w-4" /> },
    { coins: 2000, name: 'Платиновый значок', icon: <Star className="h-4 w-4" /> },
    { coins: 5000, name: 'Бриллиантовый значок', icon: <Gem className="h-4 w-4" /> },
  ]
  
  const nextReward = rewards.find(reward => reward.coins > coins) || rewards[rewards.length - 1]
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-500" />
            <span>Монеты адаптации</span>
          </div>
          <div className="text-2xl font-bold text-amber-600 flex items-center gap-1">
            <Coins className="h-5 w-5" />
            {coins}
          </div>
        </CardTitle>
        <CardDescription>
          Ваш прогресс в программе адаптации
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Уровень {level}</span>
              <span className="text-muted-foreground">{coins} / {nextRewardAt}</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-full text-amber-700">
                {nextReward.icon}
              </div>
              <div>
                <p className="text-sm font-medium">Следующая награда</p>
                <p className="text-xs text-muted-foreground">
                  {nextReward.name} ({nextReward.coins} монет)
                </p>
              </div>
            </div>
            <p className="text-sm text-amber-700">
              Осталось {nextReward.coins - coins} монет
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full gap-1 text-sm" size="sm">
          <Gift className="h-4 w-4" />
          <span>Магазин наград</span>
          <ChevronRight className="h-4 w-4 ml-auto" />
        </Button>
      </CardFooter>
    </Card>
  )
} 