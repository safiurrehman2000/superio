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
    itemsPerPage: 20,
    totalItems: 0,
    totalPages: 0,
  },
  // New properties for server-side pagination
  paginationParams: {
    page: 1,
    limit: 20,
    search: "",
    location: "",
    category: "",
    jobType: "",
    datePosted: "",
    sortOrder: "",
    status: "active",
  },
};

const newJobsSlice = createSlice({
  name: "newJob",
  initialState,
  reducers: {
    setJobs: (state, action) => {
      state.jobs = action.payload;
      state.filteredJobs = action.payload; // Server-side filtering means jobs are already filtered
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.paginationParams.search = action.payload;
      state.paginationParams.page = 1; // Reset to first page when searching
    },
    setLocationTerm: (state, action) => {
      state.locationTerm = action.payload;
      state.paginationParams.location = action.payload;
      state.paginationParams.page = 1; // Reset to first page when filtering
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
      state.paginationParams.category = action.payload;
      state.paginationParams.page = 1; // Reset to first page when filtering
    },
    setSelectedJobType: (state, action) => {
      state.selectedJobType = action.payload;
      state.paginationParams.jobType = action.payload;
      state.paginationParams.page = 1; // Reset to first page when filtering
    },
    setSelectedDatePosted: (state, action) => {
      state.selectedDatePosted = action.payload;
      state.paginationParams.datePosted = action.payload;
      state.paginationParams.page = 1; // Reset to first page when filtering
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
      state.paginationParams.sortOrder = action.payload;
      state.paginationParams.page = 1; // Reset to first page when sorting
    },
    setPagination: (state, action) => {
      state.pagination = {
        ...state.pagination,
        ...action.payload,
      };
    },
    setPaginationParams: (state, action) => {
      state.paginationParams = {
        ...state.paginationParams,
        ...action.payload,
      };
    },
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
      state.paginationParams.page = action.payload;
    },
    setItemsPerPage: (state, action) => {
      state.pagination.itemsPerPage = action.payload;
      state.paginationParams.limit = action.payload;
      state.paginationParams.page = 1; // Reset to first page when changing items per page
    },
    clearAllFilters: (state) => {
      state.searchTerm = "";
      state.locationTerm = "";
      state.selectedCategory = "";
      state.selectedJobType = "";
      state.selectedDatePosted = "";
      state.sortOrder = "";
      state.filteredJobs = state.jobs;

      // Reset pagination params
      state.paginationParams = {
        page: 1,
        limit: 20,
        search: "",
        location: "",
        category: "",
        jobType: "",
        datePosted: "",
        sortOrder: "",
        status: "active",
      };
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
  setPaginationParams,
  setCurrentPage,
  setItemsPerPage,
  clearAllFilters,
} = newJobsSlice.actions;

export default newJobsSlice.reducer;
