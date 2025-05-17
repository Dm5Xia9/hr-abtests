import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import apiClient from '@/lib/api'
import { setAuthToken } from '@/lib/api-init'
import useApi from '@/hooks/useApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { motion, AnimatePresence } from 'framer-motion'
import React from 'react'
import { useTheme } from '@/components/theme-provider'
import { Employee } from '@/types'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('dimastd3@gmail.com')
  const [password, setPassword] = useState('QAZqaz_123')
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const { setUsers, setCurrentCompanyProfile } = useStore()
  const { isLoading, error, setError } = useApi()
  const navigate = useNavigate()
  const googleButtonRef = React.useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    // Load Google Sign-In API
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = initializeGoogleSignIn
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  // Re-initialize Google Sign-In when theme changes
  useEffect(() => {
    // Only re-initialize if the script has already been loaded
    if (window.google && googleButtonRef.current) {
      initializeGoogleSignIn()
    }
  }, [theme])

  const initializeGoogleSignIn = () => {
    if (window.google && googleButtonRef.current) {
      // Get current theme
      const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      
      window.google.accounts.id.initialize({
        client_id: '127535081651-u5ou1l47vi69fqnh6bec3doj2fvelrhj.apps.googleusercontent.com', // Replace with your actual Google Client ID
        callback: handleGoogleSignIn,
      })

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: isDarkMode ? 'filled_black' : 'outline',
        size: 'large',
        width: googleButtonRef.current.offsetWidth,
        text: 'signin_with',
      })
    }
  }

  // Helper function to convert API user to Employee
  const convertUserToEmployee = (user: any): Employee => {
    return {
      id: user.id || crypto.randomUUID(),
      fullName: user.name || '',
      email: user.email || '',
      role: user.role || 'employee',
      departmentId: null,
      positionId: null,
      hireDate: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      currentCompanyId: '',
      createAt: new Date().toISOString(),
      assignedTracks: []
    };
  };

  const handleGoogleSignIn = async (response: any) => {
    try {
      setError(null)
      const googleToken = response.credential
      
      // Use Google token to authenticate with our backend
      const { token, user } = await apiClient.loginWithGoogle(googleToken)
      
      // Set authentication token
      setAuthToken(token)
      
      // Convert user to Employee and update state
      setUsers([convertUserToEmployee(user)])
      
      // Redirect to company profile selection
      navigate('/company-profile')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа через Google. Попробуйте другой способ.')
    }
  }

  const toggleAuthMode = () => {
    setIsLogin(!isLogin)
    setError(null)
  }

  const validateForm = () => {
    if (isLogin) {
      if (!email || !password) {
        setError('Пожалуйста, введите email и пароль')
        return false
      }
    } else {
      if (!name || !email || !password || !confirmPassword) {
        setError('Пожалуйста, заполните все поля')
        return false
      }
      if (password !== confirmPassword) {
        setError('Пароли не совпадают')
        return false
      }
      if (!acceptTerms) {
        setError('Необходимо принять условия использования')
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      setError(null)
      
      if (isLogin) {
        // Login process
        const { token, user } = await apiClient.login(email, password)
        
        // Set authentication token for future requests
        setAuthToken(token)
        
        // Convert user to Employee and update state
        setUsers([convertUserToEmployee(user)])
        
        // Redirect to company profile selection
        navigate('/company-profile')
      } else {
        // Registration process - но после успешной регистрации мы СРАЗУ авторизуемся
        try {
          // Регистрируем пользователя
          await apiClient.register(name, email, password)
          
          // Сразу выполняем вход с только что созданными учетными данными
          const { token, user } = await apiClient.login(email, password)
          
          // Set authentication token for future requests
          setAuthToken(token)
          
          // Convert user to Employee and update state
          setUsers([convertUserToEmployee(user)])
        
          const companyProfile = await apiClient.getCurrentCompanyProfile()

          setCurrentCompanyProfile(companyProfile)
            
          navigate('/')        
        } catch (registerError) {
          setError(registerError instanceof Error ? registerError.message : 'Ошибка при регистрации аккаунта')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка. Проверьте данные и попробуйте снова.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row auth-page-background">
      {/* Brand Section */}
      <div className="w-full md:w-1/2 auth-page-brand-section text-white p-8 flex flex-col justify-center items-center">
        <div className="max-w-md mx-auto text-center mb-8 mt-8 md:mt-0">
          <h1 className="text-4xl font-bold mb-4">Adaptation Admin</h1>
          <p className="text-lg mb-8">
            Система адаптации сотрудников для быстрого и эффективного развития новых кадров
          </p>
          <img 
            src="/images/auth-illustration.svg" 
            alt="Иллюстрация" 
            className="max-w-sm mx-auto"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/400x300?text=Adaptation+Admin';
            }}
          />
        </div>
      </div>

      {/* Forms Section */}
      <div className="w-full md:w-1/2 p-8 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold auth-page-text">
              {isLogin ? 'Вход в систему' : 'Регистрация'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isLogin 
                ? 'Войдите в вашу учетную запись' 
                : 'Создайте новую учетную запись'}
            </p>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.form 
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.2 }}
              className="mt-8 space-y-6" 
              onSubmit={handleSubmit}
            >
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-700 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                {!isLogin && (
                  <div>
                    <Label htmlFor="name" className="block text-sm font-medium auth-page-text">
                      Имя
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      className="mt-1 dark:bg-gray-800 dark:border-gray-700"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="email" className="block text-sm font-medium auth-page-text">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="mt-1 dark:bg-gray-800 dark:border-gray-700"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="password" className="block text-sm font-medium auth-page-text">
                    Пароль
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    required
                    className="mt-1 dark:bg-gray-800 dark:border-gray-700"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                
                {!isLogin && (
                  <>
                    <div>
                      <Label htmlFor="confirmPassword" className="block text-sm font-medium auth-page-text">
                        Подтвердите пароль
                      </Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        className="mt-1 dark:bg-gray-800 dark:border-gray-700"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </>
                )}
                
                {isLogin && (
                  <div className="flex items-center justify-between">
                    <div></div>
                    <div className="text-sm">
                      <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                        Забыли пароль?
                      </a>
                    </div>
                  </div>
                )}
                
                {!isLogin && (
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="terms" 
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                      className="border-gray-300 dark:border-gray-600"
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm auth-page-text"
                    >
                      Я согласен с <a href="#" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">политикой конфиденциальности</a>
                    </label>
                  </div>
                )}
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full auth-page-button-primary hover:bg-indigo-700 text-white"
                >
                  {isLoading ? (
                    <div className="inline-block animate-spin h-4 w-4 mr-2 border-t-2 border-white rounded-full" />
                  ) : null}
                  {isLogin ? 'Войти' : 'Создать аккаунт и компанию'}
                </Button>
              </div>
              
              {isLogin ? (
                <div className="flex justify-center mt-4">
                  <div ref={googleButtonRef}></div>
                </div>
              ) : null}
              
              <div className="text-sm text-center mt-4">
                {isLogin ? (
                  <p>
                    Нет аккаунта?{' '}
                    <button
                      type="button"
                      className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                      onClick={toggleAuthMode}
                    >
                      Зарегистрироваться
                    </button>
                  </p>
                ) : (
                  <p>
                    Уже есть аккаунт?{' '}
                    <button
                      type="button"
                      className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                      onClick={toggleAuthMode}
                    >
                      Войти
                    </button>
                  </p>
                )}
              </div>
            </motion.form>
          </AnimatePresence>

        </div>
      </div>
    </div>
  )
}

export default AuthPage 