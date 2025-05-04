
import React, { useState } from "react";
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FileDown, BarChart2, LineChart as LineChartIcon, PieChart as PieChartIcon } from "lucide-react";
import { add, format } from "date-fns";
import { ru } from "date-fns/locale";

export type RevenueData = {
  date: string;
  value: number;
  previousValue?: number;
};

export type ChartType = "line" | "bar" | "area" | "pie";

export type RevenueChartProps = {
  data: RevenueData[];
  title: string;
  description?: string;
  period: string;
  onPeriodChange: (period: string) => void;
  loading?: boolean;
  currencySymbol?: string;
  onExportData?: () => void;
  onDateRangeChange?: (range: { from: Date; to: Date }) => void;
  onCompareChange?: (compare: boolean) => void;
  previousPeriodData?: RevenueData[];
  isComparing?: boolean;
};

const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57'];

const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  title,
  description,
  period,
  onPeriodChange,
  loading = false,
  currencySymbol = "₽",
  onExportData,
  onDateRangeChange,
  onCompareChange,
  previousPeriodData = [],
  isComparing = false
}) => {
  const [chartType, setChartType] = useState<ChartType>("line");
  
  // Форматирование суммы для отображения в тултипе
  const formatCurrency = (value: number) => {
    return `${new Intl.NumberFormat('ru-RU').format(value)} ${currencySymbol}`;
  };

  // Подготовка данных для графика
  const chartData = data.map(item => ({
    ...item,
    value: Number(item.value),
    previousValue: item.previousValue ? Number(item.previousValue) : undefined
  }));

  // Пользовательский тултип для графика
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded-md shadow-md">
          <p className="text-sm font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
          {isComparing && payload.length > 1 && (
            <div className="mt-1 pt-1 border-t text-xs">
              <p className={payload[0].value > payload[1].value ? "text-green-500" : "text-red-500"}>
                {payload[0].value > payload[1].value 
                  ? `+${((payload[0].value - payload[1].value) / payload[1].value * 100).toFixed(1)}%` 
                  : `-${((payload[1].value - payload[0].value) / payload[1].value * 100).toFixed(1)}%`
                }
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Обработчик экспорта данных
  const handleExport = () => {
    if (onExportData) {
      onExportData();
    } else {
      // Базовый экспорт в CSV, если не предоставлена функция экспорта
      let csvContent = isComparing 
        ? ["Дата,Текущий период (₽),Предыдущий период (₽)"]
        : ["Дата,Выручка (₽)"];
      
      if (isComparing) {
        csvContent = csvContent.concat(
          data.map((item, index) => [
            item.date,
            item.value.toString(),
            (previousPeriodData[index]?.value || 0).toString()
          ].join(","))
        );
      } else {
        csvContent = csvContent.concat(
          data.map(item => [item.date, item.value.toString()].join(","))
        );
      }
      
      const blob = new Blob([csvContent.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `revenue_data_${period}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Функция для подготовки данных для круговой диаграммы
  const getPieData = () => {
    // Группируем данные по категориям или периодам для круговой диаграммы
    const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);
    
    if (totalValue === 0) return [];
    
    // Для простоты разделим данные на части (например, по неделям)
    const pieData = [];
    const chunkSize = Math.ceil(chartData.length / 5);
    
    for (let i = 0; i < chartData.length; i += chunkSize) {
      const chunk = chartData.slice(i, i + chunkSize);
      const chunkSum = chunk.reduce((sum, item) => sum + item.value, 0);
      const label = chunk.length > 0 
        ? (chunk[0].date + (chunk.length > 1 ? ` - ${chunk[chunk.length - 1].date}` : ''))
        : '';
      
      pieData.push({
        name: label,
        value: chunkSum
      });
    }
    
    return pieData;
  };

  // Обработчик изменения типа графика
  const handleChartTypeChange = (value: string) => {
    setChartType(value as ChartType);
  };

  // Функция для рендеринга соответствующего типа графика
  const renderChart = () => {
    switch (chartType) {
      case "line":
        return (
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#e0e0e0' }}
            />
            <YAxis 
              tickFormatter={value => `${value} ${currencySymbol}`} 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#e0e0e0' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              name="Текущий период"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ stroke: '#8884d8', strokeWidth: 2, r: 4 }}
              activeDot={{ stroke: '#8884d8', strokeWidth: 2, r: 6 }}
            />
            {isComparing && previousPeriodData.length > 0 && (
              <Line
                type="monotone"
                dataKey="previousValue"
                name="Предыдущий период"
                stroke="#82ca9d"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ stroke: '#82ca9d', strokeWidth: 2, r: 4 }}
              />
            )}
          </LineChart>
        );
      
      case "bar":
        return (
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#e0e0e0' }}
            />
            <YAxis 
              tickFormatter={value => `${value} ${currencySymbol}`} 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#e0e0e0' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="value"
              name="Текущий период"
              fill="#8884d8"
              radius={[4, 4, 0, 0]}
            />
            {isComparing && previousPeriodData.length > 0 && (
              <Bar
                dataKey="previousValue"
                name="Предыдущий период"
                fill="#82ca9d"
                radius={[4, 4, 0, 0]}
              />
            )}
          </BarChart>
        );
      
      case "area":
        return (
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#e0e0e0' }}
            />
            <YAxis 
              tickFormatter={value => `${value} ${currencySymbol}`} 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#e0e0e0' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="value"
              name="Текущий период"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.3}
            />
            {isComparing && previousPeriodData.length > 0 && (
              <Area
                type="monotone"
                dataKey="previousValue"
                name="Предыдущий период"
                stroke="#82ca9d"
                fill="#82ca9d"
                fillOpacity={0.3}
              />
            )}
          </AreaChart>
        );
      
      case "pie":
        const pieData = getPieData();
        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [formatCurrency(value as number), "Выручка"]}
            />
            <Legend />
          </PieChart>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center mr-2">
            <Switch 
              id="compare-switch"
              checked={isComparing}
              onCheckedChange={(checked) => onCompareChange && onCompareChange(checked)}
              className="mr-2"
            />
            <Label htmlFor="compare-switch">Сравнение</Label>
          </div>

          {onDateRangeChange && (
            <DatePickerWithRange 
              className="w-[320px]"
              onChange={onDateRangeChange}
            />
          )}

          <Select value={period} onValueChange={onPeriodChange}>
            <SelectTrigger className="w-[140px]">
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
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleExport} 
            title="Экспорт данных"
          >
            <FileDown className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <div className="px-6 mb-2">
        <Tabs value={chartType} onValueChange={handleChartTypeChange} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="line" className="flex items-center gap-1">
              <LineChartIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Линия</span>
            </TabsTrigger>
            <TabsTrigger value="bar" className="flex items-center gap-1">
              <BarChart2 className="h-4 w-4" />
              <span className="hidden sm:inline">Столбцы</span>
            </TabsTrigger>
            <TabsTrigger value="area" className="flex items-center gap-1">
              <LineChartIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Область</span>
            </TabsTrigger>
            <TabsTrigger value="pie" className="flex items-center gap-1">
              <PieChartIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Круговая</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <CardContent className="h-80">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Загрузка данных...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Нет данных для отображения</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
