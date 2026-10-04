import React, { useState } from "react";
import { Link } from "react-router-dom";
import { hotelImageUrl, API_URL } from "../store/hotelsSlice";

export default function HotelCard({ hotel, onDelete, onUpdate, onSuccess, canManage = true }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    title: hotel.title || "",
    description: hotel.description || "",
    price: hotel.price || "",
    latitude: hotel.latitude || "",
    longitude: hotel.longitude || ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("latitude", form.latitude);
      formData.append("longitude", form.longitude);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch(`${API_URL}/hotels/${hotel.id}`, {
        method: "PUT",
        body: formData,
        credentials: "include"
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update");
      }
      setIsEditing(false);
      if (onUpdate) onUpdate();
      if (onSuccess) onSuccess("saved successfully");
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (isEditing) {
    return (
      <article className="card" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <h3 className="breeze-bold">Edit Hotel</h3>
        <input aria-label="Edit title" name="title" value={form.title} onChange={handleChange} placeholder="Title" className="breeze-medium" style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} />
        <input aria-label="Edit price" name="price" type="number" value={form.price} onChange={handleChange} placeholder="Price" className="breeze-medium" style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} />
        <textarea aria-label="Edit description" name="description" value={form.description} onChange={handleChange} placeholder="Description" rows={3} className="breeze-regular" style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} />
        <div style={{ display: "flex", gap: "8px" }}>
          <input aria-label="Edit latitude" name="latitude" type="number" step="any" value={form.latitude} onChange={handleChange} placeholder="Latitude" className="breeze-medium" style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} />
          <input aria-label="Edit longitude" name="longitude" type="number" step="any" value={form.longitude} onChange={handleChange} placeholder="Longitude" className="breeze-medium" style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} />
        </div>
        <input aria-label="Edit image" type="file" onChange={handleImageChange} accept="image/jpeg, image/png, image/webp" style={{ fontSize: "0.85rem" }} />
        
        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
          <button className="btn-contained btn-contained-sm breeze-bold" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button className="btn-contained btn-contained-sm breeze-bold" style={{ background: "#ccc", color: "#333" }} onClick={() => setIsEditing(false)} disabled={saving}>
            Cancel
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="card">
      <Link className="card-image-link" to={`/hotels/${hotel.id}`} aria-label={`View ${hotel.title}`}>
        <img src={hotelImageUrl(hotel.image) || "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=80"} alt={hotel.title} />
      </Link>
      <div className="card-body">
        <div className="card-heading">
          <h3 className="breeze-bold">{hotel.title}</h3>
          <div className="price breeze-bold">₹{Number(hotel.price).toLocaleString("en-IN")} <small className="breeze-medium">/ night</small></div>
        </div>
        <p className="breeze-regular">{hotel.description.length > 105 ? hotel.description.slice(0, 105) + "..." : hotel.description}</p>
        <div className="card-actions">
          <Link className="card-link breeze-bold btn-contained-sm" to={`/hotels/${hotel.id}`}>Explore stay</Link>
          {canManage && (
            <div className="card-manage" style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-light breeze-medium btn-contained-xs" onClick={() => setIsEditing(true)}>Edit</button>
              <button className="btn btn-danger breeze-medium btn-contained-xs" onClick={() => onDelete && onDelete(hotel.id)}>Delete</button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}