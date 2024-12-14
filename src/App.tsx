import React from "react";
import axios from "axios";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import {
  Button,
  CircularProgress,
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  createTheme,
  ThemeProvider,
  Grid,
  Chip,
  Modal,
  Backdrop,
  Fade
} from "@mui/material";
import { LocationOn, Phone, Person, VerifiedUser } from "@mui/icons-material";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const theme = createTheme({
  palette: {
    primary: {
      main: "#2e7d32", // ירוק כהה צבאי
    },
    secondary: {
      main: "#6d4c41", // חום בהיר
    },
    success: {
      main: "#388e3c",
    },
    error: {
      main: "#d32f2f",
    },
  },
  typography: {
    fontFamily: "Alef, Arial, sans-serif",
  },
});

const ShowParam: React.FC = () => {
  const { param: militaryID } = useParams<{ param: string }>();
  const [soldier, setSoldier] = React.useState<Record<string, any> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const fetchSoldier = React.useCallback(async () => {
    if (!militaryID) return;
    try {
      setLoading(true);
      const response = await axios.get(
        `https://nakhsal-event.onrender.com/soldier/${militaryID}`
      );
      setSoldier(response.data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [militaryID]);

  React.useEffect(() => {
    fetchSoldier();
  }, [fetchSoldier]);

  const handleClick = async () => {
    // בדיקה אם הסטטוס הוא "pending"
    if (soldier?.status !== "pending") {
      // פתח מודל המתריע שאי אפשר לעדכן שוב
      setModalOpen(true);
      return;
    }

    try {
      await axios.put(`https://nakhsal-event.onrender.com/soldier/status/${militaryID}`);
      toast.success("החייל עודכן בהצלחה");
      await fetchSoldier();
    } catch (err) {
      console.error(err);
      toast.error("אירעה שגיאה בעדכון החייל");
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        sx={{ bgcolor: "#f4f4f4" }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        sx={{ bgcolor: "#f4f4f4" }}
      >
        <Typography color="error" variant="h6">
          שגיאה: {error.message}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#e0e0e0",
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url('https://images.unsplash.com/photo-1622646016522-4fedab6e9ae2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(5px)",
            p: 2,
          }}
          raised
        >
          <CardContent>
            <Typography variant="h4" gutterBottom align="center" color="primary">
              פרטי חייל
            </Typography>
            <Typography variant="h5" gutterBottom align="center">
              מספר אישי: {militaryID}
            </Typography>
            <Typography variant="h6" gutterBottom align="center">
              שם: {soldier?.name || "לא זמין"}
            </Typography>

            <Box mt={3}>
              <Grid container spacing={2}>
                {soldier?.city && (
                  <Grid item xs={12} display="flex" alignItems="center">
                    <LocationOn color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">עיר: {soldier.city}</Typography>
                  </Grid>
                )}
                {soldier?.cell && (
                  <Grid item xs={12} display="flex" alignItems="center">
                    <Phone color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">טלפון: {soldier.cell}</Typography>
                  </Grid>
                )}
                {soldier?.emergencyCell && (
                  <Grid item xs={12} display="flex" alignItems="center">
                    <Phone color="error" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      טלפון חירום: {soldier.emergencyCell}
                    </Typography>
                  </Grid>
                )}
                {soldier?.status && (
                  <Grid item xs={12} display="flex" alignItems="center">
                    <Person color="secondary" sx={{ mr: 1 }} />
                    <Typography variant="body1" sx={{ mr: 1 }}>
                      סטטוס:
                    </Typography>
                    <Chip
                      label={soldier.status}
                      color={soldier.status === "responded" ? "success" : soldier.status === "pending" ? "default" : "secondary"}
                    />
                  </Grid>
                )}
                {typeof soldier?.isAdmin === "boolean" && (
                  <Grid item xs={12} display="flex" alignItems="center">
                    <VerifiedUser
                      sx={{
                        mr: 1,
                        color: soldier.isAdmin ? "green" : "grey",
                      }}
                    />
                    <Typography variant="body1">
                      תפקיד: {soldier.isAdmin ? "מנהל" : "משתמש רגיל"}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          </CardContent>
          <CardActions sx={{ justifyContent: "center" }}>
            <Button
              variant="contained"
              color="success"
              onClick={handleClick}
              sx={{ mt: 2, fontWeight: "bold" }}
            >
              עדכן על מצבך
            </Button>
          </CardActions>
        </Card>
      </Container>
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={modalOpen}>
          <Box
            sx={{
              position: 'absolute' as const,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'white',
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
              textAlign: 'center'
            }}
          >
            <Typography variant="h6" gutterBottom>
              לא ניתן לעדכן סטטוס זה
            </Typography>
            <Typography variant="body1" gutterBottom>
              הסטטוס הנוכחי אינו "pending", ולכן לא ניתן לעדכן את מצבך שוב.
            </Typography>
            <Button variant="contained" color="primary" onClick={() => setModalOpen(false)} sx={{ mt: 2 }}>
              סגור
            </Button>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

const Home: React.FC = () => (
  <Box
    sx={{
      height: "100vh",
      backgroundColor: "#e0e0e0",
      backgroundImage:
        "linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url('https://images.unsplash.com/photo-1600769551731-8fbcc38a85cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      p:2
    }}
  >
    <Typography
      variant="h5"
      color="primary"
      sx={{ backgroundColor: "rgba(255,255,255,0.8)", p: 2, borderRadius: 1 }}
    >
      יש להיכנס עם מספר אישי בכתובת
    </Typography>
  </Box>
);

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:param" element={<ShowParam />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
