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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Grid,
  Paper,
} from '@mui/material';
import { ArrowBack, Directions } from '@mui/icons-material';
import api from '../services/api';
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

const bloodBankIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1297/1297136.png', // Blood drop/bank icon
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1144/1144760.png', // User location icon
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Routing Component
const Routing = ({ userLocation, destination }: { userLocation: [number, number], destination: [number, number] | null }) => {
  const map = useMap();
  const routingControlRef = useRef<any>(null);

  useEffect(() => {
    if (!map || !userLocation || !destination) return;

    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    routingControlRef.current = (L as any).Routing.control({
      waypoints: [
        L.latLng(userLocation[0], userLocation[1]),
        L.latLng(destination[0], destination[1])
      ],
      lineOptions: {
        styles: [{ color: '#D32F2F', weight: 4 }] // Red line for blood banks
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
  }, [map, userLocation, destination]);

  return null;
};

interface BloodBank {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  distanceKm?: number;
  inventories: Array<{
    bloodGroup: string;
    quantityUnits: number;
    isEmergencyShortage: boolean;
  }>;
}

const BloodSearch = () => {
  const navigate = useNavigate();
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<[number, number] | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      () => {}
    );
  }, []);

  const handleSearch = async () => {
    if (!selectedBloodGroup) {
      return;
    }

    setLoading(true);
    try {
      const params: any = { bloodGroup: selectedBloodGroup };
      if (userLocation) {
        params.latitude = userLocation[0];
        params.longitude = userLocation[1];
      }
      const response = await api.get('/blood-banks/search', { params });
      setBloodBanks(response.data);
    } catch (error) {
      console.error('Failed to search blood banks:', error);
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
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            Blood Bank Search
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Search and List Section */}
          <Grid item xs={12} md={4}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Search Blood Banks
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Blood Group</InputLabel>
                <Select
                  value={selectedBloodGroup}
                  onChange={(e) => setSelectedBloodGroup(e.target.value)}
                  label="Blood Group"
                >
                  <MenuItem value="A_POSITIVE">A+</MenuItem>
                  <MenuItem value="A_NEGATIVE">A-</MenuItem>
                  <MenuItem value="B_POSITIVE">B+</MenuItem>
                  <MenuItem value="B_NEGATIVE">B-</MenuItem>
                  <MenuItem value="AB_POSITIVE">AB+</MenuItem>
                  <MenuItem value="AB_NEGATIVE">AB-</MenuItem>
                  <MenuItem value="O_POSITIVE">O+</MenuItem>
                  <MenuItem value="O_NEGATIVE">O-</MenuItem>
                </Select>
              </FormControl>
              <Button 
                variant="contained" 
                onClick={handleSearch} 
                disabled={loading || !selectedBloodGroup}
                sx={{ px: 4 }}
              >
                Search
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '60vh', overflowY: 'auto', pr: 1 }}>
                {bloodBanks.length === 0 && selectedBloodGroup && !loading && (
                  <Typography variant="body1" color="text.secondary">
                    No blood banks found.
                  </Typography>
                )}
                {bloodBanks.map((bank) => (
                  <Card 
                    key={bank.id} 
                    variant="outlined"
                    sx={{ 
                      borderColor: selectedDestination?.[0] === bank.latitude ? 'error.main' : 'divider',
                      borderWidth: selectedDestination?.[0] === bank.latitude ? 2 : 1
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="error">
                        {bank.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {bank.address}
                      </Typography>
                      {bank.distanceKm && (
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
                          Distance: {bank.distanceKm.toFixed(2)} km
                        </Typography>
                      )}
                      <Box sx={{ mt: 2, mb: 2 }}>
                        {bank.inventories
                          .filter((inv) => inv.bloodGroup === selectedBloodGroup)
                          .map((inv) => (
                            <Typography
                              key={inv.bloodGroup}
                              variant="body2"
                              color={inv.isEmergencyShortage ? 'error' : 'text.primary'}
                              sx={{ fontWeight: inv.isEmergencyShortage ? 'bold' : 'normal' }}
                            >
                              {inv.bloodGroup.replace('_', ' ')}: {inv.quantityUnits} units
                              {inv.isEmergencyShortage && ' (CRITICAL SHORTAGE)'}
                            </Typography>
                          ))}
                      </Box>
                      <Button 
                        variant="contained" 
                        color="error"
                        fullWidth 
                        startIcon={<Directions />}
                        onClick={() => setSelectedDestination([bank.latitude, bank.longitude])}
                      >
                        Show Path
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Grid>

          {/* Map Section */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ height: '75vh', width: '100%', overflow: 'hidden', borderRadius: 2, boxShadow: 3 }}>
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
                    <Popup>You are here</Popup>
                  </Marker>
                )}

                {bloodBanks.map((bank) => (
                  <Marker 
                    key={bank.id} 
                    position={[bank.latitude, bank.longitude]}
                    icon={bloodBankIcon}
                  >
                    <Popup>
                      <Typography variant="subtitle2" color="error">{bank.name}</Typography>
                      <Typography variant="caption">{bank.address}</Typography>
                      <br />
                      <Typography variant="caption" color="primary">
                        {bank.distanceKm?.toFixed(2)} km away
                      </Typography>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        color="error"
                        sx={{ mt: 1 }}
                        fullWidth
                        onClick={() => setSelectedDestination([bank.latitude, bank.longitude])}
                      >
                        Route
                      </Button>
                    </Popup>
                  </Marker>
                ))}

                {userLocation && selectedDestination && (
                  <Routing userLocation={userLocation} destination={selectedDestination} />
                )}
              </MapContainer>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default BloodSearch;
