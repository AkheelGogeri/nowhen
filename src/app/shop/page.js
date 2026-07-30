"use client";
import Navbar from "../Navbar";
import { useCart } from "../CartContext";

const products = [
  { id: 1, name: "Nowhen Signature Tee — Black", price: 899, image: "/logo.png" },
  { id: 2, name: "Nowhen Signature Tee — Bone", price: 899, image: "/logo.png" },
  { id: 3, name: "Nowhen Oversized Tee — Charcoal", price: 999, image: "/logo.png" },
];

export default function Shop() {
  const { addToCart } = useCart();

  return (
    <>
      <Navbar />
      <main
        className="min-h-screen px-8 py-12"
        style={{ backgroundColor: "#000000", color: "#F5F2EC" }}
      >
        <h1 className="text-3xl tracking-widest mb-10 text-center">SHOP</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col items-center">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-64 object-contain bg-white rounded"
              />
              <p className="mt-4 text-sm tracking-wide text-center">{product.name}</p>
              <p className="mt-1 opacity-70">₹{product.price}</p>
              <button
                onClick={() => addToCart(product)}
                className="mt-3 px-6 py-2 text-sm tracking-wide"
                style={{ backgroundColor: "#8B1E24", color: "#F5F2EC" }}
              >
                ADD TO CART
              </button>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}