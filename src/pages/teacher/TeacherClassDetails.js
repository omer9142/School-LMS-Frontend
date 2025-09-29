import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getClassStudents,
  getClassDetails,
} from "../../redux/sclassRelated/sclassHandle";
import {
  Paper,
  Box,
  Typography,
  ButtonGroup,
  Button,
  Popper,
  Grow,
  ClickAwayListener,
  MenuList,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Container,
} from "@mui/material";
import { BlackButton, BlueButton } from "../../components/buttonStyles";
import { getTeacherDetails } from "../../redux/teacherRelated/teacherHandle";
import TableTemplate from "../../components/TableTemplate";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

const TeacherClassDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sclassStudents, loading, error, getresponse, classDetails } =
    useSelector((state) => state.sclass);
  const { currentUser } = useSelector((state) => state.user);
  const { teacherDetails, loading: teacherLoading } = useSelector(
    (state) => state.teacher
  );

  // fetch teacher details once
  useEffect(() => {
    if (currentUser?._id) {
      dispatch(getTeacherDetails(currentUser._id));
    }
  }, [dispatch, currentUser?._id]);

  // normalize classes
  const teacherClasses = useMemo(() => {
    const raw = teacherDetails?.teachSclass;
    return raw ? (Array.isArray(raw) ? raw : [raw]) : [];
  }, [teacherDetails?.teachSclass]);

  // memoized class IDs
  const classIDs = useMemo(
    () =>
      teacherClasses
        .map((c) => (typeof c === "string" ? c : c._id || c))
        .filter(Boolean),
    [teacherClasses]
  );

  const [selectedClassId, setSelectedClassId] = useState(null);

  // ensure selectedClassId always has a value
  useEffect(() => {
    if (!selectedClassId && classIDs.length > 0) {
      setSelectedClassId(classIDs[0]);
    }
  }, [classIDs, selectedClassId]);

  // fetch students + class details
  useEffect(() => {
    if (selectedClassId) {
      dispatch(getClassStudents(selectedClassId));
      dispatch(getClassDetails(selectedClassId));
    }
  }, [dispatch, selectedClassId]);

  if (error) console.log(error);

  /** ---------------- STUDENTS TABLE ---------------- */
  const studentColumns = [
    { id: "name", label: "Name", minWidth: 170 },
    { id: "rollNum", label: "Roll Number", minWidth: 100 },
  ];

  const studentRows = Array.isArray(sclassStudents)
    ? sclassStudents.map((student) => ({
        name: student.name,
        rollNum: student.rollNum,
        id: student._id,
      }))
    : [];

  /** ---------------- HELPERS ---------------- */
  const selectedClassObj = teacherClasses.find(
    (c) => (typeof c === "string" ? c : c._id || c) === selectedClassId
  );

  const classLabel =
    (selectedClassObj &&
      (typeof selectedClassObj === "string"
        ? selectedClassObj
        : selectedClassObj.sclassName)) ||
    (classDetails && classDetails._id === selectedClassId
      ? classDetails.sclassName
      : selectedClassId);

  /** ---------------- BUTTON HAVER ---------------- */
  const StudentsButtonHaver = ({ row }) => {
 
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef(null);
    const [selectedIndex, setSelectedIndex] = React.useState(0);

    const handleClick = () => {
      // Navigate without subject since it's removed
      if (selectedIndex === 0) {
        navigate(`/Teacher/class/student/attendance/${row.id}`);
      } else {
        navigate(`/Teacher/class/student/marks/${row.id}`);
      }
    };

    return (
      <>
        <BlueButton
          variant="contained"
          onClick={() => navigate("/Teacher/class/student/" + row.id)}
        >
          View
        </BlueButton>
     

        <Popper open={open} anchorEl={anchorRef.current} transition disablePortal>
          {({ TransitionProps }) => (
            <Grow {...TransitionProps}>
              <Paper>
               
              </Paper>
            </Grow>
          )}
        </Popper>
      </>
    );
  };

  return (
    <Container 
      maxWidth={false} 
      sx={{ 
        width: '85%', 
        marginLeft: 'auto', 
        marginRight: 'auto',
        mt: 2,
        mb: 4
      }}
    >
      {loading || teacherLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <Typography variant="h6">Loading...</Typography>
        </Box>
      ) : (
        <>
          <Typography variant="h4" align="center" gutterBottom sx={{ mb: 3 }}>
            Class Details {classLabel ? ` - ${classLabel}` : ""}
          </Typography>

          {/* class selector if multiple classes */}
          {classIDs.length > 1 && (
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="teacher-class-select">Class</InputLabel>
                <Select
                  labelId="teacher-class-select"
                  value={selectedClassId || ""}
                  label="Class"
                  onChange={(e) => setSelectedClassId(e.target.value || null)}
                >
                  {classIDs.map((id) => {
                    const cObj = teacherClasses.find(
                      (c) => (typeof c === "string" ? c : c._id || c) === id
                    );
                    const label =
                      cObj &&
                        (typeof cObj === "string"
                          ? cObj
                          : cObj.sclassName) || id;
                    return (
                      <MenuItem key={id} value={id}>
                        {label}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Students Table */}
          {getresponse ? (
            <Box sx={{ 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center", 
              height: "200px",
              mt: 3
            }}>
              <Typography variant="h6">No Students Found</Typography>
            </Box>
          ) : (
            <Paper sx={{ 
              width: "100%", 
              overflow: "hidden", 
              mb: 3,
              p: 3,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                Students List:
              </Typography>
              {studentRows.length > 0 && (
                <TableTemplate
                  buttonHaver={StudentsButtonHaver}
                  columns={studentColumns}
                  rows={studentRows}
                />
              )}
            </Paper>
          )}
        </>
      )}
    </Container>
  );
};

export default TeacherClassDetails;