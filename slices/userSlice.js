import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    userType: "Candidate",
    jobId: null,
    resumes: [],
  },
  reducers: {
    addUser: (state, action) => {
      state.user = action.payload;
      state.userType = action.payload.userType || state.userType;
      state.resumes = action.payload.resumes || state.resumes;
    },
    removeUser: (state) => {
      state.user = null;
      state.userType = "Candidate";
      state.jobId = null;
      state.resumes = [];
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
} = userSlice.actions;

export default userSlice.reducer;
