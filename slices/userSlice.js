import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    userType: "Candidate",
    jobId: null,
  },
  reducers: {
    addUser: (state, action) => {
      state.user = action.payload;
      state.userType = action.payload.userType || state.userType;
    },
    removeUser: (state) => {
      state.user = null;
      state.userType = "Candidate";
      state.jobId = null;
    },
    setUserType: (state, action) => {
      state.userType = action.payload;
      if (state.user) {
        state.userType = action.payload;
      }
    },
    addJobId: (state, action) => {
      state.jobId = action.payload;
    },
    removeJobId: (state, action) => {
      state.jobId = null;
    },
  },
});

export const { addUser, removeUser, setUserType, addJobId, removeJobId } =
  userSlice.actions;
export default userSlice.reducer;
