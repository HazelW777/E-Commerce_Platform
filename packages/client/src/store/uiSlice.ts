import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  globalError: string | null;
}

const initialState: UiState = {
  globalError: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    showGlobalError: (state, action: PayloadAction<string>) => {
      state.globalError = action.payload;
    },
    clearGlobalError: (state) => {
      state.globalError = null;
    },
  },
});

export const { showGlobalError, clearGlobalError } = uiSlice.actions;
export default uiSlice.reducer;
