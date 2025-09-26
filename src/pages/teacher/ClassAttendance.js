import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { getClassStudents } from "../../redux/sclassRelated/sclassHandle";
import axios from "axios";

const ClassAttendance = () => {
  const dispatch = useDispatch();

  const { sclassStudents, loading } = useSelector((state) => state.sclass);
  const { currentUser, token } = useSelector((state) => state.user);

  // always extract a plain string for classId
  const classId =
    typeof currentUser?.classTeacherOf === "object"
      ? currentUser?.classTeacherOf?._id
      : currentUser?.classTeacherOf;

  const [date] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState({}); // { studentId: "Present" | "Absent" }

  useEffect(() => {
    if (classId) {
      dispatch(getClassStudents(classId));
    }
  }, [dispatch, classId]);

  const setStatus = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const saveAttendance = async () => {
    try {
      if (!classId) {
        alert("No class assigned to this teacher.");
        return;
      }

      const payload = {
        teacherId: currentUser?._id,
        sclassId: classId,
        date,
        records: sclassStudents.map((s) => ({
          studentId: s._id,
          status: attendance[s._id] || "Absent",
        })),
      };

      await axios.post("https://school-lms-backend-ctk6.onrender.com//Attendance/Mark", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Attendance saved successfully!");

      // ✅ Reset selection so you can mark again if needed
      setAttendance({});
    } catch (err) {
      console.error("Error saving attendance:", err);
      alert(
        `Error saving attendance: ${err.response?.data?.message || err.message}`
      );
    }
  };

  if (loading) return <CircularProgress />;

  if (!classId) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="error">
          You are not assigned as a class teacher.
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Class Attendance – {date}
      </Typography>

      <Paper sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Roll No</TableCell>
              <TableCell>Name</TableCell>
              <TableCell align="center">Mark Attendance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(sclassStudents) &&
              sclassStudents.map((student) => (
                <TableRow key={student._id}>
                  <TableCell>{student.rollNum}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant={
                        attendance[student._id] === "Present"
                          ? "contained"
                          : "outlined"
                      }
                      color="success"
                      size="small"
                      sx={{ mr: 1 }}
                      onClick={() => setStatus(student._id, "Present")}
                    >
                      Present
                    </Button>

                    <Button
                      variant={
                        attendance[student._id] === "Absent"
                          ? "contained"
                          : "outlined"
                      }
                      color="error"
                      size="small"
                      onClick={() => setStatus(student._id, "Absent")}
                    >
                      Absent
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Paper>

      <Button variant="contained" sx={{ mt: 3, background:'black' }} onClick={saveAttendance}>
        Save Attendance
      </Button>
    </Box>
  );
};

export default ClassAttendance;
