import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const API_URL = import.meta.env.VITE_API_URL || "/api";
export const hotelImageUrl = image => image?.startsWith("/") && !image.includes("supabase.co") ? `${API_URL}${image}` : image;

export const fetchHotels = createAsyncThunk(
  "hotels/fetchHotels",
  async ({ title = "", minPrice = "", maxPrice = "", page = 1, limit = 6 } = {}, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/hotels`);
      if (!response.ok) throw new Error("Backend is unavailable");
      const data = await response.json();
      // the backend returns an array now, so we return it
      return data;
    } catch {
      return rejectWithValue("Backend/PostgreSQL is not running or unavailable.");
    }
  }
);

export const fetchHotel = createAsyncThunk("hotels/fetchHotel", async (id, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_URL}/hotels/${id}`);
    if (!response.ok) throw new Error();
    return await response.json();
  } catch {
    return rejectWithValue("Could not load this hotel.");
  }
});

const initialState = {
  hotels: [],
  total: 0,
  status: "idle",
  error: "",
  selected: null
};

const slice = createSlice({
  name: "hotels",
  initialState,
  reducers: {
    setHotels(state, action) {
      state.hotels = action.payload;
      state.total = action.payload.length;
    },
    addLocalHotel(state, action) {
      state.hotels = [action.payload, ...state.hotels];
      state.total += 1;
      state.status = "succeeded";
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchHotels.pending, state => { state.status = "loading"; state.error = ""; })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.hotels = action.payload; // payload is the array of hotels
        state.total = action.payload.length;
        state.error = "";
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch hotels";
      })
      .addCase(fetchHotel.fulfilled, (state, action) => {
        state.selected = action.payload;
      });
  }
});

export const { setHotels, addLocalHotel } = slice.actions;
export default slice.reducer;