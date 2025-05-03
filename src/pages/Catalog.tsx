
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  SlidersHorizontal,
} from "lucide-react";
import { productsApi } from "@/lib/api";
import CategoryFilter, { Category } from "@/components/catalog/CategoryFilter";
import PriceRangeFilter from "@/components/catalog/PriceRangeFilter";
import ProductCard from "@/components/product/ProductCard";
import { useToast } from "@/components/ui/use-toast";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type Product = {
  id: number;
  name: string;
  category: string;
  description: string;
  image: string;
  price: number;
  dailyRate: number;
  available: boolean;
};

const Catalog = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Параметры фильтрации и поиска
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const search = searchParams.get("search") || "";
  const selectedCategories = searchParams.getAll("category");
  const sortBy = searchParams.get("sortBy") || "popular";
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");
  const minPrice = minPriceParam ? parseInt(minPriceParam) : 100;
  const maxPrice = maxPriceParam ? parseInt(maxPriceParam) : 5000;
  const onlyAvailable = searchParams.get("available") === "true";

  // Загрузка данных при изменении параметров
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await productsApi.getProducts({
          page,
          limit,
          search,
          category: selectedCategories.join(","),
          minPrice,
          maxPrice,
          sortBy,
          available: onlyAvailable,
        });
        setProducts(response.data);
        setTotalItems(response.meta.total);
        setTotalPages(response.meta.totalPages);
      } catch (error) {
        toast({
          title: "Ошибка при загрузке данных",
          description: "Не удалось загрузить список инструментов",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await productsApi.getCategories();
        setCategories(response);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchProducts();
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [searchParams, toast]);

  // Обновление параметров URL
  const updateSearchParams = (
    name: string,
    value: string | number | boolean | string[]
  ) => {
    const newParams = new URLSearchParams(searchParams.toString());

    if (Array.isArray(value)) {
      newParams.delete(name);
      value.forEach((val) => newParams.append(name, val.toString()));
    } else if (value === "" || value === null) {
      newParams.delete(name);
    } else {
      newParams.set(name, value.toString());
    }

    // Сбрасываем страницу на первую при изменении фильтров
    if (name !== "page") {
      newParams.set("page", "1");
    }

    setSearchParams(newParams);
  };

  // Обработчики изменения фильтров
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchValue = formData.get("search") as string;
    updateSearchParams("search", searchValue);
  };

  const handleCategoryChange = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    updateSearchParams("category", newCategories);
  };

  const handlePriceChange = (min: number, max: number) => {
    updateSearchParams("minPrice", min);
    updateSearchParams("maxPrice", max);
  };

  const handleSortChange = (value: string) => {
    updateSearchParams("sortBy", value);
  };

  const handleAvailabilityChange = (value: string) => {
    updateSearchParams("available", value === "available");
  };

  const handlePageChange = (newPage: number) => {
    updateSearchParams("page", newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetFilters = () => {
    setSearchParams({ page: "1", limit: limit.toString() });
  };

  // Skeletons for loading state
  const renderSkeletons = () => {
    return Array(limit)
      .fill(0)
      .map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm p-4 animate-pulse"
        >
          <div className="aspect-square bg-gray-200 rounded-md mb-4"></div>
          <div className="h-5 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      ));
  };

  // Переключатель страниц
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <Button
            key={p}
            variant={p === page ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(p)}
            className={p === page ? "pointer-events-none" : ""}
          >
            {p}
          </Button>
        ))}

        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  // Фильтры для десктопа
  const FiltersContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Фильтры</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleResetFilters}
          className="h-8 text-primary hover:text-primary/80"
        >
          Сбросить
        </Button>
      </div>

      <Separator />

      <CategoryFilter
        categories={categories}
        selectedCategories={selectedCategories}
        onCategoryChange={handleCategoryChange}
        isLoading={categories.length === 0}
      />

      <Separator />

      <PriceRangeFilter
        minPrice={100}
        maxPrice={5000}
        currentMin={minPrice}
        currentMax={maxPrice}
        onPriceChange={handlePriceChange}
      />

      <Separator />

      <div className="space-y-4">
        <h3 className="font-medium text-lg">Наличие</h3>
        <Tabs
          defaultValue={onlyAvailable ? "available" : "all"}
          onValueChange={handleAvailabilityChange}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="all">Все</TabsTrigger>
            <TabsTrigger value="available">В наличии</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow bg-gray-50">
        <Container className="py-8">
          <div className="flex flex-col space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold mb-2">Каталог инструментов</h1>
              <p className="text-gray-600">
                Выберите необходимый инструмент для аренды
              </p>
            </div>

            {/* Search and Sort */}
            <div className="flex flex-col sm:flex-row gap-4">
              <form
                onSubmit={handleSearch}
                className="relative flex-grow max-w-xl"
              >
                <Input
                  placeholder="Поиск инструментов..."
                  name="search"
                  defaultValue={search}
                  className="pr-10"
                />
                <Button
                  type="submit"
                  size="icon"
                  variant="ghost"
                  className="absolute right-0 top-0 h-full"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </form>

              <div className="flex gap-2">
                <Select
                  value={sortBy}
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Сортировка" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">По популярности</SelectItem>
                    <SelectItem value="price_asc">Цена: по возрастанию</SelectItem>
                    <SelectItem value="price_desc">Цена: по убыванию</SelectItem>
                    <SelectItem value="name_asc">По названию А-Я</SelectItem>
                    <SelectItem value="name_desc">По названию Я-А</SelectItem>
                  </SelectContent>
                </Select>

                <div className="hidden md:flex border rounded-md overflow-hidden">
                  <Button
                    variant={view === "grid" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setView("grid")}
                    className="rounded-none"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={view === "list" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setView("list")}
                    className="rounded-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                <Sheet>
                  <SheetTrigger asChild className="md:hidden">
                    <Button variant="outline" size="icon">
                      <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px]">
                    <FiltersContent />
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Active filters */}
            {(selectedCategories.length > 0 ||
              search ||
              minPrice !== 100 ||
              maxPrice !== 5000 ||
              onlyAvailable) && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-500">Активные фильтры:</span>
                {selectedCategories.map((category) => (
                  <Button
                    key={category}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category}
                    <X className="h-3 w-3" />
                  </Button>
                ))}
                {search && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => updateSearchParams("search", "")}
                  >
                    Поиск: {search}
                    <X className="h-3 w-3" />
                  </Button>
                )}
                {(minPrice !== 100 || maxPrice !== 5000) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => {
                      updateSearchParams("minPrice", 100);
                      updateSearchParams("maxPrice", 5000);
                    }}
                  >
                    Цена: {minPrice} ₽ - {maxPrice} ₽
                    <X className="h-3 w-3" />
                  </Button>
                )}
                {onlyAvailable && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => updateSearchParams("available", false)}
                  >
                    Только в наличии
                    <X className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleResetFilters}
                >
                  Сбросить все
                </Button>
              </div>
            )}

            {/* Main content */}
            <div className="grid grid-cols-12 gap-6">
              {/* Filters - Desktop */}
              <Card className="col-span-12 md:col-span-3 h-fit hidden md:block">
                <CardContent className="p-6">
                  <FiltersContent />
                </CardContent>
              </Card>

              {/* Products grid */}
              <div className="col-span-12 md:col-span-9">
                {/* Results summary */}
                <div className="flex justify-between items-center mb-6">
                  <p className="text-sm text-gray-600">
                    Найдено инструментов: {totalItems}
                  </p>
                  <div className="flex items-center gap-2">
                    <Select
                      value={limit.toString()}
                      onValueChange={(value) =>
                        updateSearchParams("limit", parseInt(value))
                      }
                    >
                      <SelectTrigger className="w-[110px]">
                        <SelectValue placeholder="Показывать по" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12 на странице</SelectItem>
                        <SelectItem value="24">24 на странице</SelectItem>
                        <SelectItem value="36">36 на странице</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Products grid or loading skeleton */}
                <div
                  className={
                    view === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "space-y-4"
                  }
                >
                  {isLoading
                    ? renderSkeletons()
                    : products.length > 0
                    ? products.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          view={view}
                        />
                      ))
                    : !isLoading && (
                        <div className="col-span-full text-center py-12">
                          <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <Filter className="h-10 w-10 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">
                            Ничего не найдено
                          </h3>
                          <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            Попробуйте изменить параметры поиска или сбросить фильтры
                          </p>
                          <Button onClick={handleResetFilters}>
                            Сбросить все фильтры
                          </Button>
                        </div>
                      )}
                </div>

                {/* Pagination */}
                {!isLoading && products.length > 0 && renderPagination()}
              </div>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
};

export default Catalog;
