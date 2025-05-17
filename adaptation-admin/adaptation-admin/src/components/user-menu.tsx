import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import { setAuthToken } from '@/lib/api-init'
import apiClient from '@/lib/api'
import { CompanyProfile } from '@/types'
import { User, LogOut, Building, Plus, Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { UserRole } from '@/types'

export function UserMenu() {
  const [open, setOpen] = useState(false)
  const [companyProfiles, setCompanyProfiles] = useState<CompanyProfile[]>([])
  const { currentUser, fetchCurrentUser, currentCompanyProfile, setCurrentCompanyProfile } = useStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!currentUser) {
      fetchCurrentUser()
    }
    
    fetchCompanyProfiles()
  }, [currentUser, fetchCurrentUser])

  const fetchCompanyProfiles = async () => {
    try {
      const profiles = await apiClient.getUserCompanyProfiles()
      setCompanyProfiles(profiles)
    } catch (error) {
      console.error('Ошибка загрузки профилей компаний:', error)
    }
  }

  const clearCompanyCache = () => {
    // Keep the auth token, but clear the application data cache
    const authToken = localStorage.getItem('auth_token')
    localStorage.clear()
    if (authToken) {
      localStorage.setItem('auth_token', authToken)
    }
  }

  const handleSwitchCompany = async (companyId: string) => {
    try {
      const { companyProfile } = await apiClient.switchCompanyProfile(companyId)
      
      // Clear localStorage cache except auth token
      clearCompanyCache()
      
      setCurrentCompanyProfile(companyProfile)
      setOpen(false)
      
      // Обновляем текущую страницу без перенаправления
      window.location.reload()
    } catch (error) {
      console.error('Ошибка при переключении компании:', error)
    }
  }

  const handleCreateCompany = () => {
    navigate('/company-profile')
    setOpen(false)
  }

  const handleLogout = () => {
    // Очищаем токен авторизации
    setAuthToken(null)
    
    // Очищаем локальное хранилище
    localStorage.clear()
    
    // Перенаправляем на страницу входа
    navigate('/auth')
    
    // Закрываем меню
    setOpen(false)
  }

  // Получаем инициалы пользователя для аватара
  const getUserInitials = () => {
    if (!currentUser) return 'U'
    
    const nameParts = currentUser.fullName.split(' ')
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
    }
    
    return currentUser.fullName.substring(0, 2).toUpperCase()
  }

  // Получаем название роли пользователя
  const getUserRoleLabel = () => {
    if (!currentUser) return ''
    
    switch (currentUser.role) {
      case 'admin':
        return 'Администратор'
      case 'manager':
        return 'Руководитель'
     case 'employee':
        return 'Сотрудник'
      default:
        return 'Пользователь'
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 border-dashed flex items-center gap-1 px-3"
        >
          <div className="flex items-center">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarFallback className="text-xs">{getUserInitials()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium leading-none">{currentUser?.fullName || 'Пользователь'}</span>
              {currentCompanyProfile && (
                <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  <span className="max-w-[100px] truncate">{currentCompanyProfile.name}</span>
                </span>
              )}
            </div>
          </div>
          <ChevronDown className="h-4 w-4 ml-1 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px]">
        {/* Данные аккаунта */}
        <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-3 py-2 flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{currentUser?.fullName}</div>
            <div className="text-xs text-muted-foreground">{currentUser?.email}</div>
            <div className="text-xs text-muted-foreground mt-1">{getUserRoleLabel()}</div>
          </div>
        </div>
        
        {/* Секция компаний */}
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex justify-between items-center">
            <span>Компании</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5" 
              onClick={(e) => {
                e.stopPropagation();
                handleCreateCompany();
              }}
            >
              <Plus className="h-4 w-4 text-indigo-600" />
            </Button>
          </DropdownMenuLabel>
          
          <div className="max-h-[180px] overflow-y-auto py-1">
            {companyProfiles.length > 0 ? (
              companyProfiles.map((profile) => (
                <DropdownMenuItem
                  key={profile.id}
                  onClick={() => handleSwitchCompany(profile.id)}
                  className={cn(
                    "flex justify-between items-center",
                    currentCompanyProfile?.id === profile.id && "font-medium bg-accent"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate max-w-[200px]">{profile.name}</span>
                  </div>
                  {currentCompanyProfile?.id === profile.id && (
                    <Check className="h-4 w-4 ml-2" />
                  )}
                </DropdownMenuItem>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                У вас еще нет компаний
              </div>
            )}
          </div>
        </DropdownMenuGroup>
        
        {/* Выход из аккаунта */}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="h-4 w-4 mr-2" />
          <span>Выйти</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 