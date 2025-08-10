"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";


const IMAGE_SIZE = 1000;
const WINDOW_HEIGHT = 200;
const WINDOW_WIDTH = 1000;

export default function RestaurantSettingsPage() {
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [cropY, setCropY] = useState(0);
  const [cropX, setCropX] = useState(0);
  const [showCropper, setShowCropper] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // For dragging
  const dragStart = useRef<{ x: number; y: number; cropX: number; cropY: number } | null>(null);

  // Fetch settings on mount
  useEffect(() => {
    async function fetchSettings() {
      const res = await fetch("/api/restaurant-offers/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setName(data.user.name || "");
          setLat(data.user.lat?.toString() || "");
          setLng(data.user.lng?.toString() || "");
          setCropY(data.user.cropY || 0);
          setCropX(data.user.cropX || 0);
          setLogoUrl(data.user.logoUrl || null);
          setImagePreview(data.user.logoUrl || null);
        }
      }
    }
    fetchSettings();
  }, []);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
      setCropY(0);
      setCropX(0);
      setShowCropper(true);
    }
  }

  function moveWindowY(delta: number) {
    setCropY((prev) => {
      let next = prev + delta;
      if (next < 0) next = 0;
      if (next > IMAGE_SIZE - WINDOW_HEIGHT) next = IMAGE_SIZE - WINDOW_HEIGHT;
      return next;
    });
  }

  function moveWindowX(delta: number) {
    setCropX((prev) => {
      let next = prev + delta;
      if (next < 0) next = 0;
      if (next > IMAGE_SIZE - WINDOW_WIDTH) next = IMAGE_SIZE - WINDOW_WIDTH;
      return next;
    });
  }

  function openCropper() {
    setShowCropper(true);
  }

  function closeCropper() {
    setShowCropper(false);
  }

  // Mouse/touch drag handlers for crop window
// ...existing code...

function onCropStart(e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) {
  e.preventDefault();
  const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
  const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
  dragStart.current = { x: clientX, y: clientY, cropX, cropY };
  window.addEventListener("mousemove", onCropMove as EventListener);
  window.addEventListener("mouseup", onCropEnd as EventListener);
  window.addEventListener("touchmove", onCropMove as EventListener, { passive: false });
  window.addEventListener("touchend", onCropEnd as EventListener);
}

function onCropMove(e: MouseEvent | TouchEvent) {
  e.preventDefault();
  if (!dragStart.current) return;
  const clientX =
    "touches" in e && e.touches.length
      ? e.touches[0].clientX
      : "clientX" in e
      ? e.clientX
      : 0;
  const clientY =
    "touches" in e && e.touches.length
      ? e.touches[0].clientY
      : "clientY" in e
      ? e.clientY
      : 0;
  const dx = clientX - dragStart.current.x;
  const dy = clientY - dragStart.current.y;
  let newCropX = dragStart.current.cropX + dx;
  let newCropY = dragStart.current.cropY + dy;
  if (newCropX < 0) newCropX = 0;
  if (newCropY < 0) newCropY = 0;
  if (newCropX > IMAGE_SIZE - WINDOW_WIDTH) newCropX = IMAGE_SIZE - WINDOW_WIDTH;
  if (newCropY > IMAGE_SIZE - WINDOW_HEIGHT) newCropY = IMAGE_SIZE - WINDOW_HEIGHT;
  setCropX(newCropX);
  setCropY(newCropY);
}

