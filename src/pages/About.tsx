
import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/container";
import { Separator } from "@/components/ui/separator";
import { 
  Award, 
  Users, 
  Clock, 
  Briefcase, 
  Wrench, 
  Heart 
} from "lucide-react";

const About = () => {
  const stats = [
    { value: "8+", label: "лет опыта", icon: <Clock className="h-8 w-8 text-primary" /> },
    { value: "500+", label: "единиц техники", icon: <Wrench className="h-8 w-8 text-primary" /> },
    { value: "12000+", label: "счастливых клиентов", icon: <Users className="h-8 w-8 text-primary" /> },
    { value: "25+", label: "сотрудников", icon: <Briefcase className="h-8 w-8 text-primary" /> },
  ];

  const values = [
    {
      title: "Качество",
      description: "Мы предлагаем только профессиональный инструмент от ведущих мировых производителей.",
      icon: <Award className="h-10 w-10 text-primary" />,
    },
    {
      title: "Надежность",
      description: "Весь инструмент регулярно проходит техническое обслуживание и проверку перед каждой выдачей.",
      icon: <Wrench className="h-10 w-10 text-primary" />,
    },
    {
      title: "Клиентоориентированность",
      description: "Мы ценим каждого клиента и стремимся предоставить лучший сервис и условия аренды.",
      icon: <Heart className="h-10 w-10 text-primary" />,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary text-white py-20">
          <Container>
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">О компании "ИнструментПрокат"</h1>
              <p className="text-lg md:text-xl opacity-90">
                Мы помогаем людям и компаниям реализовывать свои проекты, предоставляя профессиональный инструмент в аренду
              </p>
            </div>
          </Container>
        </section>
        
        {/* Our Story */}
        <Container className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Наша история</h2>
              <div className="space-y-4">
                <p>
                  Компания "ИнструментПрокат" была основана в 2017 году группой энтузиастов, которые увидели растущую потребность в качественном инструменте для кратковременного использования.
                </p>
                <p>
                  Мы начинали с небольшого склада и всего 50 единиц техники. За 8 лет работы мы значительно расширили ассортимент и географию обслуживания, сохраняя при этом главный принцип — предоставлять клиентам только качественный, надежный инструмент и профессиональное обслуживание.
                </p>
                <p>
                  Сегодня "ИнструментПрокат" — это более 500 единиц современной техники и оборудования, которые помогают нашим клиентам в реализации проектов любой сложности.
                </p>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1581166397057-235af2b3c6dd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Наша история" 
                className="rounded-lg shadow-xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg hidden md:block">
                <p className="text-lg font-bold">Основано в 2017</p>
              </div>
            </div>
          </div>
        </Container>
        
        {/* Stats Section */}
        <section className="bg-gray-100 py-16">
          <Container>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">
                    {stat.icon}
                  </div>
                  <div className="text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </Container>
        </section>
        
        {/* Our Values */}
        <Container className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Наши ценности</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Мы стремимся не только предоставлять инструмент в аренду, но и создавать долгосрочные отношения с нашими клиентами, основанные на взаимном доверии и уважении.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center bg-primary/10 p-3 rounded-full mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </Container>
        
        {/* Team Section */}
        <section className="bg-white py-16">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Наша команда</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                За каждым успешным проектом стоят люди. Познакомьтесь с профессионалами, которые делают "ИнструментПрокат" лучшей компанией в своей области.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {[
                {
                  name: "Александр Иванов",
                  position: "Генеральный директор",
                  image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
                },
                {
                  name: "Мария Петрова",
                  position: "Финансовый директор",
                  image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
                },
                {
                  name: "Дмитрий Сидоров",
                  position: "Технический директор",
                  image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
                },
                {
                  name: "Екатерина Смирнова",
                  position: "Руководитель отдела продаж",
                  image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
                }
              ].map((member, index) => (
                <div key={index} className="text-center">
                  <div className="relative mb-4 aspect-square overflow-hidden rounded-full mx-auto" style={{ maxWidth: "200px" }}>
                    <img
                      src={member.image}
                      alt={member.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <p className="text-gray-600">{member.position}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
        
        {/* Certificates */}
        <Container className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Сертификаты и награды</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Качество наших услуг подтверждено многочисленными сертификатами и наградами в сфере аренды оборудования.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((cert) => (
              <div key={cert} className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-[3/4] overflow-hidden bg-gray-100 flex items-center justify-center">
                  <Award className="h-16 w-16 text-primary opacity-70" />
                </div>
                <div className="p-4 text-center">
                  <h4 className="font-medium">Сертификат #{cert}</h4>
                  <p className="text-sm text-gray-600">2023 год</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
