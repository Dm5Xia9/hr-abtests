import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Users,
  GraduationCap,
  BookOpen,
  Settings,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'

export function Nav() {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const links = [
    {
      href: '/employees',
      label: 'Сотрудники',
      icon: Users,
    },
    {
      href: '/tracks',
      label: 'Треки',
      icon: GraduationCap,
    },
    {
      href: '/knowledge',
      label: 'База знаний',
      icon: BookOpen,
    },
    {
      href: '/settings',
      label: 'Настройки',
      icon: Settings,
    },
  ]

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      <nav
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-background p-6 transition-transform duration-200 ease-in-out md:relative md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">HR Portal</h1>
          </div>

          <div className="flex-1 space-y-1">
            {links.map((link) => (
              <Button
                key={link.href}
                variant="ghost"
                className={cn(
                  'w-full justify-start',
                  location.pathname.startsWith(link.href) &&
                    'bg-muted font-medium'
                )}
                asChild
              >
                <Link to={link.href}>
                  <link.icon className="mr-2 h-4 w-4" />
                  {link.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </nav>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
} 