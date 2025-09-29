import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Grid,
  Box,
  Typography,
  Paper,
  Checkbox,
  FormControlLabel,
  TextField,
  CssBaseline,
  IconButton,
  InputAdornment,
  CircularProgress,
  Backdrop,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import bgpic from '../assets/designlogin.jpg';
import { LightPurpleButton } from '../components/buttonStyles';
import styled from 'styled-components';
import { loginUser } from '../redux/userRelated/userHandle';
import Popup from '../components/Popup';

const defaultTheme = createTheme();

const LoginPage = ({ role }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { status, currentUser, response, error, currentRole } = useSelector(
    (state) => state.user
  );

  const [toggle, setToggle] = useState(false);
  const [guestLoader, setGuestLoader] = useState(false);
  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState('');

  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [rollNumberError, setRollNumberError] = useState(false);
  const [studentNameError, setStudentNameError] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (role === 'Student') {
      const rollNum = event.target.rollNumber.value.trim();
      const studentName = event.target.studentName.value.trim();
      const password = event.target.password.value.trim();

      if (!rollNum || !studentName || !password) {
        if (!rollNum) setRollNumberError(true);
        if (!studentName) setStudentNameError(true);
        if (!password) setPasswordError(true);
        return;
      }
      const fields = { rollNum, studentName, password };
      setLoader(true);
      dispatch(loginUser(fields));
    } else {
      const email = event.target.email.value.trim();
      const password = event.target.password.value.trim();

      if (!email || !password) {
        if (!email) setEmailError(true);
        if (!password) setPasswordError(true);
        return;
      }

      const fields = { email, password };
      setLoader(true);
      dispatch(loginUser(fields));
    }
  };

  const handleInputChange = (event) => {
    const { name } = event.target;
    if (name === 'email') setEmailError(false);
    if (name === 'password') setPasswordError(false);
    if (name === 'rollNumber') setRollNumberError(false);
    if (name === 'studentName') setStudentNameError(false);
  };

  const guestModeHandler = () => {
    const password = 'zxc';

    let fields = {};
    if (role === 'Admin') {
      fields = { email: 'yogendra@12', password };
    } else if (role === 'Student') {
      fields = { rollNum: '1', studentName: 'Dipesh Awasthi', password };
    } else if (role === 'Teacher') {
      fields = { email: 'tony@12', password };
    }
    setGuestLoader(true);
    dispatch(loginUser(fields));
  };

  useEffect(() => {
    if (status === 'success' && currentRole) {
      console.log('Login success:', {
        currentUser,
        currentRole,
        token: localStorage.getItem('authToken'),
      });

      switch (currentRole.trim()) {
        case 'Admin':
          navigate('/Admin/dashboard', { replace: true });
          break;
        case 'Student':
          navigate('/Student/dashboard', { replace: true });
          break;
        case 'Teacher':
          navigate('/Teacher/dashboard', { replace: true });
          break;
        default:
          console.warn('Unknown role detected:', currentRole);
          break;
      }
    } else if (status === 'failed') {
      // ❗ show backend-provided message such as "Incorrect password"
      setMessage(response || 'Login failed');
      setShowPopup(true);
      setLoader(false);
      setGuestLoader(false);
    } else if (status === 'error') {
      // ❗ show real network/server error
      setMessage(error || 'Network Error');
      setShowPopup(true);
      setLoader(false);
      setGuestLoader(false);
    }
  // ✅ include error in the dependency list
  }, [status, currentRole, currentUser, navigate, response, error]);

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography variant="h4" sx={{ mb: 2, color: '#2c2143' }}>
              {role} Login
            </Typography>
            <Typography variant="h7">
              Welcome back! Please enter your details
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 2 }}>
              {role === 'Student' ? (
                <>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="rollNumber"
                    label="Enter your Roll Number"
                    name="rollNumber"
                    autoComplete="off"
                    type="number"
                    autoFocus
                    error={rollNumberError}
                    helperText={rollNumberError && 'Roll Number is required'}
                    onChange={handleInputChange}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="studentName"
                    label="Enter your name"
                    name="studentName"
                    autoComplete="name"
                    error={studentNameError}
                    helperText={studentNameError && 'Name is required'}
                    onChange={handleInputChange}
                  />
                </>
              ) : (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Enter your email"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  error={emailError}
                  helperText={emailError && 'Email is required'}
                  onChange={handleInputChange}
                />
              )}
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={toggle ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                error={passwordError}
                helperText={passwordError && 'Password is required'}
                onChange={handleInputChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setToggle(!toggle)} edge="end">
                        {toggle ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <LightPurpleButton type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
                {loader ? <CircularProgress size={24} color="inherit" /> : 'Login'}
              </LightPurpleButton>

              {role === 'Admin' && (
                <Grid container>
                  <Grid>Don't have an account?</Grid>
                  <Grid item sx={{ ml: 2 }}>
                    <StyledLink to="/Adminregister">Sign up</StyledLink>
                  </Grid>
                </Grid>
              )}
            </Box>
          </Box>
        </Grid>
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: `url(${bgpic})`,
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </Grid>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={guestLoader}>
        <CircularProgress color="primary" />
        Please Wait
      </Backdrop>
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </ThemeProvider>
  );
};

export default LoginPage;

const StyledLink = styled(Link)`
  margin-top: 9px;
  text-decoration: none;
  color: #7f56da;
`;
