"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { compressImage } from "@/lib/compressImage";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [heroSlides, setHeroSlides] = useState([]);
  const [marqueeText, setMarqueeText] = useState("");
  const [bannerText, setBannerText] = useState("");
  const [collectionText, setCollectionText] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    const res = await fetch("/api/admin/settings");
    const data = await res.json();
    setHeroSlides(data.hero_slides || []);
    setMarqueeText(data.marquee_text || "");
    setBannerText(data.banner_text || "");
    setCollectionText(data.collection_text || "");
    setLoading(false);
  }

  async function uploadFile(file) {
    const compressed = await compressImage(file);
    const formData = new FormData();
    formData.append("file", compressed);
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.url;
  }

  async function handleSlideImageChange(index, field, file) {
    if (!file) return;
    setError("");
    try {
      const url = await uploadFile(file);
      const updated = [...heroSlides];
      updated[index] = { ...updated[index], [field]: url };
      setHeroSlides(updated);
    } catch (err) {
      setError(err.message);
    }
  }

  function addSlide() {
    setHeroSlides([...heroSlides, { desktop: "", mobile: "" }]);
  }

  function removeSlide(index) {
    setHeroSlides(heroSlides.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    setError("");

    const incomplete = heroSlides.some((s) => !s.desktop || !s.mobile);
    if (incomplete) {
      setError("Every hero slide needs both a desktop and mobile image.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hero_slides: heroSlides,
          marquee_text: marqueeText,
          banner_text: bannerText,
          collection_text: collectionText,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen px-8 py-12" style={{ backgroundColor: "#0D0D0D", color: "#F5F2EC" }}>
        <p className="text-xs opacity-60">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-8 py-12" style={{ backgroundColor: "#0D0D0D", color: "#F5F2EC" }}>
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-2xl tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-display)" }}>
          Homepage Settings
        </h1>
        <Link href="/admin" className="text-xs tracking-[0.2em] uppercase opacity-60 hover:opacity-100">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Hero Slides */}
      <section className="mb-14 max-w-2xl">
        <h2 className="text-sm tracking-[0.2em] uppercase mb-2">Hero Slideshow</h2>
        <p className="text-xs opacity-50 mb-6">
          Each slide needs a desktop image (wide) and a mobile image (portrait, tighter crop).
        </p>

        <div className="flex flex-col gap-6">
          {heroSlides.map((slide, index) => (
            <div key={index} className="p-4 rounded" style={{ border: "1px solid #333" }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs tracking-[0.15em] uppercase opacity-70">Slide {index + 1}</p>
                <button
                  onClick={() => removeSlide(index)}
                  className="text-xs tracking-[0.15em] uppercase"
                  style={{ color: "#8B1E24" }}
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs opacity-50 mb-2">Desktop image</p>
                  <label
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files[0];
                      if (file) handleSlideImageChange(index, "desktop", file);
                    }}
                    className="block cursor-pointer rounded overflow-hidden mb-2"
                    style={{ border: "1px dashed #555" }}
                  >
                    {slide.desktop ? (
                      <img src={slide.desktop} alt="" className="w-full h-24 object-cover" />
                    ) : (
                      <div className="w-full h-24 flex items-center justify-center text-[10px] opacity-40 tracking-wide">
                        Drop image here or click to browse
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleSlideImageChange(index, "desktop", e.target.files[0])}
                    />
                  </label>
                </div>

                <div>
                  <p className="text-xs opacity-50 mb-2">Mobile image</p>
                  <label
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files[0];
                      if (file) handleSlideImageChange(index, "mobile", file);
                    }}
                    className="block cursor-pointer rounded overflow-hidden mb-2"
                    style={{ border: "1px dashed #555" }}
                  >
                    {slide.mobile ? (
                      <img src={slide.mobile} alt="" className="w-full h-24 object-cover" />
                    ) : (
                      <div className="w-full h-24 flex items-center justify-center text-[10px] opacity-40 tracking-wide">
                        Drop image here or click to browse
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleSlideImageChange(index, "mobile", e.target.files[0])}
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addSlide}
          className="mt-4 px-5 py-2 text-xs tracking-[0.2em] uppercase"
          style={{ border: "1px solid #F5F2EC" }}
        >
          + Add Slide
        </button>
      </section>

      {/* Text content */}
      <section className="mb-14 max-w-md flex flex-col gap-5">
        <h2 className="text-sm tracking-[0.2em] uppercase mb-2">Homepage Text</h2>

        <div>
          <label className="text-xs opacity-50 block mb-2">Collection announcement</label>
          <input
            type="text"
            value={collectionText}
            onChange={(e) => setCollectionText(e.target.value)}
            className="w-full px-4 py-3 rounded outline-none text-sm"
            style={{ backgroundColor: "#1A1A1A", border: "1px solid #333" }}
          />
        </div>

        <div>
          <label className="text-xs opacity-50 block mb-2">Scrolling banner text</label>
          <input
            type="text"
            value={marqueeText}
            onChange={(e) => setMarqueeText(e.target.value)}
            className="w-full px-4 py-3 rounded outline-none text-sm"
            style={{ backgroundColor: "#1A1A1A", border: "1px solid #333" }}
          />
        </div>

        <div>
          <label className="text-xs opacity-50 block mb-2">Static banner text</label>
          <input
            type="text"
            value={bannerText}
            onChange={(e) => setBannerText(e.target.value)}
            className="w-full px-4 py-3 rounded outline-none text-sm"
            style={{ backgroundColor: "#1A1A1A", border: "1px solid #333" }}
          />
        </div>
      </section>

      {error && (
        <p className="text-xs mb-4" style={{ color: "#8B1E24" }}>
          {error}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-8 py-3 text-xs tracking-[0.25em] uppercase font-semibold"
        style={{ backgroundColor: saved ? "#1A1A1A" : "#8B1E24", color: "#F5F2EC", border: saved ? "1px solid #8B1E24" : "none" }}
      >
        {saving ? "Saving..." : saved ? "✓ Saved" : "Save Changes"}
      </button>
    </main>
  );
}