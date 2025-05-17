import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '@/store'
import { 
  Home, 
  BookOpen, 
  Bell, 
  User, 
  Moon, 
  Sun,
  ChevronLeft,
  LogOut,
  Building,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/components/theme-provider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface MobileLayoutProps {
  children: React.ReactNode
  showBackButton?: boolean
  title?: string
  renderTrackSelector?: React.ReactNode
  backButton?: {
    onClick: () => void
    label?: string
  }
  disableScroll?: boolean
  hideBottomNav?: boolean
  hideHeader?: boolean
}

export function MobileLayout({ 
  children, 
  showBackButton = false, 
  title = "Трек адаптации",
  renderTrackSelector,
  backButton,
  disableScroll = false,
  hideBottomNav = false,
  hideHeader = false
}: MobileLayoutProps) {
  const { currentUser, notifications, companyProfiles, currentCompanyProfile, setCurrentCompanyProfile } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, setTheme } = useTheme()

  const unreadNotifications = notifications.filter(n => !n.isRead).length

  const handleBack = () => {
    navigate(-1)
  }

  const handleCompanyChange = (companyId: string) => {
    const company = companyProfiles.find(c => c.id === companyId)
    if (company) {
      setCurrentCompanyProfile(company)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Simplified header */}
      {!hideHeader && (
        <header className="h-12 px-3 border-b flex items-center justify-between sticky top-0 z-20 bg-background/95 backdrop-blur-sm transition-all duration-300 ease-in-out">
          <div className="flex items-center gap-2">
            {backButton ? (
              <Button variant="ghost" size="sm" onClick={backButton.onClick} className="gap-1 px-2 -ml-2 h-8 text-primary hover:bg-primary/5">
                <ChevronLeft className="h-4 w-4" />
                {backButton.label && <span className="text-xs truncate max-w-[100px]">{backButton.label}</span>}
              </Button>
            ) : showBackButton && (
              <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8 -ml-1">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            {renderTrackSelector ? (
              <div className="flex items-center">
                {renderTrackSelector}
              </div>
            ) : (
              <h1 className="text-base font-medium">{title}</h1>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Company selector */}
            {companyProfiles.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-8 w-8">
                    <Building className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Компании</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {companyProfiles.map(company => (
                    <DropdownMenuItem 
                      key={company.id}
                      onClick={() => handleCompanyChange(company.id)}
                      className={cn(
                        currentCompanyProfile?.id === company.id && "bg-primary/10 text-primary"
                      )}
                    >
                      <Building className="mr-2 h-4 w-4" />
                      <span>{company.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* Theme toggle */}
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="h-8 w-8">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            {/* Notifications */}
            <Button variant="ghost" size="icon" onClick={() => navigate('/mobile-notifications')} className="relative h-8 w-8">
              <Bell className="h-4 w-4" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-destructive text-destructive-foreground rounded-full text-[9px] flex items-center justify-center">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </Button>
            
            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
                {currentUser && (
                  <DropdownMenuLabel className="font-normal text-sm text-muted-foreground">
                    {currentUser.fullName}
                  </DropdownMenuLabel>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/knowledge')}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>База знаний</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Выйти</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
      )}
      
      {/* Main content with scroll */}
      <main className={cn(
        "flex-1 overflow-auto transition-all duration-300 ease-in-out",
        hideHeader && "h-screen"
      )}>
        {disableScroll ? (
          <div className={cn(
            "h-full",
            hideBottomNav ? "pb-0" : "pb-[72px]"
          )}>
            {children}
          </div>
        ) : (
          <ScrollArea className={cn(
            "h-full",
            hideBottomNav ? "pb-0" : "pb-[72px]"
          )}>
            {children}
          </ScrollArea>
        )}
      </main>
      
      {/* Bottom navigation */}
      {!hideBottomNav && (
        <nav className="h-16 border-t flex items-center justify-around px-2 fixed bottom-0 left-0 right-0 bg-background z-10 transition-opacity duration-300 ease-in-out">
          <Link 
            to="/passage" 
            className={cn(
              "flex flex-col items-center justify-center h-full w-full text-xs font-medium",
              location.pathname.includes('/passage') 
                ? "text-primary" 
                : "text-muted-foreground"
            )}
          >
            <Home className="h-6 w-6 mb-1" />
            <span>Трек</span>
          </Link>
          
          <Link 
            to="/employee-meetings" 
            className={cn(
              "flex flex-col items-center justify-center h-full w-full text-xs font-medium",
              location.pathname.includes('/employee-meetings') || location.pathname.includes('/employee-calendar')
                ? "text-primary" 
                : "text-muted-foreground"
            )}
          >
            <Calendar className="h-6 w-6 mb-1" />
            <span>Встречи</span>
          </Link>
          
          <Link 
            to="/knowledge" 
            className={cn(
              "flex flex-col items-center justify-center h-full w-full text-xs font-medium",
              location.pathname.includes('/knowledge') 
                ? "text-primary" 
                : "text-muted-foreground"
            )}
          >
            <BookOpen className="h-6 w-6 mb-1" />
            <span>Знания</span>
          </Link>
          
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className={cn(
                  "flex flex-col items-center justify-center h-full w-full text-xs font-medium",
                  "text-muted-foreground"
                )}
              >
                <User className="h-6 w-6 mb-1" />
                <span>Профиль</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
              {currentUser && (
                <DropdownMenuLabel className="font-normal text-sm text-muted-foreground">
                  {currentUser.fullName}
                </DropdownMenuLabel>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                <span>{theme === 'dark' ? 'Светлая тема' : 'Темная тема'}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Выйти</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      )}
    </div>
  )
} 