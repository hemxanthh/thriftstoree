import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, X, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatINR } from '../lib/currency';

const MAX_QUANTITY = 5;

const Cart = () => {
  const { items, removeItem, updateQuantity, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="pt-16 min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-light text-neutral-900 tracking-tight mb-4">
              Your cart is empty
            </h1>
            <p className="text-neutral-600 mb-8">
              Discover our curated collection of vintage fashion
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-neutral-900 text-white text-sm font-medium tracking-wide hover:bg-neutral-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <Link
            to="/products"
            className="flex items-center text-neutral-600 hover:text-neutral-900 transition-colors mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
          <h1 className="text-3xl font-light text-neutral-900 tracking-tight">
            Shopping Cart ({items.length})
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div key={`${item.id}-${item.selectedSize}`} className="flex items-center space-x-4 bg-white border border-neutral-200 p-6 rounded-lg shadow-sm">
                <div className="flex-shrink-0 w-24 h-24 bg-neutral-200 rounded overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-neutral-900 truncate">
                    {item.name}
                  </h3>
                  <p className="text-sm text-neutral-500 uppercase tracking-wide">
                    {item.category} • Size: {item.selectedSize}
                  </p>
                  <div className="mt-1">
                    <p className="text-lg font-semibold text-neutral-900">
                      {formatINR(item.price * item.quantity)}
                    </p>
                    <p className="text-xs text-neutral-500">{formatINR(item.price)} each</p>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => updateQuantity(item.id, item.selectedSize || '', Math.max(0, item.quantity - 1))}
                    aria-label={`Decrease quantity for ${item.name}`}
                    title={`Decrease quantity for ${item.name}`}
                    className="w-9 h-9 border border-neutral-500 rounded flex items-center justify-center bg-white text-neutral-950 hover:bg-neutral-100 transition-colors shadow-sm"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-2 border border-neutral-400 rounded px-3 py-2 bg-white shadow-sm min-w-[84px] justify-center">
                    <span className="text-[11px] uppercase tracking-wide text-neutral-600">Qty</span>
                    <span className="text-base font-semibold w-6 text-center text-neutral-950 opacity-100">{item.quantity}</span>
                  </div>
                  <button
                    onClick={() => updateQuantity(item.id, item.selectedSize || '', item.quantity + 1)}
                    disabled={item.quantity >= MAX_QUANTITY}
                    aria-label={`Increase quantity for ${item.name}`}
                    title={item.quantity >= MAX_QUANTITY ? 'Maximum quantity reached' : `Increase quantity for ${item.name}`}
                    className="w-9 h-9 border border-neutral-500 rounded flex items-center justify-center bg-white text-neutral-950 hover:bg-neutral-100 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.id, item.selectedSize || '')}
                  aria-label={`Remove ${item.name} from cart`}
                  title={`Remove ${item.name} from cart`}
                  className="p-2 text-neutral-500 hover:text-red-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white border border-neutral-200 p-6 rounded-lg h-fit shadow-sm">
            <h3 className="text-lg font-medium text-neutral-900 mb-4">
              Order Summary
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-700">Subtotal</span>
                <span className="font-semibold text-neutral-900">{formatINR(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-700">Shipping</span>
                <span className="font-semibold text-neutral-900">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-700">GST (approx.)</span>
                <span className="font-semibold text-neutral-900">{formatINR(total * 0.18)}</span>
              </div>
              <div className="border-t border-neutral-300 pt-3 flex justify-between text-lg font-bold text-neutral-900">
                <span>Total</span>
                <span>{formatINR(total * 1.18)}</span>
              </div>
            </div>

            <button className="w-full mt-6 py-4 px-6 bg-neutral-900 text-white text-sm font-medium tracking-wide hover:bg-neutral-800 transition-colors shadow-md">
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;