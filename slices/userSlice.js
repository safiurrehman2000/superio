import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    userType: "Candidate",
    jobId: null,
    resumes: [],
    appliedJobs: [],
    savedJobs: [],
    employerJobs: [],
    isFirstTime: true,
    hasPostedJob: false,
  },
  reducers: {
    addUser: (state, action) => {
      state.user = action.payload;
      state.userType = action.payload.userType || state.userType;
      state.resumes = action.payload.resumes || state.resumes;
      state.appliedJobs = action.payload.appliedJobs || state.appliedJobs;
      state.savedJobs = action.payload.savedJobs || state.savedJobs;
      state.hasPostedJob = action.payload.hasPostedJob || state.hasPostedJob;
    },
    removeUser: (state) => {
      state.user = null;
      state.userType = "Candidate";
      state.jobId = null;
      state.resumes = [];
      state.appliedJobs = [];
      state.savedJobs = [];
    },
    setUserType: (state, action) => {
      state.userType = action.payload;
      if (state.user) {
        state.user.userType = action.payload;
      }
    },
    addJobId: (state, action) => {
      state.jobId = action.payload;
    },
    removeJobId: (state) => {
      state.jobId = null;
    },
    addResume: (state, action) => {
      const resume = {
        id: action.payload.id,
        ...action.payload,
      };
      state.resumes = [...state.resumes, resume];
      if (state.user) {
        state.user.resumes = state.resumes;
      }
    },
    removeResumeById: (state, action) => {
      state.resumes = state.resumes.filter(
        (resume) => resume.id !== action.payload
      );
      if (state.user) {
        state.user.resumes = state.resumes;
      }
    },
    clearResumes: (state) => {
      state.resumes = [];
      if (state.user) {
        state.user.resumes = state.resumes;
      }
    },
    addAppliedJob: (state, action) => {
      state.appliedJobs = [...state.appliedJobs, action.payload];
      if (state.user) {
        state.user.appliedJobs = state.appliedJobs;
      }
    },
    setAppliedJobs: (state, action) => {
      state.appliedJobs = action.payload;
      if (state.user) {
        state.user.appliedJobs = state.appliedJobs;
      }
    },
    clearAppliedJobs: (state) => {
      state.appliedJobs = [];
      if (state.user) {
        state.user.appliedJobs = state.appliedJobs;
      }
    },
    addSavedJob: (state, action) => {
      state.savedJobs = [...state.savedJobs, action.payload];
      if (state.user) {
        state.user.savedJobs = state.savedJobs;
      }
    },
    setSavedJobs: (state, action) => {
      state.savedJobs = action.payload;
      if (state.user) {
        state.user.savedJobs = state.savedJobs;
      }
    },
    removeSavedJob: (state, action) => {
      state.savedJobs = state.savedJobs.filter(
        (job) => job.jobId !== action.payload
      );
      if (state.user) {
        state.user.savedJobs = state.savedJobs;
      }
    },
    clearSavedJobs: (state) => {
      state.savedJobs = [];
      if (state.user) {
        state.user.savedJobs = state.savedJobs;
      }
    },
    setEmployerJobs: (state, action) => {
      if (state.user && state.userType === "Employer") {
        state.employerJobs = action.payload;
        state.user.employerJobs = action.payload; // Sync with user
      }
    },
    addEmployerJob: (state, action) => {
      if (state.user && state.userType === "Employer") {
        state.employerJobs = [...state.employerJobs, action.payload];
        state.user.employerJobs = state.employerJobs;
      }
    },
    updateIsFirstTime: (state, action) => {
      state.isFirstTime = action.payload;
      if (state.user) {
        state.user.isFirstTime = action.payload;
      }
    },
  },
});

export const {
  addUser,
  removeUser,
  setUserType,
  addJobId,
  removeJobId,
  addResume,
  removeResumeById,
  clearResumes,
  addAppliedJob,
  setAppliedJobs,
  clearAppliedJobs,
  addSavedJob,
  setSavedJobs,
  removeSavedJob,
  clearSavedJobs,
  setEmployerJobs,
  addEmployerJob,
  updateIsFirstTime,
} = userSlice.actions;

export default userSlice.reducer;
