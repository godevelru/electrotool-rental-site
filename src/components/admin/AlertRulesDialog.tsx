
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertRule, useDashboardPreferences } from "@/context/DashboardPreferencesContext";
import { v4 as uuidv4 } from "uuid";
import { Check, Plus, Trash2, BellRing, Bell, BellOff, AlertTriangle } from "lucide-react";

type AlertRulesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const METRICS = [
  { id: "revenue_daily", name: "Выручка за день" },
  { id: "revenue_monthly", name: "Выручка за месяц" },
  { id: "bookings_count", name: "Количество бронирований" },
  { id: "active_users", name: "Активных пользователей" },
  { id: "available_tools", name: "Доступных инструментов" },
  { id: "pending_bookings", name: "Ожидающих бронирований" }
];

const CONDITIONS = [
  { id: "gt", name: "больше" },
  { id: "lt", name: "меньше" },
  { id: "eq", name: "равно" },
  { id: "gte", name: "больше или равно" },
  { id: "lte", name: "меньше или равно" }
];

const TIMEFRAMES = [
  { id: "1", name: "1 час" },
  { id: "6", name: "6 часов" },
  { id: "12", name: "12 часов" },
  { id: "24", name: "1 день" },
  { id: "72", name: "3 дня" },
  { id: "168", name: "7 дней" }
];

