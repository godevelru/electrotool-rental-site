
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboardPreferences, ChartSettings } from "@/context/DashboardPreferencesContext";
import { ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";

type PreferencesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const PreferencesDialog: React.FC<PreferencesDialogProps> = ({ open, onOpenChange }) => {
  const { 
    preferences, 
    updateChartSettings, 
    setPreferences, 
    savePreferences, 
    resetToDefaults, 
    isLoading 
  } = useDashboardPreferences();

  const [activeTab, setActiveTab] = useState("general");

  // Сохранение изменений
  const handleSave = async () => {
    try {
      await savePreferences();
      onOpenChange(false);
    } catch (error) {
      console.error("Ошибка при сохранении настроек:", error);
    }
  };

  // Обработчик сброса настроек
  const handleReset = () => {
    if (window.confirm("Вы уверены, что хотите сбросить все настройки дашборда?")) {
      resetToDefaults();
    }
  };

  // Изменение расположения
  const handleLayoutChange = (value: string) => {
    setPreferences(prev => ({
      ...prev,
      layout: value as "grid" | "list"
    }));
  };

  // Изменение темы
  const handleThemeChange = (value: string) => {
    setPreferences(prev => ({
      ...prev,
      theme: value as "light" | "dark" | "system"
    }));
  };

  // Изменение интервала обновления
  const handleRefreshIntervalChange = (value: string) => {
    setPreferences(prev => ({
      ...prev,
      refreshInterval: parseInt(value)
    }));
  };

  // Переключение видимости графика
  const toggleChartVisibility = (chartId: string) => {
    const chart = preferences.charts[chartId];
    if (chart) {
      updateChartSettings(chartId, { visible: !chart.visible });
    }
  };

  // Изменение типа графика
  const changeChartType = (chartId: string, type: ChartSettings["type"]) => {
    updateChartSettings(chartId, { type });
  };

  // Изменение позиции графика (вверх/вниз)
  const moveChart = (chartId: string, direction: 'up' | 'down') => {
    const charts = Object.entries(preferences.charts)
      .sort(([, a], [, b]) => a.position - b.position);
    
    const index = charts.findIndex(([id]) => id === chartId);
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === charts.length - 1)) {
      return;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const targetChartId = charts[targetIndex][0];
    
    const currentPos = preferences.charts[chartId].position;
    const targetPos = preferences.charts[targetChartId].position;
    
    updateChartSettings(chartId, { position: targetPos });
    updateChartSettings(targetChartId, { position: currentPos });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Настройка дашборда</DialogTitle>
          <DialogDescription>
            Настройте внешний вид и функциональность вашего дашборда
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">Общие настройки</TabsTrigger>
            <TabsTrigger value="charts">Графики</TabsTrigger>
          </TabsList>
          
          {/* Общие настройки */}
          <TabsContent value="general" className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="layout-select">Расположение элементов</Label>
                  <Select 
                    id="layout-select"
                    value={preferences.layout} 
                    onValueChange={handleLayoutChange}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Выбрать расположение" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Сетка</SelectItem>
                      <SelectItem value="list">Список</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Определяет, как будут расположены карточки на дашборде
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="theme-select">Цветовая тема</Label>
                  <Select 
                    id="theme-select"
                    value={preferences.theme} 
                    onValueChange={handleThemeChange}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Выбрать тему" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Светлая</SelectItem>
                      <SelectItem value="dark">Темная</SelectItem>
                      <SelectItem value="system">Системная</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Определяет цветовую схему интерфейса
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="refresh-select">Интервал обновления данных</Label>
              <Select 
                id="refresh-select"
                value={preferences.refreshInterval.toString()} 
                onValueChange={handleRefreshIntervalChange}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Выбрать интервал" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Не обновлять автоматически</SelectItem>
                  <SelectItem value="60">Каждую минуту</SelectItem>
                  <SelectItem value="300">Каждые 5 минут</SelectItem>
                  <SelectItem value="600">Каждые 10 минут</SelectItem>
                  <SelectItem value="1800">Каждые 30 минут</SelectItem>
                  <SelectItem value="3600">Каждый час</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Определяет, как часто данные будут автоматически обновляться
              </p>
            </div>
          </TabsContent>
          
          {/* Настройки графиков */}
          <TabsContent value="charts" className="py-4">
            <div className="space-y-4">
              {Object.entries(preferences.charts)
                .sort(([, a], [, b]) => a.position - b.position)
                .map(([chartId, chart]) => (
                  <div 
                    key={chartId} 
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col">
                        <button 
                          onClick={() => moveChart(chartId, 'up')}
                          className="text-gray-500 hover:text-gray-700"
                          aria-label="Переместить вверх"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button 
                          onClick={() => moveChart(chartId, 'down')}
                          className="text-gray-500 hover:text-gray-700"
                          aria-label="Переместить вниз"
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>
                      <div>
                        <div className="font-medium">
                          {chartId === 'revenue' && 'Динамика выручки'}
                          {chartId === 'bookings' && 'Статистика бронирований'}
                          {chartId !== 'revenue' && chartId !== 'bookings' && chartId}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {chart.type === 'line' && 'Линейный график'}
                          {chart.type === 'bar' && 'Столбчатый график'}
                          {chart.type === 'area' && 'График с областью'}
                          {chart.type === 'pie' && 'Круговая диаграмма'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Select 
                        value={chart.type} 
                        onValueChange={(value) => changeChartType(chartId, value as ChartSettings["type"])}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Тип графика" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="line">Линейный</SelectItem>
                          <SelectItem value="bar">Столбчатый</SelectItem>
                          <SelectItem value="area">Область</SelectItem>
                          <SelectItem value="pie">Круговой</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <button
                        onClick={() => toggleChartVisibility(chartId)}
                        className="p-1 rounded-md hover:bg-gray-100"
                        title={chart.visible ? "Скрыть график" : "Показать график"}
                        aria-label={chart.visible ? "Скрыть график" : "Показать график"}
                      >
                        {chart.visible ? 
                          <Eye size={20} className="text-primary" /> : 
                          <EyeOff size={20} className="text-gray-400" />
                        }
                      </button>
                      
                      <div className="flex flex-col">
                        <Label htmlFor={`show-comparison-${chartId}`} className="text-xs">
                          Сравнение
                        </Label>
                        <Switch 
                          id={`show-comparison-${chartId}`}
                          checked={chart.showComparison}
                          onCheckedChange={(checked) => 
                            updateChartSettings(chartId, { showComparison: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-6">
          <Button 
            variant="outline" 
            onClick={handleReset} 
            disabled={isLoading}
          >
            Сбросить настройки
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
          >
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PreferencesDialog;
