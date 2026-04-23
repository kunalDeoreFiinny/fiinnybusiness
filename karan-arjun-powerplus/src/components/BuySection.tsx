"use client";

import { useState } from "react";
import Image from "next/image";
import { useLang } from "@/lib/LangContext";
import { siteConfig } from "@/lib/config";
import { useScrollReveal } from "@/hooks/useScrollReveal";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BuySection() {
  const { lang, tx } = useLang();
  const buyRef = useScrollReveal();

  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState<"1L" | "3L" | "5L">("3L");
  const [formData, setFormData] = useState({ name: "", phone: "", address: "", state: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const basePrice = siteConfig.pricing[size];
  const subtotal = basePrice * quantity;
  const delivery = siteConfig.pricing.delivery;
  const gst = subtotal * siteConfig.pricing.gstRate;
  const total = subtotal + gst + delivery;

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create order on backend
      const res = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });
      const data = await res.json();
      
      if (!data.success) throw new Error(data.error || "Failed to create order");

      // 2. Load script
      if (!window.Razorpay) {
        await new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }

      // 3. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_S1aAwIHZXLMSDG",
        amount: data.order.amount,
        currency: "INR",
        name: "Karan Arjun Power Plus",
        description: `${quantity}× ${size} Bottle`,
        order_id: data.order.id,
        prefill: {
          name: formData.name,
          contact: formData.phone,
        },
        theme: { color: "#16a34a" },
        handler: async (response: any) => {
          // Inform system of successful payment
          await fetch("/api/order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              ...formData, size, quantity, total, 
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id
            }),
          });
          setSubmitted(true);
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => alert("Payment failed. Please try again or use COD via phone."));
      rzp.open();

    } catch (err: any) {
      console.error(err);
      alert(err.message === "Invalid key_secret" 
        ? "Payment Gateway Not Configured: Missing Secret Key on server." 
        : "Failed to initiate payment. Please call us to order via COD.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="buy"
      ref={buyRef as React.RefObject<HTMLElement>}
      className="buy-section"
      aria-label="Order section"
    >
      <div className="container">
        <h2 className="section-title text-center anim-item">{tx.orderOnline}</h2>
        <p className="section-subtitle text-center anim-item delay-100">{tx.orderSub}</p>

        <div className="buy-grid">
          {/* Pricing Card */}
          <div className="pricing-card glass anim-item delay-200">
            <Image
              src={`/images/bottle-${size.toLowerCase()}.png`}
              alt={`Karan Arjun Power Plus ${size} bottle`}
              style={{ margin: "0 auto 1.5rem", borderRadius: "12px", width: "100%", maxWidth: "180px", height: "auto" }}
              width={180}
              height={150}
            />
            <h3>Karan Arjun Power Plus</h3>
            <p style={{ color: "var(--text-600)", marginBottom: "1rem" }}>
              Humates &amp; Fulvates 22% (Liquid)
            </p>

            <div className="size-selector">
              {(["1L", "3L", "5L"] as const).map((s) => (
                <button
                  key={s}
                  className={`size-btn ${size === s ? "active" : ""}`}
                  onClick={() => setSize(s)}
                  aria-pressed={size === s}
                >
                  {s} — ₹{siteConfig.pricing[s]}/-
                </button>
              ))}
            </div>

            <div className="pricing-details">
              <div className="pricing-row">
                <span>{lang === "hi" ? "मूल्य" : lang === "mr" ? "मूळ किंमत" : "Base Price"}:</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="pricing-row">
                <span>GST (5%):</span>
                <span>₹{gst}</span>
              </div>
              <div className="pricing-row">
                <span>{lang === "hi" ? "डिलीवरी" : lang === "mr" ? "वितरण शुल्क" : "Delivery"}:</span>
                <span>₹{delivery}</span>
              </div>
              <div className="pricing-row">
                <span>{lang === "hi" ? "मात्रा" : lang === "mr" ? "प्रमाण" : "Quantity"}:</span>
                <div className="qty-control">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity" type="button">−</button>
                  <span aria-live="polite">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity" type="button">+</button>
                </div>
              </div>
              <div className="pricing-row total-row">
                <span>{lang === "hi" ? "कुल" : lang === "mr" ? "एकूण" : "Total"}:</span>
                <strong>₹{total.toLocaleString()}</strong>
              </div>
            </div>

            <div className="trust-badges">
              <span>🚚 PAN India</span>
              <span>💵 COD {lang === "hi" ? "उपलब्ध" : lang === "mr" ? "उपलब्ध" : "Available"}</span>
            </div>
          </div>

          {/* Order Form */}
          <div className="order-form-wrap glass anim-item delay-300">
            {submitted ? (
              <div className="order-success">
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
                <h3>{tx.orderSuccess}</h3>
                <p>{tx.orderSuccessMsg}</p>
                <p style={{ color: "var(--text-400)", marginTop: "1rem", fontSize: "0.9rem" }}>
                  {lang === "hi" ? "तत्काल ऑर्डर के लिए:" : lang === "mr" ? "तातडीच्या ऑर्डरसाठी:" : "For urgent orders:"}{" "}
                  <a href={`tel:${siteConfig.phone}`}>{siteConfig.phone}</a>
                </p>
              </div>
            ) : (
              <form onSubmit={handlePurchase} className="order-form" aria-label="Order form">
                <h3>{tx.deliveryDetails}</h3>

                <div className="form-field">
                  <label htmlFor="buyer-name">{tx.nameLbl}</label>
                  <input
                    id="buyer-name"
                    required
                    type="text"
                    placeholder={lang === "hi" ? "आपका पूरा नाम" : lang === "mr" ? "तुमचे पूर्ण नाव" : "Your full name"}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    autoComplete="name"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="buyer-phone">{tx.phoneLbl}</label>
                  <input
                    id="buyer-phone"
                    required
                    type="tel"
                    placeholder="10-digit mobile number"
                    pattern="[0-9]{10}"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    autoComplete="tel"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="buyer-state">{tx.stateLbl}</label>
                  <select
                    id="buyer-state"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  >
                    <option value="">{lang === "hi" ? "राज्य चुनें" : lang === "mr" ? "राज्य निवडा" : "Select State"}</option>
                    {[
                      "Maharashtra", "Andhra Pradesh", "Bihar", "Chhattisgarh",
                      "Gujarat", "Haryana", "Karnataka", "Madhya Pradesh",
                      "Punjab", "Rajasthan", "Telangana", "Uttar Pradesh",
                      "West Bengal", "Other"
                    ].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="buyer-address">{tx.addressLbl}</label>
                  <textarea
                    id="buyer-address"
                    required
                    placeholder={lang === "hi" ? "गाँव/शहर, तालुका, जिला, पिनकोड" : lang === "mr" ? "गाव/शहर, तालुका, जिल्हा, पिनकोड" : "Village / Town, Taluka, District, PIN"}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    autoComplete="street-address"
                  />
                </div>

                <div className="order-summary">
                  <span>{quantity}× {size} — {formData.state || "India"}</span>
                  <strong>₹{total.toLocaleString()}</strong>
                </div>

                <button type="submit" className="btn btn-primary btn-full pulse-btn" disabled={loading}>
                  {loading ? "..." : `${tx.placeOrder} ₹${total.toLocaleString()}`}
                </button>

                <p className="form-note">{tx.codNote}</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
