
import React, { useState, useEffect } from "react";
import UserTable, { User, UserRole, UserStatus } from "@/components/admin/UserTable";
import UserForm from "@/components/admin/UserForm";
import { useToast } from "@/components/ui/use-toast";
import { adminApi } from "@/lib/api";
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
import { Loader2 } from "lucide-react";

const UserManagement: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Состояния для модальных окон
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null);

  // Загрузка пользователей с API
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.users.getUsers();
      setUsers(response.data || []);
    } catch (err) {
      console.error("Ошибка при загрузке пользователей:", err);
      setError("Не удалось загрузить пользователей. Пожалуйста, попробуйте позже.");
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить список пользователей",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Загрузка пользователей при монтировании компонента
  useEffect(() => {
    fetchUsers();
  }, []);

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
  const confirmDeleteUser = async () => {
    if (userIdToDelete) {
      setLoading(true);
      try {
        await adminApi.users.deleteUser(userIdToDelete);
        
        // Обновляем локальное состояние после успешного удаления
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userIdToDelete));
        
        toast({
          title: "Пользователь удален",
          description: "Пользователь был успешно удален из системы",
        });
      } catch (err) {
        console.error("Ошибка при удалении пользователя:", err);
        toast({
          title: "Ошибка удаления",
          description: "Не удалось удалить пользователя. Пожалуйста, попробуйте позже.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    setIsDeleteDialogOpen(false);
    setUserIdToDelete(null);
  };

  // Обработчик изменения роли пользователя
  const handleChangeUserRole = async (userId: string, role: UserRole) => {
    setLoading(true);
    try {
      await adminApi.users.changeUserRole(userId, role);
      
      // Обновляем локальное состояние после успешного изменения роли
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, role } : user
        )
      );
      
      toast({
        title: "Роль изменена",
        description: `Роль пользователя успешно изменена на "${role === 'admin' ? 'Администратор' : role === 'manager' ? 'Менеджер' : 'Пользователь'}"`,
      });
    } catch (err) {
      console.error("Ошибка при изменении роли пользователя:", err);
      toast({
        title: "Ошибка изменения роли",
        description: "Не удалось изменить роль пользователя. Пожалуйста, попробуйте позже.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Обработчик изменения статуса пользователя
  const handleChangeUserStatus = async (userId: string, status: UserStatus) => {
    setLoading(true);
    try {
      await adminApi.users.changeUserStatus(userId, status);
      
      // Обновляем локальное состояние после успешного изменения статуса
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
    } catch (err) {
      console.error("Ошибка при изменении статуса пользователя:", err);
      toast({
        title: "Ошибка изменения статуса",
        description: "Не удалось изменить статус пользователя. Пожалуйста, попробуйте позже.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Обработчик отправки формы создания/редактирования
  const handleFormSubmit = async (data: any) => {
    setLoading(true);
    try {
      if (isCreating) {
        // Создаем нового пользователя через API
        const response = await adminApi.users.createUser(data);
        
        // Добавляем нового пользователя в локальное состояние
        setUsers(prevUsers => [...prevUsers, response.data]);
        
        toast({
          title: "Пользователь создан",
          description: "Новый пользователь успешно создан",
        });
      } else if (currentUser) {
        // Обновляем существующего пользователя через API
        const response = await adminApi.users.updateUser(currentUser.id, data);
        
        // Обновляем пользователя в локальном состоянии
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === currentUser.id ? { ...user, ...response.data } : user
          )
        );
        
        toast({
          title: "Пользователь обновлен",
          description: "Данные пользователя успешно обновлены",
        });
      }
    } catch (err) {
      console.error("Ошибка при сохранении пользователя:", err);
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить данные пользователя. Пожалуйста, попробуйте позже.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setIsFormOpen(false);
    }
  };

  // Если данные загружаются, показываем индикатор загрузки
  if (loading && users.length === 0) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Загрузка пользователей...</span>
      </div>
    );
  }

  // Если произошла ошибка и нет данных, показываем сообщение об ошибке
  if (error && users.length === 0) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center">
        <p className="text-lg font-medium text-red-500">Ошибка загрузки данных</p>
        <p className="mb-4 text-muted-foreground">{error}</p>
        <button 
          onClick={fetchUsers}
          className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

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
      
      {/* Индикатор загрузки поверх содержимого при выполнении операций */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="rounded-md bg-white p-4 shadow-lg">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </div>
      )}
      
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
