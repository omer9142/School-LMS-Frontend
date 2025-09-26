  import axios from 'axios';
  import api from '../../api.js';
  import {
      getRequest,
      getSuccess,
      getFailed,
      getError,
      postDone,
      doneSuccess,
      teacherRequest,
      teacherSuccess,
      teacherFail,
      addingStarted,
      addedSuccess,
      addFailed
  } from './teacherSlice';

  export const getAllTeachers = (id) => async (dispatch) => {
      dispatch(getRequest());

      try {
          const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Teachers/${id}`);
          if (result.data.message) {
              dispatch(getFailed(result.data.message));
          } else {
              dispatch(getSuccess(result.data));
          }
      } catch (error) {
          dispatch(getError(error));
      }
  }

  export const getTeacherDetails = (id) => async (dispatch) => {
      dispatch(getRequest());

      try {
          const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Teacher/${id}`);
          if (result.data) {
              dispatch(doneSuccess(result.data));
          }
      } catch (error) {
          dispatch(getError(error));
      }
  }
  export const assignTeacherToClass = (teacherId, sclassId) => async (dispatch) => {
      try {
          console.log('Assigning teacher:', { teacherId, sclassId }); // Debug log
          dispatch(teacherRequest());
          
          const { data } = await api.put("/assign-class", 
              { teacherId, sclassId },
              { headers: { "Content-Type": "application/json" } }
          );
          
          console.log('Assignment response:', data); // Debug log
          dispatch(teacherSuccess(data));
          return data;
      } catch (error) {
          console.error('Assignment error:', error.response?.data || error.message); // Debug log
          dispatch(teacherFail(error.response?.data || error.message));
          throw error; // Re-throw to handle in component
      }
  };


  export const updateTeachSubject = (teacherId, subjectId) => async (dispatch) => {
    dispatch(getRequest());

    try {
      const result = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/TeacherSubject`,
        { teacherId, subjectId }, // ✅ FIXED: send subjectId not teachSubject
        { headers: { 'Content-Type': 'application/json' } }
      );
      dispatch(postDone());
      return result.data; // so component can await it
    } catch (error) {
      console.error("updateTeachSubject error:", error.response?.data || error.message);
      dispatch(getError(error));
      throw error;
    }
  };

  // teacherHandle.js
  export const updateTeacherDetails = (teacherId, updatedData) => async (dispatch) => {
    try {
      dispatch(teacherRequest()); // optional loading state

      const { data } = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/Teacher/${teacherId}`,
        updatedData,
        { headers: { 'Content-Type': 'application/json' } }
      );

      dispatch(teacherSuccess(data)); // update store with new teacher info
      return data; // so component can await it
    } catch (error) {
      console.error('Update teacher error:', error.response?.data || error.message);
      dispatch(teacherFail(error.response?.data || error.message));
      throw error;
    }
  };



  export const registerUser = (fields, role) => async (dispatch) => {
    try {
      dispatch(addingStarted());
      const { data } = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/${role}Reg`,
        fields,
        { headers: { 'Content-Type': 'application/json' } }
      );
      dispatch(addedSuccess(data));
      return data; // <-- IMPORTANT: return the created teacher object
    } catch (err) {
      const payload = err.response?.data || { message: err.message || 'Failed' };
      dispatch(addFailed(payload));
      throw err;
    }
  };

  export const assignClassTeacher = async (teacherId, sclassId) => {
  try {
    const { data } = await api.post(
      "/assign-class-teacher",
      { teacherId, sclassId },
      { headers: { "Content-Type": "application/json" } }
    );
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};