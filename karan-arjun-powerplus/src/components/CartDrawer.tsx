import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { Icons } from './Icons';

export function CartDrawer() {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeFromCart, cartTotal, setIsCheckoutOpen } = useCart();

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-primary/60 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-surface shadow-2xl z-[70] flex flex-col border-l border-white/20"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-primary/10">
              <h2 className="font-sans text-2xl font-bold text-primary flex items-center gap-2">
                <Icons.ShoppingCart className="w-6 h-6" /> Your Cart
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-primary/60 hover:text-primary hover:bg-primary/5 rounded-full transition-colors"
              >
                <Icons.X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-primary/40 space-y-4">
                  <Icons.ShoppingCart className="w-16 h-16 opacity-50" />
                  <p className="font-sans font-medium text-lg">Your cart is empty.</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-4 px-6 py-2 bg-primary/5 hover:bg-primary/10 text-primary rounded-full font-semibold transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 rounded-2xl border border-primary/10 bg-white">
                    <div className="w-20 h-20 bg-primary/5 rounded-xl flex items-center justify-center shrink-0">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-contain" />
                    </div>
                    <div className="flex flex-col justify-between flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-sans font-bold text-primary">{item.name}</h3>
                          <p className="font-sans text-sm font-semibold text-primary/60">₹{item.price.toLocaleString()}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-primary/40 hover:text-red-500 transition-colors"
                        >
                          <Icons.X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3 bg-primary/5 rounded-full px-3 py-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="text-primary/60 hover:text-primary font-bold"
                          >
                            -
                          </button>
                          <span className="font-sans font-bold text-sm w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="text-primary/60 hover:text-primary font-bold"
                          >
                            +
                          </button>
                        </div>
                        <p className="font-sans font-bold text-primary">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-primary/10 bg-surface-container">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-sans text-primary/60 font-medium">Subtotal</span>
                  <span className="font-sans text-2xl font-bold text-primary">₹{cartTotal.toLocaleString()}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-4 bg-primary text-white rounded-xl font-sans font-bold hover:bg-primary-container transition-colors shadow-lg flex justify-center items-center gap-2"
                >
                  Proceed to Checkout <Icons.ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
