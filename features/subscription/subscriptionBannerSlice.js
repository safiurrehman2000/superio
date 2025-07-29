import { createSlice } from "@reduxjs/toolkit";

const subscriptionBannerSlice = createSlice({
  name: "subscriptionBanner",
  initialState: {
    isVisible: false,
    isDismissed: false,
    showForEmployers: true,
    showForCandidates: false,
  },
  reducers: {
    showBanner: (state) => {
      state.isVisible = true;
      state.isDismissed = false;
    },
    hideBanner: (state) => {
      state.isVisible = false;
    },
    dismissBanner: (state) => {
      state.isDismissed = true;
      state.isVisible = false;
    },
    resetBanner: (state) => {
      state.isDismissed = false;
      state.isVisible = false;
    },
    setShowForEmployers: (state, action) => {
      state.showForEmployers = action.payload;
    },
    setShowForCandidates: (state, action) => {
      state.showForCandidates = action.payload;
    },
  },
});

export const {
  showBanner,
  hideBanner,
  dismissBanner,
  resetBanner,
  setShowForEmployers,
  setShowForCandidates,
} = subscriptionBannerSlice.actions;

export default subscriptionBannerSlice.reducer;
