
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, ChevronUp, Grip, Eye, EyeOff, Lock, Unlock } from "lucide-react";
import { useDashboardPreferences, ChartPreference, WidgetPreference } from "@/context/DashboardPreferencesContext";

type CustomizeDashboardDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const CustomizeDashboardDialog: React.FC<CustomizeDashboardDialogProps> = ({ open, onOpenChange }) => {
  const { preferences, updateChartPreference, savePreferences, resetToDefaults } = useDashboardPreferences();
  const [activeTab, setActiveTab] = useState("layout");
  
  // Обработчик сохранения изменений
  const handleSave = async () => {
    await savePreferences();
    onOpenChange(false);
  };
  
  // Обработчик дефолтных настроек
  const handleResetToDefaults = async () => {
    if (confirm("Вы уверены, что хотите сбросить все настройки дашборда к значениям по умолчанию?")) {
      await resetToDefaults();
    }
  };
  
  // Функция для обновления видимости графика
  const toggleChartVisibility = async (chartId: string) => {
    const chart = preferences.charts[chartId];
    if (chart) {
      await updateChartPreference(chartId, { isVisible: !chart.isVisible });
    }
  };
  
  // Функция для обновления закрепления графика
  const toggleChartPin = async (chartId: string) => {
    const chart = preferences.charts[chartId];
    if (chart) {
      await updateChartPreference(chartId, { isPinned: !chart.isPinned });
    }
  };
  
  // Функция для обновления типа графика
  const updateChartType = async (chartId: string, chartType: string) => {
    await updateChartPreference(chartId, { chartType });
  };
  
  // Функция для изменения позиции графика
  const moveChart = async (chartId: string, direction: 'up' | 'down') => {
    const chart = preferences.charts[chartId];
    if (!chart) return;
    
    const chartEntries = Object.entries(preferences.charts);
    const sortedCharts = chartEntries.sort(([, a], [, b]) => a.position - b.position);
    const currentIndex = sortedCharts.findIndex(([id]) => id === chartId);
    
    if (direction === 'up' && currentIndex > 0) {
      const targetChart = sortedCharts[currentIndex - 1][1];
      await updateChartPreference(chartId, { position: targetChart.position });
      await updateChartPreference(sortedCharts[currentIndex - 1][0], { position: chart.position });
    } else if (direction === 'down' && currentIndex < sortedCharts.length - 1) {
      const targetChart = sortedCharts[currentIndex + 1][1];
      await updateChartPreference(chartId, { position: targetChart.position });
      await updateChartPreference(sortedCharts[currentIndex + 1][0], { position: chart.position });
    }
  };
  
  // Готовим графики для отображения, сортированные по позиции
  const chartsArray = Object.entries(preferences.charts)
    .map(([id, chart]) => ({ id, ...chart }))
    .sort((a, b) => a.position - b.position);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Настройка дашборда</DialogTitle>
          <DialogDescription>
            Настройте ваш дашборд. Изменения будут сохранены автоматически.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="layout">Внешний вид</TabsTrigger>
            <TabsTrigger value="charts">Графики</TabsTrigger>
            <TabsTrigger value="widgets">Виджеты</TabsTrigger>
          </TabsList>
          
          {/* Вкладка настройки внешнего вида */}
          <TabsContent value="layout" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Тип расположения</h3>
                  <Select 
                    value={preferences.layout} 
                    onValueChange={(value) => {
                      useDashboardPreferences().setPreferences(prev => ({
                        ...prev, 
                        layout: value as "grid" | "list"
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип расположения" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Сетка</SelectItem>
                      <SelectItem value="list">Список</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Цветовая тема</h3>
                  <Select 
                    value={preferences.theme} 
                    onValueChange={(value) => {
                      useDashboardPreferences().setPreferences(prev => ({
                        ...prev, 
                        theme: value as "light" | "dark" | "system"
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тему" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Светлая</SelectItem>
                      <SelectItem value="dark">Темная</SelectItem>
                      <SelectItem value="system">Системная</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Интервал обновления данных (сек)</h3>
                  <Select 
                    value={preferences.refreshInterval.toString()} 
                    onValueChange={(value) => {
                      useDashboardPreferences().setPreferences(prev => ({
                        ...prev, 
                        refreshInterval: parseInt(value)
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите интервал" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Отключено</SelectItem>
                      <SelectItem value="60">1 минута</SelectItem>
                      <SelectItem value="300">5 минут</SelectItem>
                      <SelectItem value="600">10 минут</SelectItem>
                      <SelectItem value="1800">30 минут</SelectItem>
                      <SelectItem value="3600">1 час</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Вкладка настройки графиков */}
          <TabsContent value="charts" className="space-y-4">
            <div className="border rounded-md">
              {chartsArray.map((chart) => (
                <div 
                  key={chart.id} 
                  className="flex items-center justify-between p-4 border-b last:border-b-0"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center">
                        <ChevronUp 
                          className="h-4 w-4 cursor-pointer text-gray-500 hover:text-gray-900"
                          onClick={() => moveChart(chart.id, 'up')}
                        />
                        <ChevronDown 
                          className="h-4 w-4 cursor-pointer text-gray-500 hover:text-gray-900"
                          onClick={() => moveChart(chart.id, 'down')}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium">
                        {chart.id === 'revenue' && 'Динамика выручки'}
                        {chart.id === 'bookings' && 'Статистика бронирований'}
                        {chart.id !== 'revenue' && chart.id !== 'bookings' && chart.id}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Select 
                      value={chart.chartType} 
                      onValueChange={(value) => updateChartType(chart.id, value)}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Тип графика" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="line">Линейный</SelectItem>
                        <SelectItem value="bar">Столбчатый</SelectItem>
                        <SelectItem value="area">Область</SelectItem>
                        <SelectItem value="pie">Круговой</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div 
                      className="cursor-pointer" 
                      onClick={() => toggleChartPin(chart.id)}
                      title={chart.isPinned ? "Открепить" : "Закрепить"}
                    >
                      {chart.isPinned ? 
                        <Lock className="h-5 w-5 text-amber-500" /> : 
                        <Unlock className="h-5 w-5 text-gray-400" />
                      }
                    </div>
                    
                    <div 
                      className="cursor-pointer" 
                      onClick={() => toggleChartVisibility(chart.id)}
                      title={chart.isVisible ? "Скрыть" : "Показать"}
                    >
                      {chart.isVisible ? 
                        <Eye className="h-5 w-5 text-gray-700" /> : 
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          {/* Вкладка настройки виджетов */}
          <TabsContent value="widgets" className="space-y-4">
            <div className="text-center p-6 bg-gray-50 rounded-md">
              <p className="text-gray-500">
                Создавайте и настраивайте пользовательские виджеты для отображения важных метрик.
                Используйте кнопку ниже для добавления нового виджета.
              </p>
              <Button className="mt-4" variant="outline" onClick={() => {}}>
                Добавить виджет
              </Button>
            </div>
            
            {preferences.widgets.length > 0 ? (
              <div className="border rounded-md">
                {preferences.widgets.map((widget) => (
                  <div 
                    key={widget.id} 
                    className="flex items-center justify-between p-4 border-b last:border-b-0"
                  >
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{widget.title}</p>
                        <p className="text-sm text-gray-500">{widget.type}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost">Изменить</Button>
                      <Button size="sm" variant="ghost" className="text-red-500">Удалить</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 mt-4">
                У вас еще нет настроенных виджетов.
              </p>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={handleResetToDefaults}>
            Сбросить настройки
          </Button>
          <Button onClick={handleSave}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomizeDashboardDialog;
