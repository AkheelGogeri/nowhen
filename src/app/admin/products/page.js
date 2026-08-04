"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const SIZE_OPTIONS = ["S", "M", "L", "XL", "XXL"];

function ProductModal({ product, onClose, onSaved }) {
  const isEditing = Boolean(product);

  const [name, setName] = useState(product?.name || "");
  const [price, setPrice] = useState(product?.price || "");
  const [sizes, setSizes] = useState(product?.sizes || []);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState(
    product?.images || [product?.image].filter(Boolean) || []
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function toggleSize(size) {
    setSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  }

  function handleFileChange(e) {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const hasImages = files.length > 0 || existingImages.length > 0;
    if (!name || !price || !hasImages) {
      setError("Name, price, and at least one image are required.");
      return;
    }

    setUploading(true);

    try {
      let uploadedUrls = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        uploadedUrls.push(data.url);
      }

      const finalImages = uploadedUrls.length > 0 ? uploadedUrls : existingImages;

      const url = isEditing ? `/api/admin/products/${product.id}` : "/api/admin/products";
      const method = isEditing ? "PUT" : "POST";

      const saveRes = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: Number(price),
          sizes,
          images: finalImages,
        }),
      });

      if (!saveRes.ok) throw new Error("Failed to save product");

      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 rounded flex flex-col gap-4"
        style={{ backgroundColor: "#1A1A1A", border: "1px solid #333" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm tracking-[0.2em] uppercase" style={{ color: "#F5F2EC" }}>
            {isEditing ? "Edit Product" : "Add Product"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-lg leading-none"
            style={{ color: "#F5F2EC" }}
          >
            ✕
          </button>
        </div>

        <input
          type="text"
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-4 py-3 rounded outline-none text-sm"
          style={{ backgroundColor: "#0D0D0D", color: "#F5F2EC", border: "1px solid #333" }}
        />

        <input
          type="number"
          placeholder="Price (₹)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="px-4 py-3 rounded outline-none text-sm"
          style={{ backgroundColor: "#0D0D0D", color: "#F5F2EC", border: "1px solid #333" }}
        />

        <div>
          <label
            className="text-xs tracking-[0.15em] uppercase opacity-70 block mb-2"
            style={{ color: "#F5F2EC" }}
          >
            Available Sizes
          </label>
          <div className="flex gap-2 flex-wrap">
            {SIZE_OPTIONS.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className="px-4 py-2 text-xs tracking-wide rounded transition-colors"
                style={{
                  backgroundColor: sizes.includes(size) ? "#8B1E24" : "#0D0D0D",
                  color: "#F5F2EC",
                  border: "1px solid #333",
                }}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            className="text-xs tracking-[0.15em] uppercase opacity-70 block mb-2"
            style={{ color: "#F5F2EC" }}
          >
            Product Images {isEditing && "(leave empty to keep current)"}
          </label>
          <label
            className="inline-flex items-center gap-2 px-5 py-3 text-xs tracking-[0.2em] uppercase cursor-pointer transition-opacity hover:opacity-80"
            style={{ border: "1px solid #F5F2EC", color: "#F5F2EC" }}
          >
            {files.length > 0 ? `${files.length} file(s) selected` : "Choose Images"}
            <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        {previews.length > 0 && (
          <div className="flex gap-3 flex-wrap">
            {previews.map((src, i) => (
              <img key={i} src={src} alt="preview" className="w-16 h-16 object-cover rounded" style={{ border: "1px solid #333" }} />
            ))}
          </div>
        )}

        {isEditing && previews.length === 0 && existingImages.length > 0 && (
          <div className="flex gap-3 flex-wrap">
            {existingImages.map((src, i) => (
              <img key={i} src={src} alt="current" className="w-16 h-16 object-cover rounded" style={{ border: "1px solid #333" }} />
            ))}
          </div>
        )}

        {error && (
          <p className="text-xs" style={{ color: "#8B1E24" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="py-3 text-xs tracking-[0.25em] uppercase font-semibold rounded"
          style={{ backgroundColor: "#8B1E24", color: "#F5F2EC" }}
        >
          {uploading ? "Saving..." : isEditing ? "Update Product" : "Add Product"}
        </button>
      </form>
    </div>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  }

  function openAddModal() {
    setEditingProduct(null);
    setModalOpen(true);
  }

  function openEditModal(product) {
    setEditingProduct(product);
    setModalOpen(true);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    fetchProducts();
  }

  function handleDragStart(index) {
    setDragIndex(index);
  }

  function handleDragOver(e, index) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    const reordered = [...products];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(index, 0, moved);
    setDragIndex(index);
    setProducts(reordered);
  }

  async function handleDragEnd() {
    setDragIndex(null);
    const orderedIds = products.map((p) => p.id);
    await fetch("/api/admin/products/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds }),
    });
  }

  return (
    <main className="min-h-screen px-8 py-12" style={{ backgroundColor: "#0D0D0D", color: "#F5F2EC" }}>
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-2xl tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-display)" }}>
          Products
        </h1>
        <Link href="/admin" className="text-xs tracking-[0.2em] uppercase opacity-60 hover:opacity-100">
          ← Back to Dashboard
        </Link>
      </div>

      <button
        onClick={openAddModal}
        className="mb-10 px-6 py-3 text-xs tracking-[0.25em] uppercase font-semibold rounded"
        style={{ backgroundColor: "#8B1E24", color: "#F5F2EC" }}
      >
        + Add Product
      </button>

      <h2 className="text-sm tracking-[0.2em] uppercase mb-2">Existing Products</h2>
      <p className="text-xs opacity-50 mb-6">Drag to reorder how products appear in the shop.</p>

      {loading ? (
        <p className="text-xs opacity-60">Loading...</p>
      ) : (
        <div className="flex flex-col gap-3 max-w-2xl">
          {products.map((product, index) => (
            <div
              key={product.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className="flex items-center gap-4 p-3 rounded cursor-grab active:cursor-grabbing"
              style={{
                backgroundColor: dragIndex === index ? "#222" : "#1A1A1A",
                border: "1px solid #333",
              }}
            >
              <span className="opacity-40 text-lg select-none">⠿</span>

              <img
                src={(product.images && product.images[0]) || product.image}
                alt={product.name}
                className="w-14 h-14 object-cover rounded flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{product.name}</p>
                <p className="text-xs opacity-60">
                  ₹{product.price}
                  {product.sizes && product.sizes.length > 0 && ` · ${product.sizes.join(", ")}`}
                </p>
              </div>

              <div className="flex gap-4 flex-shrink-0">
                <button
                  onClick={() => openEditModal(product)}
                  className="text-xs tracking-[0.15em] uppercase"
                  style={{ color: "#F5F2EC" }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-xs tracking-[0.15em] uppercase"
                  style={{ color: "#8B1E24" }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <ProductModal
          product={editingProduct}
          onClose={() => setModalOpen(false)}
          onSaved={fetchProducts}
        />
      )}
    </main>
  );
}