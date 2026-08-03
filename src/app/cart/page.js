"use client";
import Navbar from "../Navbar";
import { useCart } from "../CartContext";

export default function Cart() {
  const { cart } = useCart();

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  async function handleCheckout() {
    const res = await fetch("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: total }),
    });

    const order = await res.json();

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Nowhen",
      description: "Order Payment",
      order_id: order.id,
      handler: function (response) {
        alert("Payment successful! Payment ID: " + response.razorpay_payment_id);
      },
      theme: {
        color: "#8B1E24",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  return (
    <>
      <Navbar />
      <main
        className="min-h-screen px-8 py-12"
        style={{ backgroundColor: "#000000", color: "#F5F2EC" }}
      >
        <h1 className="text-3xl tracking-widest mb-10 text-center">CART</h1>

        {cart.length === 0 ? (
          <p className="text-center opacity-70">Your cart is empty.</p>
        ) : (
          <div className="max-w-xl mx-auto">
            {cart.map((item, index) => (
              <div
                key={index}
                className="flex justify-between border-b py-3"
                style={{ borderColor: "#333" }}
              >
                <span>{item.name}</span>
                <span>₹{item.price}</span>
              </div>
            ))}

            <div className="flex justify-between mt-6 text-lg">
              <span>Total</span>
              <span>₹{total}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="mt-6 w-full py-3 text-sm tracking-wide"
              style={{ backgroundColor: "#8B1E24", color: "#F5F2EC" }}
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        )}
      </main>
    </>
  );
}