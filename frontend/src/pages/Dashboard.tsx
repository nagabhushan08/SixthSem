import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
} from '@mui/material';
import { MedicalServices, LocalHospital, LocalPharmacy, Logout, Bloodtype } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import NotificationsBell from '../components/NotificationsBell';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            ERMN Dashboard
          </Typography>
          <NotificationsBell />
          <Typography sx={{ mr: 2 }}>{user?.fullName}</Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<Logout />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.fullName}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Role: {user?.role}
        </Typography>

        <Grid container spacing={3}>
          {user?.role === 'CITIZEN' && (
            <>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <MedicalServices sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Request Ambulance
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Request an ambulance and track it in real-time
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => navigate('/ambulance-request')}
                    >
                      Request Now
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <LocalHospital sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Find Hospitals
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Search for nearby hospitals with bed availability
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => navigate('/hospitals')}
                    >
                      Search Hospitals
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <LocalPharmacy sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Find Blood Banks
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Search for blood availability by location
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => navigate('/blood-banks')}
                    >
                      Search Blood Banks
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
          {user?.role === 'AMBULANCE_DRIVER' && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Driver Dashboard
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/driver')}
                  >
                    Go to Driver Dashboard
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )}
          {user?.role === 'SUPER_ADMIN' && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Admin Dashboard
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/admin')}
                  >
                    Go to Admin Dashboard
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )}
          {user?.role === 'HOSPITAL_ADMIN' && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <LocalHospital sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Hospital Admin
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Manage your hospital&apos;s bed inventory
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/hospital')}
                  >
                    Go to Hospital Dashboard
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )}
          {user?.role === 'BLOOD_BANK_ADMIN' && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Bloodtype sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Blood Bank Admin
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Manage your blood bank&apos;s inventory
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/blood-bank')}
                  >
                    Go to Blood Bank Dashboard
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Container>
    </>
  );
};

export default Dashboard;
