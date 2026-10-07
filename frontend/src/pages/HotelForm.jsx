import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { API_URL, hotelImageUrl, addLocalHotel } from "../store/hotelsSlice";

const empty = { title: "", description: "", latitude: "", longitude: "", price: "" };

export default function HotelForm({ edit = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const status = useSelector(state => state.hotels.status);
  const [form, setForm] = useState(empty);
  const [preview, setPreview] = useState("");
  const [fileDetails, setFileDetails] = useState(null);
  const [oldImage, setOldImage] = useState("");
  const [imageError, setImageError] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const [lastTypedField, setLastTypedField] = useState("Ready");
  const [lastTypedValue, setLastTypedValue] = useState("");

  useEffect(() => {
    if (!edit) return;
    fetch(`${API_URL}/hotels/${id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(h => {
        setForm({ title: h.title || "", description: h.description || "", latitude: h.latitude || "", longitude: h.longitude || "", price: h.price || "" });
        setOldImage(hotelImageUrl(h.image) || "");
      })
      .catch(() => setMessage("Could not load hotel details."));
  }, [edit, id]);

  const change = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    const fieldLabels = { title: "Property Name", description: "Description", latitude: "Latitude", longitude: "Longitude", price: "Price" };
    setLastTypedField(fieldLabels[name] || name);
    setLastTypedValue(value);
  };

  const imageChange = e => {
    const file = e.target.files?.[0];
    setImageError("");
    setFileDetails(null);
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setImageError("Please choose a JPG, PNG, or WebP image file.");
      setPreview("");
      e.target.value = "";
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setImageError("Image file size must be under 8 MB.");
      setPreview("");
      e.target.value = "";
      return;
    }

    const sizeFormatted = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${(file.size / 1024).toFixed(1)} KB`;

    setFileDetails({
      name: file.name,
      size: sizeFormatted,
      type: file.type.replace("image/", "").toUpperCase()
    });

    setPreview(URL.createObjectURL(file));
    setLastTypedField("Photo Upload");
    setLastTypedValue(file.name);
  };

  const submit = async e => {
    e.preventDefault();
    setMessage("");
    setIsSuccess(false);
    setSaving(true);
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    if (e.target.image?.files[0]) data.append("image", e.target.image.files[0]);

    try {

      const response = await fetch(`${API_URL}/hotels${edit ? `/${id}` : ""}`, {
        method: edit ? "PUT" : "POST",
        credentials: "include",
        body: data
      });
      const result = await response.json();
      if (!response.ok) throw new Error(Object.values(result.errors || {}).join(". ") || result.message || "Save failed");
      setIsSuccess(true);
      setMessage("saved successfully");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setIsSuccess(false);
      setMessage(err.message || "Failed to save hotel listing.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="container main">
      <Helmet>
        <title>{edit ? "Edit Hotel" : "Add New Hotel"} | StayFinder</title>
        <meta name="description" content={edit ? "Edit property details." : "Add a hotel listing."} />
      </Helmet>

      <div className="form-intro">
        <Link to="/" className="btn-contained btn-contained-sm breeze-bold" style={{ marginBottom: "20px", display: "inline-block" }}>← Back to Hotels</Link>
        <h1 className="breeze-bold">{edit ? "Edit Hotel Listing" : "Add New Hotel Listing"}</h1>
        <p className="subtext breeze-regular">Fill in the hotel details and upload a photo below.</p>
      </div>

      {message && !isSuccess && <div className="error form-error breeze-medium" role="alert">{message}</div>}
      
      {message && isSuccess && (
        <div className="toast-popup breeze-bold" role="alert">
          <span style={{ fontSize: "1.2rem" }}>✓</span> {message}
          <button aria-label="Dismiss notification" style={{ background: "transparent", border: "none", color: "white", cursor: "pointer", fontSize: "1.2rem", marginLeft: "10px", padding: 0 }} onClick={() => setMessage("")}>×</button>
        </div>
      )}

      <form onSubmit={submit} className="hotel-form form-layout">
      
        <section className="form-panel details-panel">
          <div className="panel-heading">
            <span className="step-number breeze-bold">1</span>
            <div>
              <h2 className="breeze-bold">Hotel Details & Photo</h2>
              <p className="breeze-regular">Fill in the property details and upload a cover photo below.</p>
            </div>
          </div>

          <label className="breeze-bold">Property Name
            <input
              name="title"
              value={form.title}
              onChange={change}
              onFocus={() => setLastTypedField("Property Name")}
              required
              maxLength="120"
              placeholder="e.g. Grand Palace Hotel & Spa"
            />
          </label>


          <label className="breeze-bold">Description
            <textarea
              name="description"
              value={form.description}
              onChange={change}
              onFocus={() => setLastTypedField("Description")}
              required
              maxLength="1200"
              rows="4"
              placeholder="Describe the rooms, amenities, location, and features..."
            />
            <span className="field-hint breeze-medium">{form.description.length}/1200 characters</span>
          </label>

          <div className="form-grid">
            <label className="breeze-bold">Latitude
              <input
                name="latitude"
                type="number"
                min="-90"
                max="90"
                step="any"
                value={form.latitude}
                onChange={change}
                onFocus={() => setLastTypedField("Latitude")}
                required
                placeholder="e.g. 13.0827"
              />
            </label>
            <label className="breeze-bold">Longitude
              <input
                name="longitude"
                type="number"
                min="-180"
                max="180"
                step="any"
                value={form.longitude}
                onChange={change}
                onFocus={() => setLastTypedField("Longitude")}
                required
                placeholder="e.g. 80.2707"
              />
            </label>
          </div>

          <label className="breeze-bold">Price per Night (₹)
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={change}
              onFocus={() => setLastTypedField("Price per Night")}
              required
              placeholder="e.g. 4500"
            />
          </label>

          
          <div className="photo-upload-section">
            <label className="breeze-bold">Cover Photo Upload</label>
            <label className="upload-drop">
              <input name="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={imageChange} aria-describedby="photo-guidance" />
              <span className="upload-icon">↥</span>
              <strong className="breeze-bold">{preview ? "Change Selected Photo" : "Upload Property Photo"}</strong>
              <span id="photo-guidance" className="breeze-regular">JPG, PNG, or WebP up to 8 MB</span>
              <span className="upload-action breeze-bold btn-contained-xs">Browse Files</span>
            </label>
            {imageError && <p className="image-error breeze-medium" role="alert">{imageError}</p>}
          </div>

          <button className="submit breeze-bold btn-contained" disabled={saving || Boolean(imageError)} style={{ marginTop: "24px" }}>
            {saving ? "Saving Hotel..." : edit ? "Save Changes" : "Add Hotel Listing"}
          </button>
        </section>

        
        <div className="form-side">
          <section className="form-panel preview-panel">
            <div className="panel-heading">
              <span className="step-number breeze-bold">2</span>
              <div>
                <h2 className="breeze-bold">Live Hotel Preview</h2>
                <p className="breeze-regular">Real-time preview of your hotel listing card.</p>
              </div>
            </div>

            
            <div className="card" style={{ marginTop: "20px" }}>
              {(preview || oldImage) ? (
                <div className="card-image-link" style={{ cursor: "default" }}>
                  <img
                    src={preview || oldImage}
                    alt="Hotel preview"
                  />
                  <span className="card-image-label breeze-condensed">
                    {preview ? "NEW UPLOAD PREVIEW" : "CURRENT COVER PHOTO"}
                  </span>
                </div>
              ) : (
                <div style={{ height: "180px", background: "#f2eff4", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid var(--line)" }}>
                  <span className="breeze-medium" style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Photo preview will appear here</span>
                </div>
              )}
              <div className="card-body">
                <div className="card-heading">
                  <h3 className="breeze-bold">{form.title || "Untitled Property"}</h3>
                  <div className="price breeze-bold">
                    ₹{form.price ? Number(form.price).toLocaleString("en-IN") : "0"} <small className="breeze-medium">/ night</small>
                  </div>
                </div>
                <p className="breeze-regular">
                  {form.description ? (form.description.length > 105 ? form.description.slice(0, 105) + "..." : form.description) : "No description typed yet."}
                </p>
                <div className="rt-preview-coords breeze-medium" style={{ marginTop: "12px", background: "#f3edfd", padding: "8px 12px", borderRadius: "8px", display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--purple)", fontSize: "0.85rem", fontWeight: "600" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  <span>Latitude: <strong>{form.latitude || "--"}</strong> | Longitude: <strong>{form.longitude || "--"}</strong></span>
                </div>
                {form.latitude && form.longitude && !isNaN(form.latitude) && !isNaN(form.longitude) ? (
                  <div style={{ marginTop: "16px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--line)" }}>
                    <iframe
                      width="100%"
                      height="200"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight="0"
                      marginWidth="0"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(form.longitude) - 0.01},${Number(form.latitude) - 0.01},${Number(form.longitude) + 0.01},${Number(form.latitude) + 0.01}&layer=mapnik&marker=${form.latitude},${form.longitude}`}
                      style={{ display: "block", border: "none" }}
                      title="Live Hotel Location Preview"
                    ></iframe>
                  </div>
                ) : (
                  <div style={{ marginTop: "16px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--line)", height: "200px", background: "#f2eff4", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "8px" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span className="breeze-medium" style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Map preview will appear here</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </form>
    </main>
  );
}