import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  Employee, 
  Track, 
  Article, 
  UserRole, 
  Position, 
  Department,
  AdaptationStatus,
  Notification,
  NotificationType,
  CompanyProfile,
  StageProgress
} from '@/types'
import apiClient from '@/lib/api'

interface AppState {
  employees: Employee[]
  tracks: Track[]
  articles: Article[]
  users: Employee[]
  positions: Position[]
  departments: Department[]
  notifications: Notification[]
  currentUser: Employee | null
  companyProfiles: CompanyProfile[]
  currentCompanyProfile: CompanyProfile | null
  
  // Employee methods
  setEmployees: (employees: Employee[]) => void
  fetchEmployees: () => Promise<void>
  addEmployee: (employee: Omit<Employee, 'id' | 'adaptationStatus' | 'accessLink'>) => Promise<void>
  updateEmployee: (employee: Employee) => Promise<void>
  deleteEmployee: (id: string) => Promise<void>
  generateAccessLink: (employeeId: string) => Promise<string>
  updateTrackProgress: (stageId: string, content: Partial<StageProgress>) => Promise<void>
  
  // Track methods
  setTracks: (tracks: Track[]) => void
  fetchTracks: () => Promise<void>
  createTrack: (track: Omit<Track, 'id'>) => Promise<void>
  assignTrack: (employeeId: string, trackId: string, startDate: string, mentorId?: string) => Promise<void>
  removeTrack: (employeeId: string, trackId: string) => Promise<void>
  updateTrack: (employeeId: string, trackId: string, startDate: string, mentorId?: string) => Promise<void>
  updateTrackContent: (track: Track) => Promise<void>

  // Articles methods  
  setArticles: (articles: Article[]) => void
  fetchArticles: () => Promise<void>
  createArticle: (article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateArticle: (article: Article) => Promise<void>
  deleteArticle: (id: string) => Promise<void>
  
  // User methods
  setUsers: (users: Employee[]) => void
  fetchUsers: () => Promise<void>
  addUser: (user: Omit<Employee, 'id' | 'createdAt'>) => Promise<void>
  updateUser: (user: Employee) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  resetUserPassword: (id: string) => Promise<void>
  changeUserRole: (id: string, role: UserRole) => Promise<void>
  setCurrentUser: (user: Employee | null) => void
  fetchCurrentUser: () => Promise<void>
  
  // Dictionary methods
  setPositions: (positions: Position[]) => void
  fetchPositions: () => Promise<void>
  addPosition: (position: Omit<Position, 'id'>) => Promise<Position>
  updatePosition: (position: Position) => Promise<void>
  deletePosition: (id: string) => Promise<void>
  
  setDepartments: (departments: Department[]) => void
  fetchDepartments: () => Promise<void>
  addDepartment: (department: Omit<Department, 'id'>) => Promise<Department>
  updateDepartment: (department: Department) => Promise<void>
  deleteDepartment: (id: string) => Promise<void>

  // Notification methods
  fetchNotifications: () => Promise<void>
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'isRead'>) => void
  markNotificationAsRead: (id: string) => Promise<void>
  markAllNotificationsAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  getUnreadNotificationsCount: () => number

  // Company Profile methods
  setCompanyProfiles: (profiles: CompanyProfile[]) => void
  fetchCompanyProfiles: () => Promise<void>
  addCompanyProfile: (profile: Omit<CompanyProfile, 'id'>) => Promise<void>
  updateCompanyProfile: (profile: CompanyProfile) => Promise<void>
  deleteCompanyProfile: (id: string) => Promise<void>
  setCurrentCompanyProfile: (profile: CompanyProfile | null) => void
  switchCompanyProfile: (id: string) => Promise<void>
  getCurrentCompanyProfile: () => Promise<void>
}

