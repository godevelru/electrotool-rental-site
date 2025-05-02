
import { Product } from "@/components/product/ProductCard";

export const products: Product[] = [
  {
    id: 1,
    name: "Перфоратор Bosch GBH 2-26",
    description: "Мощный перфоратор для сверления в бетоне, кирпиче и камне. Три режима работы: сверление, сверление с ударом, долбление.",
    price: 15000,
    dailyRate: 600,
    image: "https://images.unsplash.com/photo-1586864387789-628af9feed72?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    available: true,
    category: "Электроинструмент"
  },
  {
    id: 2,
    name: "Шуруповерт Makita DDF484",
    description: "Аккумуляторный шуруповерт с бесщеточным двигателем, 2 скорости, высокий крутящий момент для профессиональных работ.",
    price: 12000,
    dailyRate: 500,
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    available: true,
    category: "Электроинструмент"
  },
  {
    id: 3,
    name: "Болгарка DeWalt DWE4257",
    description: "Угловая шлифмашина с мощным двигателем 1500 Вт. Диаметр диска 125 мм. Идеальна для резки и шлифовки.",
    price: 9000,
    dailyRate: 450,
    image: "https://images.unsplash.com/photo-1572981779307-38ab55a4a2fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    available: true,
    category: "Электроинструмент"
  },
  {
    id: 4,
    name: "Циркулярная пила Metabo KS 55 FS",
    description: "Дисковая пила для точных прямых пропилов в древесине, ДСП и других материалах. Мощность 1200 Вт.",
    price: 8500,
    dailyRate: 400,
    image: "https://images.unsplash.com/photo-1620226856265-77ffa1f0c9a4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    available: true,
    category: "Электроинструмент"
  },
  {
    id: 5,
    name: "Лазерный уровень Hilti PM 2-LG",
    description: "Профессиональный лазерный уровень с зелеными лучами для высокой видимости. Самовыравнивание, защита от пыли и брызг.",
    price: 18000,
    dailyRate: 700,
    image: "https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    available: false,
    category: "Измерительный инструмент"
  },
  {
    id: 6,
    name: "Бетономешалка WORTEX CM 160",
    description: "Надежная бетономешалка объемом 160 литров для приготовления бетона, раствора и других строительных смесей.",
    price: 15000,
    dailyRate: 900,
    image: "https://images.unsplash.com/photo-1508450859948-4e04fabaa4ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    available: true,
    category: "Строительное оборудование"
  },
];

export const categories = [
  "Все категории",
  "Электроинструмент",
  "Измерительный инструмент",
  "Строительное оборудование",
  "Садовая техника",
  "Сварочное оборудование"
];
