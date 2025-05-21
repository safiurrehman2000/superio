import { applyFilters } from "@/utils/constants";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  jobs: [],
  filteredJobs: [],
  searchTerm: "",
  locationTerm: "",
};

const newJobsSlice = createSlice({
  name: "newJob",
  initialState,
  reducers: {
    setJobs: (state, action) => {
      state.jobs = action.payload;
      state.filteredJobs = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      applyFilters(state);
    },
    setLocationTerm: (state, action) => {
      state.locationTerm = action.payload;
      applyFilters(state);
    },
  },
});

export const { setJobs, setSearchTerm, setLocationTerm } = newJobsSlice.actions;
export default newJobsSlice.reducer;
