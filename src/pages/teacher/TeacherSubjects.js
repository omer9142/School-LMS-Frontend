import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Paper, Box, Typography } from "@mui/material";
import { getTeacherDetails } from "../../redux/teacherRelated/teacherHandle";
import TableViewTemplate from "../../components/TableViewTemplate";

const TeacherSubjects = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { teacherDetails, loading } = useSelector((state) => state.teacher);

  // fetch teacher details
  useEffect(() => {
    if (currentUser?._id) {
      dispatch(getTeacherDetails(currentUser._id));
    }
  }, [dispatch, currentUser?._id]);

  // normalize subjects (may be array or single)
  const teacherSubjects = useMemo(() => {
    const raw = teacherDetails?.teachSubject;
    return raw ? (Array.isArray(raw) ? raw : [raw]) : [];
  }, [teacherDetails?.teachSubject]);

  const subjectColumns = [
    { id: "subName", label: "Subject Name", minWidth: 170 },
    { id: "sessions", label: "Sessions", minWidth: 100 },
    { id: "className", label: "Class", minWidth: 150 },
  ];

  const subjectRows = teacherSubjects
    .filter((s) => !!s) // remove falsy items
    .map((s) => {
      // s can be:
      // - a string / ObjectId (not populated)
      // - an object (populated subject)
      // - if backend returned nested arrays for some reason, handle gracefully

      // subject name & sessions
      const subName = typeof s === "string" ? "" : s.subName || "";
      const sessions = typeof s === "string" ? "" : s.sessions ?? "";

      // class field: Subject model uses `sclassName` to point to the class
      let className = "N/A";

      if (typeof s === "string") {
        // we only have an ID — can't show class name (backend must populate)
        className = "N/A";
      } else {
        const cls = s.sclassName;

        if (!cls) {
          className = "N/A";
        } else if (typeof cls === "string") {
          // class is an ID string
          className = cls;
        } else if (Array.isArray(cls)) {
          // defensive: if it came as array of objects (unlikely), join names
          className = cls.map(c => (c?.sclassName || c)).filter(Boolean).join(", ") || "N/A";
        } else {
          // populated object
          className = cls.sclassName || (cls._id ? String(cls._id) : "N/A");
        }
      }

      return {
        subName,
        sessions,
        className,
        id: (typeof s === "string" ? s : s._id) || Math.random().toString(36).slice(2),
      };
    });

  // Debugging tip: uncomment to inspect what is returned by API
  // console.log("teacherDetails.teachSubject:", teacherDetails?.teachSubject);

  return (
    <>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
        <br/>
          <Typography variant="h4" align="center" gutterBottom>
            Subjects
          </Typography>

          <Paper sx={{ width: "90%", overflow: "hidden", mt: 3, p: 2, ml: 5, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Subjects List:
            </Typography>

            {subjectRows.length > 0 ? (
              <TableViewTemplate columns={subjectColumns} rows={subjectRows} />
            ) : (
              <Box sx={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
                No Subjects Found
              </Box>
            )}
          </Paper>
        </>
      )}
    </>
  );
};

export default TeacherSubjects;
