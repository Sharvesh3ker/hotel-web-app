import React from "react";
import { Link, NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header className="header">
      <div className="container nav">
        <Link to="/" className="logo" aria-label="StayFinder home" style={{ display: "flex", alignItems: "center" }}>
          <img src="/logo.png" alt="StayFinder Logo" style={{ height: "80px", objectFit: "contain" }} />
        </Link>
        <nav aria-label="Main navigation">
          <NavLink to="/" end className="breeze-medium">Discover</NavLink>
          <NavLink to="/page/1#stays" className="breeze-medium">Hotel Page</NavLink>
          <NavLink to="/add" className="breeze-medium">Add Hotel</NavLink>
          <NavLink to="/manage#stays" className="breeze-medium">Manage hotel</NavLink>
        </nav>
        <div className="header-actions">
          <Link to="/add" className="header-cta breeze-bold btn-contained" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            Add a Place
          </Link>
        </div>
      </div>
    </header>
  );
}