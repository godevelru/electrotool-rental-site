
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { adminApi } from "@/lib/api";
import UserManagement from "./UserManagement";
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
  Loader2
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

                  {/* Статистика по бронированиям */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Статистика бронирований</CardTitle>
                      <CardDescription>
                        Распределение бронирований по статусам за последний месяц
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

                  {/* Заглушка для графика или дополнительной статистики */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Выручка за последние 6 месяцев</CardTitle>
                      <CardDescription>
                        Тенденция изменения выручки
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-80 w-full">
                      <div className="flex h-full w-full items-center justify-center rounded-md border border-dashed p-8">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">
                            Здесь будет график выручки (компонент в разработке)
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Вкладка управления пользователями */}
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>

            {/* Заглушки для остальных вкладок */}
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
