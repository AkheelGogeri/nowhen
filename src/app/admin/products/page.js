"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

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

  function handleFileChange(e) {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  }

  function startEdit(product) {
    setEditingId(product.id);
    setName(product.name);
    setPrice(product.price);
    setDescription(product.description || "");
    setExistingImages(product.images || [product.image].filter(Boolean));
    setFiles([]);
    setPreviews([]);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setName("");
    setPrice("");
    setDescription("");
    setFiles([]);
    setPreviews([]);
    setExistingImages([]);
    setError("");
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
      // Upload any newly selected files
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

      // If new files were uploaded, they replace existing images.
      // Otherwise, keep the existing images as-is (edit mode with no new files selected).
      const finalImages = uploadedUrls.length > 0 ? uploadedUrls : existingImages;

      const url = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
      const method = editingId ? "PUT" : "POST";

      const saveRes = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: Number(price),
          description,
          images: finalImages,
        }),
      });

      if (!saveRes.ok) throw new Error("Failed to save product");

      cancelEdit();
      fetchProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (editingId === id) cancelEdit();
    fetchProducts();
  }

  return (
    <main
      className="min-h-screen px-8 py-12"
      style={{ backgroundColor: "#0D0D0D", color: "#F5F2EC" }}
    >
      <div className="flex items-center justify-between mb-10">
        <h1
          className="text-2xl tracking-[0.2em] uppercase"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Products
        </h1>
        <Link href="/admin" className="text-xs tracking-[0.2em] uppercase opacity-60 hover:opacity-100">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Add / Edit Product Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-14 p-6 rounded border flex flex-col gap-4 max-w-xl"
        style={{ borderColor: editingId ? "#8B1E24" : "#333" }}
      >
        <h2 className="text-sm tracking-[0.2em] uppercase mb-2">
          {editingId ? "Edit Product" : "Add Product"}
        </h2>

        <input
          type="text"
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-4 py-3 rounded outline-none text-sm"
          style={{ backgroundColor: "#1A1A1A", border: "1px solid #333" }}
        />

        <input
          type="number"
          placeholder="Price (₹)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="px-4 py-3 rounded outline-none text-sm"
          style={{ backgroundColor: "#1A1A1A", border: "1px solid #333" }}
        />

        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="px-4 py-3 rounded outline-none text-sm"
          style={{ backgroundColor: "#1A1A1A", border: "1px solid #333" }}
        />

        <div>
          <label className="text-xs tracking-[0.15em] uppercase opacity-70 block mb-2">
            Product Images {editingId && "(leave empty to keep current images)"}
          </label>
          <label
            className="inline-flex items-center gap-2 px-5 py-3 text-xs tracking-[0.2em] uppercase cursor-pointer transition-opacity hover:opacity-80"
            style={{ border: "1px solid #F5F2EC", color: "#F5F2EC" }}
          >
            {files.length > 0 ? `${files.length} file(s) selected` : "Choose Images"}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* New file previews */}
        {previews.length > 0 && (
          <div className="flex gap-3 flex-wrap">
            {previews.map((src, i) => (
              <img
                key={i}
                src={src}
                alt="preview"
                className="w-20 h-20 object-cover rounded"
                style={{ border: "1px solid #333" }}
              />
            ))}
          </div>
        )}

        {/* Existing images (edit mode, shown only if no new files chosen) */}
        {editingId && previews.length === 0 && existingImages.length > 0 && (
          <div>
            <p className="text-xs opacity-50 mb-2">Current images:</p>
            <div className="flex gap-3 flex-wrap">
              {existingImages.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="current"
                  className="w-20 h-20 object-cover rounded"
                  style={{ border: "1px solid #333" }}
                />
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs" style={{ color: "#8B1E24" }}>
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={uploading}
            className="py-3 px-6 text-xs tracking-[0.25em] uppercase font-semibold"
            style={{ backgroundColor: "#8B1E24", color: "#F5F2EC" }}
          >
            {uploading ? "Saving..." : editingId ? "Update Product" : "Add Product"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="py-3 px-6 text-xs tracking-[0.25em] uppercase"
              style={{ border: "1px solid #333", color: "#F5F2EC" }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Existing Products */}
      <h2 className="text-sm tracking-[0.2em] uppercase mb-6">Existing Products</h2>

      {loading ? (
        <p className="text-xs opacity-60">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="p-4 rounded border" style={{ borderColor: "#333" }}>
              <div className="flex gap-2 mb-3 overflow-x-auto">
                {(product.images || [product.image]).filter(Boolean).map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded flex-shrink-0"
                  />
                ))}
              </div>
              <p className="text-sm mb-1">{product.name}</p>
              <p className="text-xs opacity-60 mb-3">₹{product.price}</p>
              <div className="flex gap-4">
                <button
                  onClick={() => startEdit(product)}
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
    </main>
  );
}