import React, { useEffect, useState } from "react";
import { Container, Grid, Paper, Typography, Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { calculateOverallAttendancePercentage } from "../../components/attendanceCalculator";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { getUserDetails } from "../../redux/userRelated/userHandle";
import { getSubjectList } from "../../redux/sclassRelated/sclassHandle";
import { getStudentAttendance } from "../../redux/studentRelated/studentHandle";
import styled from "styled-components";
import SeeNotice from "../../components/SeeNotice";
import WelcomeImage from "../../assets/student-welcome.png";

const COLORS = ["#1e4f8fff", "#c51e1eff"]; // Blue = Present, Red = Absent

const StudentHomePage = () => {
  const dispatch = useDispatch();

  const { userDetails, currentUser, loading, response } = useSelector(
    (state) => state.user
  );
  const { subjectsList } = useSelector((state) => state.sclass);
  const { attendance } = useSelector((state) => state.student);

  const [subjectAttendance, setSubjectAttendance] = useState([]);

  const classID = currentUser.sclassName._id;

  // fetch student info, class subjects, and attendance
  useEffect(() => {
    if (currentUser?._id) {
      dispatch(getUserDetails(currentUser._id, "Student"));
      dispatch(getSubjectList(classID, "ClassSubjects"));
      dispatch(getStudentAttendance(currentUser._id)); // ✅ fetch fresh attendance
    }
  }, [dispatch, currentUser?._id, classID]);

  // set attendance whenever it changes
  useEffect(() => {
    if (attendance && attendance.length > 0) {
      setSubjectAttendance(attendance);
    }
  }, [attendance]);

  // Calculate attendance percentages
  const overallAttendancePercentage =
    calculateOverallAttendancePercentage(subjectAttendance);
  const overallAbsentPercentage = 100 - overallAttendancePercentage;

  const chartData = [
    { name: "Present", value: overallAttendancePercentage },
    { name: "Absent", value: overallAbsentPercentage },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 1, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Card */}
        <Grid item xs={12}>
          <WelcomeCard>
            <WelcomeContent>
              <div>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: "bold", mb: 1, mt:-1, color: "black" }} // ✅ force black
                >
                  Hey {currentUser?.name || "Student"}
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{ color: "#666", fontFamily: "poppins" }}
                >
                  Welcome!
                </Typography>
              </div>
              <StudentAvatar>
                <img
                  src={WelcomeImage}
                  alt="Welcome"
                  style={{
                    width: "100px",
                    height: "140px",
                    objectFit: "cover",
                  }}
                />
              </StudentAvatar>
            </WelcomeContent>
          </WelcomeCard>
        </Grid>

        {/* Attendance Chart */}
        <Grid item xs={12} md={6}>
          <AttendanceCard>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              Attendance Overview
            </Typography>
            <ChartContainer>
              {response ? (
                <Typography variant="body1" sx={{ textAlign: "center" }}>
                  No Attendance Found
                </Typography>
              ) : loading ? (
                <Typography variant="body1" sx={{ textAlign: "center" }}>
                  Loading...
                </Typography>
              ) : subjectAttendance && subjectAttendance.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value}%`, "Percentage"]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ textAlign: "center", mt: 2 }}>
                    <Typography variant="h6" color="textSecondary">
                      Overall Attendance: {overallAttendancePercentage}%
                    </Typography>
                  </Box>
                </>
              ) : (
                <Typography variant="body1" sx={{ textAlign: "center" }}>
                  No Attendance Found
                </Typography>
              )}
            </ChartContainer>
          </AttendanceCard>
        </Grid>

        {/* Notifications Panel */}
        <Grid item xs={12} md={6}>
          <NotificationCard>
            <NoticeContainer>
              <SeeNotice />
            </NoticeContainer>
          </NotificationCard>
        </Grid>
      </Grid>
    </Container>
  );
};

// Styled components
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

const StudentAvatar = styled.div`
  display: flex;
  align-items: center;
`;

const AttendanceCard = styled(Paper)`
  padding: 24px;
  height: 100%;
  min-height: 350px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
`;

const ChartContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const NotificationCard = styled(Paper)`
  padding: 24px;
  height: 100%;
  min-height: 350px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const NoticeContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`;

export default StudentHomePage;