function onCropEnd() {
  dragStart.current = null;
  window.removeEventListener("mousemove", onCropMove as EventListener);
  window.removeEventListener("mouseup", onCropEnd as EventListener);
  window.removeEventListener("touchmove", onCropMove as EventListener);
  window.removeEventListener("touchend", onCropEnd as EventListener);
}

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("lat", lat);
    formData.append("lng", lng);
    if (image) formData.append("image", image);
    formData.append("cropY", cropY.toString());
    formData.append("cropX", cropX.toString());

    const res = await fetch("/api/restaurant-offers/settings", {
      method: "PATCH",
      body: formData,
    });

    if (res.ok) {
      alert("Settings updated!");
    } else {
      alert("Failed to update settings.");
    }
  }

  return (
    <div className=" mx-auto mt-10 bg-white rounded-xl shadow p-8">
      <h1 className="text-2xl font-bold text-green-700 mb-6">Restaurant Settings</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Image upload and crop window */}
        <div>
          <label className="block font-semibold mb-2">Logo Image (1000x1000px)</label>
          <div className="flex flex-col items-center gap-4">
            <div
              className="relative"
              style={{
                width: `${WINDOW_WIDTH}px`,
                height: `${WINDOW_HEIGHT}px`,
                overflow: "hidden",
                borderRadius: "1rem",
                border: "2px solid #22c55e",
                background: "#f0fdf4",
              }}
            >
              {imagePreview ? (
  <Image
    src={imagePreview}
    alt="Preview"
    width={IMAGE_SIZE}
    height={IMAGE_SIZE}
    style={{
      objectFit: "cover",
      position: "absolute",
      left: -cropX,
      top: -cropY,
      width: `${IMAGE_SIZE}px`,
      height: `${IMAGE_SIZE}px`,
    }}
    unoptimized // Remove this if you use a remote loader or production CDN
  />
) : logoUrl ? (
  <Image
    src={logoUrl}
    alt="Logo"
    width={IMAGE_SIZE}
    height={IMAGE_SIZE}
    style={{
      objectFit: "cover",
      position: "absolute",
      left: -cropX,
      top: -cropY,
      width: `${IMAGE_SIZE}px`,
      height: `${IMAGE_SIZE}px`,
    }}
    unoptimized
  />
) : (
  <span className="text-green-700 flex items-center justify-center h-full">No Image</span>
)}
            </div>
            <button
              type="button"
              className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview || logoUrl ? "Change Image" : "Upload Image"}
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
            {(imagePreview || logoUrl) && (
              <button
                type="button"
                className="text-green-700 underline mt-2"
                onClick={openCropper}
              >
                Adjust visible section
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            The visible section in offers is the highlighted window. You can move it up or down, left or right.
          </p>
        </div>
        {/* Name */}
        <div>
          <label className="block font-semibold mb-2">Display Name</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        {/* Position */}

        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700"
        >
          Save Settings
        </button>
      </form>

      {/* Cropper Modal */}
      {showCropper && (imagePreview || logoUrl) && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 relative">
            <h2 className="text-lg font-bold text-green-700 mb-4">Adjust Visible Section</h2>
            <div
              className="relative mx-auto"
              style={{
                width: `${IMAGE_SIZE}px`,
                height: `${IMAGE_SIZE}px`,
                background: "#f0fdf4",
                borderRadius: "1rem",
                border: "2px solid #22c55e",
                overflow: "hidden",
                touchAction: "none",
              }}
            >
             <Image
              src={imagePreview || logoUrl || ""}
              alt="Crop Preview"
              width={IMAGE_SIZE}
              height={IMAGE_SIZE}
              style={{
                objectFit: "cover",
                position: "absolute",
                left: 0,
                top: 0,
                width: `${IMAGE_SIZE}px`,
                height: `${IMAGE_SIZE}px`,
              }}
              unoptimized
            />
              {/* Crop window overlay */}
              <div
                style={{
                  position: "absolute",
                  top: cropY,
                  left: cropX,
                  width: `${WINDOW_WIDTH}px`,
                  height: `${WINDOW_HEIGHT}px`,
                  border: "2px solid #15803d",
                  boxSizing: "border-box",
                  background: "rgba(34,197,94,0.08)",
                  cursor: "grab",
                  zIndex: 10,
                  touchAction: "none",
                }}
                onMouseDown={onCropStart}
                onTouchStart={onCropStart}
              />
              {/* Up/Down/Left/Right controls */}
              <button
                type="button"
                className="absolute left-1/2 -translate-x-1/2 top-2 bg-white/80 rounded px-2 py-1 text-green-700 font-bold shadow"
                onClick={() => moveWindowY(-20)}
                style={{ zIndex: 2 }}
              >
                ▲
              </button>
              <button
                type="button"
                className="absolute left-1/2 -translate-x-1/2 bottom-2 bg-white/80 rounded px-2 py-1 text-green-700 font-bold shadow"
                onClick={() => moveWindowY(20)}
                style={{ zIndex: 2 }}
              >
                ▼
              </button>
              <button
                type="button"
                className="absolute top-1/2 -translate-y-1/2 left-2 bg-white/80 rounded px-2 py-1 text-green-700 font-bold shadow"
                onClick={() => moveWindowX(-20)}
                style={{ zIndex: 2 }}
              >
                ◀
              </button>
              <button
                type="button"
                className="absolute top-1/2 -translate-y-1/2 right-2 bg-white/80 rounded px-2 py-1 text-green-700 font-bold shadow"
                onClick={() => moveWindowX(20)}
                style={{ zIndex: 2 }}
              >
                ▶
              </button>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                onClick={closeCropper}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}