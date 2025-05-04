
import React from "react";
import { BarChart3, LineChart, PieChart, Activity, Gauge, TrendingUp, Users, Package, Calendar, DollarSign } from "lucide-react";

export type WidgetType = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  supportedMetrics: string[];
  defaultHeight: number;
  defaultWidth: number;
};

export type MetricDefinition = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unit?: string;
  format?: string;
  category: string;
  color?: string;
};

// Доступные типы виджетов
export const WIDGET_TYPES: WidgetType[] = [
  {
    id: "line-chart",
    name: "Линейный график",
    description: "Показывает изменение метрики во времени",
    icon: <LineChart className="h-6 w-6" />,
    supportedMetrics: ["revenue", "bookings", "users", "visits", "tools_available"],
    defaultHeight: 2,
    defaultWidth: 3
  },
  {
    id: "bar-chart",
    name: "Столбчатый график",
    description: "Сравнение значений метрик за период",
    icon: <BarChart3 className="h-6 w-6" />,
    supportedMetrics: ["revenue", "bookings", "users", "visits", "bookings_by_status"],
    defaultHeight: 2,
    defaultWidth: 3
  },
  {
    id: "pie-chart",
    name: "Круговая диаграмма",
    description: "Показывает распределение значений",
    icon: <PieChart className="h-6 w-6" />,
    supportedMetrics: ["bookings_by_status", "tools_by_category", "revenue_by_category"],
    defaultHeight: 2,
    defaultWidth: 2
  },
  {
    id: "stat-card",
    name: "Карточка статистики",
    description: "Отображает одну ключевую метрику с индикатором тренда",
    icon: <Activity className="h-6 w-6" />,
    supportedMetrics: ["revenue", "bookings", "users", "tools", "avg_booking_value"],
    defaultHeight: 1,
    defaultWidth: 1
  },
  {
    id: "gauge",
    name: "Индикатор",
    description: "Показывает значение в диапазоне с цветовой индикацией",
    icon: <Gauge className="h-6 w-6" />,
    supportedMetrics: ["tools_availability", "booking_rate", "service_level", "user_satisfaction"],
    defaultHeight: 1,
    defaultWidth: 1
  }
];

// Доступные метрики для виджетов
export const AVAILABLE_METRICS: MetricDefinition[] = [
  {
    id: "revenue",
    name: "Выручка",
    description: "Общая выручка за выбранный период",
    icon: <DollarSign className="h-5 w-5" />,
    unit: "₽",
    format: "currency",
    category: "Финансы",
    color: "#22c55e"
  },
  {
    id: "bookings",
    name: "Бронирования",
    description: "Общее количество бронирований",
    icon: <Calendar className="h-5 w-5" />,
    format: "number",
    category: "Операции",
    color: "#3b82f6"
  },
  {
    id: "users",
    name: "Пользователи",
    description: "Количество активных пользователей",
    icon: <Users className="h-5 w-5" />,
    format: "number",
    category: "Аудитория",
    color: "#a855f7"
  },
  {
    id: "tools",
    name: "Инструменты",
    description: "Общее количество инструментов",
    icon: <Package className="h-5 w-5" />,
    format: "number",
    category: "Инвентарь",
    color: "#f97316"
  },
  {
    id: "tools_available",
    name: "Доступные инструменты",
    description: "Количество доступных для аренды инструментов",
    icon: <Package className="h-5 w-5" />,
    format: "number",
    category: "Инвентарь",
    color: "#84cc16"
  },
  {
    id: "bookings_by_status",
    name: "Бронирования по статусам",
    description: "Распределение бронирований по статусам",
    icon: <PieChart className="h-5 w-5" />,
    format: "percentage",
    category: "Операции",
    color: "#0ea5e9"
  },
  {
    id: "avg_booking_value",
    name: "Средняя стоимость бронирования",
    description: "Средняя стоимость одного бронирования",
    icon: <TrendingUp className="h-5 w-5" />,
    unit: "₽",
    format: "currency",
    category: "Финансы",
    color: "#f59e0b"
  },
  {
    id: "tools_availability",
    name: "Доступность инструментов",
    description: "Процент доступных инструментов от общего количества",
    icon: <Gauge className="h-5 w-5" />,
    format: "percentage",
    category: "Инвентарь",
    color: "#10b981"
  }
];

// Функция для получения типа виджета по ID
export const getWidgetTypeById = (typeId: string): WidgetType | undefined => {
  return WIDGET_TYPES.find(type => type.id === typeId);
};

// Функция для получения метрики по ID
export const getMetricById = (metricId: string): MetricDefinition | undefined => {
  return AVAILABLE_METRICS.find(metric => metric.id === metricId);
};

// Функция для фильтрации метрик, поддерживаемых данным типом виджета
export const getSupportedMetricsForWidgetType = (typeId: string): MetricDefinition[] => {
  const widgetType = getWidgetTypeById(typeId);
  if (!widgetType) return [];
  
  return AVAILABLE_METRICS.filter(metric => 
    widgetType.supportedMetrics.includes(metric.id)
  );
};
