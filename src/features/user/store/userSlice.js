import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    name: "Abbie",
    id: null,
    email: "",
    isAuthenticated: false,
    isAdmin: false,
    subscriptionTier: "free",
    hasPaidAccess: false,
    authReady: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.id = action.payload.id;
      state.name = action.payload.name;
    },
    setAuthState: (state, action) => {
      state.id = action.payload.id;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.isAuthenticated = action.payload.isAuthenticated;
      state.isAdmin = action.payload.isAdmin;
      state.subscriptionTier = action.payload.subscriptionTier;
      state.hasPaidAccess = action.payload.hasPaidAccess;
      state.authReady = action.payload.authReady;
    },
  },
});

export const { setUser, setAuthState } = userSlice.actions;

export default userSlice.reducer;
