import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  Employee, 
  Track, 
  Article, 
  User, 
  UserRole, 
  Position, 
  Department,
  AdaptationStatus,
  Notification,
  NotificationType
} from '@/types'
import track from './track.json'

interface AppState {
  employees: Employee[]
  tracks: Track[]
  articles: Article[]
  users: User[]
  positions: Position[]
  departments: Department[]
  notifications: Notification[]
  
  // Employee methods
  setEmployees: (employees: Employee[]) => void
  addEmployee: (employee: Omit<Employee, 'id' | 'adaptationStatus' | 'accessLink'>) => void
  updateEmployee: (employee: Employee) => void
  deleteEmployee: (id: string) => void
  assignMentor: (employeeId: string, mentorId: string) => void
  removeMentor: (employeeId: string) => void
  generateAccessLink: (employeeId: string) => string
  
  // Track methods
  setTracks: (tracks: Track[]) => void
  assignTrack: (employeeId: string, trackId: string, startDate: string) => void
  removeTrack: (employeeId: string) => void
  updateTrack: (employeeId: string, trackId: string, startDate: string) => void
  updateTrackContent: (track: Track) => void

  // Articles methods  
  setArticles: (articles: Article[]) => void
  createArticle: (article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateArticle: (article: Article) => void
  deleteArticle: (id: string) => void
  
  // User methods
  setUsers: (users: User[]) => void
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void
  updateUser: (user: User) => void
  deleteUser: (id: string) => void
  resetUserPassword: (id: string) => void
  changeUserRole: (id: string, role: UserRole) => void
  
  // Dictionary methods
  setPositions: (positions: Position[]) => void
  addPosition: (position: Omit<Position, 'id'>) => Position
  updatePosition: (position: Position) => void
  deletePosition: (id: string) => void
  
  setDepartments: (departments: Department[]) => void
  addDepartment: (department: Omit<Department, 'id'>) => Department
  updateDepartment: (department: Department) => void
  deleteDepartment: (id: string) => void

  // Notification methods
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'isRead'>) => void
  markNotificationAsRead: (id: string) => void
  markAllNotificationsAsRead: () => void
  deleteNotification: (id: string) => void
  getUnreadNotificationsCount: () => number
}

// Mock data
const mockEmployees: Employee[] = [
  {
    id: '1',
    fullName: 'John Doe',
    position: 'Software Engineer',
    department: 'Engineering',
    email: 'john.doe@example.com',
    hireDate: '2024-01-15',
    adaptationStatus: 'not_started',
  },
  {
    id: '2',
    fullName: 'Jane Smith',
    position: 'Product Manager',
    department: 'Product',
    email: 'jane.smith@example.com',
    hireDate: '2024-02-01',
    adaptationStatus: 'in_progress',
    assignedTrackId: 'dotnet-developer-track',
    startDate: '2024-02-01',
    stepProgress: {
      'welcome-survey': {
        completed: true,
        answers: {
          'experience': '5 years of experience',
          'expectations': 'Looking forward to learning new technologies',
          'learning_preference': 'mentor'
        }
      }
    }
  },
]

// Приведение типа для track.json
const typedTrack: Track = track as Track
const mockTracks: Track[] = [typedTrack]

const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Как начать работу в компании',
    content: '# Добро пожаловать!\n\nЭто руководство поможет вам начать работу в нашей компании...',
    category: 'Ориентация',
    tags: ['начало работы', 'onboarding'],
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z',
    author: 'HR Department',
  },
  {
    id: '2',
    title: 'Корпоративная культура',
    content: '# Корпоративная культура\n\nНаша компания ценит...',
    category: 'Культура',
    tags: ['культура', 'ценности'],
    createdAt: '2024-02-01T11:00:00Z',
    updatedAt: '2024-02-01T11:00:00Z',
    author: 'HR Department',
  },
]

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Администратор',
    email: 'admin@company.com',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Иван Петров',
    email: 'ivan@company.com',
    role: 'manager',
    createdAt: '2024-01-15T10:30:00Z',
    lastLogin: '2024-02-20T14:25:00Z',
  },
  {
    id: '3',
    name: 'Анна Сидорова',
    email: 'anna@company.com',
    role: 'observer',
    createdAt: '2024-02-05T09:15:00Z',
  },
]

