// ChooseSubject.jsx
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Box, Table, TableBody, TableContainer, TableHead, Typography, Paper } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom';
import { getTeacherFreeClassSubjects } from '../../../redux/sclassRelated/sclassHandle';
import { updateTeachSubject } from '../../../redux/teacherRelated/teacherHandle';
import { GreenButton, PurpleButton } from '../../../components/buttonStyles';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';

const ChooseSubject = ({ situation }) => {
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [classID, setClassID] = useState("");
  const [teacherID, setTeacherID] = useState("");
  const [submittingId, setSubmittingId] = useState(null); // ⬅️ per-row loader

  const { subjectsList, loading, error, response } = useSelector((state) => state.sclass);

  useEffect(() => {
    if (situation === "Norm") {
      const id = params.id;
      setClassID(id);
      dispatch(getTeacherFreeClassSubjects(id));
    } else if (situation === "Teacher") {
      const { classID: cid, teacherID: tid } = params;
      setClassID(cid);
      setTeacherID(tid);
      dispatch(getTeacherFreeClassSubjects(cid));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [situation, params]);

  if (loading) return <div>Loading...</div>;
  if (response) {
    return (
      <div>
        <h1>Sorry all subjects have teachers assigned already</h1>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <PurpleButton variant="contained" onClick={() => navigate("/Admin/addsubject/" + classID)}>
            Add Subjects
          </PurpleButton>
        </Box>
      </div>
    );
  }
  if (error) console.log(error);

  const updateSubjectHandler = async (teacherId, subjectId) => {
    setSubmittingId(subjectId);
    try {
      await dispatch(updateTeachSubject(teacherId, subjectId)); // ⬅️ make sure your thunk returns a promise
      // stay on page; list will shrink if your API excludes already-assigned subjects
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6">Choose a subject</Typography>
        <PurpleButton variant="outlined" onClick={() => navigate(-1)}>Done</PurpleButton>
      </Box>

      <TableContainer>
        <Table aria-label="sclasses table">
          <TableHead>
            <StyledTableRow>
              <StyledTableCell>#</StyledTableCell>
              <StyledTableCell align="center">Subject Name</StyledTableCell>
              <StyledTableCell align="center">Subject Code</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(subjectsList) && subjectsList.length > 0 && subjectsList.map((subject, index) => (
              <StyledTableRow key={subject._id}>
                <StyledTableCell component="th" scope="row" style={{ color: "white" }}>
                  {index + 1}
                </StyledTableCell>
                <StyledTableCell align="center">{subject.subName}</StyledTableCell>
                <StyledTableCell align="center">{subject.subCode}</StyledTableCell>
                <StyledTableCell align="center">
                  {situation === "Norm" ? (
                    <GreenButton
                      variant="contained"
                      onClick={() => navigate("/Admin/teachers/addteacher/" + subject._id)}
                    >
                      Choose
                    </GreenButton>
                  ) : (
                    <GreenButton
                      variant="contained"
                      disabled={!!submittingId}
                      onClick={() => updateSubjectHandler(teacherID, subject._id)}
                    >
                      {submittingId === subject._id ? <div className="load"></div> : 'Choose Sub'}
                    </GreenButton>
                  )}
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ChooseSubject;
