import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import HotelList from "./pages/HotelList";
import HotelDetail from "./pages/HotelDetail";
import HotelForm from "./pages/HotelForm";

export default function App() {
  return (
    <div className="app">
      <Header />
      <Routes>
        <Route path="/" element={<HotelList />} />
        <Route path="/page/:pageNumber" element={<HotelList />} />
        <Route path="/hotels" element={<HotelList />} />
        <Route path="/manage" element={<HotelList manage={true} />} />
        <Route path="/manage/:pageNumber" element={<HotelList manage={true} />} />
        <Route path="/add" element={<HotelForm />} />
        <Route path="/edit/:id" element={<HotelForm edit />} />
        <Route path="/hotels/:id" element={<HotelDetail />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<HotelList />} />
      </Routes>
    </div>
  );
}