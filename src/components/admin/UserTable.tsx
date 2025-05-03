
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Badge, 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  MoreHorizontal, 
  ChevronUp, 
  ChevronDown, 
  Search, 
  UserPlus, 
  Filter, 
  Edit, 
  Trash2, 
  Shield, 
  Ban, 
  CheckCircle 
} from "lucide-react";

// Типы данных пользователя
export type UserRole = 'user' | 'admin' | 'manager';
export type UserStatus = 'active' | 'inactive' | 'blocked';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  registeredAt: string;
  lastLoginAt: string;
}

// Моковые данные пользователей для демонстрации
const mockUsers: User[] = [
  {
    id: "usr_001",
    firstName: "Иван",
    lastName: "Петров",
    email: "ivan.petrov@example.com",
    phone: "+7 (901) 123-45-67",
    role: "admin",
    status: "active",
    registeredAt: "2024-03-15T10:30:00Z",
    lastLoginAt: "2025-05-02T14:22:10Z"
  },
  {
    id: "usr_002",
    firstName: "Анна",
    lastName: "Смирнова",
    email: "anna.smirnova@example.com",
    phone: "+7 (902) 234-56-78",
    role: "user",
    status: "active",
    registeredAt: "2024-04-02T15:45:00Z",
    lastLoginAt: "2025-04-30T09:15:22Z"
  },
  {
    id: "usr_003",
    firstName: "Михаил",
    lastName: "Иванов",
    email: "mikhail.ivanov@example.com",
    phone: "+7 (903) 345-67-89",
    role: "manager",
    status: "inactive",
    registeredAt: "2024-02-20T12:15:00Z",
    lastLoginAt: "2025-03-25T18:30:05Z"
  },
  {
    id: "usr_004",
    firstName: "Елена",
    lastName: "Козлова",
    email: "elena.kozlova@example.com",
    phone: "+7 (904) 456-78-90",
    role: "user",
    status: "blocked",
    registeredAt: "2024-01-10T09:00:00Z",
    lastLoginAt: "2025-02-15T11:45:30Z"
  },
  {
    id: "usr_005",
    firstName: "Алексей",
    lastName: "Новиков",
    email: "alexey.novikov@example.com",
    phone: "+7 (905) 567-89-01",
    role: "user",
    status: "active",
    registeredAt: "2024-04-25T16:20:00Z",
    lastLoginAt: "2025-05-01T10:10:45Z"
  }
];

// Словарь локализованных названий ролей
const roleLabels: Record<UserRole, string> = {
  user: 'Пользователь',
  admin: 'Администратор',
  manager: 'Менеджер'
};

// Словарь локализованных названий статусов
const statusLabels: Record<UserStatus, string> = {
  active: 'Активен',
  inactive: 'Неактивен',
  blocked: 'Заблокирован'
};

// Стили для бейджей разных статусов
const statusStyles: Record<UserStatus, string> = {
  active: 'bg-green-100 text-green-800 hover:bg-green-200',
  inactive: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  blocked: 'bg-red-100 text-red-800 hover:bg-red-200'
};

// Стили для бейджей разных ролей
const roleStyles: Record<UserRole, string> = {
  user: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  admin: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  manager: 'bg-teal-100 text-teal-800 hover:bg-teal-200'
};

interface UserTableProps {
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onChangeUserRole: (userId: string, role: UserRole) => void;
  onChangeUserStatus: (userId: string, status: UserStatus) => void;
  onCreateUser: () => void;
}

const UserTable: React.FC<UserTableProps> = ({
  onEditUser,
  onDeleteUser,
  onChangeUserRole,
  onChangeUserStatus,
  onCreateUser
}) => {
  // Состояние для хранения данных и фильтров
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof User>("lastName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Обработчик сортировки
  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Фильтрация и сортировка пользователей
  const filteredAndSortedUsers = [...users]
    .filter(user => {
      // Фильтрация по поисковому запросу
      const searchMatch = 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm);
      
      // Фильтрация по роли
      const roleMatch = roleFilter === "all" || user.role === roleFilter;
      
      // Фильтрация по статусу
      const statusMatch = statusFilter === "all" || user.status === statusFilter;
      
      return searchMatch && roleMatch && statusMatch;
    })
    .sort((a, b) => {
      // Строковая сортировка
      if (typeof a[sortField] === 'string' && typeof b[sortField] === 'string') {
        const aValue = (a[sortField] as string).toLowerCase();
        const bValue = (b[sortField] as string).toLowerCase();
        
        if (sortDirection === "asc") {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }
      
      return 0;
    });

  // Рендер иконки сортировки
  const renderSortIcon = (field: keyof User) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Управление пользователями</CardTitle>
        <CardDescription>
          Просмотр, редактирование и управление учетными записями пользователей
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Панель с фильтрами и поиском */}
        <div className="mb-4 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск пользователей..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-4 w-4" />
                  Роль
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setRoleFilter("all")}>
                  Все роли
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setRoleFilter("user")}>
                  Пользователь
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRoleFilter("manager")}>
                  Менеджер
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRoleFilter("admin")}>
                  Администратор
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-4 w-4" />
                  Статус
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  Все статусы
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                  Активен
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
                  Неактивен
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("blocked")}>
                  Заблокирован
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button onClick={onCreateUser} size="sm" className="gap-1">
              <UserPlus className="h-4 w-4" />
              Добавить
            </Button>
          </div>
        </div>
        
        {/* Таблица пользователей */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px] cursor-pointer" onClick={() => handleSort("lastName")}>
                  <div className="flex items-center">
                    ФИО {renderSortIcon("lastName")}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("email")}>
                  <div className="flex items-center">
                    Email {renderSortIcon("email")}
                  </div>
                </TableHead>
                <TableHead className="hidden md:table-cell">Телефон</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("role")}>
                  <div className="flex items-center">
                    Роль {renderSortIcon("role")}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                  <div className="flex items-center">
                    Статус {renderSortIcon("status")}
                  </div>
                </TableHead>
                <TableHead className="hidden md:table-cell cursor-pointer" onClick={() => handleSort("registeredAt")}>
                  <div className="flex items-center">
                    Дата регистрации {renderSortIcon("registeredAt")}
                  </div>
                </TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedUsers.length > 0 ? (
                filteredAndSortedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.lastName} {user.firstName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{user.phone}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={roleStyles[user.role]}>
                        {roleLabels[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyles[user.status]}>
                        {statusLabels[user.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(user.registeredAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Действия</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onEditUser(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Редактировать</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Роль</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onChangeUserRole(user.id, "user")}>
                            <span className={user.role === "user" ? "font-bold" : ""}>Пользователь</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onChangeUserRole(user.id, "manager")}>
                            <span className={user.role === "manager" ? "font-bold" : ""}>Менеджер</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onChangeUserRole(user.id, "admin")}>
                            <Shield className="mr-2 h-4 w-4" />
                            <span className={user.role === "admin" ? "font-bold" : ""}>Администратор</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Статус</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onChangeUserStatus(user.id, "active")}>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            <span>Активировать</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onChangeUserStatus(user.id, "blocked")}>
                            <Ban className="mr-2 h-4 w-4 text-red-500" />
                            <span>Заблокировать</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onDeleteUser(user.id)}
                            className="text-red-600 focus:bg-red-50 focus:text-red-700"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Удалить</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Пользователи не найдены.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Показано {filteredAndSortedUsers.length} из {users.length} пользователей
        </div>
      </CardFooter>
    </Card>
  );
};

export default UserTable;
