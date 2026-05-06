import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { Icons } from './Icons';

export function CheckoutModal() {
  const { isCheckoutOpen, setIsCheckoutOpen, items, cartTotal, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Mock API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Close and reset after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
        setIsCheckoutOpen(false);
        clearCart();
      }, 3000);
    }, 1500);
  };

  const closeCheckout = () => {
    if (!isSubmitting && !isSuccess) {
      setIsCheckoutOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCheckout}
            className="absolute inset-0 bg-primary/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-surface relative z-10 w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
          >
            {isSuccess ? (
              <div className="w-full p-12 flex flex-col items-center justify-center text-center bg-primary/5 min-h-[400px]">
                <div className="w-24 h-24 bg-green-500/20 text-green-600 rounded-full flex items-center justify-center mb-6">
                  <Icons.CheckCircle2 className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-bold font-sans text-primary mb-4">Order Placed Successfully!</h2>
                <p className="text-primary/70 font-sans">Thank you for your purchase. We will contact you shortly with delivery details.</p>
              </div>
            ) : (
              <>
                {/* Form Section */}
                <div className="flex-1 p-8 md:p-10 overflow-y-auto">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold font-sans text-primary">Checkout Details</h2>
                    <button onClick={closeCheckout} className="md:hidden text-primary/50 hover:text-primary">
                      <Icons.X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <form id="checkout-form" onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-primary/80 font-sans">Full Name *</label>
                        <input required type="text" className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-sans" placeholder="Rajesh Patil" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-primary/80 font-sans">Phone Number *</label>
                        <input required type="tel" className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-sans" placeholder="+91 98765 43210" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-primary/80 font-sans">State *</label>
                        <input required type="text" className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-sans" placeholder="Maharashtra" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-primary/80 font-sans">District *</label>
                        <input required type="text" className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-sans" placeholder="Nashik" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-primary/80 font-sans">Complete Address *</label>
                      <textarea required rows={3} className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-sans resize-none" placeholder="House/Flat No., Street, Village/Town..."></textarea>
                    </div>

                    <div className="space-y-1 w-full md:w-1/2 pr-0 md:pr-2.5">
                      <label className="text-sm font-semibold text-primary/80 font-sans">PIN Code *</label>
                      <input required type="text" className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-sans" placeholder="414402" />
                    </div>
                  </form>
                </div>

                {/* Summary Section */}
                <div className="w-full md:w-[350px] bg-surface-container p-8 md:p-10 flex flex-col border-t md:border-t-0 md:border-l border-primary/10">
                  <div className="hidden md:flex justify-end mb-6">
                    <button onClick={closeCheckout} className="text-primary/50 hover:text-primary transition-colors bg-white rounded-full p-2 shadow-sm">
                      <Icons.X className="w-5 h-5" />
                    </button>
                  </div>
                  <h3 className="text-xl font-bold font-sans text-primary mb-6">Order Summary</h3>
                  
                  <div className="flex-1 overflow-y-auto mb-6 pr-2 space-y-4">
                    {items.map(item => (
                      <div key={item.id} className="flex justify-between items-start text-sm font-sans">
                        <div className="flex flex-col">
                          <span className="font-semibold text-primary">{item.name}</span>
                          <span className="text-primary/60">Qty: {item.quantity}</span>
                        </div>
                        <span className="font-semibold text-primary">₹{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-primary/20 pt-4 space-y-3 mb-8">
                    <div className="flex justify-between text-sm font-sans text-primary/70">
                      <span>Subtotal</span>
                      <span>₹{cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-sans text-primary/70">
                      <span>Shipping</span>
                      <span className="text-green-600 font-semibold">Free</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold font-sans text-primary pt-2 border-t border-primary/10">
                      <span>Total</span>
                      <span>₹{cartTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    form="checkout-form"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-primary text-secondary-container rounded-xl font-sans font-bold hover:bg-primary-container transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-2 border-secondary-container/30 border-t-secondary-container rounded-full animate-spin" />
                    ) : (
                      <>Place Order <Icons.CheckCircle2 className="w-5 h-5" /></>
                    )}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
