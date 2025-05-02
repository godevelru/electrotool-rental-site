
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  dailyRate: number;
  image: string;
  available: boolean;
  category: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col transition-all hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform hover:scale-105 duration-300"
        />
        {!product.available && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="text-white font-bold text-xl">Не доступен</span>
          </div>
        )}
      </div>
      <CardContent className="pt-4 flex-grow">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold text-lg hover:text-primary transition-colors mb-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 line-clamp-2 mb-2">{product.description}</p>
        <div className="flex justify-between items-center mt-auto">
          <span className="font-semibold text-lg">{product.dailyRate} ₽/день</span>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          onClick={() => onAddToCart(product)} 
          className="w-full"
          disabled={!product.available}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          В корзину
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
