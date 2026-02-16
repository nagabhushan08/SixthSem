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
  CircularProgress,
  TextField,
  Grid,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import api from '../services/api';
import NotificationsBell from '../components/NotificationsBell';

interface BloodBank {
  id: number;
  name: string;
  address: string;
  phone: string;
  inventories: Array<{
    id?: number;
    bloodGroup: string;
    quantityUnits: number;
    minimumThreshold?: number;
    isEmergencyShortage: boolean;
  }>;
}

const BLOOD_GROUPS = [
  'A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE',
  'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE',
];

const BloodBankDashboard = () => {
  const navigate = useNavigate();
  const [bloodBank, setBloodBank] = useState<BloodBank | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [formBloodGroup, setFormBloodGroup] = useState<string>(BLOOD_GROUPS[0]);
  const [formQuantity, setFormQuantity] = useState('');
  const [formThreshold, setFormThreshold] = useState('');

  useEffect(() => {
    fetchMyBloodBank();
  }, []);

  const fetchMyBloodBank = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/blood-banks/my-blood-bank');
      setBloodBank(res.data);
      const firstInv = res.data.inventories?.[0];
      if (firstInv) {
        setFormBloodGroup(firstInv.bloodGroup);
        setFormQuantity(String(firstInv.quantityUnits));
        setFormThreshold(String(firstInv.minimumThreshold ?? 10));
      } else {
        setFormQuantity('0');
        setFormThreshold('10');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load your blood bank. Ensure your account is linked to a blood bank.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bloodBank) return;
    const quantity = parseInt(formQuantity, 10);
    const threshold = formThreshold ? parseInt(formThreshold, 10) : undefined;
    if (isNaN(quantity) || quantity < 0) {
      setError('Quantity must be a non-negative number.');
      return;
    }
    setUpdating(true);
    setError(null);
    try {
      await api.put(`/blood-banks/${bloodBank.id}/inventory`, {
        bloodGroup: formBloodGroup,
        quantityUnits: quantity,
        minimumThreshold: threshold,
      });
      fetchMyBloodBank();
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update inventory');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Button startIcon={<ArrowBack />} color="inherit" onClick={() => navigate('/dashboard')}>
            Back
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Blood Bank Admin
          </Typography>
          <NotificationsBell />
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Blood Bank
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error && !bloodBank ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : bloodBank ? (
          <>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {bloodBank.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {bloodBank.address}
                </Typography>
                {bloodBank.phone && (
                  <Typography variant="body2" color="text.secondary">
                    Phone: {bloodBank.phone}
                  </Typography>
                )}
              </CardContent>
            </Card>

            <Typography variant="h6" gutterBottom>
              Blood Inventory
            </Typography>
            <Box sx={{ mb: 3 }}>
              {bloodBank.inventories?.length
                ? bloodBank.inventories.map((inv) => (
                    <Typography
                      key={inv.bloodGroup}
                      variant="body2"
                      sx={{ mb: 0.5 }}
                      color={inv.isEmergencyShortage ? 'error' : 'text.primary'}
                    >
                      {inv.bloodGroup}: {inv.quantityUnits} units
                      {inv.minimumThreshold != null && ` (min ${inv.minimumThreshold})`}
                      {inv.isEmergencyShortage && ' — LOW STOCK'}
                    </Typography>
                  ))
                : (
                  <Typography variant="body2" color="text.secondary">
                    No inventory recorded yet. Add below.
                  </Typography>
                )}
            </Box>

            <Typography variant="h6" gutterBottom>
              Update Inventory
            </Typography>
            <Card>
              <CardContent>
                <form onSubmit={handleUpdateInventory}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel>Blood Group</InputLabel>
                        <Select
                          value={formBloodGroup}
                          label="Blood Group"
                          onChange={(e) => setFormBloodGroup(e.target.value)}
                        >
                          {BLOOD_GROUPS.map((bg) => (
                            <MenuItem key={bg} value={bg}>
                              {bg.replace('_', ' ')}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Quantity (units)"
                        type="number"
                        inputProps={{ min: 0 }}
                        value={formQuantity}
                        onChange={(e) => setFormQuantity(e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Min threshold (optional)"
                        type="number"
                        inputProps={{ min: 1 }}
                        value={formThreshold}
                        onChange={(e) => setFormThreshold(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      {error && (
                        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                          {error}
                        </Alert>
                      )}
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={updating}
                      >
                        {updating ? <CircularProgress size={24} /> : 'Update Inventory'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </>
        ) : null}
      </Container>
    </>
  );
};

export default BloodBankDashboard;