// Приведение типа для track.json

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      employees: [],
      tracks: [],
      articles: [],
      users: [],
      positions: [],
      departments: [],
      notifications: [],
      currentUser: null,
      companyProfiles: [],
      currentCompanyProfile: null,
      
      // Employee methods
      setEmployees: (employees) => set({ employees }),
      fetchEmployees: async () => {
        try {
          const employees = await apiClient.getEmployees();
          set({ employees });
        } catch (error) {
          console.error('Error fetching employees:', error);
          throw error;
        }
      },
      addEmployee: async (employee) => {
        try {
          await apiClient.createEmployee(employee);
          const employees = await apiClient.getEmployees();
          set({ employees });
        } catch (error) {
          console.error('Error adding employee:', error);
          throw error;
        }
      },
      updateEmployee: async (updatedEmployee) => {
        try {
          await apiClient.updateEmployee(updatedEmployee.id, updatedEmployee);
          const employees = await apiClient.getEmployees();
          set({ employees });
        } catch (error) {
          console.error('Error updating employee:', error);
          throw error;
        }
      },
      deleteEmployee: async (id) => {
        try {
          await apiClient.deleteEmployee(id);
          const employees = await apiClient.getEmployees();
          set({ employees });
        } catch (error) {
          console.error('Error deleting employee:', error);
          throw error;
        }
      },
      generateAccessLink: async (employeeId) => {
        try {
          const { accessLink } = await apiClient.generateEmployeeAccessLink(employeeId);
          const employees = await apiClient.getEmployees();
          set({ employees });
          return accessLink;
        } catch (error) {
          console.error('Error generating access link:', error);
          throw error;
        }
      },
      updateTrackProgress: async (stageId: string, content: Partial<StageProgress>) => {
        try {
          await apiClient.updateTrackProgress(stageId, content);
        } catch (error) {
          console.error('Error updating step progress:', error);
          throw error;
        }
      },
      
      // Track methods
      setTracks: (tracks) => set({ tracks }),
      fetchTracks: async () => {
        try {
          const tracks = await apiClient.getTracks();
          set({ tracks });
        } catch (error) {
          console.error('Error fetching tracks:', error);
          throw error;
        }
      },
      createTrack: async (track) => {
        try {
          await apiClient.createTrack(track);
          const tracks = await apiClient.getTracks();
          set({ tracks });
        } catch (error) {
          console.error('Error creating track:', error);
          throw error;
        }
      },
      assignTrack: async (employeeId, trackId, startDate, mentorId) => {
        try {
          await apiClient.assignTrack(employeeId, trackId, startDate, mentorId);
          const employees = await apiClient.getEmployees();
          set({ employees });
          
          // Local notification addition
          const track = get().tracks.find(t => t.id === trackId);
          const employee = get().employees.find(e => e.id === employeeId);
        
          if (employee && track) {
            get().addNotification({
              type: 'track_assigned',
              title: 'Назначен трек адаптации',
              message: `Сотруднику ${employee.fullName} назначен трек адаптации "${track.title}"`,
              employeeId,
              data: { trackId, trackTitle: track.title }
            });
          }
        } catch (error) {
          console.error('Error assigning track:', error);
          throw error;
        }
      },
      removeTrack: async (employeeId, trackId) => {
        try {
          await apiClient.removeEmployeeTrack(employeeId, trackId);
          const employees = await apiClient.getEmployees();
          set({ employees });
        } catch (error) {
          console.error('Error removing track:', error);
          throw error;
        }
      },
      updateTrack: async (employeeId, trackId, startDate, mentorId) => {
        try {
          await apiClient.assignTrack(employeeId, trackId, startDate, mentorId);
          const employees = await apiClient.getEmployees();
          set({ employees });
        } catch (error) {
          console.error('Error updating track:', error);
          throw error;
        }
      },
      updateTrackContent: async (updatedTrack) => {
        try {
          await apiClient.updateTrack(updatedTrack.id, updatedTrack);
          const tracks = await apiClient.getTracks();
          set({ tracks });
        } catch (error) {
          console.error('Error updating track content:', error);
          throw error;
        }
      },
        
      // Article methods  
      setArticles: (articles) => set({ articles }),
      fetchArticles: async () => {
        try {
          const articles = await apiClient.getArticles();
          set({ articles });
        } catch (error) {
          console.error('Error fetching articles:', error);
          throw error;
        }
      },
      createArticle: async (article) => {
        try {
          await apiClient.createArticle(article);
          const articles = await apiClient.getArticles();
          set({ articles });
        } catch (error) {
          console.error('Error creating article:', error);
          throw error;
        }
      },
      updateArticle: async (updatedArticle) => {
        try {
          await apiClient.updateArticle(updatedArticle.id, updatedArticle);
          const articles = await apiClient.getArticles();
          set({ articles });
        } catch (error) {
          console.error('Error updating article:', error);
          throw error;
        }
      },
      deleteArticle: async (id) => {
        try {
          await apiClient.deleteArticle(id);
          const articles = await apiClient.getArticles();
          set({ articles });
        } catch (error) {
          console.error('Error deleting article:', error);
          throw error;
        }
      },
        
      // User methods
      setUsers: (users) => set({ users }),
      fetchUsers: async () => {
        try {
          const users = await apiClient.getEmployees();
          set({ users });
        } catch (error) {
          console.error('Error fetching users:', error);
          throw error;
        }
      },
      addUser: async (user) => {
        try {
          await apiClient.createEmployee(user);
          const users = await apiClient.getEmployees();
          set({ users });
        } catch (error) {
          console.error('Error adding user:', error);
          throw error;
        }
      },
      updateUser: async (updatedUser) => {
        try {
          await apiClient.updateEmployee(updatedUser.id, updatedUser);
          const users = await apiClient.getEmployees();
          set({ users });
        } catch (error) {
          console.error('Error updating user:', error);
          throw error;
        }
      },
      deleteUser: async (id) => {
        try {
          await apiClient.deleteEmployee(id);
          const users = await apiClient.getEmployees();
          set({ users });
        } catch (error) {
          console.error('Error deleting user:', error);
          throw error;
        }
      },
      resetUserPassword: async (id) => {
        try {
          await apiClient.resetEmployeePassword(id);
          console.log(`Сброшен пароль для пользователя с ID ${id}`);
        } catch (error) {
          console.error('Error resetting password:', error);
          throw error;
        }
      },
      changeUserRole: async (id, role) => {
        try {
          await apiClient.changeEmployeeRole(id, role);
          const users = await apiClient.getEmployees();
          set({ users });
        } catch (error) {
          console.error('Error changing user role:', error);
          throw error;
        }
      },
      setCurrentUser: (user) => set({ currentUser: user }),
      fetchCurrentUser: async () => {
        try {
          const user = await apiClient.getCurrentEmployee();
          set({ currentUser: user });
        } catch (error) {
          console.error('Error fetching current user:', error);
          throw error;
        }
      },
      
      // Dictionary methods
      setPositions: (positions) => set({ positions }),
      fetchPositions: async () => {
        try {
          const positions = await apiClient.getPositions();
          set({ positions });
        } catch (error) {
          console.error('Error fetching positions:', error);
          throw error;
        }
      },
      addPosition: async (position) => {
        try {
          const newPosition = await apiClient.createPosition(position);
          const positions = await apiClient.getPositions();
          set({ positions });
          return newPosition;
        } catch (error) {
          console.error('Error adding position:', error);
          throw error;
        }
      },
      updatePosition: async (updatedPosition) => {
        try {
          await apiClient.updatePosition(updatedPosition.id, updatedPosition);
          const positions = await apiClient.getPositions();
          set({ positions });
        } catch (error) {
          console.error('Error updating position:', error);
          throw error;
        }
      },
      deletePosition: async (id) => {
        try {
          await apiClient.deletePosition(id);
          const positions = await apiClient.getPositions();
          set({ positions });
        } catch (error) {
          console.error('Error deleting position:', error);
          throw error;
        }
      },
      
      setDepartments: (departments) => set({ departments }),
      fetchDepartments: async () => {
        try {
          const departments = await apiClient.getDepartments();
          set({ departments });
        } catch (error) {
          console.error('Error fetching departments:', error);
          throw error;
        }
      },
      addDepartment: async (department) => {
        try {
          const newDepartment = await apiClient.createDepartment(department);
          set((state) => ({
            departments: [...state.departments, newDepartment]
          }));
          return newDepartment;
        } catch (error) {
          console.error('Error adding department:', error);
          throw error;
        }
      },
      updateDepartment: async (updatedDepartment) => {
        try {
          await apiClient.updateDepartment(updatedDepartment.id, updatedDepartment);
          set((state) => ({
            departments: state.departments.map(d => 
              d.id === updatedDepartment.id ? updatedDepartment : d
            )
          }));
        } catch (error) {
          console.error('Error updating department:', error);
          throw error;
        }
      },
      deleteDepartment: async (id) => {
        try {
          await apiClient.deleteDepartment(id);
          set((state) => ({
            departments: state.departments.filter(d => d.id !== id)
          }));
        } catch (error) {
          console.error('Error deleting department:', error);
          throw error;
        }
      },

      // Notification methods
      fetchNotifications: async () => {
        try {
          const notifications = await apiClient.getNotifications();
          set({ notifications });
        } catch (error) {
          console.error('Error fetching notifications:', error);
          throw error;
        }
      },
      addNotification: (notification) => set((state) => {
        const newNotification = {
          ...notification,
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          isRead: false,
        }
        return { notifications: [...state.notifications, newNotification] }
      }),
      
      markNotificationAsRead: async (id) => {
        try {
          await apiClient.markNotificationAsRead(id);
          const notifications = await apiClient.getNotifications();
          set({ notifications });
        } catch (error) {
          console.error('Error marking notification as read:', error);
          throw error;
        }
      },
      
      markAllNotificationsAsRead: async () => {
        try {
          await apiClient.markAllNotificationsAsRead();
          const notifications = await apiClient.getNotifications();
          set({ notifications });
        } catch (error) {
          console.error('Error marking all notifications as read:', error);
          throw error;
        }
      },
      
      deleteNotification: async (id) => {
        try {
          await apiClient.deleteNotification(id);
          const notifications = await apiClient.getNotifications();
          set({ notifications });
        } catch (error) {
          console.error('Error deleting notification:', error);
          throw error;
        }
      },
      
      getUnreadNotificationsCount: () => {
        const { notifications } = get();
        return notifications.filter(notification => !notification.isRead).length;
      },

      // Company Profile methods
      setCompanyProfiles: (profiles) => set({ companyProfiles: profiles }),
      fetchCompanyProfiles: async () => {
        try {
          const profiles = await apiClient.getCompanyProfiles();
          set({ companyProfiles: profiles });
        } catch (error) {
          console.error('Error fetching company profiles:', error);
          throw error;
        }
      },
      addCompanyProfile: async (profile) => {
        try {
          await apiClient.createCompanyProfile(profile);
          const profiles = await apiClient.getCompanyProfiles();
          set({ companyProfiles: profiles });
        } catch (error) {
          console.error('Error adding company profile:', error);
          throw error;
        }
      },
      updateCompanyProfile: async (updatedProfile) => {
        try {
          await apiClient.updateCompanyProfile(updatedProfile.id, updatedProfile);
          const profiles = await apiClient.getCompanyProfiles();
          set({ companyProfiles: profiles });
        } catch (error) {
          console.error('Error updating company profile:', error);
          throw error;
        }
      },
      deleteCompanyProfile: async (id) => {
        try {
          await apiClient.deleteCompanyProfile(id);
          const profiles = await apiClient.getCompanyProfiles();
          set({ companyProfiles: profiles.filter(p => p.id !== id) });
        } catch (error) {
          console.error('Error deleting company profile:', error);
          throw error;
        }
      },
      setCurrentCompanyProfile: (profile) => set({ currentCompanyProfile: profile }),
      switchCompanyProfile: async (id) => {
        try {
          await apiClient.switchCompanyProfile(id);
          const profile = await apiClient.getCurrentCompanyProfile();
          set({ currentCompanyProfile: profile });
        } catch (error) {
          console.error('Error switching company profile:', error);
          throw error;
        }
      },
      getCurrentCompanyProfile: async () => {
        try {
          const profile = await apiClient.getCurrentCompanyProfile();
          set({ currentCompanyProfile: profile });
        } catch (error) {
          console.error('Error fetching current company profile:', error);
          throw error;
        }
      },
    }),
    {
      name: 'adaptation-admin-storage',
    }
  )
) 