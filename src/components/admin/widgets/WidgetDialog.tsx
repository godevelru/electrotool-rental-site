
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useDashboardPreferences, WidgetPreference } from "@/context/DashboardPreferencesContext";
import { WIDGET_TYPES, AVAILABLE_METRICS, getSupportedMetricsForWidgetType } from "./WidgetTypes";
import { v4 as uuidv4 } from "uuid";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

type WidgetDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingWidget?: WidgetPreference | null;
};

const WidgetDialog: React.FC<WidgetDialogProps> = ({ 
  open, 
  onOpenChange,
  editingWidget = null 
}) => {
  const { saveWidget, preferences } = useDashboardPreferences();
  const [activeTab, setActiveTab] = useState("type");
  const [title, setTitle] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [refreshRate, setRefreshRate] = useState("300");
  const [showComparison, setShowComparison] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Загрузка данных редактируемого виджета
  useEffect(() => {
    if (editingWidget) {
      setTitle(editingWidget.title);
      setSelectedType(editingWidget.type);
      setSelectedMetrics(editingWidget.metricKeys);
      setRefreshRate(editingWidget.settings.refreshRate?.toString() || "300");
      setShowComparison(editingWidget.settings.showComparison || false);
      setSelectedPeriod(editingWidget.settings.period || "month");
      
      // Если это редактирование, начинаем с вкладки данных
      setActiveTab("data");
    } else {
      // Сбрасываем значения для нового виджета
      setTitle("");
      setSelectedType("");
      setSelectedMetrics([]);
      setRefreshRate("300");
      setShowComparison(false);
      setSelectedPeriod("month");
      setActiveTab("type");
    }
  }, [editingWidget, open]);
  
  // Вычисляем поддерживаемые метрики для выбранного типа
  const supportedMetrics = getSupportedMetricsForWidgetType(selectedType);
  
  // Проверка валидности данных для перехода к следующему шагу
  const canGoToNextStep = () => {
    if (activeTab === "type") {
      return !!selectedType;
    }
    if (activeTab === "data") {
      return selectedMetrics.length > 0;
    }
    if (activeTab === "display") {
      return !!title;
    }
    return true;
  };
  
  // Переход к следующему шагу
  const goToNextStep = () => {
    if (activeTab === "type") {
      setActiveTab("data");
    } else if (activeTab === "data") {
      setActiveTab("display");
    } else if (activeTab === "display") {
      handleSave();
    }
  };
  
  // Переход к предыдущему шагу
  const goToPreviousStep = () => {
    if (activeTab === "data") {
      setActiveTab("type");
    } else if (activeTab === "display") {
      setActiveTab("data");
    }
  };
  
  // Обработчик выбора типа виджета
  const handleTypeSelect = (typeId: string) => {
    if (typeId !== selectedType) {
      setSelectedType(typeId);
      
      // Сбрасываем метрики, если они больше не поддерживаются
      const newSupportedMetrics = getSupportedMetricsForWidgetType(typeId);
      const supportedMetricIds = newSupportedMetrics.map(m => m.id);
      setSelectedMetrics(prevMetrics => 
        prevMetrics.filter(id => supportedMetricIds.includes(id))
      );
    }
  };
  
  // Обработчик выбора/отмены метрики
  const toggleMetric = (metricId: string) => {
    setSelectedMetrics(prev => {
      if (prev.includes(metricId)) {
        return prev.filter(id => id !== metricId);
      } else {
        return [...prev, metricId];
      }
    });
  };
  
  // Сохранение виджета
  const handleSave = async () => {
    setIsSubmitting(true);
    
    try {
      const widget: WidgetPreference = {
        id: editingWidget?.id || uuidv4(),
        type: selectedType,
        title: title,
        isVisible: true,
        position: editingWidget?.position || preferences.widgets.length,
        metricKeys: selectedMetrics,
        settings: {
          refreshRate: parseInt(refreshRate),
          showComparison,
          period: selectedPeriod
        }
      };
      
      await saveWidget(widget);
      onOpenChange(false);
    } catch (error) {
      console.error("Ошибка при сохранении виджета:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {editingWidget ? `Редактирование виджета: ${editingWidget.title}` : "Создание нового виджета"}
          </DialogTitle>
          <DialogDescription>
            Настройте виджет для отображения важных для вас метрик на дашборде
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="type">1. Тип виджета</TabsTrigger>
            <TabsTrigger value="data">2. Данные</TabsTrigger>
            <TabsTrigger value="display">3. Отображение</TabsTrigger>
          </TabsList>
          
          {/* Шаг 1: Выбор типа виджета */}
          <TabsContent value="type" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {WIDGET_TYPES.map(type => (
                <Card 
                  key={type.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedType === type.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleTypeSelect(type.id)}
                >
                  <CardContent className="p-4 flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      selectedType === type.id ? 'bg-primary text-white' : 'bg-muted'
                    }`}>
                      {type.icon}
                    </div>
                    <div className="font-medium text-center">{type.name}</div>
                    <p className="text-sm text-muted-foreground text-center mt-1">
                      {type.description}
                    </p>
                    
                    {selectedType === type.id && (
                      <div className="mt-2 text-primary-500 flex items-center">
                        <Check className="mr-1 h-4 w-4" />
                        <span className="text-sm">Выбрано</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Шаг 2: Выбор данных для виджета */}
          <TabsContent value="data" className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Выберите метрики для отслеживания</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Выберите от 1 до 3 метрик, которые будут отображаться на виджете.
                Доступные метрики зависят от выбранного типа виджета.
              </p>
              
              {supportedMetrics.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {supportedMetrics.map(metric => (
                    <div 
                      key={metric.id} 
                      className={`p-3 border rounded-md cursor-pointer flex items-center ${
                        selectedMetrics.includes(metric.id) 
                          ? 'bg-primary/10 border-primary' 
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => toggleMetric(metric.id)}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3`}
                        style={{ backgroundColor: metric.color + '20', color: metric.color }}
                      >
                        {metric.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{metric.name}</div>
                        <div className="text-xs text-muted-foreground">{metric.description}</div>
                      </div>
                      <div className="ml-2">
                        <div className={`w-5 h-5 rounded-full border ${
                          selectedMetrics.includes(metric.id) 
                            ? 'bg-primary border-primary text-white' 
                            : 'border-gray-300'
                        } flex items-center justify-center`}>
                          {selectedMetrics.includes(metric.id) && <Check className="h-3 w-3" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border rounded-md bg-muted/20">
                  <p>Для выбранного типа виджета нет доступных метрик.</p>
                  <Button 
                    variant="link" 
                    onClick={() => setActiveTab("type")}
                    className="mt-2"
                  >
                    Вернуться к выбору типа
                  </Button>
                </div>
              )}
            </div>
            
            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="period-select">Период данных</Label>
                <Select 
                  id="period-select"
                  value={selectedPeriod} 
                  onValueChange={setSelectedPeriod}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Выберите период" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">День</SelectItem>
                    <SelectItem value="week">Неделя</SelectItem>
                    <SelectItem value="month">Месяц</SelectItem>
                    <SelectItem value="quarter">Квартал</SelectItem>
                    <SelectItem value="year">Год</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="compare-switch"
                  checked={showComparison}
                  onCheckedChange={setShowComparison}
                />
                <Label htmlFor="compare-switch">Показывать сравнение с предыдущим периодом</Label>
              </div>
            </div>
          </TabsContent>
          
          {/* Шаг 3: Настройка отображения */}
          <TabsContent value="display" className="space-y-6">
            <div>
              <Label htmlFor="widget-title">Название виджета</Label>
              <Input
                id="widget-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Введите название виджета"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="refresh-rate">Частота обновления данных</Label>
              <Select 
                id="refresh-rate"
                value={refreshRate} 
                onValueChange={setRefreshRate}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Выберите частоту обновления" />
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
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-6 flex justify-between">
          {activeTab !== "type" ? (
            <Button 
              variant="outline" 
              onClick={goToPreviousStep}
              disabled={isSubmitting}
            >
              Назад
            </Button>
          ) : (
            <div></div>
          )}
          
          <div>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="mr-2"
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button 
              onClick={goToNextStep}
              disabled={!canGoToNextStep() || isSubmitting}
            >
              {activeTab === "display" ? 
                (editingWidget ? "Сохранить" : "Создать виджет") : 
                "Далее"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WidgetDialog;
