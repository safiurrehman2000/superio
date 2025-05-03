import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    userType: "Candidate",
  },
  reducers: {
    addUser: (state, action) => {
      state.user = action.payload;
      state.userType = action.payload.userType || state.userType;
    },
    removeUser: (state) => {
      state.user = null;
      state.userType = "Candidate";
    },
    userType: (state, action) => {
      state.userType = action.payload;
      if (state.user) {
        state.user.userType = action.payload;
      }
    },
  },
});

export const { addUser, removeUser, userType } = userSlice.actions;
export default userSlice.reducer;
