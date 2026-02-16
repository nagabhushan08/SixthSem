import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  Grid,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import api from '../services/api';
import { subscribeToTracking, TrackingMessage } from '../services/websocket';
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
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1042/1042339.png', // Ambulance icon
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1144/1144760.png', // User icon
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Routing Component for real-time tracking
const Routing = ({ userLocation, ambulanceLocation }: { userLocation: [number, number], ambulanceLocation: [number, number] }) => {
  const map = useMap();
  const routingControlRef = useRef<any>(null);

  useEffect(() => {
    if (!map || !userLocation || !ambulanceLocation) return;

    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    routingControlRef.current = (L as any).Routing.control({
      waypoints: [
        L.latLng(ambulanceLocation[0], ambulanceLocation[1]),
        L.latLng(userLocation[0], userLocation[1])
      ],
      lineOptions: {
        styles: [{ color: '#2A52BE', weight: 6, opacity: 0.7 }]
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
  }, [map, userLocation, ambulanceLocation]);

  return null;
};

interface Booking {
  id: number;
  status: string;
  pickupLatitude: number;
  pickupLongitude: number;
  ambulance?: {
    id: number;
    licensePlate: string;
    currentLatitude: number;
    currentLongitude: number;
  };
}

const AmbulanceRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      () => {
        setError('Unable to get your location. Please enable location services.');
      }
    );
  }, []);

  useEffect(() => {
    if (booking?.id) {
      const unsubscribe = subscribeToTracking(booking.id, (message: TrackingMessage) => {
        setBooking((prev) =>
          prev && prev.ambulance
            ? {
                ...prev,
                ambulance: {
                  ...prev.ambulance,
                  currentLatitude: message.latitude,
                  currentLongitude: message.longitude,
                },
              }
            : prev
        );
      });
      return unsubscribe;
    }
  }, [booking?.id]);

  const handleRequest = async () => {
    if (!userLocation) {
      setError('Please allow location access to request an ambulance');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await api.post('/bookings', {
        pickupLatitude: userLocation[0],
        pickupLongitude: userLocation[1],
      });
      setBooking(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to request ambulance. No available ambulances nearby.');
    } finally {
      setLoading(false);
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
            Emergency Ambulance
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Status and Action Section */}
          <Grid item xs={12} md={4}>
            {!booking ? (
              <Paper sx={{ p: 4, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="h4" gutterBottom color="error" sx={{ fontWeight: 'bold' }}>
                  Emergency Request
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Our system will automatically find and assign the nearest available ambulance to your current location.
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  size="large"
                  onClick={handleRequest}
                  disabled={loading || !userLocation}
                  sx={{ 
                    fontSize: '1.5rem', 
                    py: 3, 
                    borderRadius: '50px',
                    boxShadow: '0 4px 20px rgba(211, 47, 47, 0.4)',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: '0 6px 25px rgba(211, 47, 47, 0.5)',
                    }
                  }}
                >
                  {loading ? <CircularProgress size={30} color="inherit" /> : '🚑 REQUEST NOW'}
                </Button>
              </Paper>
            ) : (
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Booking Status
                </Typography>
                <Box 
                  sx={{ 
                    p: 2, 
                    bgcolor: booking.status === 'ASSIGNED' ? 'info.light' : 'success.light',
                    color: 'white',
                    borderRadius: 1,
                    mb: 3,
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="h6">{booking.status}</Typography>
                </Box>
                
                {booking.ambulance ? (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Ambulance Details:</strong>
                    </Typography>
                    <Typography variant="body1">Vehicle: {booking.ambulance.licensePlate}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      The ambulance is on its way to your location. You can track its real-time movement on the map.
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body1">
                    Finding nearest ambulance... Please stay on this page.
                  </Typography>
                )}
              </Paper>
            )}
          </Grid>

          {/* Map Section */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ height: '75vh', width: '100%', overflow: 'hidden', borderRadius: 2 }}>
              <MapContainer
                center={userLocation || [20.5937, 78.9629]}
                zoom={userLocation ? 13 : 5}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer 
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {userLocation && (
                  <Marker position={userLocation} icon={userIcon}>
                    <Popup>Your Location</Popup>
                  </Marker>
                )}

                {booking?.ambulance?.currentLatitude && booking?.ambulance?.currentLongitude && (
                  <Marker
                    position={[booking.ambulance.currentLatitude, booking.ambulance.currentLongitude]}
                    icon={ambulanceIcon}
                  >
                    <Popup>
                      <Typography variant="subtitle2">Ambulance {booking.ambulance.licensePlate}</Typography>
                      <Typography variant="caption">En route to your location</Typography>
                    </Popup>
                  </Marker>
                )}

                {userLocation && booking?.ambulance?.currentLatitude && booking?.ambulance?.currentLongitude && (
                  <Routing 
                    userLocation={userLocation} 
                    ambulanceLocation={[booking.ambulance.currentLatitude, booking.ambulance.currentLongitude]} 
                  />
                )}
              </MapContainer>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default AmbulanceRequest;
