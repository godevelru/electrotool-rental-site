
import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { PhoneCall, Mail, MapPin, Clock, Send } from "lucide-react";

const Contacts = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // В реальном приложении здесь был бы код отправки формы
    alert("Форма отправлена!");
  };

  const contactInfo = [
    {
      icon: <PhoneCall className="h-6 w-6 text-primary" />,
      title: "Телефон",
      details: ["+7 (999) 123-45-67", "+7 (999) 765-43-21"],
    },
    {
      icon: <Mail className="h-6 w-6 text-primary" />,
      title: "Email",
      details: ["info@instrumentprokat.ru", "support@instrumentprokat.ru"],
    },
    {
      icon: <MapPin className="h-6 w-6 text-primary" />,
      title: "Адрес",
      details: ["г. Москва, ул. Строителей, 12", "Метро Университет"],
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: "Режим работы",
      details: ["Пн-Пт: 9:00 - 20:00", "Сб-Вс: 10:00 - 18:00"],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Header */}
        <section className="bg-primary text-white py-20">
          <Container>
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Контактная информация</h1>
              <p className="text-lg md:text-xl opacity-90">
                Свяжитесь с нами любым удобным способом или оставьте заявку, и мы перезвоним вам в ближайшее время
              </p>
            </div>
          </Container>
        </section>
        
        {/* Contact Information */}
        <Container className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-8">Наши контакты</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {contactInfo.map((contact, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <div className="mr-4">
                          {contact.icon}
                        </div>
                        <div>
                          <h3 className="font-bold mb-2">{contact.title}</h3>
                          {contact.details.map((detail, idx) => (
                            <p key={idx} className="text-gray-600">{detail}</p>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-10">
                <h3 className="text-xl font-bold mb-4">Реквизиты компании</h3>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="mb-2"><span className="font-medium">ООО "ИнструментПрокат"</span></p>
                  <p className="mb-2"><span className="font-medium">ИНН:</span> 7712345678</p>
                  <p className="mb-2"><span className="font-medium">КПП:</span> 771201001</p>
                  <p className="mb-2"><span className="font-medium">ОГРН:</span> 1197746123456</p>
                  <p className="mb-2"><span className="font-medium">Юридический адрес:</span> 123456, г. Москва, ул. Строителей, д. 12</p>
                  <p><span className="font-medium">Р/с:</span> 40702810123450123456 в АО "Наш Банк"</p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold mb-8">Напишите нам</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium">
                      Ваше имя
                    </label>
                    <Input id="name" placeholder="Иван Иванов" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-medium">
                      Телефон
                    </label>
                    <Input id="phone" placeholder="+7 (___) ___-__-__" required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium">
                    Email
                  </label>
                  <Input id="email" type="email" placeholder="example@email.com" required />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="subject" className="block text-sm font-medium">
                    Тема сообщения
                  </label>
                  <Input id="subject" placeholder="Аренда инструмента" required />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message" className="block text-sm font-medium">
                    Сообщение
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Опишите ваш запрос подробнее..."
                    rows={5}
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="privacy"
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                    required
                  />
                  <label htmlFor="privacy" className="text-sm text-gray-600">
                    Я согласен на обработку персональных данных
                  </label>
                </div>
                
                <Button type="submit" className="w-full">
                  <Send className="mr-2 h-4 w-4" />
                  Отправить сообщение
                </Button>
              </form>
            </div>
          </div>
        </Container>
        
        {/* Map */}
        <div className="h-[400px] bg-gray-200 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold">Карта проезда</h3>
              <p className="text-gray-600">г. Москва, ул. Строителей, 12</p>
            </div>
          </div>
          {/* В реальном проекте здесь будет интеграция с картой (например, Яндекс.Карты или Google Maps) */}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contacts;
