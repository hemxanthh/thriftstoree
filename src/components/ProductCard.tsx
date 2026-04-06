import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { Product } from '../types/Product';
import { useCart } from '../context/CartContext';
import { formatINR } from '../lib/currency';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
  };

  return (
    <div className="group cursor-pointer">
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative overflow-hidden bg-neutral-100 rounded-lg aspect-square mb-4">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={handleAddToCart}
                title={`Quick add ${product.name} to cart`}
                aria-label={`Quick add ${product.name} to cart`}
                className="p-3 bg-white rounded-full shadow-lg hover:bg-neutral-100 transition-colors"
              >
                <ShoppingBag className="h-5 w-5 text-neutral-900" />
              </button>
              <button className="p-3 bg-white rounded-full shadow-lg hover:bg-neutral-100 transition-colors" title="Add to wishlist" aria-label="Add to wishlist">
                <Heart className="h-5 w-5 text-neutral-900" />
              </button>
            </div>
          </div>

          {/* Badge */}
          {product.isVintage && (
            <div className="absolute top-3 left-3 bg-neutral-900 text-white text-xs font-medium px-2 py-1 rounded">
              VINTAGE
            </div>
          )}
        </div>
      </Link>

      <div className="space-y-1">
        <Link to={`/products/${product.id}`} className="block">
          <h3 className="text-sm font-medium text-neutral-900 truncate group-hover:text-neutral-600 transition-colors hover:underline underline-offset-2">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-neutral-500 uppercase tracking-wide">
          {product.category}
        </p>
        <div className="flex items-center justify-between pt-1">
          <p className="text-lg font-medium text-neutral-900">
            {formatINR(product.price)}
          </p>
          <button
            onClick={handleAddToCart}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-900 text-white text-xs font-medium hover:bg-neutral-800 transition-colors"
            title={`Add ${product.name} to cart`}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;