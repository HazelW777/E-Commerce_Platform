import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import authReducer from "./authSlice";
import cartReducer from "./cartSlice";
import uiReducer, { showGlobalError } from "./uiSlice";
import apiClient from "../lib/apiClient";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    ui: uiReducer,
  },
});

// Setup global error interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Catch Network Errors or 500+ Server Errors globally
    if (!error.response || error.response.status >= 500) {
      const msg = error.response?.data?.message || error.message || "Network or Server Error";
      store.dispatch(showGlobalError(msg));
    }
    return Promise.reject(error);
  }
);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
