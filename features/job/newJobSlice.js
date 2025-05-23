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
  sortOrder: "",
  pagination: {
    currentPage: 1,
    itemsPerPage: Infinity,
    totalItems: 0,
  },
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
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
      applyFilters(state);
    },
    setPagination: (state, action) => {
      state.pagination = {
        ...state.pagination,
        ...action.payload,
      };
    },
    clearAllFilters: (state) => {
      state.searchTerm = "";
      state.locationTerm = "";
      state.selectedCategory = "";
      state.selectedJobType = "";
      state.selectedDatePosted = "";
      state.sortOrder = "";
      state.filteredJobs = state.jobs;
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
  setSortOrder,
  setPagination,
  clearAllFilters,
} = newJobsSlice.actions;

export default newJobsSlice.reducer;
