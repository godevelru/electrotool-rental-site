
import React, { useState } from "react";
import UserTable, { User, UserRole, UserStatus } from "@/components/admin/UserTable";
import UserForm from "@/components/admin/UserForm";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

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

const UserManagement: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(mockUsers);
  
  // Состояния для модальных окон
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null);

  // Обработчик создания пользователя
  const handleCreateUser = () => {
    setIsCreating(true);
    setCurrentUser(undefined);
    setIsFormOpen(true);
  };

  // Обработчик редактирования пользователя
  const handleEditUser = (user: User) => {
    setIsCreating(false);
    setCurrentUser(user);
    setIsFormOpen(true);
  };

  // Обработчик удаления пользователя
  const handleDeleteUser = (userId: string) => {
    setUserIdToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  // Подтверждение удаления пользователя
  const confirmDeleteUser = () => {
    if (userIdToDelete) {
      // Фильтруем пользователей, исключая удаляемого
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userIdToDelete));
      
      toast({
        title: "Пользователь удален",
        description: "Пользователь был успешно удален из системы.",
      });
    }
    setIsDeleteDialogOpen(false);
    setUserIdToDelete(null);
  };

  // Обработчик изменения роли пользователя
  const handleChangeUserRole = (userId: string, role: UserRole) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, role } : user
      )
    );
    
    toast({
      title: "Роль изменена",
      description: `Роль пользователя успешно изменена на "${role === 'admin' ? 'Администратор' : role === 'manager' ? 'Менеджер' : 'Пользователь'}"`,
    });
  };

  // Обработчик изменения статуса пользователя
  const handleChangeUserStatus = (userId: string, status: UserStatus) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, status } : user
      )
    );
    
    const statusText = status === 'active' ? 'активирован' : status === 'blocked' ? 'заблокирован' : 'деактивирован';
    
    toast({
      title: "Статус изменен",
      description: `Пользователь успешно ${statusText}`,
    });
  };

  // Обработчик отправки формы создания/редактирования
  const handleFormSubmit = (data: any) => {
    if (isCreating) {
      // Генерируем ID для нового пользователя
      const newUserId = `usr_${Math.floor(100000 + Math.random() * 900000)}`;
      const now = new Date().toISOString();
      
      // Создаем нового пользователя
      const newUser: User = {
        id: newUserId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        role: data.role as UserRole,
        status: data.status as UserStatus,
        registeredAt: now,
        lastLoginAt: now
      };
      
      // Добавляем пользователя в список
      setUsers(prevUsers => [...prevUsers, newUser]);
      
      toast({
        title: "Пользователь создан",
        description: "Новый пользователь успешно создан.",
      });
    } else if (currentUser) {
      // Обновляем существующего пользователя
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === currentUser.id ? { ...user, ...data } : user
        )
      );
      
      toast({
        title: "Пользователь обновлен",
        description: "Данные пользователя успешно обновлены.",
      });
    }
    
    // Закрываем форму
    setIsFormOpen(false);
  };

  return (
    <div className="p-6">
      {/* Таблица пользователей */}
      <UserTable 
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser}
        onChangeUserRole={handleChangeUserRole}
        onChangeUserStatus={handleChangeUserStatus}
        onCreateUser={handleCreateUser}
      />
      
      {/* Форма создания/редактирования пользователя */}
      <UserForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={currentUser}
        isCreating={isCreating}
      />
      
      {/* Диалог подтверждения удаления */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Эта операция удалит пользователя и все связанные с ним данные.
              Операцию нельзя будет отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagement;
