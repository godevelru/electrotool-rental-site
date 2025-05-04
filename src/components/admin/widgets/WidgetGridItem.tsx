
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, Trash2, Edit, Maximize2, RefreshCw, Move, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useDashboardPreferences, WidgetPreference } from "@/context/DashboardPreferencesContext";
import { WIDGET_TYPES, AVAILABLE_METRICS, getWidgetTypeById, getMetricById } from "./WidgetTypes";
import { Skeleton } from "@/components/ui/skeleton";

type WidgetGridItemProps = {
  widget: WidgetPreference;
  onEdit: (widget: WidgetPreference) => void;
  isDragging?: boolean;
};

const WidgetGridItem: React.FC<WidgetGridItemProps> = ({ 
  widget, 
  onEdit,
  isDragging = false
}) => {
  const { deleteWidget } = useDashboardPreferences();
  const [isLoading, setIsLoading] = useState(false);
  
  // Получаем тип виджета
  const widgetType = getWidgetTypeById(widget.type);
  
  // Формируем список названий метрик для отображения
  const metricNames = widget.metricKeys
    .map(key => getMetricById(key)?.name || key)
    .join(", ");
  
  // Обработчик удаления виджета
  const handleDelete = async () => {
    if (confirm(`Вы уверены, что хотите удалить виджет "${widget.title}"?`)) {
      await deleteWidget(widget.id);
    }
  };
  
  // Обработчик обновления данных виджета
  const handleRefresh = () => {
    setIsLoading(true);
    
    // Имитация загрузки данных
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };
  
  // Определяем иконку для виджета
  const widgetIcon = widgetType?.icon || null;
  
  return (
    <Card className={`overflow-hidden transition-all ${isDragging ? 'opacity-50 ring-2 ring-primary shadow-lg' : ''}`}>
      <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center">
          <div className="cursor-move mr-2 text-muted-foreground">
            <Move className="h-4 w-4" />
          </div>
          <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(widget)}>
              <Edit className="mr-2 h-4 w-4" />
              Редактировать
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Обновить данные
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent className="p-3 pt-0">
        {isLoading ? (
          <div className="w-full space-y-2">
            <Skeleton className="w-full h-24" />
            <Skeleton className="w-2/3 h-4" />
          </div>
        ) : (
          <div>
            <div className="h-24 flex items-center justify-center border rounded-md bg-muted/30">
              {widgetIcon}
              <p className="text-sm text-muted-foreground ml-2">
                Визуализация: {widgetType?.name || widget.type}
              </p>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Метрики: {metricNames}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WidgetGridItem;
