import { applyFilters } from "@/utils/constants";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  jobs: [],
  filteredJobs: [],
  searchTerm: "",
  locationTerm: "",
  selectedCategory: "",
  selectedJobType: "",
  selectedDatePosted: "",
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
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
      applyFilters(state);
    },
    setSelectedJobType: (state, action) => {
      state.selectedJobType = action.payload;
      applyFilters(state);
    },
    setSelectedDatePosted: (state, action) => {
      state.selectedDatePosted = action.payload;
      applyFilters(state);
    },
  },
});

export const {
  setJobs,
  setSearchTerm,
  setLocationTerm,
  setSelectedCategory,
  setSelectedJobType,
  setSelectedDatePosted,

} = newJobsSlice.actions;

export default newJobsSlice.reducer;
