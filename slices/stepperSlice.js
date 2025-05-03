import { createSlice } from "@reduxjs/toolkit";

const stepperSlice = createSlice({
  name: "stepper",
  initialState: {
    currentStep: 1,
  },
  reducers: {
    nextStep: (state) => {
      state.currentStep = Math.min(state.currentStep + 1, 3);
    },
    prevStep: (state) => {
      state.currentStep = Math.max(state.currentStep - 1, 1);
    },
    setStep: (state, action) => {
      state.currentStep = Math.max(1, Math.min(action.payload, 4));
    },
  },
});

export const { nextStep, prevStep, setStep } = stepperSlice.actions;
export default stepperSlice.reducer;