const mockPositions: Position[] = [
  { id: '1', name: 'Разработчик' },
  { id: '2', name: 'Тестировщик' },
  { id: '3', name: 'Менеджер проектов' },
  { id: '4', name: 'Дизайнер' },
]

const mockDepartments: Department[] = [
  { id: '1', name: 'Разработка' },
  { id: '2', name: 'Тестирование' },
  { id: '3', name: 'Маркетинг' },
  { id: '4', name: 'Продажи' },
]

const mockNotifications: Notification[] = []

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      employees: mockEmployees,
      tracks: mockTracks,
      articles: mockArticles,
      users: mockUsers,
      positions: mockPositions,
      departments: mockDepartments,
      notifications: mockNotifications,
      
      // Employee methods
      setEmployees: (employees) => set({ employees }),
      addEmployee: (employee) => set((state) => {
        const newEmployee = {
          ...employee,
          id: crypto.randomUUID(),
          adaptationStatus: 'not_started' as AdaptationStatus,
          accessLink: `${window.location.origin}/access/${crypto.randomUUID()}`,
        }
        return { employees: [...state.employees, newEmployee] }
      }),
      updateEmployee: (updatedEmployee) => set((state) => ({
        employees: state.employees.map((employee) => 
          employee.id === updatedEmployee.id ? updatedEmployee : employee
        ),
      })),
      deleteEmployee: (id) => set((state) => ({
        employees: state.employees.filter((employee) => employee.id !== id),
      })),
      assignMentor: (employeeId, mentorId) => {
        const employee = get().employees.find(e => e.id === employeeId)
        const mentor = get().employees.find(e => e.id === mentorId)
        
        set((state) => ({
          employees: state.employees.map((e) =>
            e.id === employeeId
              ? { ...e, mentorId }
              : e
          ),
        }))
        
        if (employee && mentor) {
          get().addNotification({
            type: 'mentor_assigned',
            title: 'Назначен ментор',
            message: `Сотруднику ${employee.fullName} назначен ментор: ${mentor.fullName}`,
            employeeId,
            data: { mentorId, mentorName: mentor.fullName }
          })
        }
      },
      removeMentor: (employeeId) => set((state) => ({
        employees: state.employees.map((employee) =>
          employee.id === employeeId
            ? { ...employee, mentorId: undefined }
            : employee
        ),
      })),
      generateAccessLink: (employeeId) => {
        const accessLink = `${window.location.origin}/access/${crypto.randomUUID()}`
        set((state) => ({
          employees: state.employees.map((employee) =>
            employee.id === employeeId
              ? { ...employee, accessLink }
              : employee
          ),
        }))
        return accessLink
      },
      
      // Track methods
      setTracks: (tracks) => set({ tracks }),
      assignTrack: (employeeId, trackId, startDate) => {
        const track = get().tracks.find(t => t.id === trackId)
        const employee = get().employees.find(e => e.id === employeeId)
        
        set((state) => ({
          employees: state.employees.map((e) =>
            e.id === employeeId
              ? {
                  ...e,
                  adaptationStatus: 'in_progress',
                  assignedTrackId: trackId,
                  startDate,
                  stepProgress: {}
                }
              : e
          ),
        }))
        
        if (employee && track) {
          get().addNotification({
            type: 'track_assigned',
            title: 'Назначен трек адаптации',
            message: `Сотруднику ${employee.fullName} назначен трек адаптации "${track.title}"`,
            employeeId,
            data: { trackId, trackTitle: track.title }
          })
        }
      },
      removeTrack: (employeeId) =>
        set((state) => {
          const employee = state.employees.find((e) => e.id === employeeId)
          return {
            employees: state.employees.map((e) =>
              e.id === employeeId
                ? {
                    ...e,
                    adaptationStatus: 'not_started',
                    assignedTrackId: undefined,
                    startDate: undefined,
                    stepProgress: undefined
                  }
                : e
            ),
          }
        }),
      updateTrack: (employeeId, trackId, startDate) =>
        set((state) => ({
          employees: state.employees.map((e) =>
            e.id === employeeId
              ? {
                  ...e,
                  assignedTrackId: trackId,
                  startDate,
                  stepProgress: {}
                }
              : e
          ),
        })),
      updateTrackContent: (updatedTrack) =>
        set((state) => ({
          tracks: state.tracks.map((t) =>
            t.id === updatedTrack.id ? updatedTrack : t
          ),
        })),
        
      // Article methods  
      setArticles: (articles) => set({ articles }),
      createArticle: (article) =>
        set((state) => {
          const now = new Date().toISOString()
          const newArticle: Article = {
            ...article,
            id: String(Date.now()),
            createdAt: now,
            updatedAt: now,
          }
          return { articles: [...state.articles, newArticle] }
        }),
      updateArticle: (updatedArticle) =>
        set((state) => ({
          articles: state.articles.map((a) =>
            a.id === updatedArticle.id ? updatedArticle : a
          ),
        })),
      deleteArticle: (id) =>
        set((state) => ({
          articles: state.articles.filter((a) => a.id !== id),
        })),
        
      // User methods
      setUsers: (users) => set({ users }),
      addUser: (user) => set((state) => {
        const newUser: User = {
          ...user,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }
        return { users: [...state.users, newUser] }
      }),
      updateUser: (updatedUser) => set((state) => ({
        users: state.users.map((user) => 
          user.id === updatedUser.id ? updatedUser : user
        ),
      })),
      deleteUser: (id) => set((state) => ({
        users: state.users.filter((user) => user.id !== id),
      })),
      resetUserPassword: (id) => {
        console.log(`Пароль сброшен для пользователя с ID ${id}. В реальном приложении письмо было бы отправлено на почту.`)
      },
      changeUserRole: (id, role) => set((state) => ({
        users: state.users.map((user) =>
          user.id === id ? { ...user, role } : user
        ),
      })),
      
      // Dictionary methods
      setPositions: (positions) => set({ positions }),
      addPosition: (position) => {
        const newPosition = { ...position, id: crypto.randomUUID() }
        set((state) => ({
          positions: [...state.positions, newPosition],
        }))
        return newPosition
      },
      updatePosition: (updatedPosition) => set((state) => ({
        positions: state.positions.map((position) => 
          position.id === updatedPosition.id ? updatedPosition : position
        ),
      })),
      deletePosition: (id) => set((state) => ({
        positions: state.positions.filter((position) => position.id !== id),
      })),
      
      setDepartments: (departments) => set({ departments }),
      addDepartment: (department) => {
        const newDepartment = { ...department, id: crypto.randomUUID() }
        set((state) => ({
          departments: [...state.departments, newDepartment],
        }))
        return newDepartment
      },
      updateDepartment: (updatedDepartment) => set((state) => ({
        departments: state.departments.map((department) => 
          department.id === updatedDepartment.id ? updatedDepartment : department
        ),
      })),
      deleteDepartment: (id) => set((state) => ({
        departments: state.departments.filter((department) => department.id !== id),
      })),

      // Notification methods
      addNotification: (notification) => set((state) => {
        const newNotification = {
          ...notification,
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          isRead: false,
        }
        return { notifications: [...state.notifications, newNotification] }
      }),
      
      markNotificationAsRead: (id) => set((state) => ({
        notifications: state.notifications.map((notification) => 
          notification.id === id ? { ...notification, isRead: true } : notification
        ),
      })),
      
      markAllNotificationsAsRead: () => set((state) => ({
        notifications: state.notifications.map((notification) => 
          ({ ...notification, isRead: true })
        ),
      })),
      
      deleteNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((notification) => notification.id !== id),
      })),
      
      getUnreadNotificationsCount: () => {
        const { notifications } = get()
        return notifications.filter(notification => !notification.isRead).length
      },
    }),
    {
      name: 'adaptation-admin-storage',
    }
  )
) 