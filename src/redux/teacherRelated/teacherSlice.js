import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    teachersList: [],
    teacherDetails: [],
    loading: false,
    error: null,
    response: null,
};

const teacherSlice = createSlice({
    name: 'teacher',
    initialState,
    reducers: {
        getRequest: (state) => {
            state.loading = true;
        },
        doneSuccess: (state, action) => {
            state.teacherDetails = action.payload;
            state.loading = false;
            state.error = null;
            state.response = null;
        },
        getSuccess: (state, action) => {
            state.teachersList = action.payload;
            state.loading = false;
            state.error = null;
            state.response = null;
        },
        getFailed: (state, action) => {
            state.response = action.payload;
            state.loading = false;
            state.error = null;
        },
        getError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        postDone: (state) => {
            state.loading = false;
            state.error = null;
            state.response = null;
        },
        teacherRequest: (state) => {
            state.loading = true;
        },
        teacherSuccess: (state, action) => {
            state.loading = false;
            state.response = action.payload;

        },
        addFailed: (state, action) => {   // ✅ renamed to match teacherHandle.js
            state.loading = false;
            state.error = action.payload;
        },
        updateRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        updateSuccess: (state, action) => {
            state.loading = false;
            state.response = action.payload;
            state.currentTeacher = action.payload; // update with latest teacher
        },
        updateFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        }
    },
});

export const {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    doneSuccess,
    postDone,
    teacherRequest,
    teacherSuccess,
    addFailed,
    teacherFail,  // ✅ added to match teacherHandle.js
    addingStarted,
    addedSuccess,
    updateRequest,
    updateSuccess,
    updateFailed
} = teacherSlice.actions;

export const teacherReducer = teacherSlice.reducer;
