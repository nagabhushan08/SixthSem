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
  CircularProgress,
  Grid,
  Paper,
} from '@mui/material';
import { ArrowBack, Directions, Navigation, MyLocation } from '@mui/icons-material';
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

const hospitalIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063176.png', // Hospital icon
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
        styles: [{ color: '#2A52BE', weight: 4 }]
      },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false // Hide the textual instructions to keep UI clean
    }).addTo(map);

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map, userLocation, destination]);

  return null;
};

interface Hospital {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  distanceKm?: number;
  bedInventories: Array<{
    bedType: string;
    totalCapacity: number;
    availableCount: number;
  }>;
}

const HospitalSearch = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<[number, number] | null>(null);

  const handleNavigate = (lat: number, lon: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, '_blank');
  };

  const handleSelectNearest = () => {
    if (hospitals.length > 0) {
      const nearest = hospitals[0];
      setSelectedDestination([nearest.latitude, nearest.longitude]);
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: [number, number] = [position.coords.latitude, position.coords.longitude];
        setUserLocation(location);
        fetchHospitals(location[0], location[1]);
      },
      () => {
        fetchHospitals();
      }
    );
  }, []);

  const fetchHospitals = async (lat?: number, lon?: number) => {
    try {
      const params: any = {};
      if (lat && lon) {
        params.latitude = lat;
        params.longitude = lon;
      }
      const response = await api.get('/hospitals', { params });
      setHospitals(response.data);
    } catch (error) {
      console.error('Failed to fetch hospitals:', error);
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
            Hospital Search
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* List Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Nearby Hospitals
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<MyLocation />}
                onClick={handleSelectNearest}
                disabled={hospitals.length === 0}
              >
                Find Nearest
              </Button>
            </Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '70vh', overflowY: 'auto', pr: 1 }}>
                {hospitals.length === 0 && (
                  <Typography variant="body1" color="text.secondary">
                    No hospitals found nearby.
                  </Typography>
                )}
                {hospitals.map((hospital) => (
                  <Card 
                    key={hospital.id} 
                    variant="outlined"
                    sx={{ 
                      borderColor: selectedDestination?.[0] === hospital.latitude ? 'primary.main' : 'divider',
                      borderWidth: selectedDestination?.[0] === hospital.latitude ? 2 : 1
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        {hospital.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {hospital.address}
                      </Typography>
                      {hospital.distanceKm && (
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
                          Distance: {hospital.distanceKm.toFixed(2)} km
                        </Typography>
                      )}
                      <Box sx={{ mt: 2, mb: 2 }}>
                        {hospital.bedInventories.map((bed) => (
                          <Typography key={bed.bedType} variant="caption" display="block">
                            {bed.bedType}: <strong>{bed.availableCount}</strong> / {bed.totalCapacity} available
                          </Typography>
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          variant="contained" 
                          fullWidth 
                          startIcon={<Directions />}
                          onClick={() => setSelectedDestination([hospital.latitude, hospital.longitude])}
                          sx={{ flexGrow: 1 }}
                        >
                          Show Path
                        </Button>
                        <Button 
                          variant="outlined"
                          startIcon={<Navigation />}
                          onClick={() => handleNavigate(hospital.latitude, hospital.longitude)}
                        >
                          Navigate
                        </Button>
                      </Box>
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
                center={userLocation || [20.5937, 78.9629]} // Default to India center
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

                {hospitals.map((hospital) => (
                  <Marker 
                    key={hospital.id} 
                    position={[hospital.latitude, hospital.longitude]}
                    icon={hospitalIcon}
                  >
                    <Popup>
                      <Typography variant="subtitle2">{hospital.name}</Typography>
                      <Typography variant="caption">{hospital.address}</Typography>
                      <br />
                      <Typography variant="caption" color="primary">
                        {hospital.distanceKm?.toFixed(2)} km away
                      </Typography>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        sx={{ mt: 1 }}
                        fullWidth
                        onClick={() => setSelectedDestination([hospital.latitude, hospital.longitude])}
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

export default HospitalSearch;
