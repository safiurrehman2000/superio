import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    userType: "Candidate",
    jobId: null,
    resumes: [],
    appliedJobs: [],
    isFirstTime: true,
  },
  reducers: {
    addUser: (state, action) => {
      state.user = action.payload;
      state.userType = action.payload.userType || state.userType;
      state.resumes = action.payload.resumes || state.resumes;
      state.appliedJobs = action.payload.appliedJobs || state.appliedJobs;
    },
    removeUser: (state) => {
      state.user = null;
      state.userType = "Candidate";
      state.jobId = null;
      state.resumes = [];
      state.appliedJobs = [];
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
} = userSlice.actions;

export default userSlice.reducer;
