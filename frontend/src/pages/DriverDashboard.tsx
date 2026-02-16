import { useState, useEffect, useRef } from 'react';
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
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Grid,
  Paper,
} from '@mui/material';
import { ArrowBack, Person, Phone } from '@mui/icons-material';
import api from '../services/api';
import NotificationsBell from '../components/NotificationsBell';
import { connectWebSocket, sendLocationUpdate } from '../services/websocket';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const ambulanceIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1042/1042339.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const citizenIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1144/1144760.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Routing Component
const Routing = ({ ambulanceLocation, pickupLocation }: { ambulanceLocation: [number, number], pickupLocation: [number, number] }) => {
  const map = useMap();
  const routingControlRef = useRef<any>(null);

  useEffect(() => {
    if (!map || !ambulanceLocation || !pickupLocation) return;

    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    routingControlRef.current = (L as any).Routing.control({
      waypoints: [
        L.latLng(ambulanceLocation[0], ambulanceLocation[1]),
        L.latLng(pickupLocation[0], pickupLocation[1])
      ],
      lineOptions: {
        styles: [{ color: '#2A52BE', weight: 4 }]
      },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false
    }).addTo(map);

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map, ambulanceLocation, pickupLocation]);

  return null;
};

interface Ambulance {
  id: number;
  vehicleNumber: string;
  isAvailable: boolean;
  currentLatitude?: number;
  currentLongitude?: number;
}

interface Booking {
  id: number;
  status: string;
  pickupLatitude: number;
  pickupLongitude: number;
  citizen: {
    fullName: string;
    phone: string;
  };
}

const DriverDashboard = () => {
  const navigate = useNavigate();
  const [ambulance, setAmbulance] = useState<Ambulance | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchData();
    connectWebSocket();
    return () => {
      // Cleanup handled by websocket.ts or just let it stay
    };
  }, []);

  useEffect(() => {
    if (bookings.length > 0) {
      const activeBooking = bookings.find(b => b.status === 'ASSIGNED' || b.status === 'EN_ROUTE' || b.status === 'ARRIVED');
      if (activeBooking) {
        setSelectedBooking(activeBooking);
      }
    }
  }, [bookings]);

  // Real-time location update effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (selectedBooking && (selectedBooking.status === 'ASSIGNED' || selectedBooking.status === 'EN_ROUTE')) {
      interval = setInterval(() => {
        handleUpdateLocation();
      }, 5000); // Update every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedBooking]);

  const fetchData = async () => {
    try {
      const [ambulanceRes, bookingsRes] = await Promise.all([
        api.get('/ambulances/my-ambulance'),
        api.get('/bookings'),
      ]);
      setAmbulance(ambulanceRes.data);
      setBookings(bookingsRes.data);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (!ambulance) return;
    try {
      const response = await api.put(`/ambulances/${ambulance.id}/availability`);
      setAmbulance(response.data);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to update availability');
    }
  };

  const handleUpdateStatus = async (bookingId: number, status: string) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, null, { params: { status } });
      fetchData();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to update status');
    }
  };

  const handleUpdateLocation = async () => {
    if (!ambulance) return;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          await api.put(`/ambulances/${ambulance.id}/location`, {
            latitude,
            longitude,
          });
          
          // Send real-time update if there's an active booking
          if (selectedBooking && (selectedBooking.status === 'ASSIGNED' || selectedBooking.status === 'EN_ROUTE')) {
            sendLocationUpdate(selectedBooking.id, latitude, longitude);
          }
          
          setAmbulance(prev => prev ? { ...prev, currentLatitude: latitude, currentLongitude: longitude } : null);
        } catch (error: any) {
          setError(error.response?.data?.error || 'Failed to update location');
        }
      },
      () => {
        setError('Unable to get your location');
      }
    );
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Button startIcon={<ArrowBack />} color="inherit" onClick={() => navigate('/dashboard')}>
            Back
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Driver Dashboard
          </Typography>
          <NotificationsBell />
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Left Panel: Status and List */}
            <Grid item xs={12} md={4}>
              {ambulance && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Vehicle: {ambulance.vehicleNumber}
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={ambulance.isAvailable}
                          onChange={handleToggleAvailability}
                        />
                      }
                      label="Availability Status"
                    />
                    <Box sx={{ mt: 2 }}>
                      <Button variant="contained" fullWidth onClick={handleUpdateLocation}>
                        Update Current Location
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              )}

              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                Active & Recent Bookings
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '60vh', overflowY: 'auto', pr: 1 }}>
                {bookings.length === 0 && (
                  <Typography variant="body1" color="text.secondary">
                    No bookings assigned.
                  </Typography>
                )}
                {bookings.map((booking) => (
                  <Card 
                    key={booking.id}
                    variant="outlined"
                    sx={{ 
                      borderColor: selectedBooking?.id === booking.id ? 'primary.main' : 'divider',
                      borderWidth: selectedBooking?.id === booking.id ? 2 : 1,
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6">Booking #{booking.id}</Typography>
                        <Paper sx={{ px: 1, py: 0.5, bgcolor: 'info.light', color: 'white' }}>
                          <Typography variant="caption">{booking.status}</Typography>
                        </Paper>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Person fontSize="small" color="action" />
                        <Typography variant="body2">{booking.citizen.fullName}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Phone fontSize="small" color="action" />
                        <Typography variant="body2">{booking.citizen.phone}</Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {booking.status === 'ASSIGNED' && (
                          <Button
                            variant="contained"
                            fullWidth
                            size="small"
                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(booking.id, 'EN_ROUTE'); }}
                          >
                            Accept & Start
                          </Button>
                        )}
                        {booking.status === 'EN_ROUTE' && (
                          <Button
                            variant="contained"
                            fullWidth
                            size="small"
                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(booking.id, 'ARRIVED'); }}
                          >
                            Arrived at Pickup
                          </Button>
                        )}
                        {booking.status === 'ARRIVED' && (
                          <Button
                            variant="contained"
                            fullWidth
                            size="small"
                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(booking.id, 'COMPLETED'); }}
                          >
                            Complete Trip
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Grid>

            {/* Right Panel: Map */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ height: '80vh', width: '100%', overflow: 'hidden', borderRadius: 2, boxShadow: 3 }}>
                <MapContainer
                  center={[ambulance?.currentLatitude || 20.5937, ambulance?.currentLongitude || 78.9629]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer 
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />

                  {ambulance?.currentLatitude && ambulance?.currentLongitude && (
                    <Marker position={[ambulance.currentLatitude, ambulance.currentLongitude]} icon={ambulanceIcon}>
                      <Popup>Your Location</Popup>
                    </Marker>
                  )}

                  {selectedBooking && (
                    <Marker position={[selectedBooking.pickupLatitude, selectedBooking.pickupLongitude]} icon={citizenIcon}>
                      <Popup>
                        <Typography variant="subtitle2">Pickup Point</Typography>
                        <Typography variant="caption">{selectedBooking.citizen.fullName}</Typography>
                      </Popup>
                    </Marker>
                  )}

                  {ambulance?.currentLatitude && ambulance?.currentLongitude && selectedBooking && (
                    <Routing 
                      ambulanceLocation={[ambulance.currentLatitude, ambulance.currentLongitude]} 
                      pickupLocation={[selectedBooking.pickupLatitude, selectedBooking.pickupLongitude]} 
                    />
                  )}
                </MapContainer>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>
    </>
  );
};

export default DriverDashboard;
