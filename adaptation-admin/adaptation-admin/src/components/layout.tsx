import { Link, useLocation } from 'react-router-dom'
import { useTheme } from './theme-provider'
import { Button } from './ui/button'
import { Moon, Sun, Plus } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { theme, setTheme } = useTheme()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path
  const isTrackEditor = location.pathname === '/tracks/new'

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link to="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold">HR Адаптация</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                to="/employees"
                className={`transition-colors hover:text-foreground/80 ${
                  location.pathname.startsWith('/employees')
                    ? 'text-foreground'
                    : 'text-foreground/60'
                }`}
              >
                Сотрудники
              </Link>
              <Link
                to="/knowledge"
                className={`transition-colors hover:text-foreground/80 ${
                  location.pathname.startsWith('/knowledge')
                    ? 'text-foreground'
                    : 'text-foreground/60'
                }`}
              >
                Статьи
              </Link>
              <Link
                to="/tracks"
                className={`transition-colors hover:text-foreground/80 ${
                  location.pathname.startsWith('/tracks')
                    ? 'text-foreground'
                    : 'text-foreground/60'
                }`}
              >
                Треки адаптации
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            {location.pathname === '/employees' && (
              <Button asChild>
                <Link to="/employees/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить сотрудника
                </Link>
              </Button>
            )}
            {location.pathname === '/tracks' && (
              <Button asChild>
                <Link to="/tracks/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Создать трек
                </Link>
              </Button>
            )}
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