import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import { ArrowBack, Hotel, People, LocalHospital, Assessment } from '@mui/icons-material';
import api from '../services/api';

interface BedInventory {
  id?: number;
  bedType: string;
  totalCapacity: number;
  availableCount: number;
}

interface Hospital {
  id: number;
  name: string;
  address: string;
  phone: string;
  bedInventories: BedInventory[];
}

const BED_TYPES = ['ICU', 'GENERAL', 'EMERGENCY'];

const HospitalDashboard = () => {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  
  // Form state
  const [formBedType, setFormBedType] = useState<string>(BED_TYPES[0]);
  const [formTotalCapacity, setFormTotalCapacity] = useState('');
  const [formAvailableCount, setFormAvailableCount] = useState('');

  useEffect(() => {
    fetchMyHospital();
  }, []);

  const fetchMyHospital = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/hospitals/my-hospital');
      setHospital(res.data);
      // Auto-fill form with the first bed type if available
      const firstBed = res.data.bedInventories?.[0];
      if (firstBed) {
        setFormBedType(firstBed.bedType);
        setFormTotalCapacity(String(firstBed.totalCapacity));
        setFormAvailableCount(String(firstBed.availableCount));
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to load hospital details.';
      if (err.response?.status === 400 || err.response?.status === 404) {
        setError('No hospital is currently assigned to your account. Please contact the administrator.');
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBeds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospital) return;

    const total = parseInt(formTotalCapacity, 10);
    const available = parseInt(formAvailableCount, 10);

    if (isNaN(total) || isNaN(available)) {
      setError('Please enter valid numbers');
      return;
    }

    if (available > total) {
      setError('Available count cannot exceed total capacity');
      return;
    }

    setUpdating(true);
    setError(null);
    try {
      await api.put(`/hospitals/${hospital.id}/beds`, {
        bedType: formBedType,
        totalCapacity: total,
        availableCount: available,
      });
      fetchMyHospital();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update bed inventory');
    } finally {
      setUpdating(false);
    }
  };

  const calculateOccupancy = (bed: BedInventory) => {
    if (bed.totalCapacity === 0) return 0;
    return ((bed.totalCapacity - bed.availableCount) / bed.totalCapacity * 100).toFixed(1);
  };

  if (loading) {
    return (      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Button startIcon={<ArrowBack />} color="inherit" onClick={() => navigate('/dashboard')}>
            Back
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            Hospital Admin Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}

        <Grid container spacing={3}>
          {/* Hospital Info & Stats */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocalHospital color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{hospital?.name}</Typography>
                  <Typography variant="body1" color="text.secondary">{hospital?.address}</Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                {hospital?.bedInventories.map((bed) => (
                  <Grid item xs={12} sm={4} key={bed.bedType}>
                    <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
                      <CardContent>
                        <Typography color="text.secondary" gutterBottom variant="overline">
                          {bed.bedType} BEDS
                        </Typography>
                        <Typography variant="h4" color="primary">
                          {bed.availableCount} / {bed.totalCapacity}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Occupancy: <strong>{calculateOccupancy(bed)}%</strong>
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          {/* Update Inventory Form */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assessment color="primary" /> Update Bed Inventory
              </Typography>
              <Box component="form" onSubmit={handleUpdateBeds} sx={{ mt: 2 }}>
                <TextField
                  select
                  fullWidth
                  label="Bed Type"
                  value={formBedType}
                  onChange={(e) => {
                    const type = e.target.value;
                    setFormBedType(type);
                    const existing = hospital?.bedInventories.find(b => b.bedType === type);
                    if (existing) {
                      setFormTotalCapacity(String(existing.totalCapacity));
                      setFormAvailableCount(String(existing.availableCount));
                    }
                  }}
                  sx={{ mb: 2 }}
                >
                  {BED_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  label="Total Capacity"
                  type="number"
                  value={formTotalCapacity}
                  onChange={(e) => setFormTotalCapacity(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                />
                <TextField
                  fullWidth
                  label="Available Beds"
                  type="number"
                  value={formAvailableCount}
                  onChange={(e) => setFormAvailableCount(e.target.value)}
                  sx={{ mb: 3 }}
                  required
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={updating}
                  startIcon={updating ? <CircularProgress size={20} /> : null}
                >
                  Update Inventory
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Patient Overview Mock Section */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <People color="primary" /> Patient Statistics
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><Hotel color="action" /></ListItemIcon>
                  <ListItemText 
                    primary="Total Admitted Patients" 
                    secondary={hospital?.bedInventories.reduce((acc, bed) => acc + (bed.totalCapacity - bed.availableCount), 0)} 
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemIcon><People color="action" /></ListItemIcon>
                  <ListItemText primary="Pending Admissions" secondary="3 patients" />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemIcon><People color="action" /></ListItemIcon>
                  <ListItemText primary="Discharges Scheduled Today" secondary="5 patients" />
                </ListItem>
              </List>
              <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1, color: 'white' }}>
                <Typography variant="subtitle2">System Alert</Typography>
                <Typography variant="body2">ICU capacity reaching 90%. Consider redirecting incoming emergencies.</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default HospitalDashboard;
