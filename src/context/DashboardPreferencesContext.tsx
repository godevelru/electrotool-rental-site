
import React, { createContext, useContext, useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { useAuth } from "./AuthContext";

// Типы для настроек дашборда
export type ChartPreference = {
  id: string;
  chartType: string;
  isPinned: boolean;
  isVisible: boolean;
  position: number;
  defaultPeriod: string;
  defaultCompare: boolean;
};

export type WidgetPreference = {
  id: string;
  type: string;
  title: string;
  isVisible: boolean;
  position: number;
  metricKeys: string[];
  settings: Record<string, any>;
};

export type AlertRule = {
  id: string;
  name: string;
  metric: string;
  condition: "gt" | "lt" | "eq" | "gte" | "lte";
  threshold: number;
  timeframeHours: number;
  enabled: boolean;
  notificationChannels: ("email" | "sms" | "app")[];
  lastTriggered?: string;
};

export type DashboardPreferences = {
  layout: "grid" | "list";
  theme: "light" | "dark" | "system";
  charts: Record<string, ChartPreference>;
  widgets: WidgetPreference[];
  alerts: AlertRule[];
  refreshInterval: number;
};

type DashboardPreferencesContextType = {
  preferences: DashboardPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<DashboardPreferences>>;
  updateChartPreference: (chartId: string, updates: Partial<ChartPreference>) => Promise<void>;
  saveWidget: (widget: WidgetPreference) => Promise<void>;
  deleteWidget: (widgetId: string) => Promise<void>;
  saveAlertRule: (rule: AlertRule) => Promise<void>;
  deleteAlertRule: (ruleId: string) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  savePreferences: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

// Дефолтные настройки
const defaultPreferences: DashboardPreferences = {
  layout: "grid",
  theme: "light",
  charts: {
    revenue: {
      id: "revenue",
      chartType: "line",
      isPinned: true,
      isVisible: true,
      position: 0,
      defaultPeriod: "month",
      defaultCompare: false
    },
    bookings: {
      id: "bookings",
      chartType: "bar",
      isPinned: true,
      isVisible: true,
      position: 1,
      defaultPeriod: "month",
      defaultCompare: false
    }
  },
  widgets: [],
  alerts: [],
  refreshInterval: 300
};

// Создание контекста
const DashboardPreferencesContext = createContext<DashboardPreferencesContextType | undefined>(undefined);

export const DashboardPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<DashboardPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка предпочтений пользователя
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await adminApi.preferences.getDashboardPreferences();
        
        if (response.data) {
          setPreferences(response.data);
        } else {
          // Если предпочтений еще нет, используем дефолтные
          setPreferences(defaultPreferences);
        }
      } catch (err) {
        console.error("Ошибка при загрузке предпочтений:", err);
        setError("Не удалось загрузить настройки дашборда");
        // В случае ошибки используем дефолтные настройки
        setPreferences(defaultPreferences);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  // Сохранение всех предпочтений
  const savePreferences = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      await adminApi.preferences.saveDashboardPreferences(preferences);
    } catch (err) {
      console.error("Ошибка при сохранении предпочтений:", err);
      setError("Не удалось сохранить настройки дашборда");
    } finally {
      setIsLoading(false);
    }
  };

  // Обновление настроек графика
  const updateChartPreference = async (chartId: string, updates: Partial<ChartPreference>) => {
    setPreferences(prev => {
      const updatedCharts = {
        ...prev.charts,
        [chartId]: {
          ...prev.charts[chartId],
          ...updates
        }
      };
      
      return { ...prev, charts: updatedCharts };
    });

    await savePreferences();
  };

  // Добавление/обновление виджета
  const saveWidget = async (widget: WidgetPreference) => {
    setPreferences(prev => {
      // Проверяем, существует ли уже виджет с таким ID
      const existingWidgetIndex = prev.widgets.findIndex(w => w.id === widget.id);
      
      if (existingWidgetIndex >= 0) {
        // Обновляем существующий виджет
        const updatedWidgets = [...prev.widgets];
        updatedWidgets[existingWidgetIndex] = widget;
        return { ...prev, widgets: updatedWidgets };
      } else {
        // Добавляем новый виджет
        return { ...prev, widgets: [...prev.widgets, widget] };
      }
    });

    await savePreferences();
  };

  // Удаление виджета
  const deleteWidget = async (widgetId: string) => {
    setPreferences(prev => {
      const updatedWidgets = prev.widgets.filter(widget => widget.id !== widgetId);
      return { ...prev, widgets: updatedWidgets };
    });

    await savePreferences();
  };

  // Добавление/обновление правила оповещения
  const saveAlertRule = async (rule: AlertRule) => {
    setPreferences(prev => {
      // Проверяем, существует ли уже правило с таким ID
      const existingRuleIndex = prev.alerts.findIndex(r => r.id === rule.id);
      
      if (existingRuleIndex >= 0) {
        // Обновляем существующее правило
        const updatedAlerts = [...prev.alerts];
        updatedAlerts[existingRuleIndex] = rule;
        return { ...prev, alerts: updatedAlerts };
      } else {
        // Добавляем новое правило
        return { ...prev, alerts: [...prev.alerts, rule] };
      }
    });

    await savePreferences();
  };

  // Удаление правила оповещения
  const deleteAlertRule = async (ruleId: string) => {
    setPreferences(prev => {
      const updatedAlerts = prev.alerts.filter(rule => rule.id !== ruleId);
      return { ...prev, alerts: updatedAlerts };
    });

    await savePreferences();
  };

  // Сброс к настройкам по умолчанию
  const resetToDefaults = async () => {
    setPreferences(defaultPreferences);
    await savePreferences();
  };

  return (
    <DashboardPreferencesContext.Provider
      value={{
        preferences,
        setPreferences,
        updateChartPreference,
        saveWidget,
        deleteWidget,
        saveAlertRule,
        deleteAlertRule,
        resetToDefaults,
        savePreferences,
        isLoading,
        error
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
