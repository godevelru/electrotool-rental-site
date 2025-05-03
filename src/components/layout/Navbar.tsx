
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home,
  InfoIcon,
  Phone,
  ShoppingCart,
  Menu,
  User,
  LogOut,
  Settings,
  Package,
  CalendarClock,
  ShieldCheck,
} from "lucide-react";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  // Получаем инициалы пользователя для аватара
  const getUserInitials = () => {
    if (!user) return "ГП";
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link to="/" className="flex items-center text-xl font-bold text-primary">
            🛠️ ИнструментПрокат
          </Link>
          
          <nav className="ml-8 hidden md:flex space-x-1">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-1">
                <Home className="h-4 w-4" />
                Главная
              </Button>
            </Link>
            <Link to="/catalog">
              <Button variant="ghost" size="sm" className="gap-1">
                <Package className="h-4 w-4" />
                Каталог
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="ghost" size="sm" className="gap-1">
                <InfoIcon className="h-4 w-4" />
                О нас
              </Button>
            </Link>
            <Link to="/contacts">
              <Button variant="ghost" size="sm" className="gap-1">
                <Phone className="h-4 w-4" />
                Контакты
              </Button>
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                0
              </span>
            </Button>
          </Link>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.avatar ? user.avatar : undefined}
                      alt={`${user?.firstName} ${user?.lastName}`}
                    />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">{user?.firstName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Link to="/account">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Мой профиль</span>
                  </DropdownMenuItem>
                </Link>
                <Link to="/booking">
                  <DropdownMenuItem>
                    <CalendarClock className="mr-2 h-4 w-4" />
                    <span>Мои бронирования</span>
                  </DropdownMenuItem>
                </Link>
                {user?.role === "admin" && (
                  <>
                    <DropdownMenuSeparator />
                    <Link to="/admin">
                      <DropdownMenuItem>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        <span>Админ-панель</span>
                      </DropdownMenuItem>
                    </Link>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Выйти</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button size="sm">Войти</Button>
            </Link>
          )}

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
