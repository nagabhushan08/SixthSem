import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import NotificationsBell from '../components/NotificationsBell';

interface DashboardMetrics {
  totalBookingsToday: number;
  totalBookingsWeek: number;
  totalBookingsMonth: number;
  activeAmbulances: number;
  averageResponseTimeSeconds: number;
  bedOccupancyPercentage: number;
  bloodShortageAlerts: number;
  pendingAmbulanceApprovals: number;
}

interface Ambulance {
  id: number;
  vehicleNumber: string;
  isApproved: boolean;
}

interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [pendingAmbulances, setPendingAmbulances] = useState<Ambulance[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [usersPage, setUsersPage] = useState(0);
  const [usersSize] = useState(10);
  const [usersTotalElements, setUsersTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hospitalAdmins, setHospitalAdmins] = useState<User[]>([]);
  const [bloodBankAdmins, setBloodBankAdmins] = useState<User[]>([]);
  const [createHospitalForm, setCreateHospitalForm] = useState({ name: '', address: '', latitude: '', longitude: '', phone: '', adminUserId: '' });
  const [createBloodBankForm, setCreateBloodBankForm] = useState({ name: '', address: '', latitude: '', longitude: '', phone: '', adminUserId: '' });
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const loadAdminUsers = async () => {
      try {
        const [hRes, bRes] = await Promise.all([
          api.get('/admin/users?size=100&role=HOSPITAL_ADMIN'),
          api.get('/admin/users?size=100&role=BLOOD_BANK_ADMIN'),
        ]);
        setHospitalAdmins(hRes.data.content || []);
        setBloodBankAdmins(bRes.data.content || []);
      } catch {
        // ignore
      }
    };
    if (!loading) loadAdminUsers();
  }, [loading]);

  useEffect(() => {
    fetchUsers(usersPage);
  }, [usersPage]);

  const fetchData = async () => {
    try {
      const [metricsRes, ambulancesRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/ambulances/pending'),
      ]);
      setMetrics(metricsRes.data);
      setPendingAmbulances(ambulancesRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (page: number) => {
    try {
      const usersRes = await api.get(`/admin/users?page=${page}&size=${usersSize}`);
      setUsers(usersRes.data.content || []);
      setUsersTotalElements(usersRes.data.totalElements ?? 0);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleApproveAmbulance = async (id: number) => {
    try {
      await api.put(`/admin/ambulances/${id}/approve`);
      fetchData();
    } catch (error) {
      console.error('Failed to approve ambulance:', error);
    }
  };

  const handleUserStatusChange = async (userId: number, isActive: boolean) => {
    try {
      await api.put(`/admin/users/${userId}/status`, null, {
        params: { isActive },
      });
      fetchUsers(usersPage);
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const handleCreateHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);
    const lat = parseFloat(createHospitalForm.latitude);
    const lon = parseFloat(createHospitalForm.longitude);
    if (!createHospitalForm.name || !createHospitalForm.address || isNaN(lat) || isNaN(lon) || !createHospitalForm.adminUserId) {
      setCreateError('Please fill name, address, latitude, longitude, and select an admin.');
      return;
    }
    setCreating(true);
    try {
      await api.post('/admin/hospitals', {
        ...createHospitalForm,
        latitude: lat,
        longitude: lon,
        adminUserId: Number(createHospitalForm.adminUserId),
      });
      setCreateSuccess('Hospital created. The admin can now use the Hospital Dashboard.');
      setCreateHospitalForm({ name: '', address: '', latitude: '', longitude: '', phone: '', adminUserId: '' });
    } catch (err: unknown) {
      setCreateError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to create hospital');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateBloodBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);
    const lat = parseFloat(createBloodBankForm.latitude);
    const lon = parseFloat(createBloodBankForm.longitude);
    if (!createBloodBankForm.name || !createBloodBankForm.address || isNaN(lat) || isNaN(lon) || !createBloodBankForm.adminUserId) {
      setCreateError('Please fill name, address, latitude, longitude, and select an admin.');
      return;
    }
    setCreating(true);
    try {
      await api.post('/admin/blood-banks', {
        ...createBloodBankForm,
        latitude: lat,
        longitude: lon,
        adminUserId: Number(createBloodBankForm.adminUserId),
      });
      setCreateSuccess('Blood bank created. The admin can now use the Blood Bank Dashboard.');
      setCreateBloodBankForm({ name: '', address: '', latitude: '', longitude: '', phone: '', adminUserId: '' });
    } catch (err: unknown) {
      setCreateError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to create blood bank');
    } finally {
      setCreating(false);
    }
  };

  const chartData = metrics
    ? [
        { name: 'Today', bookings: metrics.totalBookingsToday },
        { name: 'This Week', bookings: metrics.totalBookingsWeek },
        { name: 'This Month', bookings: metrics.totalBookingsMonth },
      ]
    : [];

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Button startIcon={<ArrowBack />} color="inherit" onClick={() => navigate('/dashboard')}>
            Back
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <NotificationsBell />
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          System Overview
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Bookings Today
                    </Typography>
                    <Typography variant="h4">{metrics?.totalBookingsToday || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Active Ambulances
                    </Typography>
                    <Typography variant="h4">{metrics?.activeAmbulances || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Avg Response Time
                    </Typography>
                    <Typography variant="h4">
                      {metrics?.averageResponseTimeSeconds
                        ? `${(metrics.averageResponseTimeSeconds / 60).toFixed(1)} min`
                        : 'N/A'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Bed Occupancy
                    </Typography>
                    <Typography variant="h4">
                      {metrics?.bedOccupancyPercentage
                        ? `${metrics.bedOccupancyPercentage.toFixed(1)}%`
                        : 'N/A'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" gutterBottom>
                Bookings Overview
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="bookings" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Box>

            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" gutterBottom>
                Pending Ambulance Approvals
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Vehicle Number</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingAmbulances.map((ambulance) => (
                      <TableRow key={ambulance.id}>
                        <TableCell>{ambulance.vehicleNumber}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleApproveAmbulance(ambulance.id)}
                          >
                            Approve
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" gutterBottom>
                User Management
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Email</TableCell>
                      <TableCell>Full Name</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{u.fullName}</TableCell>
                        <TableCell>
                          <Chip label={u.role} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={u.isActive ? 'Active' : 'Inactive'}
                            size="small"
                            color={u.isActive ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            color={u.isActive ? 'error' : 'primary'}
                            onClick={() => handleUserStatusChange(u.id, !u.isActive)}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  component="div"
                  count={usersTotalElements}
                  page={usersPage}
                  onPageChange={(_, newPage) => setUsersPage(newPage)}
                  rowsPerPage={usersSize}
                  rowsPerPageOptions={[usersSize]}
                />
              </TableContainer>
            </Box>

            {(createError || createSuccess) && (
              <Alert severity={createError ? 'error' : 'success'} sx={{ mt: 2 }} onClose={() => { setCreateError(null); setCreateSuccess(null); }}>
                {createError || createSuccess}
              </Alert>
            )}

            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Create Hospital</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Link a HOSPITAL_ADMIN user to a new hospital. They will manage it from the Hospital Dashboard.
                    </Typography>
                    <form onSubmit={handleCreateHospital}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField fullWidth label="Name" value={createHospitalForm.name} onChange={(e) => setCreateHospitalForm((f) => ({ ...f, name: e.target.value }))} required />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField fullWidth label="Address" value={createHospitalForm.address} onChange={(e) => setCreateHospitalForm((f) => ({ ...f, address: e.target.value }))} required />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField fullWidth label="Latitude" type="number" value={createHospitalForm.latitude} onChange={(e) => setCreateHospitalForm((f) => ({ ...f, latitude: e.target.value }))} inputProps={{ step: 0.0001 }} required />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField fullWidth label="Longitude" type="number" value={createHospitalForm.longitude} onChange={(e) => setCreateHospitalForm((f) => ({ ...f, longitude: e.target.value }))} inputProps={{ step: 0.0001 }} required />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField fullWidth label="Phone" value={createHospitalForm.phone} onChange={(e) => setCreateHospitalForm((f) => ({ ...f, phone: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12}>
                          <FormControl fullWidth required>
                            <InputLabel>Hospital Admin (user)</InputLabel>
                            <Select value={createHospitalForm.adminUserId} label="Hospital Admin (user)" onChange={(e) => setCreateHospitalForm((f) => ({ ...f, adminUserId: e.target.value }))}>
                              {hospitalAdmins.map((u) => (
                                <MenuItem key={u.id} value={String(u.id)}>{u.fullName} ({u.email})</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                          <Button type="submit" variant="contained" disabled={creating || hospitalAdmins.length === 0}>{creating ? <CircularProgress size={24} /> : 'Create Hospital'}</Button>
                        </Grid>
                      </Grid>
                    </form>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Create Blood Bank</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Link a BLOOD_BANK_ADMIN user to a new blood bank. They will manage it from the Blood Bank Dashboard.
                    </Typography>
                    <form onSubmit={handleCreateBloodBank}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField fullWidth label="Name" value={createBloodBankForm.name} onChange={(e) => setCreateBloodBankForm((f) => ({ ...f, name: e.target.value }))} required />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField fullWidth label="Address" value={createBloodBankForm.address} onChange={(e) => setCreateBloodBankForm((f) => ({ ...f, address: e.target.value }))} required />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField fullWidth label="Latitude" type="number" value={createBloodBankForm.latitude} onChange={(e) => setCreateBloodBankForm((f) => ({ ...f, latitude: e.target.value }))} inputProps={{ step: 0.0001 }} required />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField fullWidth label="Longitude" type="number" value={createBloodBankForm.longitude} onChange={(e) => setCreateBloodBankForm((f) => ({ ...f, longitude: e.target.value }))} inputProps={{ step: 0.0001 }} required />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField fullWidth label="Phone" value={createBloodBankForm.phone} onChange={(e) => setCreateBloodBankForm((f) => ({ ...f, phone: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12}>
                          <FormControl fullWidth required>
                            <InputLabel>Blood Bank Admin (user)</InputLabel>
                            <Select value={createBloodBankForm.adminUserId} label="Blood Bank Admin (user)" onChange={(e) => setCreateBloodBankForm((f) => ({ ...f, adminUserId: e.target.value }))}>
                              {bloodBankAdmins.map((u) => (
                                <MenuItem key={u.id} value={String(u.id)}>{u.fullName} ({u.email})</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                          <Button type="submit" variant="contained" disabled={creating || bloodBankAdmins.length === 0}>{creating ? <CircularProgress size={24} /> : 'Create Blood Bank'}</Button>
                        </Grid>
                      </Grid>
                    </form>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </Container>
    </>
  );
};

export default AdminDashboard;
