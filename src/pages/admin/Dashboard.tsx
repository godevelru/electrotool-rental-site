
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { adminApi } from "@/lib/api";
import UserManagement from "./UserManagement";
import RevenueChart, { RevenueData } from "@/components/admin/RevenueChart";
import BookingsChart, { BookingData } from "@/components/admin/BookingsChart";
import { DateRange } from "react-day-picker";
import { DashboardPreferencesProvider, useDashboardPreferences } from "@/context/DashboardPreferencesContext";
import CustomizeDashboardDialog from "@/components/admin/CustomizeDashboardDialog";
import AlertRulesDialog from "@/components/admin/AlertRulesDialog";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  CalendarClock, 
  Settings, 
  LogOut,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
  Download,
  Bell,
  PanelLeftClose,
  Sliders
} from "lucide-react";

const DashboardContent = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { preferences } = useDashboardPreferences();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTools: 0,
    availableTools: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    canceledBookings: 0,
    revenue: {
      total: 0,
      thisMonth: 0,
      lastMonth: 0
    }
  });

  // Состояния для диалогов
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);

  // Состояния для периодов графиков (с учетом сохраненных предпочтений)
  const [revenuePeriod, setRevenuePeriod] = useState<string>(
    preferences.charts.revenue?.defaultPeriod || "month"
  );
  const [bookingsPeriod, setBookingsPeriod] = useState<string>(
    preferences.charts.bookings?.defaultPeriod || "month"
  );
  
  // Состояния для данных графиков
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [previousRevenueData, setPreviousRevenueData] = useState<RevenueData[]>([]);
  const [bookingsData, setBookingsData] = useState<BookingData[]>([]);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  
  // Состояния для сравнения и выбора диапазона (с учетом сохраненных предпочтений)
  const [isComparingRevenue, setIsComparingRevenue] = useState(
    preferences.charts.revenue?.defaultCompare || false
  );
  const [revenueDateRange, setRevenueDateRange] = useState<DateRange | undefined>();

  // Загрузка данных дашборда
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const summary = await adminApi.dashboard.getSummary();
        setStatsData(summary.data || {});
      } catch (error) {
        console.error("Ошибка при загрузке данных дашборда:", error);
        toast({
          title: "Ошибка загрузки данных",
          description: "Не удалось загрузить статистику. Пожалуйста, попробуйте позже.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === "overview") {
      fetchDashboardData();
    }
  }, [activeTab, toast]);

  // Периодическое обновление данных в соответствии с настройками
  useEffect(() => {
    if (preferences.refreshInterval <= 0 || activeTab !== "overview") return;
    
    const intervalId = setInterval(() => {
      adminApi.dashboard.getSummary()
        .then(summary => {
          setStatsData(summary.data || {});
        })
        .catch(error => {
          console.error("Ошибка при обновлении данных дашборда:", error);
        });
        
      // Обновляем данные графиков только если они видимы
      if (preferences.charts.revenue?.isVisible) {
        fetchRevenueData();
      }
      if (preferences.charts.bookings?.isVisible) {
        fetchBookingsData();
      }
    }, preferences.refreshInterval * 1000);
    
    return () => clearInterval(intervalId);
  }, [preferences.refreshInterval, activeTab, preferences.charts]);

  // Загрузка данных выручки при изменении периода или диапазона дат
  const fetchRevenueData = async () => {
    setRevenueLoading(true);
    try {
      // Параметры для запроса текущих данных
      const params: any = { period: revenuePeriod };
      
      // Если указан произвольный диапазон дат
      if (revenueDateRange?.from) {
        params.startDate = revenueDateRange.from.toISOString();
      }
      if (revenueDateRange?.to) {
        params.endDate = revenueDateRange.to.toISOString();
      }
      
      // Запрос текущих данных
      const response = await adminApi.dashboard.getRevenueStats(params);
      setRevenueData(response.data || []);
      
      // Если включено сравнение, запрашиваем данные за предыдущий период
      if (isComparingRevenue) {
        // Расчет параметров для предыдущего периода
        const prevParams = { ...params };
        
        // Логика определения предыдущего периода в зависимости от текущего
        if (revenueDateRange?.from && revenueDateRange?.to) {
          // Для произвольного диапазона: смещаем на такой же интервал назад
          const rangeInDays = Math.ceil((revenueDateRange.to.getTime() - revenueDateRange.from.getTime()) / (1000 * 60 * 60 * 24));
          const prevEndDate = new Date(revenueDateRange.from);
          prevEndDate.setDate(prevEndDate.getDate() - 1);
          
          const prevStartDate = new Date(prevEndDate);
          prevStartDate.setDate(prevStartDate.getDate() - rangeInDays);
          
          prevParams.startDate = prevStartDate.toISOString();
          prevParams.endDate = prevEndDate.toISOString();
        } else {
          // Для стандартных периодов: предыдущий аналогичный период
          prevParams.previousPeriod = true;
        }
        
        // Запрос данных за предыдущий период
        const prevResponse = await adminApi.dashboard.getRevenueStats(prevParams);
        setPreviousRevenueData(prevResponse.data || []);
      }
    } catch (error) {
      console.error("Ошибка при загрузке данных выручки:", error);
      toast({
        title: "Ошибка загрузки данных",
        description: "Не удалось загрузить статистику выручки. Пожалуйста, попробуйте позже.",
        variant: "destructive"
      });
    } finally {
      setRevenueLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "overview" && preferences.charts.revenue?.isVisible) {
      fetchRevenueData();
    }
  }, [revenuePeriod, revenueDateRange, isComparingRevenue, activeTab, preferences.charts.revenue?.isVisible]);

  // Загрузка данных бронирований при изменении периода
  const fetchBookingsData = async () => {
    setBookingsLoading(true);
    try {
      const response = await adminApi.dashboard.getBookingStats(bookingsPeriod as any);
      setBookingsData(response.data || []);
    } catch (error) {
      console.error("Ошибка при загрузке данных бронирований:", error);
      toast({
        title: "Ошибка загрузки данных",
        description: "Не удалось загрузить статистику бронирований. Пожалуйста, попробуйте позже.",
        variant: "destructive"
      });
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "overview" && preferences.charts.bookings?.isVisible) {
      fetchBookingsData();
    }
  }, [bookingsPeriod, activeTab, preferences.charts.bookings?.isVisible]);

  // Форматирование суммы в рубли
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Вычисление процентного изменения
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  };

  const revenueChange = calculateChange(statsData.revenue.thisMonth, statsData.revenue.lastMonth);

  // Обработчик изменения диапазона дат
  const handleRevenueDateRangeChange = (range: DateRange | undefined) => {
    setRevenueDateRange(range);
  };

  // Обработчик включения/выключения сравнения
  const handleCompareToggle = (compare: boolean) => {
    setIsComparingRevenue(compare);
  };

  // Экспорт полного отчета
  const exportFullReport = () => {
    try {
      // Формирование данных отчета
      const reportData = {
        generatedAt: new Date().toISOString(),
        summaryData: statsData,
        revenueData: revenueData,
        previousRevenueData: previousRevenueData,
        bookingsData: bookingsData
      };
      
      // Преобразование данных в JSON-строку
      const jsonString = JSON.stringify(reportData, null, 2);
      
      // Создание и скачивание файла
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `dashboard_report_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Отчет сформирован",
        description: "Полный отчет успешно сформирован и загружен"
      });
    } catch (error) {
      console.error("Ошибка при экспорте отчета:", error);
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось сформировать отчет. Пожалуйста, попробуйте позже.",
        variant: "destructive"
      });
    }
  };
  
  // Получаем отсортированные и отфильтрованные виджеты
  const visibleWidgets = preferences.widgets
    .filter(widget => widget.isVisible)
    .sort((a, b) => a.position - b.position);
  
  // Получаем графики с учетом настроек видимости и сортировки
  const getCharts = () => {
    const charts = [];
    
    if (preferences.charts.revenue?.isVisible) {
      charts.push({
        id: 'revenue',
        position: preferences.charts.revenue.position,
        component: (
          <RevenueChart
            key="revenue-chart"
            data={revenueData}
            title="Динамика выручки"
            description="Изменение выручки за выбранный период"
            period={revenuePeriod}
            onPeriodChange={setRevenuePeriod}
            loading={revenueLoading}
            currencySymbol="₽"
            onDateRangeChange={handleRevenueDateRangeChange}
            onCompareChange={handleCompareToggle}
            previousPeriodData={previousRevenueData}
            isComparing={isComparingRevenue}
          />
        )
      });
    }
    
    if (preferences.charts.bookings?.isVisible) {
      charts.push({
        id: 'bookings',
        position: preferences.charts.bookings.position,
        component: (
          <BookingsChart
            key="bookings-chart"
            data={bookingsData}
            title="Статистика бронирований"
            description="Распределение бронирований по статусам за выбранный период"
            period={bookingsPeriod}
            onPeriodChange={setBookingsPeriod}
            loading={bookingsLoading}
          />
        )
      });
    }
    
    return charts.sort((a, b) => a.position - b.position).map(chart => chart.component);
  };
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Боковая панель навигации */}
      <div className="hidden w-64 flex-shrink-0 border-r bg-white lg:block">
        <div className="flex h-16 items-center border-b px-6">
          <h2 className="text-lg font-bold text-primary">🛠️ Админ-панель</h2>
        </div>
        <div className="flex flex-col gap-1 p-4">
          <Button 
            variant={activeTab === "overview" ? "default" : "ghost"} 
            className="justify-start"
            onClick={() => setActiveTab("overview")}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Обзор
          </Button>
          <Button 
            variant={activeTab === "users" ? "default" : "ghost"} 
            className="justify-start"
            onClick={() => setActiveTab("users")}
          >
            <Users className="mr-2 h-4 w-4" />
            Пользователи
          </Button>
          <Button 
            variant={activeTab === "tools" ? "default" : "ghost"} 
            className="justify-start"
            onClick={() => setActiveTab("tools")}
          >
            <Package className="mr-2 h-4 w-4" />
            Инструменты
          </Button>
          <Button 
            variant={activeTab === "bookings" ? "default" : "ghost"} 
            className="justify-start"
            onClick={() => setActiveTab("bookings")}
          >
            <CalendarClock className="mr-2 h-4 w-4" />
            Бронирования
          </Button>
          <Button 
            variant={activeTab === "settings" ? "default" : "ghost"} 
            className="justify-start"
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="mr-2 h-4 w-4" />
            Настройки
          </Button>
          <hr className="my-2" />
          <Button 
            variant="ghost" 
            className="justify-start text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Выйти
          </Button>
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1 overflow-auto">
        {/* Верхняя панель */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-6">
          <h2 className="text-lg font-medium">
            {activeTab === "overview" && "Общая статистика"}
            {activeTab === "users" && "Управление пользователями"}
            {activeTab === "tools" && "Управление инструментами"}
            {activeTab === "bookings" && "Управление бронированиями"}
            {activeTab === "settings" && "Настройки"}
          </h2>
          <div className="flex items-center gap-2">
            {activeTab === "overview" && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setAlertsOpen(true)}
                  className="mr-1"
                >
                  <Bell className="mr-1 h-4 w-4" />
                  Оповещения
                  {preferences.alerts.filter(a => a.enabled).length > 0 && (
                    <span className="ml-1 rounded-full bg-primary text-white w-5 h-5 flex items-center justify-center text-xs">
                      {preferences.alerts.filter(a => a.enabled).length}
                    </span>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCustomizeOpen(true)}
                  className="mr-1"
                >
                  <Sliders className="mr-1 h-4 w-4" />
                  Настроить
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={exportFullReport}
                  className="mr-2"
                >
                  <Download className="mr-1 h-4 w-4" />
                  Экспорт
                </Button>
              </>
            )}
            <span className="text-sm text-muted-foreground">
              {user?.firstName} {user?.lastName}
            </span>
          </div>
        </header>

        {/* Контент дашборда */}
        <main className={`p-6 ${preferences.theme === 'dark' ? 'bg-gray-900 text-white' : ''}`}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            {/* Вкладка общего обзора */}
            <TabsContent value="overview" className="space-y-6">
              {loading ? (
                <div className="flex h-[400px] w-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Загрузка статистики...</span>
                </div>
              ) : (
                <>
                  <div className={`grid gap-4 ${preferences.layout === 'grid' ? 'md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'}`}>
                    {/* Карточка с выручкой */}
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Выручка за месяц</CardTitle>
                        <TrendingUp className="h-4 w-4 text-gray-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(statsData.revenue.thisMonth)}</div>
                        <div className="flex items-center pt-1 text-xs text-muted-foreground">
                          {revenueChange >= 0 ? (
                            <>
                              <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                              <span className="text-green-500">+{revenueChange.toFixed(1)}%</span>
                            </>
                          ) : (
                            <>
                              <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                              <span className="text-red-500">{revenueChange.toFixed(1)}%</span>
                            </>
                          )}
                          <span className="ml-1">по сравнению с прошлым месяцем</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Карточка с пользователями */}
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
                        <Users className="h-4 w-4 text-gray-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{statsData.totalUsers}</div>
                        <div className="pt-1 text-xs text-muted-foreground">
                          <span className="font-medium text-green-500">{statsData.activeUsers}</span> активных пользователей
                        </div>
                      </CardContent>
                    </Card>

                    {/* Карточка с инструментами */}
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Всего инструментов</CardTitle>
                        <Package className="h-4 w-4 text-gray-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{statsData.totalTools}</div>
                        <div className="pt-1 text-xs text-muted-foreground">
                          <span className="font-Я изучу ваш запрос о персонализации дашборда, включающей сохранение предпочтений пользователя, создание пользовательских виджетов и настраиваемых оповещений. Для начала мне нужно посмотреть текущую реализацию компонента Dashboard.tsx, чтобы разработать функциональность персонализации.Я реализую первую и наиболее важную часть персонализации дашборда - систему сохранения пользовательских настроек. Чтобы настройки были доступны во всем приложении, начнем с создания контекста для хранения и управления этими настройками.

<pp-write filepath="src/context/DashboardPreferencesContext.tsx">
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "@/components/ui/use-toast";

// Типы для настроек дашборда
export type WidgetSettings = {
  id: string;
  visible: boolean;
  position: number;
};

export type ChartSettings = {
  id: string;
  type: "line" | "bar" | "area" | "pie";
  visible: boolean;
  position: number;
  defaultPeriod: string;
  showComparison: boolean;
};

export type AlertSettings = {
  id: string;
  metric: string;
  condition: ">" | "<" | "=" | ">=" | "<=";
  threshold: number;
  enabled: boolean;
  notificationMethod: ("app" | "email" | "sms")[];
};

export type DashboardPreferences = {
  layout: "grid" | "list";
  theme: "light" | "dark" | "system";
  refreshInterval: number; // в секундах
  charts: Record<string, ChartSettings>;
  widgets: WidgetSettings[];
  alerts: AlertSettings[];
};

// Дефолтные настройки
const defaultPreferences: DashboardPreferences = {
  layout: "grid",
  theme: "light",
  refreshInterval: 300, // 5 минут
  charts: {
    revenue: {
      id: "revenue",
      type: "line",
      visible: true,
      position: 0,
      defaultPeriod: "month",
      showComparison: false
    },
    bookings: {
      id: "bookings",
      type: "bar",
      visible: true,
      position: 1,
      defaultPeriod: "month",
      showComparison: false
    }
  },
  widgets: [],
  alerts: []
};

// Тип контекста
type DashboardPreferencesContextType = {
  preferences: DashboardPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<DashboardPreferences>>;
  updateChartSettings: (chartId: string, settings: Partial<ChartSettings>) => void;
  addWidget: (widget: WidgetSettings) => void;
  updateWidget: (widgetId: string, settings: Partial<WidgetSettings>) => void;
  removeWidget: (widgetId: string) => void;
  addAlert: (alert: AlertSettings) => void;
  updateAlert: (alertId: string, settings: Partial<AlertSettings>) => void;
  removeAlert: (alertId: string) => void;
  savePreferences: () => Promise<void>;
  resetToDefaults: () => void;
  isLoading: boolean;
};

// Создание контекста
const DashboardPreferencesContext = createContext<DashboardPreferencesContextType | undefined>(undefined);

export const DashboardPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<DashboardPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка предпочтений пользователя из localStorage или API
  useEffect(() => {
    const loadPreferences = async () => {
      setIsLoading(true);
      try {
        // В реальном приложении здесь будет API-запрос
        const savedPrefs = localStorage.getItem(`dashboard_prefs_${user?.id}`);
        
        if (savedPrefs) {
          setPreferences(JSON.parse(savedPrefs));
        }
      } catch (error) {
        console.error("Ошибка загрузки настроек дашборда:", error);
        toast({
          title: "Ошибка загрузки настроек",
          description: "Будут использованы настройки по умолчанию",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadPreferences();
    }
  }, [user, toast]);

  // Сохранение настроек
  const savePreferences = async () => {
    setIsLoading(true);
    try {
      // В реальном приложении здесь будет API-запрос
      localStorage.setItem(`dashboard_prefs_${user?.id}`, JSON.stringify(preferences));
      
      toast({
        title: "Настройки сохранены",
        description: "Ваши предпочтения успешно сохранены",
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error("Ошибка сохранения настроек дашборда:", error);
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить настройки дашборда",
        variant: "destructive"
      });
      
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Обновление настроек графика
  const updateChartSettings = (chartId: string, settings: Partial<ChartSettings>) => {
    setPreferences(prev => {
      const chart = prev.charts[chartId];
      if (!chart) return prev;

      return {
        ...prev,
        charts: {
          ...prev.charts,
          [chartId]: {
            ...chart,
            ...settings
          }
        }
      };
    });
  };

  // Добавление виджета
  const addWidget = (widget: WidgetSettings) => {
    setPreferences(prev => ({
      ...prev,
      widgets: [...prev.widgets, widget]
    }));
  };

  // Обновление виджета
  const updateWidget = (widgetId: string, settings: Partial<WidgetSettings>) => {
    setPreferences(prev => ({
      ...prev,
      widgets: prev.widgets.map(widget => 
        widget.id === widgetId ? { ...widget, ...settings } : widget
      )
    }));
  };

  // Удаление виджета
  const removeWidget = (widgetId: string) => {
    setPreferences(prev => ({
      ...prev,
      widgets: prev.widgets.filter(widget => widget.id !== widgetId)
    }));
  };

  // Добавление оповещения
  const addAlert = (alert: AlertSettings) => {
    setPreferences(prev => ({
      ...prev,
      alerts: [...prev.alerts, alert]
    }));
  };

  // Обновление оповещения
  const updateAlert = (alertId: string, settings: Partial<AlertSettings>) => {
    setPreferences(prev => ({
      ...prev,
      alerts: prev.alerts.map(alert => 
        alert.id === alertId ? { ...alert, ...settings } : alert
      )
    }));
  };

  // Удаление оповещения
  const removeAlert = (alertId: string) => {
    setPreferences(prev => ({
      ...prev,
      alerts: prev.alerts.filter(alert => alert.id !== alertId)
    }));
  };

  // Сброс настроек к значениям по умолчанию
  const resetToDefaults = () => {
    setPreferences(defaultPreferences);
  };

  return (
    <DashboardPreferencesContext.Provider 
      value={{
        preferences,
        setPreferences,
        updateChartSettings,
        addWidget,
        updateWidget,
        removeWidget,
        addAlert,
        updateAlert,
        removeAlert,
        savePreferences,
        resetToDefaults,
        isLoading
      }}
    >
      {children}
    </DashboardPreferencesContext.Provider>
  );
};

// Хук для использования контекста
export const useDashboardPreferences = () => {
  const context = useContext(DashboardPreferencesContext);
  if (context === undefined) {
    throw new Error("useDashboardPreferences must be used within a DashboardPreferencesProvider");
  }
  return context;
};
