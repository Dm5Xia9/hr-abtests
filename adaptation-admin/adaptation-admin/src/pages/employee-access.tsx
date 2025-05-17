import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '@/store/index'
import { Button } from '@/components/ui/button'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { PlayCircle, XCircle, AlertTriangle, BookOpen } from 'lucide-react'
import { ThemeProvider } from '@/components/theme-provider'
import { useTheme } from '@/components/theme-provider'

export function EmployeeAccessPage() {
  const { accessLink } = useParams()
  const { employees } = useStore()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [employee, setEmployee] = useState<any>(null)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    if (accessLink) {
      // Find employee by access link
      const foundEmployee = employees.find(e => e.accessLink === accessLink)
      
      if (foundEmployee) {
        setEmployee(foundEmployee)
        setError(null)
      } else {
        setError('Неверная ссылка доступа или срок действия ссылки истек')
      }
      
      setIsLoading(false)
    }
  }, [accessLink, employees])

  const handleStartAdaptation = () => {
    if (employee?.id && employee?.assignedTrackId) {
      navigate(`/track-progress/${employee.id}`)
    }
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <XCircle className="h-16 w-16 text-destructive" />
              </div>
              <CardTitle className="text-center text-xl">Ошибка доступа</CardTitle>
              <CardDescription className="text-center text-base mt-2">
                {error}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.reload()}
              >
                Попробовать снова
              </Button>
            </CardFooter>
          </Card>
        </div>
      )
    }

    if (!employee?.assignedTrackId) {
      return (
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-16 w-16 text-warning" />
              </div>
              <CardTitle className="text-center text-xl">Трек не назначен</CardTitle>
              <CardDescription className="text-center text-base mt-2">
                Вам еще не назначен трек адаптации. Пожалуйста, обратитесь к вашему HR-менеджеру.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      )
    }

    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <div className="absolute top-4 right-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full"
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              )}
            </Button>
          </div>
          <CardHeader className="pt-10">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <PlayCircle className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-center text-xl">Добро пожаловать!</CardTitle>
              <CardDescription className="text-center text-base mt-2 max-w-xs">
                {employee.fullName}, вы готовы начать прохождение программы адаптации?
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Информация</AlertTitle>
                <AlertDescription>
                  Ваш прогресс будет автоматически сохраняться. Вы можете вернуться к прохождению трека в любой момент, используя эту же ссылку.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
          <CardFooter className="flex-col space-y-3">
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleStartAdaptation}
            >
              <PlayCircle className="mr-2 h-5 w-5" />
              Начать адаптацию
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/knowledge')}
            >
              <BookOpen className="mr-2 h-5 w-5" />
              База знаний
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background flex flex-col">
        {/* Mobile-friendly top bar for branding */}
        <header className="h-16 flex items-center justify-center border-b">
          <h1 className="text-xl font-semibold">Система адаптации</h1>
        </header>
        
        {/* Main content */}
        {renderContent()}
        
        {/* Footer */}
        <footer className="h-12 flex items-center justify-center border-t text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} HR-Adaptation</p>
        </footer>
      </div>
    </ThemeProvider>
  )
} 