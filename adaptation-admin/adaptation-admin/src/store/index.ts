import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Employee, Track, StepProgress, Article } from '@/types'
import track from './track.json'

interface AppState {
  employees: Employee[]
  tracks: Track[]
  articles: Article[]
  setEmployees: (employees: Employee[]) => void
  setTracks: (tracks: Track[]) => void
  setArticles: (articles: Article[]) => void
  assignTrack: (employeeId: string, trackId: string, startDate: string) => void
  removeTrack: (employeeId: string) => void
  updateTrack: (employeeId: string, trackId: string, startDate: string) => void
  updateTrackContent: (track: Track) => void
  createArticle: (article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateArticle: (article: Article) => void
  deleteArticle: (id: string) => void
}

// Mock data
const mockEmployees: Employee[] = [
  {
    id: '1',
    fullName: 'John Doe',
    position: 'Software Engineer',
    department: 'Engineering',
    adaptationStatus: 'not_started',
  },
  {
    id: '2',
    fullName: 'Jane Smith',
    position: 'Product Manager',
    department: 'Product',
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

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      employees: mockEmployees,
      tracks: mockTracks,
      articles: mockArticles,
      setEmployees: (employees) => set({ employees }),
      setTracks: (tracks) => set({ tracks }),
      setArticles: (articles) => set({ articles }),
      assignTrack: (employeeId, trackId, startDate) =>
        set((state) => ({
          employees: state.employees.map((employee) =>
            employee.id === employeeId
              ? {
                  ...employee,
                  adaptationStatus: 'in_progress',
                  assignedTrackId: trackId,
                  startDate,
                  stepProgress: {}
                }
              : employee
          ),
        })),
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
    }),
    {
      name: 'app-storage',
    }
  )
) 