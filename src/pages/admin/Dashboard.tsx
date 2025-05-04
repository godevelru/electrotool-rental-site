
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
  Download
} from "lucide-react";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
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

  // Состояния для периодов графиков
  const [revenuePeriod, setRevenuePeriod] = useState<string>("month");
  const [bookingsPeriod, setBookingsPeriod] = useState<string>("month");
  
  // Состояния для данных графиков
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [previousRevenueData, setPreviousRevenueData] = useState<RevenueData[]>([]);
  const [bookingsData, setBookingsData] = useState<BookingData[]>([]);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  
  // Состояния для сравнения и выбора диапазона
  const [isComparingRevenue, setIsComparingRevenue] = useState(false);
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

  // Загрузка данных выручки при изменении периода или диапазона дат
  useEffect(() => {
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

    if (activeTab === "overview") {
      fetchRevenueData();
    }
  }, [revenuePeriod, revenueDateRange, isComparingRevenue, activeTab, toast]);

  // Загрузка данных бронирований при изменении периода
  useEffect(() => {
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

    if (activeTab === "overview") {
      fetchBookingsData();
    }
  }, [bookingsPeriod, activeTab, toast]);

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
          <div className="flex items-center gap-4">
            {activeTab === "overview" && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportFullReport}
                className="mr-2"
              >
                <Download className="mr-2 h-4 w-4" />
                Экспорт отчета
              </Button>
            )}
            <span className="text-sm text-muted-foreground">
              {user?.firstName} {user?.lastName}
            </span>
          </div>
        </header>

        {/* Контент дашборда */}
        <main className="p-6">
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
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                          <span className="font-medium text-green-500">{statsData.availableTools}</span> доступно для аренды
                        </div>
                      </CardContent>
                    </Card>

                    {/* Карточка с бронированиями */}
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Всего бронирований</CardTitle>
                        <CalendarClock className="h-4 w-4 text-gray-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{statsData.totalBookings}</div>
                        <div className="pt-1 text-xs text-muted-foreground">
                          <span className="font-medium text-amber-500">{statsData.pendingBookings}</span> ожидают подтверждения
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* График выручки */}
                  <RevenueChart
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

                  {/* График бронирований */}
                  <BookingsChart
                    data={bookingsData}
                    title="Статистика бронирований"
                    description="Распределение бронирований по статусам за выбранный период"
                    period={bookingsPeriod}
                    onPeriodChange={setBookingsPeriod}
                    loading={bookingsLoading}
                  />

                  {/* Статистика по бронированиям */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Сводка по бронированиям</CardTitle>
                      <CardDescription>
                        Текущее состояние бронирований в системе
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <div className="flex items-center">
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">Завершено</span>
                          </div>
                          <div className="ml-auto font-medium">{statsData.completedBookings}</div>
                        </div>
                        <div className="flex items-center">
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-amber-500" />
                            <span className="text-sm font-medium">Ожидает</span>
                          </div>
                          <div className="ml-auto font-medium">{statsData.pendingBookings}</div>
                        </div>
                        <div className="flex items-center">
                          <div className="flex items-center">
                            <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                            <span className="text-sm font-medium">Отменено</span>
                          </div>
                          <div className="ml-auto font-medium">{statsData.canceledBookings}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Остальные вкладки остаются без изменений */}
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>

            <TabsContent value="tools" className="h-[400px] rounded-md border p-6">
              <div className="flex h-full flex-col items-center justify-center">
                <Package className="h-10 w-10 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">Управление инструментами</h3>
                <p className="mt-2 text-center text-sm text-gray-500">
                  Здесь будет список инструментов с возможностью добавления,
                  <br />
                  редактирования и удаления. Этот раздел находится в разработке.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="bookings" className="h-[400px] rounded-md border p-6">
              <div className="flex h-full flex-col items-center justify-center">
                <CalendarClock className="h-10 w-10 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">Управление бронированиями</h3>
                <p className="mt-2 text-center text-sm text-gray-500">
                  Здесь будет список бронирований с возможностью их подтверждения,
                  <br />
                  отклонения и просмотра деталей. Этот раздел находится в разработке.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="h-[400px] rounded-md border p-6">
              <div className="flex h-full flex-col items-center justify-center">
                <Settings className="h-10 w-10 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">Настройки</h3>
                <p className="mt-2 text-center text-sm text-gray-500">
                  Здесь будут общие настройки для администратора.
                  <br />
                  Этот раздел находится в разработке.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
