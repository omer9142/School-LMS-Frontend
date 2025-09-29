import { useEffect, useState } from 'react';
import { Box, CircularProgress, Stack, TextField, Typography, Paper } from '@mui/material';
import Popup from '../../components/Popup';
import { BlackButton } from '../../components/buttonStyles';
import { addStuff } from '../../redux/userRelated/userHandle';
import { useDispatch, useSelector } from 'react-redux';

const StudentComplain = () => {
    const [complaint, setComplaint] = useState("");
    const [date, setDate] = useState("");

    const dispatch = useDispatch()

    const { status, currentUser, error } = useSelector(state => state.user);

    const user = currentUser._id
    const school = currentUser.school._id
    const address = "Complain"

    const [loader, setLoader] = useState(false)
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    const fields = {
        user,
        date,
        complaint,
        school,
    };

    const submitHandler = (event) => {
        event.preventDefault()
        setLoader(true)
        dispatch(addStuff(fields, address))
    };

    useEffect(() => {
        if (status === "added") {
            setLoader(false)
            setShowPopup(true)
            setMessage("Done Successfully")
        }
        else if (error) {
            setLoader(false)
            setShowPopup(true)
            setMessage("Network Error")
        }
    }, [status, error])

    return (
        <>
            <Box
                sx={{
                    flex: '1 1 auto',
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'center',
                    backgroundColor: '#ffffff',
                    minHeight: '60vh',
                    padding: 2
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        maxWidth: 550,
                        px: 4,
                        py: 4,
                        width: '100%',
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    <Stack spacing={1} sx={{ mb: 3 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                            Submit Complaint
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#666', textAlign: 'center' }}>
                            Please fill out the form below to submit your complaint
                        </Typography>
                    </Stack>
                    <form onSubmit={submitHandler}>
                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                label="Select Date"
                                type="date"
                                value={date}
                                onChange={(event) => setDate(event.target.value)} 
                                required
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    }
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Write your complaint"
                                variant="outlined"
                                value={complaint}
                                onChange={(event) => {
                                    setComplaint(event.target.value);
                                }}
                                required
                                multiline
                                rows={4}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    }
                                }}
                            />
                        </Stack>
                        <BlackButton
                            fullWidth
                            size="large"
                            sx={{ 
                                mt: 3,
                                borderRadius: 2,
                                padding: '12px 0',
                                fontWeight: 'bold'
                            }}
                            variant="contained"
                            type="submit"
                            disabled={loader}
                        >
                            {loader ? <CircularProgress size={24} background='black' /> : "Submit Complaint"}
                        </BlackButton>
                    </form>
                </Paper>
            </Box>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default StudentComplain;