const AlertRulesDialog: React.FC<AlertRulesDialogProps> = ({ open, onOpenChange }) => {
  const { preferences, saveAlertRule, deleteAlertRule } = useDashboardPreferences();
  const [activeTab, setActiveTab] = useState("active");
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  
  // Инициализация нового правила
  const initNewRule = () => {
    setEditingRule({
      id: uuidv4(),
      name: "Новое правило",
      metric: METRICS[0].id,
      condition: "gt",
      threshold: 0,
      timeframeHours: 24,
      enabled: true,
      notificationChannels: ["app"]
    });
  };
  
  // Обработчик сохранения правила
  const handleSaveRule = async () => {
    if (editingRule) {
      await saveAlertRule(editingRule);
      setEditingRule(null);
    }
  };
  
  // Обработчик удаления правила
  const handleDeleteRule = async (ruleId: string) => {
    if (confirm("Вы уверены, что хотите удалить это правило оповещения?")) {
      await deleteAlertRule(ruleId);
    }
  };
  
  // Обработчик изменения статуса правила
  const handleToggleRule = async (rule: AlertRule) => {
    await saveAlertRule({ ...rule, enabled: !rule.enabled });
  };
  
  // Получение активных и неактивных правил
  const activeRules = preferences.alerts.filter(rule => rule.enabled);
  const inactiveRules = preferences.alerts.filter(rule => !rule.enabled);
  
  // Получение названия метрики
  const getMetricName = (metricId: string) => {
    return METRICS.find(m => m.id === metricId)?.name || metricId;
  };
  
  // Получение названия условия
  const getConditionName = (conditionId: string) => {
    return CONDITIONS.find(c => c.id === conditionId)?.name || conditionId;
  };
  
  // Форматирование описания правила
  const formatRuleDescription = (rule: AlertRule) => {
    return `${getMetricName(rule.metric)} ${getConditionName(rule.condition)} ${rule.threshold}`;
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Настройка правил оповещений</DialogTitle>
          <DialogDescription>
            Настройте оповещения для важных показателей, чтобы быть в курсе изменений.
          </DialogDescription>
        </DialogHeader>
        
        {editingRule ? (
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rule-name">Название правила</Label>
              <Input 
                id="rule-name"
                value={editingRule.name}
                onChange={(e) => setEditingRule({...editingRule, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rule-metric">Метрика</Label>
                <Select 
                  value={editingRule.metric}
                  onValueChange={(value) => setEditingRule({...editingRule, metric: value})}
                >
                  <SelectTrigger id="rule-metric">
                    <SelectValue placeholder="Выберите метрику" />
                  </SelectTrigger>
                  <SelectContent>
                    {METRICS.map((metric) => (
                      <SelectItem key={metric.id} value={metric.id}>
                        {metric.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rule-condition">Условие</Label>
                <Select 
                  value={editingRule.condition}
                  onValueChange={(value: any) => setEditingRule({...editingRule, condition: value})}
                >
                  <SelectTrigger id="rule-condition">
                    <SelectValue placeholder="Выберите условие" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((condition) => (
                      <SelectItem key={condition.id} value={condition.id}>
                        {condition.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rule-threshold">Пороговое значение</Label>
                <Input 
                  id="rule-threshold"
                  type="number"
                  value={editingRule.threshold}
                  onChange={(e) => setEditingRule({...editingRule, threshold: Number(e.target.value)})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rule-timeframe">Период мониторинга</Label>
              <Select 
                value={editingRule.timeframeHours.toString()}
                onValueChange={(value) => setEditingRule({...editingRule, timeframeHours: Number(value)})}
              >
                <SelectTrigger id="rule-timeframe">
                  <SelectValue placeholder="Выберите период" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEFRAMES.map((timeframe) => (
                    <SelectItem key={timeframe.id} value={timeframe.id}>
                      {timeframe.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium mb-1">Каналы уведомлений</p>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="notify-app"
                    checked={editingRule.notificationChannels.includes("app")}
                    onCheckedChange={(checked) => {
                      const channels = [...editingRule.notificationChannels];
                      if (checked) {
                        if (!channels.includes("app")) channels.push("app");
                      } else {
                        const index = channels.indexOf("app");
                        if (index > -1) channels.splice(index, 1);
                      }
                      setEditingRule({...editingRule, notificationChannels: channels});
                    }}
                  />
                  <Label htmlFor="notify-app">В приложении</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="notify-email"
                    checked={editingRule.notificationChannels.includes("email")}
                    onCheckedChange={(checked) => {
                      const channels = [...editingRule.notificationChannels];
                      if (checked) {
                        if (!channels.includes("email")) channels.push("email");
                      } else {
                        const index = channels.indexOf("email");
                        if (index > -1) channels.splice(index, 1);
                      }
                      setEditingRule({...editingRule, notificationChannels: channels});
                    }}
                  />
                  <Label htmlFor="notify-email">Email</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="notify-sms"
                    checked={editingRule.notificationChannels.includes("sms")}
                    onCheckedChange={(checked) => {
                      const channels = [...editingRule.notificationChannels];
                      if (checked) {
                        if (!channels.includes("sms")) channels.push("sms");
                      } else {
                        const index = channels.indexOf("sms");
                        if (index > -1) channels.splice(index, 1);
                      }
                      setEditingRule({...editingRule, notificationChannels: channels});
                    }}
                  />
                  <Label htmlFor="notify-sms">SMS</Label>
                </div>
              </div>
            </div>
            
            <div className="pt-4 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingRule(null)}>
                Отмена
              </Button>
              <Button onClick={handleSaveRule}>Сохранить</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mt-4 mb-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList className="grid grid-cols-2 w-[200px]">
                  <TabsTrigger value="active">
                    Активные ({activeRules.length})
                  </TabsTrigger>
                  <TabsTrigger value="inactive">
                    Неактивные ({inactiveRules.length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button onClick={initNewRule} className="flex items-center">
                <Plus className="h-4 w-4 mr-1" />
                Новое правило
              </Button>
            </div>
            
            <div className="mt-4 space-y-4">
              <TabsContent value="active" className="m-0">
                {activeRules.length === 0 ? (
                  <div className="text-center p-6 bg-gray-50 rounded-md">
                    <BellOff className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">У вас нет активных правил оповещений</p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={initNewRule}
                    >
                      Создать правило
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeRules.map((rule) => (
                      <Card key={rule.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center justify-between">
                            <span>{rule.name}</span>
                            <BellRing className="h-4 w-4 text-green-500" />
                          </CardTitle>
                          <CardDescription>{formatRuleDescription(rule)}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm py-2">
                          <p>Период: {TIMEFRAMES.find(t => t.id === rule.timeframeHours.toString())?.name || rule.timeframeHours + " часов"}</p>
                          <p className="mt-1">
                            Уведомления: {" "}
                            {rule.notificationChannels.map(c => 
                              c === "app" ? "В приложении" : 
                              c === "email" ? "Email" : "SMS"
                            ).join(", ")}
                          </p>
                        </CardContent>
                        <CardFooter className="pt-0 flex justify-between">
                          <div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500"
                              onClick={() => handleDeleteRule(rule.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Удалить
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleRule(rule)}
                            >
                              <BellOff className="h-4 w-4 mr-1" />
                              Отключить
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingRule(rule)}
                            >
                              Изменить
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="inactive" className="m-0">
                {inactiveRules.length === 0 ? (
                  <div className="text-center p-6 bg-gray-50 rounded-md">
                    <Check className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">У вас нет неактивных правил оповещений</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inactiveRules.map((rule) => (
                      <Card key={rule.id} className="opacity-70">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center justify-between">
                            <span>{rule.name}</span>
                            <BellOff className="h-4 w-4 text-gray-400" />
                          </CardTitle>
                          <CardDescription>{formatRuleDescription(rule)}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm py-2">
                          <p>Период: {TIMEFRAMES.find(t => t.id === rule.timeframeHours.toString())?.name || rule.timeframeHours + " часов"}</p>
                          <p className="mt-1">
                            Уведомления: {" "}
                            {rule.notificationChannels.map(c => 
                              c === "app" ? "В приложении" : 
                              c === "email" ? "Email" : "SMS"
                            ).join(", ")}
                          </p>
                        </CardContent>
                        <CardFooter className="pt-0 flex justify-between">
                          <div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500"
                              onClick={() => handleDeleteRule(rule.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Удалить
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleRule(rule)}
                            >
                              <Bell className="h-4 w-4 mr-1" />
                              Включить
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingRule(rule)}
                            >
                              Изменить
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </>
        )}
        
        <DialogFooter className="mt-6">
          <Button onClick={() => onOpenChange(false)}>Закрыть</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AlertRulesDialog;
