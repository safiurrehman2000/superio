import { JOB_TYPE_OPTIONS, SECTORS } from "@/utils/constants";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  latestJob: ["full-time"],
  category: [
    {
      id: 1,
      name: "Residential",
      value: "residential",
    },
    {
      id: 2,
      name: "Commercial",
      value: "commercial",
    },
    {
      id: 3,
      name: "Industrial",
      value: "industrial",
    },
    {
      id: 4,
      name: "Apartments",
      value: "apartments",
    },
  ],
  jobTypeList: JOB_TYPE_OPTIONS.map((option, index) => ({
    id: index + 1,
    name: option.label,
    value: option.value,
    isChecked: false,
  })),
  datePost: [
    { id: 1, name: "All", value: "all", isChecked: false },
    { id: 2, name: "Last Hour", value: "last-hour", isChecked: false },
    {
      id: 3,
      name: "Last 24 Hour",
      value: "last-24-hour",
      isChecked: false,
    },
    { id: 4, name: "Last 7 Days", value: "last-7-days", isChecked: false },
    {
      id: 5,
      name: "Last 14 Days",
      value: "last-14-days",
      isChecked: false,
    },
    {
      id: 6,
      name: "Last 30 Days",
      value: "last-30-days",
      isChecked: false,
    },
  ],

  tags: SECTORS.map((sector, index) => ({
    id: index + 1,
    name: sector.label,
    value: sector.value,
    isChecked: false,
  })),
};

export const jobSlice = createSlice({
  name: "job",
  initialState,
  reducers: {
    addLatestJob: (state, { payload }) => {
      const isExist = state.latestJob?.includes(payload);
      if (isExist) {
        state.latestJob = state.latestJob.filter((item) => item !== payload);
      } else {
        state.latestJob.push(payload);
      }
    },
    clearJobTypeToggle: (state) => {
      state?.jobTypeList?.map((item) => {
        item.isChecked = false;
        return {
          ...item,
        };
      });
    },
    jobTypeCheck: (state, { payload }) => {
      state?.jobTypeList?.map((item) => {
        if (item.id === payload) {
          if (item.isChecked) {
            item.isChecked = false;
          } else {
            item.isChecked = true;
          }
        }
        return {
          ...item,
        };
      });
    },
    datePostCheck: (state, { payload }) => {
      state?.datePost?.map((item) => {
        item.isChecked = false;
        if (item.id === payload) {
          item.isChecked = true;
        }
        return {
          ...item,
        };
      });
    },
    clearDatePostToggle: (state) => {
      state?.datePost?.map((item) => {
        item.isChecked = false;
        return {
          ...item,
        };
      });
    },

    clearExperienceToggle: (state) => {
      state?.experienceLavel?.map((item) => {
        item.isChecked = false;
        return {
          ...item,
        };
      });
    },

    tagCheck: (state, { payload }) => {
      state.tags.forEach((item) => {
        if (item.id === payload) {
          item.isChecked = !item.isChecked;
        }
      });
    },
    clearTagsToggle: (state) => {
      state.tags.forEach((item) => {
        item.isChecked = false;
      });
    },
  },
});

export const {
  addLatestJob,
  clearJobTypeToggle,
  jobTypeCheck,
  datePostCheck,
  clearDatePostToggle,
  clearExperienceToggle,
  tagCheck,
  clearTagsToggle,
} = jobSlice.actions;
export default jobSlice.reducer;
