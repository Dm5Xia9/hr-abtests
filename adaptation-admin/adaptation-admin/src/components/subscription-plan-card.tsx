import { useState } from "react"
import { SubscriptionPlan } from "@/types"
import { formatPrice, getAnnualPrice } from "@/data/subscriptionPlans"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Check, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan
  isSelected?: boolean
  showAnnualToggle?: boolean
  onSelect?: (plan: SubscriptionPlan) => void
}

export const SubscriptionPlanCard = ({ 
  plan, 
  isSelected = false, 
  showAnnualToggle = true,
  onSelect 
}: SubscriptionPlanCardProps) => {
  const [isAnnual, setIsAnnual] = useState(false)

  const getBorderColor = () => {
    if (isSelected) {
      switch (plan.color) {
        case 'gray': return 'border-gray-500 dark:border-gray-400'
        case 'indigo': return 'border-indigo-500 dark:border-indigo-400'
        case 'purple': return 'border-purple-500 dark:border-purple-400'
        default: return 'border-indigo-500 dark:border-indigo-400'
      }
    }
    return 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
  }

  const getHeaderColor = () => {
    switch (plan.color) {
      case 'gray': return 'bg-gray-50 dark:bg-gray-800/60'
      case 'indigo': return 'bg-indigo-50 dark:bg-indigo-900/30'
      case 'purple': return 'bg-purple-50 dark:bg-purple-900/30'
      default: return 'bg-indigo-50 dark:bg-indigo-900/30'
    }
  }

  const getTitleColor = () => {
    switch (plan.color) {
      case 'gray': return 'text-gray-700 dark:text-gray-200'
      case 'indigo': return 'text-indigo-700 dark:text-indigo-300'
      case 'purple': return 'text-purple-700 dark:text-purple-300'
      default: return 'text-indigo-700 dark:text-indigo-300'
    }
  }

  const getButtonColor = () => {
    switch (plan.color) {
      case 'gray': return 'bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600'
      case 'indigo': return 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600'
      case 'purple': return 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600'
      default: return 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600'
    }
  }

  const price = isAnnual 
    ? getAnnualPrice(plan) 
    : formatPrice(plan.price)

  const priceLabel = isAnnual 
    ? 'в год (скидка 20%)' 
    : 'в месяц'

  return (
    <Card 
      className={cn(
        "relative transition-all duration-300 overflow-hidden h-full flex flex-col",
        getBorderColor(),
        isSelected && "shadow-lg transform scale-[1.02]",
        plan.isPopular && "border-indigo-300 dark:border-indigo-700",
        plan.isPopular && "shadow-md"
      )}
    >
      {plan.isPopular && (
        <div className="absolute top-0 right-0 bg-indigo-600 dark:bg-indigo-700 text-white px-4 py-1.5 text-xs font-medium flex items-center z-10 rounded-bl-md">
          <Star className="h-3.5 w-3.5 mr-1.5 fill-white" />
          Популярный
        </div>
      )}

      <CardHeader className={cn("pb-6 pt-6", getHeaderColor())}>
        <CardTitle className={cn("text-2xl font-bold", getTitleColor())}>
          {plan.name}
        </CardTitle>
        <CardDescription className="mt-2 text-sm dark:text-gray-400">
          {plan.id === 'free' 
            ? 'Для небольших команд и стартапов' 
            : plan.id === 'pro'
            ? 'Для растущих компаний с активной адаптацией' 
            : 'Для крупных компаний со сложной структурой'
          }
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 pb-4 px-6 flex-grow">
        <div className="mb-6">
          <div className="text-4xl font-bold text-gray-900 dark:text-white">{price}</div>
          <div className="text-sm mt-1 text-gray-500 dark:text-gray-400">{priceLabel}</div>
        </div>

        {showAnnualToggle && (
          <div className="flex items-center justify-between mb-8 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
            <span className="text-sm dark:text-gray-300">Ежемесячная оплата</span>
            <Switch 
              checked={isAnnual} 
              onCheckedChange={setIsAnnual} 
              className="mx-2"
            />
            <span className="text-sm dark:text-gray-300">Годовая оплата</span>
          </div>
        )}

        <ul className="space-y-4">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-green-500 dark:text-green-400 mr-3 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-4 pb-8 px-6 mt-auto">
        <Button 
          onClick={() => onSelect?.(plan)} 
          className={cn(
            "w-full text-white py-6", 
            getButtonColor(),
            isSelected && "ring-2 ring-offset-2 dark:ring-offset-gray-900"
          )}
        >
          {isSelected ? "Выбрано" : "Выбрать тариф"}
        </Button>
      </CardFooter>
    </Card>
  )
} 