
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

type ProtectedRouteProps = {
  children: ReactNode;
  requireAdmin?: boolean;
};

/**
 * Компонент для защиты маршрутов, требующих авторизации
 * 
 * @param children - Дочерние компоненты для рендеринга
 * @param requireAdmin - Требуется ли роль администратора для доступа
 */
const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Пока проверяем аутентификацию, показываем индикатор загрузки
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-t-4 border-primary"></div>
          <p className="text-gray-600">Проверка доступа...</p>
        </div>
      </div>
    );
  }

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!isAuthenticated) {
    // Сохраняем текущий путь, чтобы вернуться после авторизации
    return <Navigate to={`/login?from=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Если требуется роль администратора, проверяем наличие этой роли
  if (requireAdmin && user?.role !== "admin") {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
        <div className="mb-4 text-red-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="mx-auto h-12 w-12"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="mb-2 text-2xl font-bold">Доступ запрещен</h1>
        <p className="mb-6 text-gray-600">
          У вас нет прав для просмотра этой страницы. Требуются права администратора.
        </p>
        <a
          href="/"
          className="rounded-md bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90"
        >
          Вернуться на главную
        </a>
      </div>
    );
  }

  // Если все проверки пройдены, отображаем защищенный контент
  return <>{children}</>;
};

export default ProtectedRoute;
