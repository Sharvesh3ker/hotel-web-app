import { configureStore } from "@reduxjs/toolkit";
import hotelsReducer from "./hotelsSlice";

export const store = configureStore({
  reducer: {
    hotels: hotelsReducer
  }
});