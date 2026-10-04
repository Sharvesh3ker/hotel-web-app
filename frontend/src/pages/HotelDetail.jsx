import React from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchHotel, hotelImageUrl } from "../store/hotelsSlice";

export default function HotelDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { hotels, selected } = useSelector(s => s.hotels);
  const hotel = selected?.id?.toString() === id ? selected : hotels.find(h => h.id.toString() === id);

  useEffect(() => {
    if (!hotel || !String(id).startsWith("demo-")) dispatch(fetchHotel(id));
  }, [dispatch, id]);

  if (!hotel) return <main className="container main"><div className="empty breeze-regular">Hotel not found.</div></main>;

  const mapUrl = `https://www.openstreetmap.org/?mlat=${hotel.latitude}&mlon=${hotel.longitude}#map=15/${hotel.latitude}/${hotel.longitude}`;
  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${Number(hotel.longitude) - 0.02}%2C${Number(hotel.latitude) - 0.015}%2C${Number(hotel.longitude) + 0.02}%2C${Number(hotel.latitude) + 0.015}&layer=mapnik&marker=${hotel.latitude}%2C${hotel.longitude}`;

  return (
    <main className="container main detail">
      <Helmet>
        <title>{hotel.title} | StayFinder</title>
        <meta name="description" content={`${hotel.title}: ${hotel.description.slice(0, 150)}`} />
      </Helmet>
      <Link to="/" className="btn-contained btn-contained-sm breeze-bold" style={{ marginBottom: "20px", display: "inline-block" }}>← Back to hotels</Link>
      <div className="detail-card">
        <img src={hotelImageUrl(hotel.image)} alt={hotel.title} />
        <div className="detail-content">
          <p className="eyebrow purple breeze-condensed">HOTEL DETAILS</p>
          <h1 className="breeze-bold">{hotel.title}</h1>
          <div className="detail-price breeze-bold">₹{Number(hotel.price).toLocaleString("en-IN")} <span className="breeze-medium">/ night</span></div>
          <p className="breeze-regular">{hotel.description}</p>
          <div className="location-box breeze-regular">
            <strong className="breeze-bold">Location Coordinates</strong>
            <span>Latitude: {hotel.latitude}</span>
            <span>Longitude: {hotel.longitude}</span>
            <div style={{ marginTop: "8px", marginBottom: "12px" }}>
              <a href={mapUrl} target="_blank" rel="noreferrer" className="breeze-bold btn-contained-xs" style={{ color: "#ffffff" }}>
                View on OpenStreetMap ↗
              </a>
            </div>
            <div style={{ position: "relative", width: "100%", height: "240px", border: "1px solid var(--line)", borderRadius: "6px", overflow: "hidden" }}>
              <iframe className="location-map" title={`Map showing ${hotel.title}`} src={mapEmbedUrl} loading="lazy" style={{ width: "100%", height: "100%", border: "none" }} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}