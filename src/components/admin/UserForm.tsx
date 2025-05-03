
import React from "react";
import { User, UserRole, UserStatus } from "./UserTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Схема валидации формы
const userFormSchema = z.object({
  firstName: z
    .string()
    .min(2, "Имя должно содержать минимум 2 символа")
    .max(50, "Имя не должно превышать 50 символов"),
  lastName: z
    .string()
    .min(2, "Фамилия должна содержать минимум 2 символа")
    .max(50, "Фамилия не должна превышать 50 символов"),
  email: z
    .string()
    .email("Введите корректный email")
    .min(5, "Email должен содержать минимум 5 символов")
    .max(100, "Email не должен превышать 100 символов"),
  phone: z
    .string()
    .min(10, "Номер телефона должен содержать минимум 10 символов")
    .max(20, "Номер телефона не должен превышать 20 символов"),
  role: z.enum(["user", "admin", "manager"]),
  status: z.enum(["active", "inactive", "blocked"]),
  password: z
    .string()
    .min(6, "Пароль должен содержать минимум 6 символов")
    .max(100, "Пароль не должен превышать 100 символов")
    .optional()
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormValues) => void;
  initialData?: User;
  isCreating?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isCreating = false,
}) => {
  // Инициализация формы с помощью React Hook Form
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: initialData || {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "user" as UserRole,
      status: "active" as UserStatus,
      password: "",
    },
  });

  // Сброс формы при изменении начальных данных
  React.useEffect(() => {
    if (isOpen) {
      reset(initialData || {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "user" as UserRole,
        status: "active" as UserStatus,
        password: "",
      });
    }
  }, [isOpen, initialData, reset]);

  // Обработчик отправки формы
  const onFormSubmit = handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={onFormSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isCreating ? "Создание нового пользователя" : "Редактирование пользователя"}
            </DialogTitle>
            <DialogDescription>
              Заполните информацию о пользователе в форме ниже.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Имя</Label>
                <Input
                  id="firstName"
                  {...register("firstName")}
                  placeholder="Введите имя"
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия</Label>
                <Input
                  id="lastName"
                  {...register("lastName")}
                  placeholder="Введите фамилию"
                />
                {errors.lastName && (
                  <p className="text-xs text-red-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="Введите email"
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="Введите номер телефона"
              />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Роль</Label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите роль" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Пользователь</SelectItem>
                        <SelectItem value="manager">Менеджер</SelectItem>
                        <SelectItem value="admin">Администратор</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.role && (
                  <p className="text-xs text-red-500">{errors.role.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Статус</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите статус" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Активен</SelectItem>
                        <SelectItem value="inactive">Неактивен</SelectItem>
                        <SelectItem value="blocked">Заблокирован</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && (
                  <p className="text-xs text-red-500">{errors.status.message}</p>
                )}
              </div>
            </div>
            {isCreating && (
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder="Введите пароль"
                />
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isCreating ? "Создать" : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserForm;
