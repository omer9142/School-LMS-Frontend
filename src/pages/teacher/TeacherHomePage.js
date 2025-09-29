import React, { useEffect, useMemo, useState } from 'react';
import { Container, Grid, Paper, Box, Typography } from '@mui/material';
import SeeNotice from '../../components/SeeNotice';
import CountUp from 'react-countup';
import styled from 'styled-components';
import Students from "../../assets/img1.png";
import SubjectsIcon from "../../assets/subjects.svg"; 
import ClassesIcon from "../../assets/classroomIcon.png";
import { getClassStudents, getClassDetails } from '../../redux/sclassRelated/sclassHandle';
import { useDispatch, useSelector } from 'react-redux';
import WelcomeImage from "../../assets/student-welcome.png";

const TeacherHomePage = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { sclassStudents} = useSelector((state) => state.sclass);

  // Teacher classes
  const teacherClasses = useMemo(() => {
    if (!currentUser) return [];
    const raw = currentUser.teachSclass;
    if (!raw) return [];
    return Array.isArray(raw) ? raw : [raw];
  }, [currentUser]);

  const classIDs = useMemo(
    () => teacherClasses.map(c => (typeof c === 'string' ? c : (c._id || c))).filter(Boolean),
    [teacherClasses]
  );

  const [selectedClassId, setSelectedClassId] = useState(classIDs[0] || null);

  useEffect(() => {
    if (!selectedClassId && classIDs.length > 0) setSelectedClassId(classIDs[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classIDs.join(',')]);

  // Fetch class students and class details
  useEffect(() => {
    if (selectedClassId) {
      dispatch(getClassStudents(selectedClassId));
      dispatch(getClassDetails(selectedClassId));
    }
  }, [dispatch, selectedClassId]);

  const numberOfStudents = Array.isArray(sclassStudents) ? sclassStudents.length : 0;
  const numberOfSubjects = Array.isArray(currentUser?.teachSubject) ? currentUser.teachSubject.length : 0;
  const numberOfClasses = Array.isArray(currentUser?.teachSclass) ? currentUser.teachSclass.length : 0;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Card */}
        <Grid item xs={12}>
          <WelcomeCard>
            <WelcomeContent>
              <div>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: "bold", mb: 1, mt: -1, color: "black" }}
                >
                  Hey {currentUser?.name || "Teacher"}
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{ color: "#666", fontFamily: "poppins" }}
                >
                  Welcome!
                </Typography>
              </div>
              <TeacherAvatar>
                <img
                  src={WelcomeImage}
                  alt="Welcome"
                  style={{
                    width: "100px",
                    height: "140px",
                    objectFit: "cover",
                  }}
                />
              </TeacherAvatar>
            </WelcomeContent>
          </WelcomeCard>
        </Grid>

        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <StyledPaper>
            <CardIcon src={Students} alt="Students" />
            <Title>Class Students</Title>
            <Data start={0} end={numberOfStudents} duration={0.1} />
          </StyledPaper>
        </Grid>
        <Grid item xs={12} md={4}>
          <StyledPaper>
            <CardIcon src={SubjectsIcon} alt="Subjects" />
            <Title>Total Subjects</Title>
            <Data start={0} end={numberOfSubjects} duration={0.1} />
          </StyledPaper>
        </Grid>
        <Grid item xs={12} md={4}>
          <StyledPaper>
            <CardIcon src={ClassesIcon} alt="Classes" />
            <Title>Total Classes</Title>
            <Data start={0} end={numberOfClasses} duration={0.1} />
          </StyledPaper>
        </Grid>
        
        {/* Notices Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <SeeNotice classId={selectedClassId} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

// Styled components matching student dashboard
const WelcomeCard = styled(Paper)`
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 8px;
`;

const WelcomeContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TeacherAvatar = styled.div`
  display: flex;
  align-items: center;
`;

const StyledPaper = styled(Paper)`
  padding: 24px;
  height: 200px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  text-align: center;
`;

const CardIcon = styled.img`
  width: 50px;
  height: 50px;
  object-fit: contain;
`;

const Title = styled.p`
  font-size: 1.25rem;
  margin: 8px 0;
`;

const Data = styled(CountUp)`
  font-size: calc(1.3rem + .6vw);
  color: green;
`;

export default TeacherHomePage;