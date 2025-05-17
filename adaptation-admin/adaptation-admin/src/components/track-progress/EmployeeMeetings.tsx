// Этот файл был переименован из EmployeeCalendar.tsx
import { useState, useEffect, useMemo, useRef } from 'react';
import { format, isToday, parse, startOfToday, isWithinInterval, isSameDay, addDays, isPast, isFuture } from 'date-fns';
import { ru } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import { CalendarEvent } from '@/types';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Video,
  Check,
  X,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/store';
import { useParams } from 'react-router-dom';
import { setAuthToken } from '@/lib/api-init';

// Временные стили для календаря
import 'react-day-picker/dist/style.css';

// CSS для стилизации календаря
const calendarCustomStyles = `
  .rdp-day_today:not(.rdp-day_selected) {
    background-color: rgba(var(--accent), 0.1);
  }
  
  .rdp-day {
    position: relative;
    height: 45px !important;
  }
  
  .day-event-marker {
    position: absolute;
    bottom: -6px;
    left: 2px; 
    right: 2px;
    font-size: 9px;
    color: var(--primary);
    text-align: center;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-weight: 500;
  }
  
  .has-multiple-events .day-event-marker {
    font-weight: 700;
  }
  
  .rdp-day_selected:not(.rdp-day_disabled):not(.rdp-day_outside) .day-event-marker {
    color: white;
  }
  
  .rdp-months {
    justify-content: center;
  }
  
  .rdp-month {
    width: 100%;
    max-width: 320px;
  }
  
  @media (max-width: 640px) {
    .rdp-month {
      max-width: 300px;
    }
  }
`;

// Создаем компонент-заглушку для Skeleton
const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-muted rounded", className)} />
);

// Компонент для отображения информации о встречах в день
type DayEventsProps = {
  date: Date;
  eventsByDate: Map<string, CalendarEvent[]>;
};

const DayEvents = ({ date, eventsByDate }: DayEventsProps) => {
  const dateStr = date.toISOString().split('T')[0];
  const events = eventsByDate.get(dateStr) || [];
  
  if (events.length === 0) {
    return null;
  }
  
  return (
    <div className="day-event-marker">
      {events.length === 1 ? (
        "1 встреча"
      ) : events.length > 1 ? (
        `${events.length} встреч${events.length < 5 ? 'и' : ''}`
      ) : null}
    </div>
  );
};

// Компонент для кастомного рендеринга ячейки дня
const CustomDay = (props: { 
  date: Date; 
  eventsByDate: Map<string, CalendarEvent[]>;
}) => {
  const { date, eventsByDate } = props;
  
  return (
    <div className="w-full h-full flex flex-col items-center pt-1.5">
      <div>{format(date, 'd')}</div>
      <DayEvents date={date} eventsByDate={eventsByDate} />
    </div>
  );
};

