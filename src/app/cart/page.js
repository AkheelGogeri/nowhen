"use client";
import { useState, useEffect } from "react";
import Navbar from "../Navbar";
import { useCart } from "../CartContext";

export default function Cart() {
  const { cart, removeFromCart, updateQty, clearCart } = useCart();
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "", address: "" });

  useEffect(() => {
    async function prefillFromAccount() {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return;
      const { user } = await res.json();
      setCustomer((prev) => ({
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
        address: prev.address || user.address || "",
      }));
    }
    prefillFromAccount();
  }, []);
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState(null);
  const [promoInput, setPromoInput] = useState("");
  const [offer, setOffer] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = offer
    ? offer.discount_percent
      ? Math.round((subtotal * offer.discount_percent) / 100)
      : Math.min(offer.discount_amount, subtotal)
    : 0;
  const total = Math.max(subtotal - discount, 0);

  function handleChange(field, value) {
    setCustomer((prev) => ({ ...prev, [field]: value }));
  }

  async function handleApplyPromo() {
    setPromoError("");
    if (!promoInput) return;
    setApplyingPromo(true);
    try {
      const res = await fetch("/api/offers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code");
      setOffer(data);
    } catch (err) {
      setOffer(null);
      setPromoError(err.message);
    } finally {
      setApplyingPromo(false);
    }
  }

  function handleRemovePromo() {
    setOffer(null);
    setPromoInput("");
    setPromoError("");
  }

  async function handleCheckout() {
    setError("");

    if (!customer.name || !customer.email || !customer.phone || !customer.address) {
      setError("Please fill in all your details before checking out.");
      return;
    }

    setPlacing(true);
    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({ id: item.id, selectedSize: item.selectedSize, qty: item.qty })),
          customer,
          offerCode: offer?.code || null,
        }),
      });

      const order = await res.json();
      if (!res.ok) throw new Error(order.error || "Could not start checkout");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Nowhen",
        description: "Order Payment",
        order_id: order.id,
        prefill: {
          name: customer.name,
          email: customer.email,
          contact: customer.phone,
        },
        handler: async function (response) {
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification failed");
            clearCart();
            setPlacedOrderId(order.dbOrderId);
            setSuccess(true);
          } catch (err) {
            setError(err.message + " — contact us with your payment ID if you were charged.");
          } finally {
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPlacing(false);
          },
        },
        theme: {
          color: "#8B1E24",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function () {
        setError("Payment failed. Please try again.");
        setPlacing(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.message);
      setPlacing(false);
    }
  }

  if (success) {
    return (
      <>
        <Navbar />
        <main
          className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-4"
          style={{ backgroundColor: "#000000", color: "#F5F2EC" }}
        >
          <h1 className="text-2xl tracking-widest">ORDER PLACED</h1>
          {placedOrderId && (
            <p className="text-sm tracking-[0.15em] uppercase" style={{ color: "#8B1E24" }}>
              Order #{placedOrderId}
            </p>
          )}
          <p className="text-sm opacity-70 max-w-sm">
            Thank you — your payment went through. We'll email you at {customer.email} with updates.
            Save your order number to track it anytime under Account.
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main
        className="min-h-screen px-4 sm:px-6 md:px-10 pt-28 pb-16"
        style={{ backgroundColor: "#000000", color: "#F5F2EC" }}
      >
        <h1 className="text-2xl md:text-3xl tracking-widest mb-8 md:mb-10 text-center">CART</h1>

        {cart.length === 0 ? (
          <p className="text-center opacity-70">Your cart is empty.</p>
        ) : (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Items */}
            <div>
              {cart.map((item) => {
                const image = (item.images && item.images[0]) || item.image;
                return (
                  <div
                    key={item.cartId}
                    className="flex items-center gap-4 border-b py-4"
                    style={{ borderColor: "#222" }}
                  >
                    {image && (
                      <img
                        src={image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded flex-shrink-0"
                        style={{ backgroundColor: "#111" }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{item.name}</p>
                      {item.selectedSize && (
                        <p className="text-xs opacity-50 mt-0.5">Size: {item.selectedSize}</p>
                      )}
                      <p className="text-sm mt-1" style={{ color: "#8B1E24" }}>
                        ₹{item.price}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => updateQty(item.cartId, item.qty - 1)}
                        aria-label="Decrease quantity"
                        className="w-7 h-7 flex items-center justify-center rounded"
                        style={{ border: "1px solid #333" }}
                      >
                        −
                      </button>
                      <span className="text-sm w-5 text-center">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.cartId, item.qty + 1)}
                        aria-label="Increase quantity"
                        className="w-7 h-7 flex items-center justify-center rounded"
                        style={{ border: "1px solid #333" }}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.cartId)}
                      aria-label="Remove item"
                      className="text-xs tracking-wide opacity-60 hover:opacity-100 flex-shrink-0 ml-2"
                      style={{ color: "#8B1E24" }}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}

              {/* Promo code */}
              <div className="mt-6">
                {offer ? (
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: "#3E8B4A" }}>
                      Code {offer.code} applied
                    </span>
                    <button
                      onClick={handleRemovePromo}
                      className="text-xs tracking-wide opacity-60 hover:opacity-100"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo code"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      className="flex-1 px-4 py-2.5 rounded outline-none text-sm"
                      style={{ backgroundColor: "#1A1A1A", border: "1px solid #333", color: "#F5F2EC" }}
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={applyingPromo}
                      className="px-5 text-xs tracking-[0.2em] uppercase"
                      style={{ border: "1px solid #F5F2EC" }}
                    >
                      {applyingPromo ? "..." : "Apply"}
                    </button>
                  </div>
                )}
                {promoError && (
                  <p className="text-xs mt-2" style={{ color: "#8B1E24" }}>
                    {promoError}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1 mt-6 text-sm">
                <div className="flex justify-between opacity-70">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between" style={{ color: "#3E8B4A" }}>
                    <span>Discount</span>
                    <span>−₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg mt-2">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>
            </div>

            {/* Checkout form */}
            <div className="flex flex-col gap-4">
              <h2 className="text-sm tracking-[0.2em] uppercase opacity-70 mb-1">Shipping Details</h2>

              <input
                type="text"
                placeholder="Full name"
                value={customer.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="px-4 py-3 rounded outline-none text-sm"
                style={{ backgroundColor: "#1A1A1A", border: "1px solid #333", color: "#F5F2EC" }}
              />
              <input
                type="email"
                placeholder="Email"
                value={customer.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="px-4 py-3 rounded outline-none text-sm"
                style={{ backgroundColor: "#1A1A1A", border: "1px solid #333", color: "#F5F2EC" }}
              />
              <input
                type="tel"
                placeholder="Phone number"
                value={customer.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="px-4 py-3 rounded outline-none text-sm"
                style={{ backgroundColor: "#1A1A1A", border: "1px solid #333", color: "#F5F2EC" }}
              />
              <textarea
                placeholder="Shipping address"
                value={customer.address}
                onChange={(e) => handleChange("address", e.target.value)}
                rows={3}
                className="px-4 py-3 rounded outline-none text-sm resize-none"
                style={{ backgroundColor: "#1A1A1A", border: "1px solid #333", color: "#F5F2EC" }}
              />

              {error && (
                <p className="text-xs" style={{ color: "#8B1E24" }}>
                  {error}
                </p>
              )}

              <button
                onClick={handleCheckout}
                disabled={placing}
                className="mt-2 w-full py-3 text-sm tracking-wide disabled:opacity-60"
                style={{ backgroundColor: "#8B1E24", color: "#F5F2EC" }}
              >
                {placing ? "PROCESSING..." : `PAY ₹${total}`}
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
