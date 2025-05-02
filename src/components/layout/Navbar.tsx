
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, X, Home, Phone, Info, Wrench, User } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { title: "Главная", path: "/", icon: <Home className="mr-2 h-4 w-4" /> },
    { title: "Каталог", path: "/catalog", icon: <Wrench className="mr-2 h-4 w-4" /> },
    { title: "О нас", path: "/about", icon: <Info className="mr-2 h-4 w-4" /> },
    { title: "Контакты", path: "/contacts", icon: <Phone className="mr-2 h-4 w-4" /> },
  ];

  return (
    <nav className="bg-primary text-white sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold flex items-center">
              ИнструментПрокат
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="hover:text-primary-foreground/80 flex items-center transition-colors"
              >
                {link.icon}
                {link.title}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-white text-primary text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">0</span>
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="hidden md:flex bg-white text-primary hover:bg-white/90">
                <User className="mr-2 h-4 w-4" />
                Войти
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[250px] p-0">
                <div className="flex flex-col h-full bg-primary text-white">
                  <div className="p-4 border-b border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold">Меню</span>
                    </div>
                  </div>
                  <div className="flex flex-col p-4 space-y-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className="flex items-center p-2 hover:bg-primary-foreground/20 rounded transition-colors"
                      >
                        {link.icon}
                        {link.title}
                      </Link>
                    ))}
                    <Link
                      to="/login"
                      className="flex items-center p-2 hover:bg-primary-foreground/20 rounded transition-colors"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Войти
                    </Link>
                    <Link
                      to="/cart"
                      className="flex items-center p-2 hover:bg-primary-foreground/20 rounded transition-colors"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Корзина
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