export function EmployeeMeetings() {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(startOfToday());
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfToday());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false); // Состояние для управления видимостью календаря
  const [activeTab, setActiveTab] = useState('upcoming'); // Активная вкладка для фильтрации - по умолчанию "Будущие"
  
  const { employees, tracks } = useStore();
  const { employeeId } = useParams();
  
  // Ref для доступа к элементам дат, к которым нужно прокрутить
  const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  // Debug function to check localStorage
  const debugCheckLocalStorage = () => {
    console.log('==== DEBUG EMPLOYEE ACCESS INFO ====');
    console.log('employee_access_mode:', localStorage.getItem('employee_access_mode'));
    console.log('current_employee_id:', localStorage.getItem('current_employee_id'));
    console.log('employee_access_link:', localStorage.getItem('employee_access_link'));
    console.log('auth_token:', localStorage.getItem('auth_token'));
    
    // Manually try to set headers for a test
    const accessToken = `employee_access_${localStorage.getItem('employee_access_link')}`;
    setAuthToken(accessToken);
    console.log('Test token set to:', accessToken);
    console.log('==== END DEBUG ====');
    
    // Force re-fetch events to test authorization
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };
  
  // Проверка и восстановление авторизации при доступе сотрудника
  useEffect(() => {
    // Check localStorage for employee access mode
    const employeeAccessMode = localStorage.getItem('employee_access_mode');
    const storedEmployeeId = localStorage.getItem('current_employee_id');
    const accessLink = localStorage.getItem('employee_access_link');
    
    console.log('Checking employee access mode on EmployeeMeetings mount:');
    console.log('employee_access_mode:', employeeAccessMode);
    console.log('current_employee_id:', storedEmployeeId);
    console.log('employee_access_link:', accessLink);
    
    // If we're in employee access mode
    if (employeeAccessMode === 'true' && accessLink) {
      console.log('Employee access mode detected in meetings - setting up authorization');
      
      // Generate temporary auth token
      const accessToken = `employee_access_${accessLink}`;
      
      // Setup auth token (this is needed for API requests)
      setAuthToken(accessToken);
      
      // Ensure localStorage values are set (in case they were somehow cleared)
      localStorage.setItem('employee_access_mode', 'true');
      if (storedEmployeeId) {
        localStorage.setItem('current_employee_id', storedEmployeeId);
      }
      localStorage.setItem('employee_access_link', accessLink);
      
      console.log('Employee authorization restored successfully in meetings page');
    } else {
      console.warn('No employee access credentials in meetings page');
    }
  }, []); // Only run once on mount
  
  // Загрузка событий из API и их объединение с событиями из трека
  useEffect(() => {
    setLoading(true);
    setApiError(null);
    
    // Функция для получения событий из трека
    const getTrackEvents = (): CalendarEvent[] => {
      const trackEvents: CalendarEvent[] = [];
      
      if (!employeeId) return trackEvents;
      
      const employee = employees.find(e => e.id === employeeId);
      if (!employee || !employee.assignedTrackId) return trackEvents;
      
      const track = tracks.find(t => t.id === employee.assignedTrackId);
      if (!track) return trackEvents;
      
      // Собираем все встречи из трека
      track.milestones.forEach(milestone => {
        milestone.stages.forEach(stage => {
          if (stage.type === 'meeting' && stage.content.date) {
            const meetingDate = new Date(stage.content.date);
            
            // Добавляем в список событий
            trackEvents.push({
              id: stage.id,
              title: stage.title,
              description: stage.description,
              start: stage.content.date,
              end: stage.content.duration 
                ? new Date(meetingDate.getTime() + stage.content.duration * 60000).toISOString() 
                : new Date(meetingDate.getTime() + 60 * 60000).toISOString(),
              location: stage.content.location,
              meetingType: stage.content.meetingTool,
              participants: stage.content.participants,
              isAllDay: false,
              stageId: stage.id,
              color: '#0ea5e9', // Голубой цвет для встреч
              status: stage.status?.isCompleted ? 'completed' : 'scheduled'
            });
          }
        });
      });
      
      return trackEvents;
    };
    
    // Функция для получения событий из API
    const fetchApiEvents = async (): Promise<CalendarEvent[]> => {
      try {
        // В реальном приложении здесь будет реализован запрос к API
        // const response = await fetch(`/api/employees/${employeeId}/calendar-events`);
        // if (!response.ok) throw new Error('Не удалось загрузить данные календаря');
        // const data = await response.json();
        // return data;
        
        // Для демонстрации возвращаем тестовые данные
        // Имитируем задержку, как при сетевом запросе
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const todayStart = new Date();
        todayStart.setHours(10, 0, 0, 0);
        
        const todayEnd = new Date();
        todayEnd.setHours(11, 0, 0, 0);
        
        const tomorrowStart = new Date();
        tomorrowStart.setDate(tomorrowStart.getDate() + 1);
        tomorrowStart.setHours(14, 0, 0, 0);
        
        const tomorrowEnd = new Date();
        tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
        tomorrowEnd.setHours(15, 30, 0, 0);
        
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextWeek.setHours(11, 0, 0, 0);
        
        const nextWeekEnd = new Date();
        nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);
        nextWeekEnd.setHours(12, 0, 0, 0);
        
        // Добавим еще одно событие на сегодня, чтобы показать несколько событий в один день
        const todaySecondStart = new Date();
        todaySecondStart.setHours(15, 0, 0, 0);
        
        const todaySecondEnd = new Date();
        todaySecondEnd.setHours(16, 0, 0, 0);
        
        // Добавим событие на 2 дня вперед
        const dayAfterTomorrow = new Date();
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
        dayAfterTomorrow.setHours(13, 0, 0, 0);
        
        const dayAfterTomorrowEnd = new Date();
        dayAfterTomorrowEnd.setDate(dayAfterTomorrowEnd.getDate() + 2);
        dayAfterTomorrowEnd.setHours(14, 0, 0, 0);
        
        return [
          {
            id: 'api-1',
            title: 'Ежедневная планерка',
            description: 'Обсуждение текущих задач и рабочих вопросов',
            start: todayStart.toISOString(),
            end: todayEnd.toISOString(),
            location: 'Конференц-зал',
            meetingType: 'in_person',
            participants: ['Руководитель отдела', 'Коллеги по команде'],
            color: '#22c55e', // Зеленый цвет
            status: 'scheduled'
          },
          {
            id: 'api-2',
            title: 'Встреча с наставником',
            description: 'Обсуждение прогресса адаптации и ответы на вопросы',
            start: tomorrowStart.toISOString(),
            end: tomorrowEnd.toISOString(),
            meetingType: 'google_meet',
            meetingUrl: 'https://meet.google.com/demo',
            color: '#8b5cf6', // Фиолетовый цвет
            status: 'scheduled'
          },
          {
            id: 'api-3', 
            title: 'Тренинг по продуктам компании',
            description: 'Углубленное знакомство с линейкой продуктов',
            start: nextWeek.toISOString(),
            end: nextWeekEnd.toISOString(),
            location: 'Комната для тренингов',
            meetingType: 'in_person',
            participants: ['Руководитель продуктового направления', 'Новые сотрудники'],
            color: '#f97316', // Оранжевый цвет
            status: 'scheduled'
          },
          // Дополнительное событие на сегодня
          {
            id: 'api-4',
            title: 'Обучение корпоративным системам',
            description: 'Знакомство с внутренними инструментами и системами',
            start: todaySecondStart.toISOString(),
            end: todaySecondEnd.toISOString(),
            location: 'Переговорная №2',
            meetingType: 'in_person',
            participants: ['IT-специалист', 'Новые сотрудники'],
            color: '#0ea5e9', // Голубой цвет
            status: 'scheduled'
          },
          // Событие через 2 дня
          {
            id: 'api-5',
            title: 'Знакомство с командой',
            description: 'Неформальное общение с командой',
            start: dayAfterTomorrow.toISOString(),
            end: dayAfterTomorrowEnd.toISOString(),
            location: 'Кофейня рядом с офисом',
            meetingType: 'in_person',
            participants: ['Команда отдела'],
            color: '#ec4899', // Розовый цвет
            status: 'scheduled'
          },
          // Событие, которое перезаписывает событие из трека (пример конфликта)
          {
            id: 'api-override-track',
            title: 'Изменённая встреча из трека', // Изменённое название
            description: 'Это событие заменяет событие из трека с тем же stageId',
            start: nextWeek.toISOString(), // Изменённая дата
            end: nextWeekEnd.toISOString(),
            location: 'Переговорная комната', // Изменённое место
            meetingType: 'zoom',
            meetingUrl: 'https://zoom.us/j/123456',
            stageId: 'stage-meeting-1', // ID этапа-встречи из трека для примера
            color: '#dc2626', // Красный цвет
            status: 'scheduled'
          }
        ];
      } catch (error) {
        console.error('Ошибка загрузки календарных событий:', error);
        setApiError('Не удалось загрузить данные календаря. Пожалуйста, попробуйте позже.');
        return [];
      }
    };
    
    // Запуск загрузки и объединения данных
    const loadEvents = async () => {
      try {
        // Получаем события из трека
        const trackEvents = getTrackEvents();
        
        // Получаем события из API
        const apiEvents = await fetchApiEvents();
        
        // Объединяем события, отдавая приоритет данным из API
        // Создаем словарь событий по stageId для быстрого поиска
        const trackEventsMap = new Map<string, CalendarEvent>();
        
        // Добавляем события из трека в словарь
        trackEvents.forEach(event => {
          if (event.stageId) {
            trackEventsMap.set(event.stageId, event);
          }
        });
        
        // Обрабатываем события из API
        apiEvents.forEach(apiEvent => {
          // Если у события из API есть stageId, оно заменяет соответствующее событие из трека
          if (apiEvent.stageId && trackEventsMap.has(apiEvent.stageId)) {
            trackEventsMap.delete(apiEvent.stageId);
          }
        });
        
        // Объединяем события из API и оставшиеся события из трека
        const mergedEvents = [
          ...apiEvents,
          ...Array.from(trackEventsMap.values())
        ];
        
        // Сортируем по дате начала
        mergedEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
        
        setEvents(mergedEvents);
      } catch (error) {
        console.error('Ошибка при объединении данных календаря:', error);
        setApiError('Произошла ошибка при обработке данных. Пожалуйста, обновите страницу.');
      } finally {
        setLoading(false);
      }
    };
    
    loadEvents();
  }, [employeeId, employees, tracks]);
  
  // Находим события для выбранной даты
  const selectedDayEvents = selectedDay ? events.filter(event => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    return isWithinInterval(selectedDay, { start: new Date(eventStart.setHours(0,0,0,0)), end: new Date(eventEnd.setHours(23,59,59,999)) });
  }) : [];
  
  // Фильтрация событий
  const filteredEvents = useMemo(() => {
    let filtered = [...events];
    
    // Фильтрация по вкладке (прошедшие, сегодня, будущие, все)
    if (activeTab === 'past') {
      filtered = filtered.filter(event => isPast(new Date(event.end)));
    } else if (activeTab === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = addDays(today, 1);
      
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.start);
        eventDate.setHours(0, 0, 0, 0);
        return isSameDay(eventDate, today);
      });
    } else if (activeTab === 'upcoming') {
      filtered = filtered.filter(event => isFuture(new Date(event.start)));
    }
    
    return filtered;
  }, [events, activeTab]);
  
  // Подготовка данных для разметки дней с событиями
  // Создаем Map для группировки событий по датам
  const eventsByDate = new Map<string, CalendarEvent[]>();
  
  // Используем отфильтрованные события для индикаторов календаря
  filteredEvents.forEach(event => {
    const date = new Date(event.start);
    const dateStr = date.toISOString().split('T')[0]; // Формат YYYY-MM-DD
    
    if (!eventsByDate.has(dateStr)) {
      eventsByDate.set(dateStr, []);
    }
    
    eventsByDate.get(dateStr)?.push(event);
  });
  
  // Преобразуем Map в массив дат для DayPicker
  // Подготавливаем модификаторы для разных типов событий
  const singleEventDays: Date[] = [];
  const multipleEventDays: Date[] = [];
  
  eventsByDate.forEach((dateEvents, dateStr) => {
    const date = new Date(dateStr);
    if (dateEvents.length === 1) {
      singleEventDays.push(date);
    } else if (dateEvents.length > 1) {
      multipleEventDays.push(date);
    }
  });
  
  // Обработчик выбора дня в календаре
  const handleDaySelect = (day: Date | undefined) => {
    setSelectedDay(day);
    
    if (day) {
      // Форматируем дату как YYYY-MM-DD для соответствия с id элементов
      const dateStr = format(day, 'yyyy-MM-dd');
      
      // Находим элемент с этой датой и скроллим к нему
      setTimeout(() => {
        const element = scrollRefs.current[dateStr];
        if (element) {
          // Используем scrollIntoView для плавного скролла
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };
  
  // При изменении месяца
  const handleMonthChange = (month: Date) => {
    setCurrentMonth(month);
  };
  
  // Группировка событий по датам для отображения в списке
  const groupedEvents = useMemo(() => {
    const grouped = new Map<string, CalendarEvent[]>();
    
    // Сортируем события по дате начала
    const sortedEvents = [...filteredEvents].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );
    
    sortedEvents.forEach(event => {
      const date = new Date(event.start);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      if (!grouped.has(dateStr)) {
        grouped.set(dateStr, []);
      }
      
      grouped.get(dateStr)?.push(event);
    });
    
    return grouped;
  }, [filteredEvents]);
  
  return (
    <div className="flex flex-col space-y-4">
      {/* Стили для отображения индикаторов событий */}
      <style>{calendarCustomStyles}</style>
      
      {/* Заголовок страницы и переключатель календаря */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Мои встречи</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            {showCalendar ? 'Скрыть календарь' : 'Показать календарь'}
          </Button>
        </div>
      </div>
      
      {/* Табы для быстрой фильтрации в новом дизайне - с измененным порядком */}
      <div className="sticky top-0 z-10 bg-background pt-1 pb-2 border-b">
        <div className="grid grid-cols-4 gap-2 max-w-lg mx-auto">
          <Button 
            variant={activeTab === 'upcoming' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setActiveTab('upcoming')}
            className="h-9"
          >
            <span>Будущие</span>
          </Button>
          <Button 
            variant={activeTab === 'today' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setActiveTab('today')}
            className="h-9"
          >
            <span>Сегодня</span>
          </Button>
          <Button 
            variant={activeTab === 'past' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setActiveTab('past')}
            className="h-9"
          >
            <span>Прошедшие</span>
          </Button>
          <Button 
            variant={activeTab === 'all' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setActiveTab('all')}
            className="h-9"
          >
            Все
          </Button>
        </div>
      </div>
      
      {/* Календарь (отображается только если showCalendar === true) */}
      {showCalendar && (
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Календарь для навигации</CardTitle>
            <p className="text-xs text-muted-foreground">Нажмите на дату, чтобы перейти к встречам</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex justify-center">
              <DayPicker
                mode="single"
                selected={selectedDay}
                onSelect={handleDaySelect}
                onMonthChange={handleMonthChange}
                month={currentMonth}
                locale={ru}
                showOutsideDays={true}
                modifiersClassNames={{
                  selected: "bg-primary text-primary-foreground",
                  today: "text-accent-foreground font-bold",
                  'has-event': "has-event",
                  'has-multiple-events': "has-multiple-events",
                }}
                classNames={{
                  caption_label: "text-sm font-medium",
                  nav_button: cn(
                    "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                    "h-7 w-7 rounded-md p-0 opacity-50 hover:opacity-100"
                  ),
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                  cell: cn(
                    "relative p-0 rounded-md text-center text-sm focus-within:relative focus-within:z-20"
                  ),
                  day: cn(
                    "h-8 w-8 p-0 font-normal aria-selected:opacity-100 rounded-md"
                  ),
                  month: "space-y-2",
                }}
                modifiers={{
                  'has-event': singleEventDays,
                  'has-multiple-events': multipleEventDays,
                }}
                formatters={{
                  // Используем обычный форматтер, который возвращает строку, чтобы избежать ошибки TypeScript
                  formatDay: (date) => format(date, 'd')
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Список встреч (основной контент страницы) */}
      <div className="space-y-6 pb-16">
        {apiError && (
          <div className="bg-red-50 p-3 rounded-md mb-4 text-sm text-red-600 flex items-start">
            <X className="h-5 w-5 mr-2 flex-shrink-0 text-red-500" />
            <p>{apiError}</p>
          </div>
        )}
        
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : events.length > 0 ? (
          <div className="space-y-12">
            {Array.from(groupedEvents.entries()).length > 0 ? (
              Array.from(groupedEvents.entries()).map(([dateStr, dayEvents]) => {
                const date = new Date(dateStr);
                const isToday = isSameDay(date, new Date());
                
                return (
                  <div 
                    key={dateStr} 
                    className="space-y-3" 
                    id={dateStr}
                    ref={(el) => (scrollRefs.current[dateStr] = el)}
                  >
                    {/* Заголовок с датой */}
                    <div className="sticky top-16 bg-background z-10 pt-2 pb-1 flex items-center border-b">
                      <h3 className="text-lg font-semibold">
                        {format(date, 'd MMMM yyyy', { locale: ru })}
                      </h3>
                      {isToday && (
                        <Badge variant="outline" className="ml-2 bg-accent text-accent-foreground">
                          Сегодня
                        </Badge>
                      )}
                      <Badge className="ml-2 bg-primary">
                        {dayEvents.length} {dayEvents.length === 1 ? 'встреча' : 
                          dayEvents.length < 5 ? 'встречи' : 'встреч'}
                      </Badge>
                    </div>
                    
                    {/* Список встреч на дату */}
                    <div className="space-y-3 pl-1">
                      {dayEvents.map((event) => (
                        <div 
                          key={event.id} 
                          className={cn(
                            "p-3 rounded-lg border shadow-sm",
                            event.status === 'completed' ? 'border-green-200 bg-green-50' : 
                            event.status === 'cancelled' ? 'border-red-200 bg-red-50' : 
                            'border-blue-200 bg-blue-50'
                          )}
                          style={{ borderLeftColor: event.color, borderLeftWidth: '4px' }}
                        >
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium">{event.title}</h3>
                            <Badge
                              variant={
                                event.status === 'completed' ? 'outline' : 
                                event.status === 'cancelled' ? 'destructive' : 
                                'default'
                              }
                              className={cn(
                                event.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 
                                event.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' : 
                                'bg-blue-500'
                              )}
                            >
                              {event.status === 'completed' ? (
                                <>
                                  <Check className="h-3 w-3 mr-1" /> Завершено
                                </>
                              ) : event.status === 'cancelled' ? (
                                <>
                                  <X className="h-3 w-3 mr-1" /> Отменено
                                </>
                              ) : (
                                'Запланировано'
                              )}
                            </Badge>
                          </div>
                          
                          <div className="mt-2 text-sm text-muted-foreground">
                            {event.description && (
                              <p className="mb-2">{event.description}</p>
                            )}
                            
                            <div className="flex items-center mt-1">
                              <Clock className="h-4 w-4 mr-1 flex-shrink-0" /> 
                              <span>
                                {format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')}
                              </span>
                            </div>
                            
                            {event.location && (
                              <div className="flex items-center mt-1">
                                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" /> 
                                <span>{event.location}</span>
                              </div>
                            )}
                            
                            {event.meetingType && event.meetingType !== 'in_person' && (
                              <div className="flex items-center mt-1">
                                <Video className="h-4 w-4 mr-1 flex-shrink-0" /> 
                                <span>
                                  {event.meetingType === 'google_meet' ? 'Google Meet' : 
                                   event.meetingType === 'zoom' ? 'Zoom' : 
                                   event.meetingType === 'teams' ? 'Microsoft Teams' : 
                                   event.meetingType === 'telemost' ? 'Телемост' : 
                                   'Онлайн-встреча'}
                                </span>
                                {event.meetingUrl && (
                                  <a 
                                    href={event.meetingUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="ml-2 text-primary hover:underline"
                                  >
                                    Подключиться
                                  </a>
                                )}
                              </div>
                            )}
                            
                            {event.participants && event.participants.length > 0 && (
                              <div className="flex items-center mt-1">
                                <Users className="h-4 w-4 mr-1 flex-shrink-0" /> 
                                <span className="break-words">{event.participants.join(', ')}</span>
                              </div>
                            )}
                            
                            {/* Индикатор для событий из трека адаптации */}
                            {event.stageId && (
                              <div className="mt-2 pt-2 border-t border-dashed border-gray-200 text-xs text-muted-foreground">
                                Связано с этапом адаптации
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <Filter className="h-12 w-12 mb-3 text-muted-foreground/50" />
                <p>Нет встреч, соответствующих выбранным фильтрам</p>
                <div className="mt-4">
                  {activeTab !== 'all' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setActiveTab('all')}
                    >
                      Показать все периоды
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
            <CalendarIcon className="h-12 w-12 mb-3 text-muted-foreground/50" />
            <p>Нет запланированных встреч</p>
            <p className="text-sm">Ваш график встреч пуст</p>
          </div>
        )}
      </div>
    </div>
  );
} 