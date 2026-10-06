import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { fetchHotels, API_URL } from "../store/hotelsSlice";
import HotelCard from "../components/HotelCard";
import Pagination from "../components/Pagination";

export default function HotelList({ manage = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pageNumber } = useParams();
  const location = useLocation();
  const { hotels, total, status } = useSelector(s => s.hotels);
  const [title, setTitle] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(Number(pageNumber) || 1);
  const [notice, setNotice] = useState("");
  const [hotelToDelete, setHotelToDelete] = useState(null);
  const limit = 6;

  useEffect(() => {
    if (pageNumber) {
      setPage(Number(pageNumber));
    }
  }, [pageNumber]);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location.hash]);

  useEffect(() => {
    dispatch(fetchHotels());
  }, [dispatch]);

  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => {
        setNotice("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [notice]);

  const visibleHotels = useMemo(() => {
    let filtered = hotels || [];
    if (title) {
      filtered = filtered.filter(h => (h.title || "").toLowerCase().includes(title.toLowerCase()));
    }
    if (minPrice) {
      filtered = filtered.filter(h => h.price >= Number(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(h => h.price <= Number(maxPrice));
    }
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [hotels, title, minPrice, maxPrice, page, limit]);

  const totalItemCount = useMemo(() => {
    let filtered = hotels || [];
    if (title) {
      filtered = filtered.filter(h => (h.title || "").toLowerCase().includes(title.toLowerCase()));
    }
    if (minPrice) {
      filtered = filtered.filter(h => h.price >= Number(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(h => h.price <= Number(maxPrice));
    }
    return filtered.length;
  }, [hotels, title, minPrice, maxPrice]);

  const requestDelete = (id) => {
    setHotelToDelete(id);
  };

  const confirmDelete = async () => {
    if (!hotelToDelete) return;
    const id = hotelToDelete;
    setHotelToDelete(null);
    try {
      const res = await fetch(`${API_URL}/hotels/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.message || "Delete failed.");
      }
      setNotice("Hotel listing deleted successfully.");
      dispatch(fetchHotels());
    } catch (error) {
      setNotice(error.message || "Failed to delete hotel listing.");
    }
  };

  const pages = Math.max(1, Math.ceil(totalItemCount / limit));

  return (
    <>
      <Helmet>
        <title>{`Hotel Listings - Page ${page} | StayFinder`}</title>
        <meta name="description" content="Find and explore curated hotel listings with StayFinder." />
      </Helmet>

      {/* Hero Header Banner */}
      <section className="hero">
        <div className="container hero-layout">
          <div className="hero-copy">
            <h1 className="breeze-bold">Discover Exceptional Hotels & Stays</h1>
            <p className="breeze-regular">Explore curated properties with transparent pricing, detailed amenities, and real-time updates.</p>

          </div>
          <div className="search-card">
            <p className="search-heading breeze-bold">Search Hotels</p>
            <label htmlFor="search-title" className="search-field breeze-bold">
              <span>LOCATION OR HOTEL NAME</span>
              <input
                id="search-title"
                aria-label="Search hotels by name"
                value={title}
                onChange={e => { setTitle(e.target.value); setPage(1); }}
                placeholder="Search hotel title..."
              />
            </label>
            <div className="search-prices">
              <label htmlFor="search-min" className="search-field breeze-bold">
                <span>MIN PRICE (₹)</span>
                <input
                  id="search-min"
                  aria-label="Minimum price"
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={e => { setMinPrice(e.target.value); setPage(1); }}
                  placeholder="Min ₹"
                />
              </label>
              <label htmlFor="search-max" className="search-field breeze-bold">
                <span>MAX PRICE (₹)</span>
                <input
                  id="search-max"
                  aria-label="Maximum price"
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={e => { setMaxPrice(e.target.value); setPage(1); }}
                  placeholder="Max ₹"
                />
              </label>
            </div>
            <button
              type="button"
              className="search-button breeze-bold btn-contained"
              onClick={(e) => {
                e.preventDefault();
                dispatch(fetchHotels());
                navigate(manage ? "/manage#stays" : "/#stays");
                const staysSection = document.getElementById("stays");
                if (staysSection) staysSection.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Search Hotels
            </button>
          </div>
        </div>
      </section>



      {/* Main Catalog Section */}
      <main id="stays" className="container main">
        {notice && <div className="toast-popup breeze-bold" role="status"><span style={{ fontSize: "1.2rem" }}>✓</span> {notice}<button aria-label="Dismiss notification" style={{ background: "transparent", border: "none", color: "white", cursor: "pointer", fontSize: "1.2rem", marginLeft: "10px", padding: 0 }} onClick={() => setNotice("")}>×</button></div>}
        {status === "loading" && <div className="loading breeze-medium">Loading hotel listings...</div>}

        <div className="section-head">
          <div>
            <h2 className="breeze-bold">{manage ? "Manage Hotels" : "Hotel Listings"} - Page {page}<span className="accent-dot">.</span></h2>
            <p className="result-count breeze-regular">Showing page {page} of {pages} ({totalItemCount} total properties)</p>
          </div>
          <Link to="/add" className="btn btn-primary add-btn breeze-bold btn-contained">+ Add Hotel Listing</Link>
        </div>

        {visibleHotels.length ? (
          <div className="grid">
            {visibleHotels.map(hotel => (
              <HotelCard key={hotel.id} hotel={hotel} onDelete={requestDelete} onUpdate={() => dispatch(fetchHotels())} onSuccess={setNotice} canManage={manage} />
            ))}
          </div>
        ) : (
          <div className="empty breeze-regular">
            <h3 className="breeze-bold">No hotels found</h3>
            <p className="breeze-regular">Try adjusting your search criteria or price filters.</p>
          </div>
        )}

        <Pagination page={page} pages={pages} onChange={setPage} basePath={manage ? "/manage" : "/page"} />
      </main>

      {/* Delete Confirmation Modal */}
      {hotelToDelete && (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div className="modal-content" style={{ background: "white", padding: "24px", borderRadius: "8px", maxWidth: "400px", width: "90%", textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
            <h3 className="breeze-bold" style={{ marginTop: 0 }}>Confirm Deletion</h3>
            <p className="breeze-regular">Are you sure you want to delete this hotel listing?</p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "20px" }}>
              <button className="btn-contained btn-contained-sm breeze-bold" style={{ background: "#dc3545" }} onClick={confirmDelete}>Delete</button>
              <button className="btn-contained btn-contained-sm breeze-bold" style={{ background: "#ccc", color: "#333" }} onClick={() => setHotelToDelete(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}