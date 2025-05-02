
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  ChevronLeft, 
  Star, 
  Clock, 
  Package, 
  Shield, 
  Truck,
  Plus,
  Minus
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/container";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/components/product/ProductCard";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [rentalDays, setRentalDays] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  // Нашли бы продукт через API запрос в реальном приложении
  useEffect(() => {
    const foundProduct = products.find(p => p.id === Number(id));
    if (foundProduct) {
      setProduct(foundProduct);
      setSelectedImage(foundProduct.image);
    }
    setLoading(false);
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, rentalDays);
      // Можно добавить уведомление об успешном добавлении
    }
  };

  const incrementDays = () => {
    setRentalDays(prev => prev + 1);
  };

  const decrementDays = () => {
    if (rentalDays > 1) {
      setRentalDays(prev => prev - 1);
    }
  };

  // Демо-изображения для галереи
  const additionalImages = [
    product?.image || "",
    "https://images.unsplash.com/photo-1572981779307-38ab55a4a2fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <Container className="flex-grow flex items-center justify-center flex-col">
          <h2 className="text-2xl font-bold mb-4">Товар не найден</h2>
          <p className="text-gray-600 mb-6">К сожалению, запрашиваемый товар не существует.</p>
          <Button onClick={() => navigate("/")}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Вернуться на главную
          </Button>
        </Container>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        <Container>
          <div className="mb-8">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Назад
            </Button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Изображение и галерея */}
              <div>
                <div className="aspect-square overflow-hidden rounded-lg border bg-white mb-4">
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex space-x-2">
                  {additionalImages.map((img, index) => (
                    <div 
                      key={index}
                      className={`cursor-pointer aspect-square w-20 rounded-md overflow-hidden border-2 ${selectedImage === img ? 'border-primary' : 'border-transparent'}`}
                      onClick={() => setSelectedImage(img)}
                    >
                      <img
                        src={img}
                        alt={`${product.name} view ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Информация о продукте */}
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <div className="flex items-center mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">12 отзывов</span>
                </div>
                
                <div className="bg-gray-100 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Стоимость аренды:</span>
                    <span className="text-2xl font-bold text-primary">{product.dailyRate} ₽/день</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-6">
                    Залог: {Math.round(product.price * 0.3)} ₽ (возвращается при возврате инструмента)
                  </div>
                  
                  <div className="flex flex-col space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Срок аренды (дни):
                      </label>
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={decrementDays}
                          disabled={rentalDays <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="mx-4 font-bold text-xl">{rentalDays}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={incrementDays}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center font-bold">
                      <span>Итого:</span>
                      <span>{product.dailyRate * rentalDays} ₽</span>
                    </div>
                    
                    <Button
                      onClick={handleAddToCart}
                      className="w-full"
                      size="lg"
                      disabled={!product.available}
                    >
                      {product.available ? (
                        <>
                          <ShoppingCart className="mr-2 h-5 w-5" />
                          Добавить в корзину
                        </>
                      ) : (
                        "Нет в наличии"
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <h4 className="font-medium">Быстрое оформление</h4>
                      <p className="text-sm text-gray-600">Получите инструмент уже через 30 минут</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Package className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <h4 className="font-medium">Всё включено</h4>
                      <p className="text-sm text-gray-600">В стоимость входят все расходные материалы</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <h4 className="font-medium">Гарантия качества</h4>
                      <p className="text-sm text-gray-600">Регулярное техническое обслуживание</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Truck className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <h4 className="font-medium">Доставка</h4>
                      <p className="text-sm text-gray-600">Доставка от 300₽ по городу</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Детали товара */}
          <div className="mt-12 mb-16">
            <Tabs defaultValue="description" onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="description">Описание</TabsTrigger>
                <TabsTrigger value="specifications">Характеристики</TabsTrigger>
                <TabsTrigger value="documents">Документы</TabsTrigger>
                <TabsTrigger value="reviews">Отзывы</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description">
                <div className="prose max-w-none">
                  <h3>Описание {product.name}</h3>
                  <p>{product.description}</p>
                  <p>
                    Данный инструмент идеально подходит для профессиональных строительных работ, ремонта и отделки. 
                    Эргономичный дизайн обеспечивает комфортное использование в течение длительного времени.
                  </p>
                  <h4>Преимущества:</h4>
                  <ul>
                    <li>Высокая мощность и производительность</li>
                    <li>Минимальная вибрация при работе</li>
                    <li>Эргономичный дизайн и удобная рукоятка</li>
                    <li>Надежность и долговечность</li>
                    <li>Защита от перегрева</li>
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="specifications">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold">Технические характеристики</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium">Производитель</span>
                        <span>{product.name.split(' ')[0]}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium">Модель</span>
                        <span>{product.name.split(' ')[1]}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium">Мощность</span>
                        <span>800 Вт</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium">Вес</span>
                        <span>2.7 кг</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium">Напряжение</span>
                        <span>220 В</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium">Частота вращения</span>
                        <span>0-2800 об/мин</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium">Гарантия</span>
                        <span>12 месяцев</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium">Страна производства</span>
                        <span>Германия</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="documents">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold">Необходимые документы для аренды</h3>
                  <p className="text-gray-700">Для оформления аренды электроинструмента необходимы следующие документы:</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold mr-3">1</div>
                      <div>
                        <h4 className="font-medium">Паспорт гражданина РФ</h4>
                        <p className="text-sm text-gray-600">Оригинал документа, удостоверяющего личность</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold mr-3">2</div>
                      <div>
                        <h4 className="font-medium">Залог</h4>
                        <p className="text-sm text-gray-600">Денежный залог или документ равнозначной ценности</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold mr-3">3</div>
                      <div>
                        <h4 className="font-medium">Договор аренды</h4>
                        <p className="text-sm text-gray-600">Заполняется на месте при получении инструмента</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h4 className="font-medium mb-2">Скачать образцы документов:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                        <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span>Договор аренды.pdf</span>
                      </div>
                      <div className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                        <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span>Правила эксплуатации.pdf</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="reviews">
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">Отзывы клиентов</h3>
                    <Button>Оставить отзыв</Button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    {[
                      {
                        name: "Алексей",
                        date: "15.04.2025",
                        rating: 5,
                        comment: "Отличный инструмент, взял на выходные для домашнего ремонта. Всё работает как часы, никаких проблем не возникло. Рекомендую!"
                      },
                      {
                        name: "Марина",
                        date: "02.03.2025",
                        rating: 4,
                        comment: "Быстрое оформление, качественный инструмент. Немного тяжеловат, но с работой справляется на ура. Буду обращаться еще."
                      },
                      {
                        name: "Игорь",
                        date: "18.01.2025",
                        rating: 5,
                        comment: "Это просто находка для моего ремонта! Пользовался неделю, никаких нареканий. Сдал без проблем, залог вернули моментально."
                      }
                    ].map((review, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between mb-2">
                            <div className="font-medium">{review.name}</div>
                            <div className="text-sm text-gray-500">{review.date}</div>
                          </div>
                          <div className="flex mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Похожие товары */}
          <div className="my-16">
            <h2 className="text-2xl font-bold mb-8">Похожие инструменты</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {products
                .filter(p => p.id !== product.id && p.category === product.category)
                .slice(0, 4)
                .map(relatedProduct => (
                  <Card 
                    key={relatedProduct.id} 
                    className="overflow-hidden h-full flex flex-col cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/product/${relatedProduct.id}`)}
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <CardContent className="pt-4 flex-grow">
                      <h3 className="font-bold hover:text-primary transition-colors">{relatedProduct.name}</h3>
                      <div className="mt-2">
                        <span className="font-medium">{relatedProduct.dailyRate} ₽/день</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </Container>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
