import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/store/index';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  X, 
  Plus, 
  User, 
  Calendar, 
  FileText, 
  Trash, 
  Building, 
  Briefcase,
  UserPlus,
  Users,
  Check,
  Mail,
  Phone,
  Shield,
  Pencil,
  Key,
  Save,
  ChevronDown,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, Link } from 'react-router-dom';
import { Track, Employee, AdaptationStatus } from '@/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Combobox } from '@/components/ui/combobox';

// Extended Track interface with category field for internal component use
interface ExtendedTrack extends Track {
  category?: string; // Optional category field for grouping
}

// Возможные роли пользователя (должно соответствовать типам в backend)
type UserRole = 'employee' | 'manager' | 'admin';

export function EmployeesList() {
  const store = useStore();
  const { 
    employees, 
    tracks: originalTracks, 
    users, 
    positions, 
    departments, 
    generateAccessLink, 
    assignTrack, 
    updateTrack, 
    removeTrack, 
    fetchEmployees, 
    fetchTracks, 
    fetchUsers, 
    fetchPositions, 
    fetchDepartments,
    updateEmployee, 
    resetUserPassword
  } = store;
  
  // Получаем метод createEmployee из store, или определяем как заглушку
  const createEmployee = (store as any).createEmployee || (async () => {
    console.warn('createEmployee is not implemented in store');
    return null;
  });
  
  // Функции для создания новых должностей и подразделений
  const addPosition = (store as any).addPosition || (async (position: any) => {
    console.warn('addPosition is not implemented in store');
    return { id: `pos_${Date.now()}`, name: position.name };
  });
  
  const addDepartment = (store as any).addDepartment || (async (department: any) => {
    console.warn('addDepartment is not implemented in store');
    return { id: `dep_${Date.now()}`, name: department.name };
  });
  
  // Подготовка данных для Combobox
  const positionItems = positions.map(pos => ({
    value: pos.id,
    label: pos.name
  }));

  const departmentItems = departments.map(dep => ({
    value: dep.id,
    label: dep.name
  }));
  
  // Cast the tracks array to ExtendedTrack[] for internal use
  const tracks = originalTracks as ExtendedTrack[];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState(false);
  const [newTrackId, setNewTrackId] = useState('');
  const [newMentorId, setNewMentorId] = useState('none');
  const [isAssigningTrack, setIsAssigningTrack] = useState(false);
  const [isRemovingTrack, setIsRemovingTrack] = useState<Record<string, boolean>>({});
  const [isUpdatingMentor, setIsUpdatingMentor] = useState<Record<string, boolean>>({});
  const [isCopyingLink, setIsCopyingLink] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRole, setEditingRole] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  
  // Добавляем состояния для редактирования полей
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [isUpdatingField, setIsUpdatingField] = useState<Record<string, boolean>>({});
  const [confirmEmailChange, setConfirmEmailChange] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  
  // Добавляем состояния для расширенных фильтров
  const [showFilters, setShowFilters] = useState(false);
  const [positionFilter, setPositionFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [trackFilter, setTrackFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [hireDateStart, setHireDateStart] = useState<string>('');
  const [hireDateEnd, setHireDateEnd] = useState<string>('');
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  
  // New state variables for inline employee creation
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    fullName: '',
    email: '',
    phone: '',
    positionId: '',
    departmentId: '',
    role: 'employee' as UserRole,
    hireDate: new Date().toISOString().split('T')[0]
  });
  const [isCreatingEmployee, setIsCreatingEmployee] = useState(false);
  const [justCreatedEmployeeId, setJustCreatedEmployeeId] = useState<string | null>(null);
  
  // Reference to the add form
  const addFormRef = useRef<HTMLDivElement>(null);
  
  // Handle opening the add form
  const handleOpenAddForm = () => {
    // Only open if not already open
    if (!showAddForm) {
      setShowAddForm(true);
      
      // Wait for the form to be added to the DOM, then scroll to it
      setTimeout(() => {
        if (addFormRef.current) {
          addFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close form on Escape key
      if (e.key === 'Escape' && showAddForm) {
        setShowAddForm(false);
      }
      
      // Submit form on Ctrl+Enter or Cmd+Enter when form is open
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && showAddForm && !isCreatingEmployee) {
        if (newEmployee.fullName && newEmployee.email && newEmployee.positionId && newEmployee.departmentId) {
          handleCreateEmployee();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showAddForm, isCreatingEmployee, newEmployee]);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch all required data when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          fetchEmployees(),
          fetchTracks(),
          fetchUsers(),
          fetchPositions(),
          fetchDepartments()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Ошибка загрузки данных",
          description: "Не удалось загрузить все необходимые данные",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Handler for creating a new employee
  const handleCreateEmployee = async () => {
    // Basic validation
    if (!newEmployee.fullName || !newEmployee.email || !newEmployee.positionId || !newEmployee.departmentId) {
      toast({
        title: "Заполните обязательные поля",
        description: "ФИО, Email, Должность и Подразделение обязательны для заполнения",
        variant: "destructive"
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmployee.email)) {
      toast({
        title: "Некорректный формат email",
        description: "Пожалуйста, введите корректный адрес электронной почты",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsCreatingEmployee(true);
      
      // The store might not have createEmployee method yet, so we'll define a fallback
      if (typeof createEmployee !== 'function') {
        // Simulate API call for demo
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock implementation
        const newEmployeeWithId = {
          ...newEmployee,
          id: `emp_${Date.now()}`, // Generate a mock ID
          assignedTracks: []
        };
        
        // Add to local employees array
        await fetchEmployees();
        
        toast({
          title: "Функция создания недоступна",
          description: "Эта функция еще не реализована в API. Данные не были сохранены.",
          variant: "destructive"
        });
        setIsCreatingEmployee(false);
        return;
      }
      
      // Call the API to create a new employee
      const createdEmployee = await createEmployee(newEmployee);
      
      // Set the newly created employee ID to show notification
      if (createdEmployee && createdEmployee.id) {
        setJustCreatedEmployeeId(createdEmployee.id);
        
        // Select the newly created employee
        selectEmployee(createdEmployee.id);
        
        // Clear the ID after 10 seconds
        setTimeout(() => {
          setJustCreatedEmployeeId(null);
        }, 10000);
      }
      
      // Reset form and hide it
      setNewEmployee({
        fullName: '',
        email: '',
        phone: '',
        positionId: '',
        departmentId: '',
        role: 'employee',
        hireDate: new Date().toISOString().split('T')[0]
      });
      
      setShowAddForm(false);
      
      // Show success message
      toast({
        title: "Сотрудник создан",
        description: "Новый сотрудник успешно добавлен",
      });
    } catch (error) {
      console.error('Error creating employee:', error);
      toast({
        title: "Ошибка при создании сотрудника",
        description: typeof error === 'object' && error !== null && 'message' in error 
          ? String(error.message) 
          : "Не удалось добавить нового сотрудника. Пожалуйста, попробуйте еще раз.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingEmployee(false);
    }
  };

  // Select the first employee by default when the component mounts and data is loaded
  useEffect(() => {
    if (!isLoading && employees.length > 0 && !selectedEmployeeId) {
      selectEmployee(employees[0].id);
    }
  }, [employees, isLoading]);

  const selectEmployee = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setRightPanelOpen(true);
    setEditingTrack(false);
  };

  const closeRightPanel = () => {
    setRightPanelOpen(false);
  };

  const toggleAddTrack = () => {
    setEditingTrack(!editingTrack);
    setNewTrackId('');
    setNewMentorId('none');
  };

  const handleAddTrack = async () => {
    if (selectedEmployeeId && newTrackId) {
      try {
        setIsAssigningTrack(true);
        // Use current date as the start date
        const startDate = new Date().toISOString().split('T')[0];
        
        // Get mentor ID or undefined if "none" is selected
        const mentorId = newMentorId !== 'none' ? newMentorId : undefined;
        
        // Assign track and mentor in a single API call
        await assignTrack(selectedEmployeeId, newTrackId, startDate, mentorId);
        
        setEditingTrack(false);
        
        // Show success toast
        const track = tracks.find(t => t.id === newTrackId);
        const employee = employees.find(e => e.id === selectedEmployeeId);
        
        toast({
          title: "Трек успешно назначен",
          description: `${track?.title} назначен для ${employee?.fullName}`,
        });
      } catch (error) {
        console.error('Error assigning track:', error);
        toast({
          title: "Ошибка при назначении трека",
          description: "Не удалось назначить трек. Пожалуйста, попробуйте снова.",
          variant: "destructive"
        });
      } finally {
        setIsAssigningTrack(false);
      }
    }
  };

  const handleUpdateTrack = async (trackId: string, mentorId?: string) => {
    if (selectedEmployeeId) {
      try {
        setIsUpdatingMentor(prev => ({ ...prev, [trackId]: true }));
        // Use current date as the start date if updating
        const startDate = new Date().toISOString().split('T')[0];
        
        // If mentor ID is 'none', pass undefined to the API
        const mentorIdToPass = mentorId === 'none' ? undefined : mentorId;
        
        // Update track and mentor in a single API call
        await updateTrack(selectedEmployeeId, trackId, startDate, mentorIdToPass);
        
        const mentorName = mentorIdToPass 
          ? users.find(u => u.id === mentorIdToPass)?.fullName 
          : undefined;
        
        if (mentorIdToPass) {
          toast({
            title: "Трек и руководитель обновлены",
            description: `${mentorName ? `${mentorName} назначен руководителем` : 'Руководитель назначен'}`,
          });
        } else {
          toast({
            title: "Трек обновлен",
            description: "Руководитель не назначен",
          });
        }
      } catch (error) {
        console.error('Error updating track assignment:', error);
        toast({
          title: "Ошибка при обновлении",
          description: "Не удалось обновить информацию. Пожалуйста, попробуйте снова.",
          variant: "destructive"
        });
      } finally {
        setIsUpdatingMentor(prev => ({ ...prev, [trackId]: false }));
      }
    }
  };

  const handleRemoveTrack = async (trackId: string) => {
    if (selectedEmployeeId) {
      try {
        setIsRemovingTrack(prev => ({ ...prev, [trackId]: true }));
        
        // Удаляем конкретный трек по ID
        await removeTrack(selectedEmployeeId, trackId);
        
        // Show success toast
        toast({
          title: "Трек удален",
          description: "Трек адаптации был успешно удален",
        });
      } catch (error) {
        console.error('Error removing track:', error);
        toast({
          title: "Ошибка при удалении трека",
          description: "Не удалось удалить трек. Пожалуйста, попробуйте снова.",
          variant: "destructive"
        });
      } finally {
        setIsRemovingTrack(prev => ({ ...prev, [trackId]: false }));
      }
    }
  };

  const handleGetAccessLink = async (employeeId: string) => {
    const fullAccessUrl = `${window.location.origin}/passage`;
    await navigator.clipboard.writeText(fullAccessUrl);
    
    toast({
      title: "Ссылка скопирована",
      description: "Ссылка доступа скопирована в буфер обмена",
    });
  };

  const navigateToTrackProgress = (employeeId: string) => {
    // navigate(`/track-progress/${employeeId}`);
  };

  // Helper function to get position name by ID
  const getPositionName = (positionId?: string | null) => {
    const position = positions.find(p => p.id === positionId);
    return position?.name || 'Unknown';
  };

  // Helper function to get department name by ID
  const getDepartmentName = (departmentId?: string | null) => {
    const department = departments.find(d => d.id === departmentId);
    return department?.name || 'Unknown';
  };

  // Helper function to get employee adaptation status
  const getEmployeeStatus = (employee: Employee): AdaptationStatus => {
    if (!employee.assignedTracks || employee.assignedTracks.length === 0) {
      return 'not_started';
    }
    
    // Check if any track is in progress
    const hasInProgress = employee.assignedTracks.some(track => track.status === 'in_progress');
    if (hasInProgress) {
      return 'in_progress';
    }
    
    // If all tracks have completed status
    const allCompleted = employee.assignedTracks.every(track => track.status === 'completed');
    if (allCompleted && employee.assignedTracks.length > 0) {
      return 'completed';
    }
    
    return 'not_started';
  };

  // Filter employees based on search query and filters
  const filteredEmployees = employees.filter((employee) => {
    // Filter by search query (name, email, phone)
    const matchesSearch = employee.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (employee.email && employee.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (employee.phone && employee.phone.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by department
    const matchesDepartment = departmentFilter === 'all' || employee.departmentId === departmentFilter;
    
    // Filter by status
    const status = getEmployeeStatus(employee);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    
    // Filter by position
    const matchesPosition = positionFilter === 'all' || employee.positionId === positionFilter;
    
    // Filter by role
    const matchesRole = roleFilter === 'all' || employee.role === roleFilter;
    
    // Filter by track
    let matchesTrack = true;
    if (trackFilter !== 'all') {
      if (trackFilter === 'none') {
        // Check if employee has no tracks
        matchesTrack = !employee.assignedTracks || employee.assignedTracks.length === 0;
      } else {
        // Check if employee has the specific track
        matchesTrack = employee.assignedTracks?.some(t => t.trackId === trackFilter) || false;
      }
    }
    
    // Filter by hire date range
    let matchesHireDate = true;
    if (hireDateStart || hireDateEnd) {
      if (employee.hireDate) {
        const hireDate = new Date(employee.hireDate);
        if (hireDateStart) {
          const startDate = new Date(hireDateStart);
          if (hireDate < startDate) {
            matchesHireDate = false;
          }
        }
        if (hireDateEnd) {
          const endDate = new Date(hireDateEnd);
          // Set end date to end of day
          endDate.setHours(23, 59, 59, 999);
          if (hireDate > endDate) {
            matchesHireDate = false;
          }
        }
      } else {
        // If hire date is required but employee doesn't have one
        matchesHireDate = false;
      }
    }
    
    return matchesSearch && matchesDepartment && matchesStatus && 
           matchesPosition && matchesRole && matchesTrack && matchesHireDate;
  });

  // Sort filtered employees
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.fullName.localeCompare(b.fullName);
        break;
      case 'position':
        comparison = getPositionName(a.positionId).localeCompare(getPositionName(b.positionId));
        break;
      case 'department':
        comparison = getDepartmentName(a.departmentId).localeCompare(getDepartmentName(b.departmentId));
        break;
      case 'hireDate':
        // Sort by hire date, employees without hire date at the end
        if (!a.hireDate && !b.hireDate) {
          comparison = 0;
        } else if (!a.hireDate) {
          comparison = 1;
        } else if (!b.hireDate) {
          comparison = -1;
        } else {
          comparison = new Date(a.hireDate).getTime() - new Date(b.hireDate).getTime();
        }
        break;
      case 'status':
        // Sort by adaptation status
        const statusOrder = {
          'in_progress': 0,
          'completed': 1,
          'not_started': 2
        };
        comparison = statusOrder[getEmployeeStatus(a) as keyof typeof statusOrder] - 
                     statusOrder[getEmployeeStatus(b) as keyof typeof statusOrder];
        break;
      default:
        comparison = a.fullName.localeCompare(b.fullName);
    }
    
    // Reverse order if descending
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Get the selected employee's details
  const selectedEmployee = selectedEmployeeId 
    ? employees.find(e => e.id === selectedEmployeeId) 
    : null;

  // Count assigned tracks for an employee
  const countAssignedTracks = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.assignedTracks?.length || 0;
  };

  // Get primary track for employee (for backward compatibility)
  const getPrimaryTrack = (employee: Employee) => {
    if (!employee.assignedTracks || employee.assignedTracks.length === 0) {
      return null;
    }
    
    // Try to find an in-progress track first
    const inProgressTrack = employee.assignedTracks.find(track => track.status === 'in_progress');
    if (inProgressTrack) {
      return inProgressTrack;
    }
    
    // Otherwise return the first one
    return employee.assignedTracks[0];
  };

  // Get track details from ID
  const getTrackById = (trackId: string) => {
    return tracks.find(t => t.id === trackId);
  };

  // Get mentor details
  const getMentorById = (mentorId?: string) => {
    if (!mentorId) return null;
    return users.find(u => u.id === mentorId);
  };

  // Get mentor for the employee or from a specific track
  const getMentorForEmployee = (employee: Employee, trackId?: string) => {
    if (!employee) return null;
    
    // If trackId is provided, find mentor from that specific track
    if (trackId && employee.assignedTracks) {
      const track = employee.assignedTracks.find(t => t.trackId === trackId);
      if (track && track.mentorId) {
        return getMentorById(track.mentorId);
      }
    }
    
    // Otherwise check all tracks and return the first mentor found
    if (employee.assignedTracks) {
      for (const track of employee.assignedTracks) {
        if (track.mentorId) {
          return getMentorById(track.mentorId);
        }
      }
    }
    
    return null;
  };

  // Function to calculate progress
  const calculateTrackProgress = (employeeId: string, trackId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return 0;
    
    // Get assigned track status
    const assignedTrack = employee.assignedTracks?.find(t => t.trackId === trackId);
    if (!assignedTrack) return 0;
    
    // If track is completed, return 100%
    if (assignedTrack.status === 'completed') {
      return 100;
    }
    
    // If track is in progress, return 50% (for demo purposes)
    if (assignedTrack.status === 'in_progress') {
      return 50;
    }
    
    // Otherwise, return 0%
    return 0;
  };

  // Group tracks by tags for better display
  const trackGroups = tracks.reduce((groups: Record<string, typeof tracks>, track) => {
    // Use the first tag as a category, or put in "Другое" if no tags
    const category = track.tags && track.tags.length > 0 ? track.tags[0] : 'Другое';
    // Set the category field for use in component
    track.category = category;
    
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(track);
    return groups;
  }, {});

  // Функция для обновления роли пользователя
  const handleRoleUpdate = async (employeeId: string, role: UserRole) => {
    if (!employeeId) return;
    
    try {
      setIsUpdatingRole(true);
      
      // Создаем обновленный объект сотрудника
      const employeeToUpdate = employees.find(e => e.id === employeeId);
      if (!employeeToUpdate) {
        throw new Error('Сотрудник не найден');
      }
      
      // Создаем обновленный объект с новой ролью
      const updatedEmployee = {
        ...employeeToUpdate,
        role
      };
      
      // Вызываем API для обновления сотрудника
      await updateEmployee(updatedEmployee);
      
      // Показать уведомление об успехе
      toast({
        title: "Роль обновлена",
        description: `Роль пользователя успешно изменена на ${role}`,
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Ошибка при обновлении роли",
        description: "Не удалось обновить роль пользователя. Пожалуйста, попробуйте снова.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingRole(false);
    }
  };
  
  // Функция для редактирования полей сотрудника
  const handleEditField = (field: string) => {
    if (selectedEmployeeId) {
      const employee = employees.find(e => e.id === selectedEmployeeId);
      if (employee) {
        setEditingField(field);
        setEditedValues(prev => ({
          ...prev,
          [field]: employee[field as keyof Employee] as string || ''
        }));
      }
    }
  };
  
  // Функция для сохранения отредактированного поля
  const handleSaveField = async (field: string) => {
    if (!selectedEmployeeId || !editedValues[field]) return;
    
    // Для email показываем диалог подтверждения
    if (field === 'email' && !confirmEmailChange) {
      setConfirmEmailChange(true);
      return;
    }
    
    try {
      setIsUpdatingField(prev => ({ ...prev, [field]: true }));
      
      const employeeToUpdate = employees.find(e => e.id === selectedEmployeeId);
      if (!employeeToUpdate) {
        throw new Error('Сотрудник не найден');
      }
      
      // Создаем обновленный объект с новым значением поля
      const updatedEmployee = {
        ...employeeToUpdate,
        [field]: editedValues[field]
      };
      
      // Вызываем API для обновления сотрудника
      await updateEmployee(updatedEmployee);
      
      // Закрываем режим редактирования
      setEditingField(null);
      
      // Сбрасываем флаг подтверждения email
      if (field === 'email') {
        setConfirmEmailChange(false);
      }
      
      // Показать уведомление об успехе
      toast({
        title: "Данные обновлены",
        description: `Поле ${field} успешно обновлено`,
      });
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      toast({
        title: "Ошибка при обновлении данных",
        description: `Не удалось обновить поле ${field}. Пожалуйста, попробуйте снова.`,
        variant: "destructive"
      });
    } finally {
      setIsUpdatingField(prev => ({ ...prev, [field]: false }));
    }
  };
  
  // Функция для сброса пароля
  const handleResetPassword = async (employeeId: string) => {
    if (!employeeId) return;
    
    try {
      setIsResettingPassword(true);
      
      // Вызываем API для сброса пароля
      await resetUserPassword(employeeId);
      
      // Показать уведомление об успехе
      toast({
        title: "Пароль сброшен",
        description: "Временный пароль был отправлен на email пользователя",
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: "Ошибка при сбросе пароля",
        description: "Не удалось сбросить пароль. Пожалуйста, попробуйте снова.",
        variant: "destructive"
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Обновление счетчика активных фильтров
  useEffect(() => {
    let count = 0;
    if (departmentFilter !== 'all') count++;
    if (statusFilter !== 'all') count++;
    if (positionFilter !== 'all') count++;
    if (roleFilter !== 'all') count++;
    if (trackFilter !== 'all') count++;
    if (hireDateStart || hireDateEnd) count++;
    setActiveFiltersCount(count);
  }, [
    departmentFilter, 
    statusFilter, 
    positionFilter, 
    roleFilter, 
    trackFilter, 
    hireDateStart, 
    hireDateEnd
  ]);

  // Функции для обработки создания новых элементов
  const handleCreatePosition = async (name: string) => {
    try {
      const newPosition = await addPosition({ name, description: '' });
      setNewEmployee(prev => ({ ...prev, positionId: newPosition.id }));
      await fetchPositions(); // Обновляем список должностей
    } catch (error) {
      console.error('Error creating position:', error);
    }
  };

  const handleCreateDepartment = async (name: string) => {
    try {
      const newDepartment = await addDepartment({ name, description: '' });
      setNewEmployee(prev => ({ ...prev, departmentId: newDepartment.id }));
      await fetchDepartments(); // Обновляем список подразделений
    } catch (error) {
      console.error('Error creating department:', error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] relative">
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
            <p className="text-muted-foreground">Загрузка данных...</p>
          </div>
        </div>
      )}
      
      {/* Left side - Employee list */}
      <div 
        className={`p-4 overflow-y-auto transition-all duration-300 ${
          rightPanelOpen ? 'w-full lg:w-3/5 xl:w-2/3' : 'w-full'
        }`}
      >
        <div className="space-y-4">
          {/* Created employee notification */}
          {justCreatedEmployeeId && (
            <div className="p-3 border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-900/30 rounded-md flex justify-between items-center animate-in fade-in-0 duration-300">
              <div className="flex items-center text-sm text-green-800 dark:text-green-300">
                <Check className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                Сотрудник успешно создан! Назначьте ему трек адаптации.
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-800"
                  onClick={() => {
                    if (justCreatedEmployeeId) {
                      selectEmployee(justCreatedEmployeeId);
                      setEditingTrack(true);
                    }
                  }}
                >
                  <FileText className="h-3.5 w-3.5 mr-1.5" />
                  Назначить трек
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 hover:bg-green-100 dark:hover:bg-green-800"
                  onClick={() => setJustCreatedEmployeeId(null)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Поиск сотрудников..."
                className="pl-9 focus:border-primary focus:ring-1 focus:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full sm:w-[180px] h-9">
                  <div className="flex items-center">
                    <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Подразделение" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все подразделения</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px] h-9">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Статус адаптации" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="not_started">Без трека адаптации</SelectItem>
                  <SelectItem value="in_progress">В процессе</SelectItem>
                  <SelectItem value="completed">Завершено</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                size="icon" 
                className="h-9 w-9 relative"
                onClick={() => setShowFilters(!showFilters)}
                title="Расширенные фильтры"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {activeFiltersCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-primary text-white text-[10px] h-4 min-w-4 rounded-full flex items-center justify-center px-1">
                    {activeFiltersCount}
                  </div>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-xs flex items-center gap-1.5"
                onClick={handleOpenAddForm}
                disabled={showAddForm}
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Добавить сотрудника</span>
              </Button>
            </div>
          </div>

          {/* Active filter tags */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {departmentFilter !== 'all' && (
                <Badge variant="outline" className="h-6 px-2 gap-1 text-xs">
                  <span className="mr-1">Подразделение:</span>
                  {getDepartmentName(departmentFilter)}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 ml-1"
                    onClick={() => setDepartmentFilter('all')}
                  >
                    <X className="h-2.5 w-2.5" />
                  </Button>
                </Badge>
              )}
              
              {statusFilter !== 'all' && (
                <Badge variant="outline" className="h-6 px-2 gap-1 text-xs">
                  <span className="mr-1">Статус:</span>
                  {statusFilter === 'not_started' ? 'Без трека' : 
                   statusFilter === 'in_progress' ? 'В процессе' : 
                   'Завершено'}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 ml-1"
                    onClick={() => setStatusFilter('all')}
                  >
                    <X className="h-2.5 w-2.5" />
                  </Button>
                </Badge>
              )}
              
              {positionFilter !== 'all' && (
                <Badge variant="outline" className="h-6 px-2 gap-1 text-xs">
                  <span className="mr-1">Должность:</span>
                  {getPositionName(positionFilter)}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 ml-1"
                    onClick={() => setPositionFilter('all')}
                  >
                    <X className="h-2.5 w-2.5" />
                  </Button>
                </Badge>
              )}
              
              {roleFilter !== 'all' && (
                <Badge variant="outline" className="h-6 px-2 gap-1 text-xs">
                  <span className="mr-1">Роль:</span>
                  {roleFilter === 'employee' ? 'Сотрудник' : 
                   roleFilter === 'manager' ? 'Руководитель' : 
                   'Администратор'}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 ml-1"
                    onClick={() => setRoleFilter('all')}
                  >
                    <X className="h-2.5 w-2.5" />
                  </Button>
                </Badge>
              )}
              
              {trackFilter !== 'all' && (
                <Badge variant="outline" className="h-6 px-2 gap-1 text-xs">
                  <span className="mr-1">Трек:</span>
                  {trackFilter === 'none' ? 'Без трека' : 
                   getTrackById(trackFilter)?.title || trackFilter}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 ml-1"
                    onClick={() => setTrackFilter('all')}
                  >
                    <X className="h-2.5 w-2.5" />
                  </Button>
                </Badge>
              )}
              
              {(hireDateStart || hireDateEnd) && (
                <Badge variant="outline" className="h-6 px-2 gap-1 text-xs">
                  <span className="mr-1">Дата начала:</span>
                  {hireDateStart && hireDateEnd ? 
                    `${hireDateStart} — ${hireDateEnd}` : 
                    hireDateStart ? `от ${hireDateStart}` : 
                    `до ${hireDateEnd}`}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 ml-1"
                    onClick={() => {
                      setHireDateStart('');
                      setHireDateEnd('');
                    }}
                  >
                    <X className="h-2.5 w-2.5" />
                  </Button>
                </Badge>
              )}
              
              {activeFiltersCount > 1 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-6 text-xs px-2 flex gap-1 items-center"
                  onClick={() => {
                    setPositionFilter('all');
                    setRoleFilter('all');
                    setTrackFilter('all');
                    setHireDateStart('');
                    setHireDateEnd('');
                    setDepartmentFilter('all');
                    setStatusFilter('all');
                  }}
                >
                  <X className="h-3 w-3" />
                  Сбросить все
                </Button>
              )}
            </div>
          )}

          {/* Расширенные фильтры */}
          {showFilters && (
            <div className="p-3 border rounded-md bg-muted/5 space-y-3 mt-3 animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center">
                  <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
                  Расширенные фильтры
                </h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Должность</label>
                  <Select value={positionFilter} onValueChange={setPositionFilter}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Все должности" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все должности</SelectItem>
                      {positions.map(pos => (
                        <SelectItem key={pos.id} value={pos.id}>{pos.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Роль</label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Все роли" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все роли</SelectItem>
                      <SelectItem value="employee">Сотрудник</SelectItem>
                      <SelectItem value="manager">Руководитель</SelectItem>
                      <SelectItem value="admin">Администратор</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Трек адаптации</label>
                  <Select value={trackFilter} onValueChange={setTrackFilter}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Все треки" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все треки</SelectItem>
                      <SelectItem value="none">Без трека</SelectItem>
                      {tracks.map(track => (
                        <SelectItem key={track.id} value={track.id}>{track.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Дата начала работы</label>
                  <div className="flex gap-2 items-center">
                    <div className="relative flex-1">
                      <Input
                        type="date"
                        className="h-8 text-xs w-full"
                        value={hireDateStart}
                        onChange={(e) => setHireDateStart(e.target.value)}
                        placeholder="От"
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">—</span>
                    <div className="relative flex-1">
                      <Input
                        type="date"
                        className="h-8 text-xs w-full"
                        value={hireDateEnd}
                        onChange={(e) => setHireDateEnd(e.target.value)}
                        placeholder="До"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Сортировка</label>
                  <div className="flex gap-2 items-start">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="h-8 text-xs flex-1">
                        <SelectValue placeholder="Сортировать по" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">По имени</SelectItem>
                        <SelectItem value="position">По должности</SelectItem>
                        <SelectItem value="department">По подразделению</SelectItem>
                        <SelectItem value="hireDate">По дате начала</SelectItem>
                        <SelectItem value="status">По статусу адаптации</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      <ChevronDown className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between pt-1">
                <Button 
                  variant="link" 
                  size="sm"
                  className="h-7 px-0 text-xs text-muted-foreground"
                  onClick={() => {
                    setPositionFilter('all');
                    setRoleFilter('all');
                    setTrackFilter('all');
                    setHireDateStart('');
                    setHireDateEnd('');
                    setSortBy('name');
                    setSortOrder('asc');
                  }}
                >
                  Сбросить фильтры
                </Button>
              </div>
            </div>
          )}

          <div className="grid gap-2">
            {/* Inline Add Employee Form */}
            {showAddForm && (
              <Card className="border-primary/30 bg-primary/5 animate-in fade-in-50 slide-in-from-top-5 duration-300" ref={addFormRef}>
                <CardContent className="p-3">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-medium flex items-center">
                      <UserPlus className="h-4 w-4 mr-1.5 text-primary" />
                      Добавить нового сотрудника
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 hover:bg-primary/10"
                      onClick={() => setShowAddForm(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">ФИО *</label>
                      <div className="relative">
                        <User className="h-4 w-4 absolute left-2.5 top-2 text-muted-foreground" />
                        <Input
                          value={newEmployee.fullName}
                          onChange={(e) => setNewEmployee(prev => ({ ...prev, fullName: e.target.value }))}
                          placeholder="Фамилия Имя Отчество"
                          className="h-8 text-sm pl-8 border-primary/20 focus:border-primary"
                          disabled={isCreatingEmployee}
                          autoFocus
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Email *</label>
                      <div className="relative">
                        <Mail className="h-4 w-4 absolute left-2.5 top-2 text-muted-foreground" />
                        <Input
                          value={newEmployee.email}
                          onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="email@example.com"
                          type="email"
                          className="h-8 text-sm pl-8 border-primary/20 focus:border-primary"
                          disabled={isCreatingEmployee}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Телефон</label>
                      <div className="relative">
                        <Phone className="h-4 w-4 absolute left-2.5 top-2 text-muted-foreground" />
                        <Input
                          value={newEmployee.phone}
                          onChange={(e) => setNewEmployee(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+7 (XXX) XXX-XX-XX"
                          className="h-8 text-sm pl-8 border-primary/20 focus:border-primary"
                          disabled={isCreatingEmployee}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Дата начала работы</label>
                      <div className="relative">
                        <Calendar className="h-4 w-4 absolute left-2.5 top-2 text-muted-foreground" />
                        <Input
                          value={newEmployee.hireDate}
                          onChange={(e) => setNewEmployee(prev => ({ ...prev, hireDate: e.target.value }))}
                          type="date"
                          className="h-8 text-sm pl-8 border-primary/20 focus:border-primary"
                          disabled={isCreatingEmployee}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Должность *</label>
                      <div className="relative">
                        <Briefcase className="h-4 w-4 absolute left-2.5 top-2 text-muted-foreground z-10" />
                        <div className="pl-8 h-8">
                          {isCreatingEmployee ? (
                            <Input 
                              value={positions.find(p => p.id === newEmployee.positionId)?.name || ''} 
                              className="h-8 text-sm" 
                              disabled 
                            />
                          ) : (
                            <Combobox
                              items={positionItems}
                              value={newEmployee.positionId}
                              onChange={(value) => setNewEmployee(prev => ({ ...prev, positionId: value }))}
                              placeholder="Выберите должность"
                              emptyText="Должность не найдена"
                              createNew={handleCreatePosition}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Подразделение *</label>
                      <div className="relative">
                        <Building className="h-4 w-4 absolute left-2.5 top-2 text-muted-foreground z-10" />
                        <div className="pl-8 h-8">
                          {isCreatingEmployee ? (
                            <Input 
                              value={departments.find(d => d.id === newEmployee.departmentId)?.name || ''} 
                              className="h-8 text-sm" 
                              disabled 
                            />
                          ) : (
                            <Combobox
                              items={departmentItems}
                              value={newEmployee.departmentId}
                              onChange={(value) => setNewEmployee(prev => ({ ...prev, departmentId: value }))}
                              placeholder="Выберите подразделение"
                              emptyText="Подразделение не найдено"
                              createNew={handleCreateDepartment}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Роль</label>
                      <div className="relative">
                        <Select 
                          value={newEmployee.role} 
                          onValueChange={(value) => setNewEmployee(prev => ({ ...prev, role: value as UserRole }))}
                          disabled={isCreatingEmployee}
                        >
                          <SelectTrigger className="h-8 text-sm pl-8 border-primary/20 focus:border-primary">
                            <Shield className="h-4 w-4 absolute left-2.5 top-2 text-muted-foreground" />
                            <SelectValue placeholder="Выберите роль" />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="max-h-[180px] overflow-y-auto p-1">
                              <SelectItem 
                                value="employee"
                                className="cursor-pointer rounded-md text-sm hover:bg-primary/10 flex items-center"
                              >
                                <div className="flex items-center">
                                  <User className="h-3.5 w-3.5 mr-2 text-primary" />
                                  <span>Сотрудник</span>
                                </div>
                              </SelectItem>
                              <SelectItem 
                                value="manager"
                                className="cursor-pointer rounded-md text-sm hover:bg-primary/10 flex items-center"
                              >
                                <div className="flex items-center">
                                  <Users className="h-3.5 w-3.5 mr-2 text-blue-500" />
                                  <span>Руководитель</span>
                                </div>
                              </SelectItem>
                              <SelectItem 
                                value="admin"
                                className="cursor-pointer rounded-md text-sm hover:bg-primary/10 flex items-center"
                              >
                                <div className="flex items-center">
                                  <Shield className="h-3.5 w-3.5 mr-2 text-red-500" />
                                  <span>Администратор</span>
                                </div>
                              </SelectItem>
                            </div>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 flex items-center pt-5 text-xs text-muted-foreground sm:col-span-2">
                      <Info className="h-3.5 w-3.5 mr-1.5" />
                      Поля, отмеченные * - обязательны для заполнения
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-3 pt-3 border-t">
                    <div className="mr-auto text-xs text-muted-foreground">
                      <kbd className="hidden sm:inline-flex bg-muted px-1.5 py-0.5 text-[10px] font-medium border rounded-md">Ctrl+Enter</kbd>
                      <span className="hidden sm:inline sm:mx-1">|</span>
                      <span className="sm:hidden">Enter</span>
                      <span className="mx-1">для создания</span>
                      <span className="hidden sm:inline">|</span>
                      <kbd className="hidden sm:inline-flex mx-1 bg-muted px-1.5 py-0.5 text-[10px] font-medium border rounded-md">Esc</kbd>
                      <span className="mx-1 sm:hidden">|</span>
                      <span className="sm:hidden">Отмена</span>
                      <span className="hidden sm:inline">для отмены</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 mr-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                      onClick={() => setShowAddForm(false)}
                      disabled={isCreatingEmployee}
                    >
                      <X className="h-3.5 w-3.5 mr-1.5" />
                      Отмена
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 bg-primary hover:bg-primary/90"
                      disabled={isCreatingEmployee || !newEmployee.fullName || !newEmployee.email || !newEmployee.positionId || !newEmployee.departmentId}
                      onClick={handleCreateEmployee}
                    >
                      {isCreatingEmployee ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                          Добавление...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1.5" />
                          Добавить сотрудника
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {sortedEmployees.map((employee) => (
              <Card 
                key={employee.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${selectedEmployeeId === employee.id ? 'border-primary/80 ring-1 ring-primary/30' : 'hover:border-muted-foreground/20'}`}
                onClick={() => selectEmployee(employee.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-9 w-9 border">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {employee.fullName.split(' ').map(name => name[0]).join('').substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-center">
                        <div className="font-medium truncate mr-2" title={employee.fullName}>
                        {employee.fullName}
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-1.5">
                          {employee.role && (
                            <Badge variant="secondary" className="h-5 text-[10px] px-1.5 font-normal">
                              {employee.role === 'employee' ? 'Сотрудник' : 
                               employee.role === 'manager' ? 'Руководитель' : 
                               employee.role === 'admin' ? 'Администратор' : employee.role}
                          </Badge>
                        )}
                          <Badge 
                            className={`h-5 text-[10px] px-1.5 font-normal ${
                              getEmployeeStatus(employee) === 'not_started' ? 'bg-muted text-muted-foreground' : 
                              getEmployeeStatus(employee) === 'in_progress' ? 'bg-blue-500 border-transparent text-white' : 
                              'bg-green-500 border-transparent text-white'
                            }`}
                          >
                            {getEmployeeStatus(employee) === 'not_started' ? 'Без трека' : 
                             getEmployeeStatus(employee) === 'in_progress' ? 'В процессе' : 
                             'Завершено'}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-0.5" />
                      </div>
                      </div>
                      
                      <div className="flex flex-wrap mt-1 gap-x-3 gap-y-0.5">
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Briefcase className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{getPositionName(employee.positionId)}</span>
                      </div>
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Building className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{getDepartmentName(employee.departmentId)}</span>
                    </div>
                        {employee.email && (
                          <div className="text-xs text-muted-foreground flex items-center">
                            <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{employee.email}</span>
                          </div>
                        )}
                        {employee.phone && (
                          <div className="text-xs text-muted-foreground flex items-center">
                            <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{employee.phone}</span>
                          </div>
                        )}
                        {employee.hireDate && (
                          <div className="text-xs text-muted-foreground flex items-center">
                            <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{new Date(employee.hireDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Adaptation progress - show only if there are assigned tracks */}
                      {employee.assignedTracks && employee.assignedTracks.length > 0 && (
                        <div className="mt-2 pt-2 border-t">
                          <div className="bg-muted/20 p-1.5 rounded-md">
                            <div className="flex justify-between items-center mb-1">
                              <div className="text-xs text-muted-foreground flex items-center">
                                <FileText className="h-3 w-3 mr-1" />
                                Прогресс адаптации
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {countAssignedTracks(employee.id)} {countAssignedTracks(employee.id) === 1 ? 'трек' : 
                                  countAssignedTracks(employee.id) < 5 ? 'трека' : 'треков'}
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              {employee.assignedTracks.slice(0, 2).map(track => {
                                const trackInfo = getTrackById(track.trackId);
                                if (!trackInfo) return null;
                                
                                const progress = calculateTrackProgress(employee.id, track.trackId);
                                return (
                                  <div key={track.trackId} className="space-y-0.5">
                                    <div className="flex justify-between text-xs">
                                      <span className="truncate max-w-[180px]" title={trackInfo.title}>{trackInfo.title}</span>
                                      <span className={progress >= 100 ? "text-green-600 font-medium" : ""}>{progress}%</span>
                                    </div>
                                    <Progress 
                                      value={progress} 
                                      className={`h-1 ${
                                        progress >= 100 ? "bg-green-100" : 
                                        progress > 0 ? "bg-blue-100" : ""
                                      }`} 
                                    />
                                  </div>
                                );
                              })}
                              {employee.assignedTracks.length > 2 && (
                                <div className="text-xs text-muted-foreground text-right mt-1">
                                  + ещё {employee.assignedTracks.length - 2} {employee.assignedTracks.length - 2 === 1 ? 'трек' : 
                                     employee.assignedTracks.length - 2 < 5 ? 'трека' : 'треков'}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {sortedEmployees.length === 0 && !showAddForm && (
              <div className="text-center py-8 px-4 border rounded-lg bg-muted/5">
                <UserPlus className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground font-medium">Сотрудники не найдены</p>
                <p className="text-xs text-muted-foreground mt-1 mb-3">Создайте первого сотрудника, чтобы начать работу</p>
                <Button 
                  size="sm"
                  onClick={handleOpenAddForm}
                >
                  <UserPlus className="h-4 w-4 mr-1.5" />
                  Добавить сотрудника
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Floating button for adding a new employee - only show if form is not already open */}
        {!showAddForm && (
          <Button
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-10 p-0"
            size="lg"
            onClick={handleOpenAddForm}
            style={{
              right: rightPanelOpen ? 'calc(550px + 1.5rem)' : '1.5rem'
            }}
          >
            <UserPlus className="h-6 w-6" />
          </Button>
        )}
      </div>

      {/* Right side - Employee details */}
      <div 
        className={`fixed top-[64px] bottom-0 right-0 w-full sm:w-[450px] lg:w-[500px] xl:w-[550px] bg-background border-l shadow-xl transition-transform duration-300 transform z-50 ${
          rightPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedEmployee && (
          <div className="h-full flex flex-col">
            <div className="border-b p-4 flex justify-between items-center bg-muted/10">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedEmployee.fullName.split(' ').map(name => name[0]).join('').substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-semibold flex items-center">
                    {selectedEmployee.fullName}
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-7 w-7 ml-1"
                      onClick={() => handleEditField('fullName')}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </h2>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Briefcase className="h-3.5 w-3.5 mr-1.5" />
                    {getPositionName(selectedEmployee.positionId)}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={closeRightPanel}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex-grow overflow-y-auto">
              {/* Редактирование fullName */}
              {editingField === 'fullName' && (
                <div className="p-4 border-b bg-muted/5">
                  <div className="flex items-center gap-2">
                    <Input 
                      value={editedValues['fullName'] || ''}
                      onChange={(e) => setEditedValues(prev => ({ ...prev, fullName: e.target.value }))}
                      className="h-9 flex-1"
                      placeholder="ФИО сотрудника"
                      disabled={isUpdatingField['fullName']}
                    />
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setEditingField(null)}
                      disabled={isUpdatingField['fullName']}
                    >
                      Отмена
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleSaveField('fullName')}
                      disabled={isUpdatingField['fullName']}
                    >
                      {isUpdatingField['fullName'] ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Сохранить
                    </Button>
                    </div>
                    </div>
              )}
              
              <div className="p-4 space-y-4">
                {/* Quick action buttons */}
                <div className="flex gap-2">
                  <Select 
                    value={selectedEmployee.role || 'employee'} 
                    onValueChange={(value) => {
                      if (value !== selectedEmployee.role) {
                        setIsUpdatingRole(true);
                        handleRoleUpdate(selectedEmployee.id, value as UserRole);
                      }
                    }}
                    disabled={isUpdatingRole}
                  >
                    <SelectTrigger className="h-9 flex-1 max-w-[160px]">
                      {isUpdatingRole ? (
                        <div className="flex items-center">
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
                          <span className="truncate">Обновление...</span>
                  </div>
                      ) : (
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                          <SelectValue />
                    </div>
                  )}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Сотрудник</SelectItem>
                      <SelectItem value="manager">Руководитель</SelectItem>
                      <SelectItem value="admin">Администратор</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant="outline" 
                    size="default"
                    className="flex-1"
                    onClick={() => handleResetPassword(selectedEmployee.id)}
                    disabled={isResettingPassword}
                  >
                    {isResettingPassword ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
                        Сброс...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4 mr-2" />
                        Сбросить пароль
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleGetAccessLink(selectedEmployee.id)}
                    disabled={isCopyingLink}
                    title="Скопировать ссылку доступа"
                  >
                    {isCopyingLink ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {/* Employee basic info with avatar */}
                <div className="space-y-1">
                  <div className="text-sm font-medium flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    Основная информация
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 p-3 border rounded-lg bg-muted/5 text-sm">
                    {/* Position field */}
                    <div className="flex justify-between items-center group">
                      <div className="flex items-center text-muted-foreground">
                        <Briefcase className="h-3.5 w-3.5 mr-2" />
                        <span>Должность:</span>
                      </div>
                      {editingField === 'positionId' ? (
                        <div className="flex items-center gap-1 flex-1 justify-end">
                          <Select 
                            value={editedValues['positionId'] || selectedEmployee.positionId || ''}
                            onValueChange={(value) => setEditedValues(prev => ({ ...prev, positionId: value }))}
                            disabled={isUpdatingField['positionId']}
                          >
                            <SelectTrigger className="h-7 flex-1 max-w-[200px] text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {positions.map(position => (
                                <SelectItem key={position.id} value={position.id}>{position.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-7 w-7"
                              onClick={() => setEditingField(null)}
                              disabled={isUpdatingField['positionId']}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-7 w-7"
                              onClick={() => handleSaveField('positionId')}
                              disabled={isUpdatingField['positionId']}
                            >
                              {isUpdatingField['positionId'] ? (
                                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                              ) : (
                                <Save className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{getPositionName(selectedEmployee.positionId)}</span>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleEditField('positionId')}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {/* Department field */}
                    <div className="flex justify-between items-center group">
                      <div className="flex items-center text-muted-foreground">
                        <Building className="h-3.5 w-3.5 mr-2" />
                        <span>Подразделение:</span>
                      </div>
                      {editingField === 'departmentId' ? (
                        <div className="flex items-center gap-1 flex-1 justify-end">
                          <Select 
                            value={editedValues['departmentId'] || selectedEmployee.departmentId || ''}
                            onValueChange={(value) => setEditedValues(prev => ({ ...prev, departmentId: value }))}
                            disabled={isUpdatingField['departmentId']}
                          >
                            <SelectTrigger className="h-7 flex-1 max-w-[200px] text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {departments.map(department => (
                                <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-7 w-7"
                              onClick={() => setEditingField(null)}
                              disabled={isUpdatingField['departmentId']}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-7 w-7"
                              onClick={() => handleSaveField('departmentId')}
                              disabled={isUpdatingField['departmentId']}
                            >
                              {isUpdatingField['departmentId'] ? (
                                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                              ) : (
                                <Save className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{getDepartmentName(selectedEmployee.departmentId)}</span>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleEditField('departmentId')}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {/* Hire date field */}
                    <div className="flex justify-between items-center group">
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 mr-2" />
                        <span>Дата начала работы:</span>
                      </div>
                      {editingField === 'hireDate' ? (
                        <div className="flex items-center gap-1 flex-1 justify-end">
                          <Input 
                            value={editedValues['hireDate'] || ''}
                            onChange={(e) => setEditedValues(prev => ({ ...prev, hireDate: e.target.value }))}
                            className="h-7 w-[120px] text-xs"
                            disabled={isUpdatingField['hireDate']}
                            type="date"
                          />
                          <div className="flex">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-7 w-7"
                              onClick={() => setEditingField(null)}
                              disabled={isUpdatingField['hireDate']}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-7 w-7"
                              onClick={() => handleSaveField('hireDate')}
                              disabled={isUpdatingField['hireDate']}
                            >
                              {isUpdatingField['hireDate'] ? (
                                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                              ) : (
                                <Save className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{selectedEmployee.hireDate ? new Date(selectedEmployee.hireDate).toLocaleDateString() : 'Не указана'}</span>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleEditField('hireDate')}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {/* Email field */}
                    <div className="flex justify-between items-center group">
                      <div className="flex items-center text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 mr-2" />
                        <span>Email:</span>
                      </div>
                      {editingField === 'email' ? (
                        <div className="flex items-center gap-1 flex-1 justify-end">
                          <Input 
                            value={editedValues['email'] || ''}
                            onChange={(e) => setEditedValues(prev => ({ ...prev, email: e.target.value }))}
                            className="h-7 flex-1 max-w-[200px] text-xs"
                            disabled={isUpdatingField['email']}
                            type="email"
                          />
                          <div className="flex">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-7 w-7"
                              onClick={() => setEditingField(null)}
                              disabled={isUpdatingField['email']}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-7 w-7"
                              onClick={() => handleSaveField('email')}
                              disabled={isUpdatingField['email']}
                            >
                              {isUpdatingField['email'] ? (
                                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                              ) : (
                                <Save className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{selectedEmployee.email || 'Не указан'}</span>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleEditField('email')}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {/* Phone field */}
                    <div className="flex justify-between items-center group">
                      <div className="flex items-center text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 mr-2" />
                        <span>Телефон:</span>
                      </div>
                      {editingField === 'phone' ? (
                        <div className="flex items-center gap-1 flex-1 justify-end">
                          <Input 
                            value={editedValues['phone'] || ''}
                            onChange={(e) => setEditedValues(prev => ({ ...prev, phone: e.target.value }))}
                            className="h-7 flex-1 max-w-[200px] text-xs"
                            disabled={isUpdatingField['phone']}
                            type="tel"
                          />
                          <div className="flex">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-7 w-7"
                              onClick={() => setEditingField(null)}
                              disabled={isUpdatingField['phone']}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-7 w-7"
                              onClick={() => handleSaveField('phone')}
                              disabled={isUpdatingField['phone']}
                            >
                              {isUpdatingField['phone'] ? (
                                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                              ) : (
                                <Save className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{selectedEmployee.phone || 'Не указан'}</span>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleEditField('phone')}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Диалог подтверждения смены email */}
                <Dialog open={confirmEmailChange} onOpenChange={setConfirmEmailChange}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Подтверждение смены email</DialogTitle>
                      <DialogDescription>
                        Вы уверены, что хотите изменить email пользователя? На новый адрес будет отправлено уведомление.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => setConfirmEmailChange(false)}
                        disabled={isUpdatingField['email']}
                      >
                        Отмена
                      </Button>
                      <Button 
                        onClick={() => handleSaveField('email')}
                        disabled={isUpdatingField['email']}
                      >
                        {isUpdatingField['email'] ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                            Сохранение...
                          </>
                        ) : (
                          "Подтвердить"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    Треки адаптации
                  </div>
                  {!editingTrack && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs gap-1.5"
                      onClick={toggleAddTrack}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Добавить
                    </Button>
                  )}
                  </div>
                  
                  {/* List of assigned tracks */}
                <div className="space-y-2 mt-2">
                    {selectedEmployee.assignedTracks && selectedEmployee.assignedTracks.map(assignedTrack => {
                      const track = getTrackById(assignedTrack.trackId);
                      if (!track) return null;
                      
                      return (
                      <div key={assignedTrack.trackId} className="border rounded-lg p-2 bg-card hover:bg-accent/5 transition-colors text-sm">
                        <div className="flex justify-between items-start">
                          <div className="font-medium truncate pr-2" title={track.title}>
                            {track.title}
                          </div>
                            <div className="flex space-x-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => navigateToTrackProgress(selectedEmployee.id)}
                                    className="h-7 w-7"
                              >
                                    <FileText className="h-3.5 w-3.5" />
                              </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Показать прогресс
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                    className="h-7 w-7" 
                                onClick={() => handleRemoveTrack(assignedTrack.trackId)}
                                disabled={isRemovingTrack[assignedTrack.trackId]}
                              >
                                {isRemovingTrack[assignedTrack.trackId] ? (
                                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                ) : (
                                      <Trash className="h-3.5 w-3.5" />
                                )}
                              </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Удалить трек
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            </div>
                          </div>
                          
                        <div className="flex justify-between items-center text-xs py-1">
                          <div className="flex items-center text-muted-foreground gap-1">
                            <User className="h-3 w-3" />
                            <span>
                              {assignedTrack.mentorId ? 
                                getMentorById(assignedTrack.mentorId)?.fullName || 'Нет руководителя' : 
                                'Нет руководителя'}
                            </span>
                          </div>
                          
                          <button
                            className="text-xs text-primary hover:underline focus:outline-none"
                            onClick={() => handleEditField(`mentorId_${assignedTrack.trackId}`)}
                          >
                            Изменить
                          </button>
                            </div>
                            
                        {/* Editing mentor */}
                        {editingField === `mentorId_${assignedTrack.trackId}` && (
                          <div className="pt-2 pb-1">
                            <div className="flex items-center gap-1">
                            <Select 
                                value={editedValues[`mentorId_${assignedTrack.trackId}`] || assignedTrack.mentorId || 'none'} 
                                onValueChange={(value) => setEditedValues(prev => ({ ...prev, [`mentorId_${assignedTrack.trackId}`]: value }))}
                              disabled={isUpdatingMentor[assignedTrack.trackId]}
                            >
                                <SelectTrigger className="h-7 flex-1 text-xs">
                                {isUpdatingMentor[assignedTrack.trackId] ? (
                                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent ml-1" />
                                ) : (
                                    <SelectValue placeholder="Выбрать руководителя" />
                                )}
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Нет руководителя</SelectItem>
                                {users.map(user => (
                                  <SelectItem key={user.id} value={user.id}>{user.fullName}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                              <div className="flex">
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-7 w-7"
                                  onClick={() => setEditingField(null)}
                                  disabled={isUpdatingMentor[assignedTrack.trackId]}
                                >
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-7 w-7"
                                  onClick={() => {
                                    const mentorId = editedValues[`mentorId_${assignedTrack.trackId}`] === 'none' ? 
                                      undefined : editedValues[`mentorId_${assignedTrack.trackId}`];
                                    setIsUpdatingMentor(prev => ({ ...prev, [assignedTrack.trackId]: true }));
                                    handleUpdateTrack(assignedTrack.trackId, mentorId);
                                    setEditingField(null);
                                  }}
                                  disabled={isUpdatingMentor[assignedTrack.trackId]}
                                >
                                  <Save className="h-3.5 w-3.5" />
                                </Button>
                          </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-xs mb-0.5">
                            <span className="text-muted-foreground">Прогресс</span>
                            <span>{calculateTrackProgress(selectedEmployee.id, assignedTrack.trackId)}%</span>
                          </div>
                          <Progress value={calculateTrackProgress(selectedEmployee.id, assignedTrack.trackId)} className="h-1.5" />
                        </div>
                        
                        <div className="flex justify-between pt-2 items-center text-xs">
                          {assignedTrack.startDate && (
                            <div className="text-muted-foreground flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(assignedTrack.startDate).toLocaleDateString()}
                            </div>
                          )}
                          
                          {assignedTrack.status === 'completed' && (
                            <Badge className="bg-green-500 border-transparent text-white h-5 text-xs">Завершен</Badge>
                          )}
                          {assignedTrack.status === 'in_progress' && (
                            <Badge className="bg-blue-500 border-transparent text-white h-5 text-xs">В процессе</Badge>
                          )}
                          {assignedTrack.status !== 'completed' && assignedTrack.status !== 'in_progress' && (
                            <Badge variant="outline" className="h-5 text-xs">Не начат</Badge>
                          )}
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* No tracks assigned message */}
                    {(!selectedEmployee.assignedTracks || selectedEmployee.assignedTracks.length === 0) && !editingTrack && (
                    <div className="text-center py-4 text-muted-foreground border rounded-lg flex flex-col items-center">
                      <FileText className="h-10 w-10 mb-2 text-muted-foreground/50" />
                      <p className="text-sm">Треки не назначены</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={toggleAddTrack}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Назначить трек
                      </Button>
                      </div>
                    )}
                    
                  {/* Add new track form - compact version */}
                    {editingTrack && (
                    <div className="border rounded-lg overflow-hidden bg-card">
                      <div className="bg-muted/10 px-3 py-2 flex justify-between items-center border-b">
                        <div className="font-medium text-sm flex items-center">
                          <FileText className="h-3.5 w-3.5 mr-1.5" />
                          Назначить трек
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={toggleAddTrack}>
                          <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        
                      <div className="p-3 space-y-3">
                          {/* Track selection with categories */}
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">
                              Выберите трек для сотрудника
                            </label>
                            
                          <div className="grid gap-1.5 max-h-[200px] overflow-y-auto pr-1">
                              {Object.entries(trackGroups).map(([category, categoryTracks]) => (
                                <div key={category} className="space-y-1">
                                <div className="text-xs font-semibold text-muted-foreground mt-1 mb-0.5">
                                    {category}
                                  </div>
                                  
                                  {categoryTracks.map(track => (
                                    <div 
                                      key={track.id}
                                    className={`flex items-center p-1.5 rounded-md cursor-pointer text-sm ${
                                        newTrackId === track.id 
                                          ? 'bg-primary/10 text-primary border border-primary/30' 
                                          : 'hover:bg-muted border border-transparent'
                                      }`}
                                      onClick={() => setNewTrackId(track.id)}
                                    >
                                    <div className="mr-2 flex-shrink-0">
                                        {newTrackId === track.id ? (
                                        <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                                          <Check className="h-2.5 w-2.5 text-white" />
                                          </div>
                                        ) : (
                                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/40" />
                                        )}
                                      </div>
                                    <div className="flex-1 truncate">
                                      <div className="font-medium text-xs truncate" title={track.title}>{track.title}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Mentor selection */}
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground flex items-center">
                            <Users className="h-3.5 w-3.5 mr-1.5" />
                              Выберите наставника (опционально)
                            </label>
                            
                            <Select value={newMentorId} onValueChange={setNewMentorId}>
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Выберите наставника" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Без наставника</SelectItem>
                                {users.map(user => (
                                  <SelectItem key={user.id} value={user.id}>{user.fullName}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                      <div className="border-t p-2 flex justify-end space-x-2 bg-muted/5">
                          <Button 
                          variant="ghost" 
                            size="sm" 
                          className="h-7 text-xs"
                            onClick={toggleAddTrack}
                          >
                            Отмена
                          </Button>
                          <Button 
                            size="sm" 
                          className="h-7 text-xs"
                            onClick={handleAddTrack}
                            disabled={!newTrackId || isAssigningTrack}
                          >
                            {isAssigningTrack ? (
                              <>
                              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent mr-1.5" />
                                Назначаем...
                              </>
                            ) : (
                            <>
                              <Plus className="h-3 w-3 mr-1" />
                              Назначить
                            </>
                      )}
                    </Button>
                  </div>
                </div>
                  )}
              </div>
            </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
