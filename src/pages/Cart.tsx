
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Trash2, 
  ChevronLeft, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Calendar, 
  CreditCard, 
  Truck, 
  User,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const Cart = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, updateDays, removeFromCart, clearCart, totalItems, totalPrice } = useCart();
  const [activeTab, setActiveTab] = useState("cart");
  
  // Состояния для формы оформления заказа
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    deliveryMethod: "pickup",
    paymentMethod: "card",
    address: "",
    comment: "",
    promocode: "",
  });
  
  // Обработчик изменения полей формы
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Обработчик выбора в селектах
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Обработчик отправки формы заказа
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    // В реальном приложении здесь был бы код отправки заказа на сервер
    alert("Заказ успешно оформлен!");
    clearCart();
    setActiveTab("success");
  };
  
  // Если корзина пуста и мы не на странице успешного заказа
  if (cart.length === 0 && activeTab !== "success") {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-grow">
          <Container className="py-12">
            <div className="flex flex-col items-center justify-center text-center py-16">
              <div className="rounded-full bg-gray-100 p-6 mb-6">
                <ShoppingCart className="h-12 w-12 text-gray-400" />
              </div>
              <h1 className="text-2xl font-bold mb-4">Ваша корзина пуста</h1>
              <p className="text-gray-600 mb-8 max-w-md">
                Похоже, вы еще не добавили инструменты в корзину. Перейдите в каталог, чтобы выбрать необходимый инструмент.
              </p>
              <Button onClick={() => navigate("/")}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Вернуться в каталог
              </Button>
            </div>
          </Container>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  // Вычисление общей суммы заказа
  const deliveryCost = formData.deliveryMethod === "delivery" ? 300 : 0;
  const deposit = Math.round(cart.reduce((sum, item) => sum + item.product.price * 0.2, 0));
  const totalOrderPrice = totalPrice + deliveryCost;
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        <Container className="py-12">
          <h1 className="text-3xl font-bold mb-6">
            {activeTab === "cart" && "Корзина"}
            {activeTab === "checkout" && "Оформление заказа"}
            {activeTab === "success" && "Заказ оформлен"}
          </h1>
          
          {/* Прогресс оформления заказа */}
          {activeTab !== "success" && (
            <div className="mb-10">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="cart" disabled={cart.length === 0}>
                    1. Корзина
                  </TabsTrigger>
                  <TabsTrigger value="checkout" disabled={cart.length === 0}>
                    2. Оформление заказа
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}
          
          {/* Содержимое корзины */}
          <TabsContent value="cart" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-4">Товары в корзине</h2>
                  
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex flex-col sm:flex-row gap-4 py-4 border-b">
                        {/* Изображение */}
                        <div className="flex-shrink-0 w-full sm:w-24 h-24">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                        
                        {/* Информация */}
                        <div className="flex-grow">
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <div>
                              <h3 className="font-medium text-lg">{item.product.name}</h3>
                              <p className="text-gray-600 text-sm mb-2">Категория: {item.product.category}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">{item.product.dailyRate} ₽/день</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4">
                            <div className="flex items-center space-x-2 mb-3 sm:mb-0">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <span className="ml-2 text-sm text-gray-600">шт.</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600 mr-2">Дней аренды:</span>
                              <Select
                                value={item.days.toString()}
                                onValueChange={(value) => updateDays(item.product.id, parseInt(value))}
                              >
                                <SelectTrigger className="w-20 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {[1, 2, 3, 5, 7, 10, 14, 30].map((dayOption) => (
                                    <SelectItem key={dayOption} value={dayOption.toString()}>
                                      {dayOption}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="flex items-center mt-3 sm:mt-0">
                              <span className="font-bold mr-4">
                                {item.product.dailyRate * item.quantity * item.days} ₽
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-500 hover:text-red-500"
                                onClick={() => removeFromCart(item.product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={() => navigate("/")}>
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Продолжить покупки
                    </Button>
                    <Button variant="destructive" onClick={clearCart}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Очистить корзину
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Итоговая информация */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                  <h2 className="text-xl font-bold mb-4">Итого</h2>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Товары ({totalItems} шт.):</span>
                      <span>{totalPrice} ₽</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Залог (возвращается):</span>
                      <span>{deposit} ₽</span>
                    </div>
                    <Separator className="my-3" />
                    <div className="flex justify-between font-bold text-lg">
                      <span>К оплате:</span>
                      <span>{totalPrice} ₽</span>
                    </div>
                    <div className="flex justify-between text-gray-600 text-sm">
                      <span>+ залог</span>
                      <span>{deposit} ₽</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-6" 
                    size="lg"
                    onClick={() => setActiveTab("checkout")}
                  >
                    Оформить заказ
                  </Button>
                  
                  <div className="mt-6 text-sm text-gray-600">
                    <p className="flex items-center">
                      <CheckCircle2 className="text-green-500 h-4 w-4 mr-2" />
                      Бесплатная отмена в течение 24 часов
                    </p>
                    <p className="flex items-center mt-2">
                      <CheckCircle2 className="text-green-500 h-4 w-4 mr-2" />
                      Можно продлить срок аренды
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Оформление заказа */}
          <TabsContent value="checkout" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmitOrder} className="space-y-8">
                  {/* Личные данные */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      Личные данные
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="firstName" className="block text-sm font-medium">
                          Имя
                        </label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="lastName" className="block text-sm font-medium">
                          Фамилия
                        </label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium">
                          Email
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="phone" className="block text-sm font-medium">
                          Телефон
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Способ получения */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                      <Truck className="mr-2 h-5 w-5" />
                      Способ получения
                    </h2>
                    
                    <div className="space-y-6">
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="pickup"
                            name="deliveryMethod"
                            value="pickup"
                            checked={formData.deliveryMethod === "pickup"}
                            onChange={() => handleSelectChange("deliveryMethod", "pickup")}
                            className="rounded-full"
                          />
                          <label htmlFor="pickup" className="font-medium">Самовывоз из пункта выдачи (бесплатно)</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="delivery"
                            name="deliveryMethod"
                            value="delivery"
                            checked={formData.deliveryMethod === "delivery"}
                            onChange={() => handleSelectChange("deliveryMethod", "delivery")}
                            className="rounded-full"
                          />
                          <label htmlFor="delivery" className="font-medium">Доставка курьером (300 ₽)</label>
                        </div>
                      </div>
                      
                      {formData.deliveryMethod === "delivery" && (
                        <div className="pt-4 border-t">
                          <div className="space-y-2">
                            <label htmlFor="address" className="block text-sm font-medium">
                              Адрес доставки
                            </label>
                            <Input
                              id="address"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              placeholder="Город, улица, дом, квартира"
                              required
                            />
                          </div>
                        </div>
                      )}
                      
                      {formData.deliveryMethod === "pickup" && (
                        <div className="pt-4 border-t">
                          <h3 className="font-medium mb-2">Пункт выдачи:</h3>
                          <p className="text-gray-700">г. Москва, ул. Строителей, 12</p>
                          <p className="text-gray-600">Режим работы: Пн-Пт 9:00-20:00, Сб-Вс 10:00-18:00</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Способ оплаты */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                      <CreditCard className="mr-2 h-5 w-5" />
                      Способ оплаты
                    </h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="card"
                          name="paymentMethod"
                          value="card"
                          checked={formData.paymentMethod === "card"}
                          onChange={() => handleSelectChange("paymentMethod", "card")}
                          className="rounded-full"
                        />
                        <label htmlFor="card" className="font-medium">Банковская карта</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="cash"
                          name="paymentMethod"
                          value="cash"
                          checked={formData.paymentMethod === "cash"}
                          onChange={() => handleSelectChange("paymentMethod", "cash")}
                          className="rounded-full"
                        />
                        <label htmlFor="cash" className="font-medium">Наличные при получении</label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Комментарий к заказу */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-bold mb-4">Дополнительная информация</h2>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="comment" className="block text-sm font-medium">
                          Комментарий к заказу
                        </label>
                        <textarea
                          id="comment"
                          name="comment"
                          rows={3}
                          value={formData.comment}
                          onChange={handleInputChange}
                          className="w-full border rounded-md p-2"
                          placeholder="Дополнительная информация по заказу..."
                        ></textarea>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="promocode" className="block text-sm font-medium">
                          Промокод
                        </label>
                        <div className="flex">
                          <Input
                            id="promocode"
                            name="promocode"
                            value={formData.promocode}
                            onChange={handleInputChange}
                            className="rounded-r-none"
                          />
                          <Button className="rounded-l-none">Применить</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setActiveTab("cart")}>
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Назад в корзину
                    </Button>
                    <Button type="submit">
                      Оформить заказ
                    </Button>
                  </div>
                </form>
              </div>
              
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                  <h2 className="text-xl font-bold mb-4">Ваш заказ</h2>
                  
                  <div className="max-h-60 overflow-auto mb-4">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center py-2 border-b">
                        <div className="w-12 h-12 mr-3">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium text-sm line-clamp-1">{item.product.name}</p>
                          <div className="flex text-xs text-gray-500">
                            <span>{item.quantity} шт.</span>
                            <span className="mx-1">×</span>
                            <span>{item.days} дн.</span>
                            <span className="mx-1">×</span>
                            <span>{item.product.dailyRate} ₽</span>
                          </div>
                        </div>
                        <div className="font-medium">
                          {item.product.dailyRate * item.quantity * item.days} ₽
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Товары ({totalItems} шт.):</span>
                      <span>{totalPrice} ₽</span>
                    </div>
                    {formData.deliveryMethod === "delivery" && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Доставка:</span>
                        <span>{deliveryCost} ₽</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600">
                      <span>Залог (возвращается):</span>
                      <span>{deposit} ₽</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold text-lg">
                      <span>К оплате:</span>
                      <span>{totalOrderPrice} ₽</span>
                    </div>
                    <div className="flex justify-between text-gray-600 text-sm">
                      <span>+ залог</span>
                      <span>{deposit} ₽</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-sm text-gray-600">
                    <p className="flex items-start">
                      <AlertCircle className="text-primary h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        При получении инструмента необходимо предоставить паспорт и внести залог.
                        Залог возвращается в полном объеме при возврате инструмента в исправном состоянии.
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Успешное оформление заказа */}
          <TabsContent value="success" className="mt-0">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="rounded-full bg-green-100 p-4">
                  <CheckCircle2 className="h-16 w-16 text-green-600" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold mb-4">Заказ успешно оформлен!</h2>
              <p className="text-gray-600 mb-6">
                Благодарим за ваш заказ. Номер вашего заказа: <strong>#123456</strong>
              </p>
              <p className="text-gray-600 mb-8">
                Информация о заказе отправлена на ваш email. Наш менеджер свяжется с вами в ближайшее время для уточнения деталей.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button onClick={() => navigate("/")}>
                  Вернуться в каталог
                </Button>
                <Button variant="outline">
                  Перейти в личный кабинет
                </Button>
              </div>
            </div>
          </TabsContent>
        </Container>
      </main>
      
      <Footer />
    </div>
  );
};

export default Cart;
