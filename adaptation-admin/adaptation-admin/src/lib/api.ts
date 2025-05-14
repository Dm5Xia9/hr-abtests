import {
  Employee,
  Track,
  Article,
  User,
  Position,
  Department,
  Notification,
  CompanyProfile
} from '@/types';

/**
 * API client for the adaptation admin system
 */
class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = 'https://localhost:7272/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Sets the authentication token for API requests
   */
  setToken(token: string) {
    this.token = token;
  }

  /**
   * Clears the authentication token
   */
  clearToken() {
    this.token = null;
  }

  /**
   * Create headers for fetch requests
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Generic request method
   */
  private async request<T>(
    endpoint: string,
    method: string = 'GET',
    data?: any
  ): Promise<T> {
    console.log(`API Request: ${method} ${endpoint}`, data ? { data } : '')
    
    const options: RequestInit = {
      method,
      headers: this.getHeaders(),
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      console.log(`API Response status: ${response.status}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(
          errorData.message || `Request failed with status ${response.status}`
        );
      }

      // For DELETE requests that return 204 No Content, return void
      if (method === 'DELETE' && response.status === 204) {
        console.log('DELETE request successful (204 No Content)')
        return undefined as T;
      }

      // For empty responses, return void
      const text = await response.text();
      console.log('Response text:', text)
      
      if (!text) {
        console.log('Empty response received')
        return undefined as T;
      }

      try {
        const parsed = JSON.parse(text) as T;
        console.log('Parsed response:', parsed)
        return parsed;
      } catch (error) {
        console.error('JSON parse error:', error)
        throw new Error('Invalid JSON response from server');
      }
    } catch (error) {
      console.error('Request failed:', error)
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    return this.request<{ token: string; user: User }>('/auth/login', 'POST', { email, password });
  }

  async register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    return this.request<{ token: string; user: User }>('/auth/register', 'POST', { name, email, password });
  }

  async loginWithGoogle(token: string): Promise<{ token: string; user: User }> {
    return this.request<{ token: string; user: User }>('/auth/google', 'POST', { token });
  }

  // Company Profiles
  async getUserCompanyProfiles(): Promise<CompanyProfile[]> {
    return this.request<CompanyProfile[]>('/company-profiles');
  }

  async getCompanyProfiles(): Promise<CompanyProfile[]> {
    return this.request<CompanyProfile[]>('/company-profiles');
  }

  async getCompanyProfile(id: string): Promise<CompanyProfile> {
    return this.request<CompanyProfile>(`/company-profiles/${id}`);
  }

  async createCompanyProfile(company: Omit<CompanyProfile, 'id'>): Promise<CompanyProfile> {
    return this.request<CompanyProfile>('/company-profiles', 'POST', company);
  }

  async updateCompanyProfile(id: string, company: Partial<CompanyProfile>): Promise<CompanyProfile> {
    return this.request<CompanyProfile>(`/company-profiles/${id}`, 'PUT', company);
  }

  async deleteCompanyProfile(id: string): Promise<void> {
    return this.request<void>(`/company-profiles/${id}`, 'DELETE');
  }

  async switchCompanyProfile(id: string): Promise<{ companyProfile: CompanyProfile }> {
    return this.request<{ companyProfile: CompanyProfile }>('/company-profiles/switch', 'POST', { companyProfileId: id });
  }

  async getCurrentCompanyProfile(): Promise<CompanyProfile | null> {
    return this.request<CompanyProfile | null>('/company-profiles/current');
  }

  // Employee endpoints
  async getEmployees(): Promise<Employee[]> {
    return this.request<Employee[]>('/employees');
  }

  async getEmployee(id: string): Promise<Employee> {
    return this.request<Employee>(`/employees/${id}`);
  }

  async createEmployee(employee: Omit<Employee, 'id' | 'adaptationStatus' | 'accessLink'>): Promise<Employee> {
    return this.request<Employee>('/employees', 'POST', employee);
  }

  async updateEmployee(id: string, employee: Partial<Employee>): Promise<Employee> {
    return this.request<Employee>(`/employees/${id}`, 'PUT', employee);
  }

  async updateStepProgress(employeeId: string, stepId: string, completed: boolean): Promise<Employee> {
    return this.request<Employee>(`/employees/${employeeId}/steps/${stepId}/progress`, 'PUT', { completed });
  }

  async deleteEmployee(id: string): Promise<void> {
    return this.request<void>(`/employees/${id}`, 'DELETE');
  }

  async assignMentor(employeeId: string, mentorId: string): Promise<Employee> {
    return this.request<Employee>(`/employees/${employeeId}/mentor`, 'POST', { mentorId });
  }

  async removeMentor(employeeId: string): Promise<Employee> {
    return this.request<Employee>(`/employees/${employeeId}/mentor`, 'DELETE');
  }

  async generateEmployeeAccessLink(employeeId: string): Promise<{ accessLink: string }> {
    return this.request<{ accessLink: string }>(`/employees/${employeeId}/access-link`, 'POST');
  }

  // Track endpoints
  async getTracks(): Promise<Track[]> {
    return this.request<Track[]>('/tracks');
  }

  async getTrack(id: string): Promise<Track> {
    return this.request<Track>(`/tracks/${id}`);
  }

  async createTrack(track: Omit<Track, 'id'>): Promise<Track> {
    return this.request<Track>('/tracks', 'POST', track);
  }

  async updateTrack(id: string, track: Partial<Track>): Promise<Track> {
    return this.request<Track>(`/tracks/${id}`, 'PUT', track);
  }

  async deleteTrack(id: string): Promise<void> {
    return this.request<void>(`/tracks/${id}`, 'DELETE');
  }

  async assignTrack(employeeId: string, trackId: string, startDate: string): Promise<Employee> {
    return this.request<Employee>(`/employees/${employeeId}/track`, 'POST', { 
      trackId,
      startDate
    });
  }

  async removeEmployeeTrack(employeeId: string): Promise<Employee> {
    return this.request<Employee>(`/employees/${employeeId}/track`, 'DELETE');
  }

  // Article endpoints
  async getArticles(): Promise<Article[]> {
    return this.request<Article[]>('/articles');
  }

  async getArticle(id: string): Promise<Article> {
    return this.request<Article>(`/articles/${id}`);
  }

  async createArticle(article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<Article> {
    return this.request<Article>('/articles', 'POST', article);
  }

  async updateArticle(id: string, article: Partial<Article>): Promise<Article> {
    return this.request<Article>(`/articles/${id}`, 'PUT', article);
  }

  async deleteArticle(id: string): Promise<void> {
    return this.request<void>(`/articles/${id}`, 'DELETE');
  }

  // User endpoints
  async getCurrentUser(): Promise<User> {
    return this.request<User>('/users/current');
  }

  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  async getUser(id: string): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    return this.request<User>('/users', 'POST', user);
  }

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    return this.request<User>(`/users/${id}`, 'PUT', user);
  }

  async deleteUser(id: string): Promise<void> {
    return this.request<void>(`/users/${id}`, 'DELETE');
  }

  async resetUserPassword(id: string): Promise<void> {
    return this.request<void>(`/users/${id}/reset-password`, 'POST');
  }

  async changeUserRole(id: string, role: User['role']): Promise<User> {
    return this.request<User>(`/users/${id}/role`, 'PUT', { role });
  }

  // Dictionary endpoints
  async getPositions(): Promise<Position[]> {
    return this.request<Position[]>('/positions');
  }

  async createPosition(position: Omit<Position, 'id'>): Promise<Position> {
    return this.request<Position>('/positions', 'POST', position);
  }

  async updatePosition(id: string, position: Partial<Position>): Promise<Position> {
    return this.request<Position>(`/positions/${id}`, 'PUT', position);
  }

  async deletePosition(id: string): Promise<void> {
    return this.request<void>(`/positions/${id}`, 'DELETE');
  }

  async getDepartments(): Promise<Department[]> {
    return this.request<Department[]>('/departments');
  }

  async createDepartment(department: Omit<Department, 'id'>): Promise<Department> {
    return this.request<Department>('/departments', 'POST', department);
  }

  async updateDepartment(id: string, department: Partial<Department>): Promise<Department> {
    return this.request<Department>(`/departments/${id}`, 'PUT', department);
  }

  async deleteDepartment(id: string): Promise<void> {
    return this.request<void>(`/departments/${id}`, 'DELETE');
  }

  // Notification endpoints
  async getNotifications(): Promise<Notification[]> {
    return this.request<Notification[]>('/notifications');
  }

  async markNotificationAsRead(id: string): Promise<Notification> {
    return this.request<Notification>(`/notifications/${id}/read`, 'PUT');
  }

  async markAllNotificationsAsRead(): Promise<void> {
    return this.request<void>('/notifications/read-all', 'PUT');
  }

  async deleteNotification(id: string): Promise<void> {
    return this.request<void>(`/notifications/${id}`, 'DELETE');
  }
}

// Create a singleton instance
const apiClient = new ApiClient();

export default apiClient; 