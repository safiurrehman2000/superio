import newJobsSlice from "@/features/job/newJobSlice";
import subscriptionBannerSlice from "@/features/subscription/subscriptionBannerSlice";
import userReducer from "@/slices/userSlice";
import { configureStore } from "@reduxjs/toolkit";
import candidateSlice from "../features/candidate/candidateSlice";
import employerSlice from "../features/employer/employerSlice";
import candidateFilterSlice from "../features/filter/candidateFilterSlice";
import employerFilterSlice from "../features/filter/employerFilterSlice";
import filterSlice from "../features/filter/filterSlice";
import shopSlice from "../features/shop/shopSlice";
import toggleSlice from "../features/toggle/toggleSlice";

export const store = configureStore({
  reducer: {
    toggle: toggleSlice,
    filter: filterSlice,
    employer: employerSlice,
    employerFilter: employerFilterSlice,
    candidate: candidateSlice,
    candidateFilter: candidateFilterSlice,
    shop: shopSlice,
    user: userReducer,
    newJob: newJobsSlice,
    subscriptionBanner: subscriptionBannerSlice,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(),
});
