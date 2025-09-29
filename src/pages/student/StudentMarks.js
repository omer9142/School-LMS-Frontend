import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMarksByStudent } from "../../redux/marksRelated/marksHandle";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Grid,
  Paper,
  LinearProgress,
  Alert,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  Equalizer,
  School,
  CalendarToday,
  Search,
  FilterList,
} from "@mui/icons-material";

const StudentMarksPage = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { marksList, loading, error } = useSelector((state) => state.marks);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  const theme = {
    primary: "#1976d2",
    secondary: "#dc004e",
    accent: "#1a1a1a",
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    surface: "#ffffff",
    text: "#1a1a1a",
    textSecondary: "#666666",
    border: "#e0e0e0",
    success: "#2e7d32",
    warning: "#ed6c02",
    error: "#d32f2f",
  };

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(fetchMarksByStudent(currentUser._id));
    }
  }, [currentUser, dispatch]);

  // Get unique subjects and assessment types for filters
  const subjects = [...new Set(marksList.map(mark => mark.subjectId?.subName).filter(Boolean))];
  const assessmentTypes = [...new Set(marksList.map(mark => mark.assessmentType).filter(Boolean))];

  // Filter and sort marks
  const filteredMarks = marksList
    .filter(mark => {
      const matchesSearch = 
        mark.subjectId?.subName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mark.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mark.assessmentType?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSubject = filterSubject === "all" || mark.subjectId?.subName === filterSubject;
      const matchesType = filterType === "all" || mark.assessmentType === filterType;
      
      return matchesSearch && matchesSubject && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.date) - new Date(a.date);
        case "percentage":
          return (b.obtainedMarks / b.totalMarks) - (a.obtainedMarks / a.totalMarks);
        case "subject":
          return (a.subjectId?.subName || "").localeCompare(b.subjectId?.subName || "");
        case "type":
          return a.assessmentType.localeCompare(b.assessmentType);
        default:
          return 0;
      }
    });

  const getPercentage = (mark) => {
    if (!mark.obtainedMarks || !mark.totalMarks || mark.totalMarks === 0) return 0;
    const percentage = (mark.obtainedMarks / mark.totalMarks) * 100;
    return isNaN(percentage) ? 0 : percentage;
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: "A+", color: theme.success };
    if (percentage >= 80) return { grade: "A", color: theme.success };
    if (percentage >= 70) return { grade: "B", color: "#388e3c" };
    if (percentage >= 60) return { grade: "C", color: "#f57c00" };
    if (percentage >= 50) return { grade: "D", color: theme.warning };
    return { grade: "F", color: theme.error };
  };

  // Calculate overall statistics
  const totalMarks = filteredMarks.length;
  const averagePercentage = totalMarks > 0 
    ? filteredMarks.reduce((sum, mark) => sum + getPercentage(mark), 0) / totalMarks 
    : 0;
  
  const bestSubject = totalMarks > 0 
    ? filteredMarks.reduce((best, mark) => 
        getPercentage(mark) > getPercentage(best) ? mark : best
      ) 
    : null;
  
  const needsImprovement = totalMarks > 0 
    ? filteredMarks.reduce((worst, mark) => 
        getPercentage(mark) < getPercentage(worst) ? mark : worst
      ) 
    : null;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2, color: theme.text }}>
            Loading your marks...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ background: theme.background, minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl" sx={{ width: "95%" }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              color: theme.accent,
              fontWeight: "bold",
              textAlign: "center",
              mb: 2,
              background: "linear-gradient(45deg, #1a1a1a 30%, #1976d2 90%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            My Academic Performance
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: theme.textSecondary,
              textAlign: "center",
              mb: 4,
            }}
          >
            Track your progress and performance across all subjects
          </Typography>
        </Box>

        {/* Statistics Cards */}
        {marksList.length > 0 && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
              }}>
                <CardContent sx={{ textAlign: "center" }}>
                  <Equalizer sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {totalMarks}
                  </Typography>
                  <Typography variant="body1">
                    Total Assessments
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                color: "white",
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
              }}>
                <CardContent sx={{ textAlign: "center" }}>
                  <TrendingUp sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {averagePercentage.toFixed(1)}%
                  </Typography>
                  <Typography variant="body1">
                    Average Score
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                color: "white",
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
              }}>
                <CardContent sx={{ textAlign: "center" }}>
                  <School sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6" fontWeight="bold" noWrap>
                    {bestSubject?.subjectId?.subName || "N/A"}
                  </Typography>
                  <Typography variant="body2">
                    Best Subject
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                color: "white",
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
              }}>
                <CardContent sx={{ textAlign: "center" }}>
                  <CalendarToday sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    {new Date().getFullYear()}
                  </Typography>
                  <Typography variant="body2">
                    Academic Year
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filters and Search */}
        {marksList.length > 0 && (
          <Card sx={{ mb: 3, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by subject, topic, or type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    label="Subject"
                  >
                    <MenuItem value="all">All Subjects</MenuItem>
                    {subjects.map((subject) => (
                      <MenuItem key={subject} value={subject}>
                        {subject}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                {/* Assessment Type Filter */}
<Grid item xs={12} sm={6} md={2}>
  <TextField
    fullWidth
    size="small"
    select
    value={filterType}
    onChange={(e) => setFilterType(e.target.value)}
    label="Assessment Type"
  >
    <MenuItem value="all">All Types</MenuItem>
    {["Test", "Quiz", "Mid Term", "Final", "Other"].map((type) => (
      <MenuItem key={type} value={type}>
        {type}
      </MenuItem>
    ))}
  </TextField>
</Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Sort By"
                  >
                    <MenuItem value="date">Date (Newest)</MenuItem>
                    <MenuItem value="percentage">Percentage</MenuItem>
                    <MenuItem value="subject">Subject</MenuItem>
                    <MenuItem value="type">Type</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FilterList />}
                    onClick={() => {
                      setSearchTerm("");
                      setFilterSubject("all");
                      setFilterType("all");
                      setSortBy("date");
                    }}
                  >
                    Clear Filters
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {marksList.length === 0 ? (
          <Card sx={{ 
            textAlign: "center", 
            py: 8, 
            borderRadius: 3,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            background: "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)"
          }}>
            <CardContent>
              <School sx={{ fontSize: 80, color: theme.textSecondary, mb: 2 }} />
              <Typography variant="h5" color={theme.textSecondary} gutterBottom>
                No Marks Available Yet
              </Typography>
              <Typography variant="body1" color={theme.textSecondary}>
                Your marks will appear here once your teachers start adding them.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Performance Summary */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: theme.accent, fontWeight: "bold" }}>
                      Overall Performance
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={averagePercentage}
                        sx={{
                          flexGrow: 1,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: "#e0e0e0",
                          "& .MuiLinearProgress-bar": {
                            backgroundColor: averagePercentage >= 50 ? theme.success : theme.error,
                            borderRadius: 5,
                          },
                        }}
                      />
                      <Typography variant="body2" sx={{ ml: 2, fontWeight: "bold", color: theme.accent }}>
                        {averagePercentage.toFixed(1)}%
                      </Typography>
                    </Box>
                    <Typography variant="body2" color={theme.textSecondary}>
                      {averagePercentage >= 70 ? "Great job! Keep up the good work!" :
                       averagePercentage >= 50 ? "You're doing okay, but there's room for improvement." :
                       "Let's work on improving your scores. You can do it!"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: theme.accent, fontWeight: "bold" }}>
                      Quick Stats
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2" color={theme.textSecondary}>
                        Showing:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {filteredMarks.length} of {marksList.length} records
                      </Typography>
                    </Box>
                    {bestSubject && (
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="body2" color={theme.textSecondary}>
                          Best Subject:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color={theme.success}>
                          {bestSubject.subjectId?.subName} ({getPercentage(bestSubject).toFixed(1)}%)
                        </Typography>
                      </Box>
                    )}
                    {needsImprovement && (
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color={theme.textSecondary}>
                          Needs Focus:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color={theme.error}>
                          {needsImprovement.subjectId?.subName} ({getPercentage(needsImprovement).toFixed(1)}%)
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Marks Table */}
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              overflow: "hidden"
            }}>
              <CardContent sx={{ p: 0 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ 
                      backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      background: "linear-gradient(135deg, #1a1a1a 0%, #1976d2 100%)"
                    }}>
                      <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "1rem" }}>
                        Subject
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "1rem" }}>
                        Assessment
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "1rem" }}>
                        Topic
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "1rem" }}>
                        Date
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "1rem" }}>
                        Marks
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "1rem" }}>
                        Percentage
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "1rem" }}>
                        Grade
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredMarks.map((mark) => {
                      const percentage = getPercentage(mark);
                      const gradeInfo = getGrade(percentage);
                      const percentageColor = percentage >= 50 ? theme.success : theme.error;

                      return (
                        <TableRow 
                          key={mark._id} 
                          sx={{ 
                            "&:hover": { 
                              backgroundColor: "#f8f9fa",
                              transform: "translateY(-1px)",
                              transition: "all 0.2s ease"
                            },
                            transition: "all 0.2s ease"
                          }}
                        >
                          <TableCell sx={{ color: theme.text, fontWeight: "500" }}>
                            {mark.subjectId?.subName || "N/A"}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={mark.assessmentType} 
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell sx={{ color: theme.text }}>
                            {mark.topic || "General"}
                          </TableCell>
                          <TableCell sx={{ color: theme.text }}>
                            {mark.date ? new Date(mark.date).toLocaleDateString() : "N/A"}
                          </TableCell>
                          <TableCell sx={{ color: theme.text, fontWeight: "bold" }}>
                            {mark.obtainedMarks} / {mark.totalMarks}
                          </TableCell>
                          <TableCell sx={{ color: percentageColor, fontWeight: "bold" }}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              {percentage.toFixed(1)}%
                              {percentage >= 70 ? 
                                <TrendingUp sx={{ fontSize: 16, ml: 0.5, color: theme.success }} /> :
                                percentage >= 50 ? 
                                <Equalizer sx={{ fontSize: 16, ml: 0.5, color: theme.warning }} /> :
                                <TrendingDown sx={{ fontSize: 16, ml: 0.5, color: theme.error }} />
                              }
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={gradeInfo.grade} 
                              size="small"
                              sx={{ 
                                backgroundColor: gradeInfo.color,
                                color: "white",
                                fontWeight: "bold"
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {filteredMarks.length === 0 && (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography variant="body1" color={theme.textSecondary}>
                      No marks found matching your filters.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </Container>
    </Box>
  );
};

export default StudentMarksPage;