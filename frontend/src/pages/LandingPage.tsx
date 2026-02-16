import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Box, Grid, Card, CardContent } from '@mui/material';
import { LocalHospital, LocalPharmacy, MedicalServices, Dashboard } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom color="primary">
          🚑 ERMN
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          Emergency Response & Medical Resource Network
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, mb: 4 }}>
          Connecting citizens, ambulances, hospitals, and blood banks for faster emergency response
        </Typography>

        {!isAuthenticated ? (
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              sx={{ mr: 2 }}
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/register')}
            >
              Register
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            size="large"
            sx={{ mt: 4 }}
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
        )}

        <Grid container spacing={4} sx={{ mt: 8 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <MedicalServices sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Emergency Response
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Request ambulance and track in real-time
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <LocalHospital sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Hospital Search
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Find nearby hospitals with bed availability
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <LocalPharmacy sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Blood Banks
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Search blood availability by location
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Dashboard sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Admin Dashboard
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Monitor system metrics and resources
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default LandingPage;
