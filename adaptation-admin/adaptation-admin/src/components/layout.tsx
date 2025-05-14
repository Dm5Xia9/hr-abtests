import { Link, useLocation } from 'react-router-dom'
import { useTheme } from './theme-provider'
import { Button } from './ui/button'
import { Moon, Sun, Plus, Users, BookOpen, FileText, Settings, UserCheck } from 'lucide-react'
import { NotificationIcon } from './ui/notifications'
import { UserMenu } from './user-menu'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { theme, setTheme } = useTheme()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path
  const isTrackEditor = location.pathname === '/tracks/new' || (location.pathname.includes('tracks') && location.pathname.includes('edit'))

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link to="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold">HR Адаптация</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Button variant="ghost" asChild>
                <Link to="/employees">
                  <Users className="mr-2 h-4 w-4" />
                  Сотрудники
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/tracks">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Треки
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/knowledge">
                  <FileText className="mr-2 h-4 w-4" />
                  База знаний
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/my-mentees">
                  <UserCheck className="mr-2 h-4 w-4" />
                  Мои подопечные
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/management">
                  <Settings className="mr-2 h-4 w-4" />
                  Управление
                </Link>
              </Button>
            </nav>
          </div>
          <div className="ml-auto flex items-center space-x-2">
            <NotificationIcon />
            <UserMenu />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Переключить тему</span>
            </Button>
          </div>
        </div>
      </header>
      <main className={isTrackEditor ? 'w-full' : 'container py-6'}>{children}</main>
    </div>
  )
} 