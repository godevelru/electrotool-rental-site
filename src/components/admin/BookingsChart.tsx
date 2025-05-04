
import React from "react";
import { 
  BarChart, 
  Bar, 
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
import { FileDown } from "lucide-react";

export type BookingData = {
  date: string;
  completed: number;
  pending: number;
  canceled: number;
};

export type BookingsChartProps = {
  data: BookingData[];
  title: string;
  description?: string;
  period: string;
  onPeriodChange: (period: string) => void;
  loading?: boolean;
  onExportData?: () => void;
};

const BookingsChart: React.FC<BookingsChartProps> = ({
  data,
  title,
  description,
  period,
  onPeriodChange,
  loading = false,
  onExportData
}) => {
  // Пользовательский тултип для графика
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded-md shadow-md">
          <p className="text-sm font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
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
      const csvContent = [
        ["Дата", "Завершено", "Ожидает", "Отменено"],
        ...data.map(item => [
          item.date, 
          item.completed.toString(),
          item.pending.toString(),
          item.canceled.toString()
        ])
      ].map(row => row.join(",")).join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `bookings_data_${period}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
            <BarChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="completed" 
                name="Завершено" 
                fill="#4ade80" 
                stackId="a" 
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                dataKey="pending" 
                name="Ожидает" 
                fill="#fcd34d" 
                stackId="a" 
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                dataKey="canceled" 
                name="Отменено" 
                fill="#f87171" 
                stackId="a" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingsChart;
