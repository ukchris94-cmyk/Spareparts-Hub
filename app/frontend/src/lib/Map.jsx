import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { locationAPI, ordersAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { MapPin, Truck, Navigation, RefreshCw } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '600px',
};

const portHarcourtCenter = {
  lat: 4.8156,
  lng: 7.0498,
};

const darkMapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#1d1d1d' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1d1d1d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2c2c2c' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9c9c9c' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e0e0e' }] },
];

export function TrackingMap() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const { user } = useAuth();
  const [dispatchers, setDispatchers] = useState([]);
  const [selectedDispatcher, setSelectedDispatcher] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
  });

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchData = async () => {
    try {
      const [locationsRes] = await Promise.all([
        locationAPI.getAll(),
        orderId ? ordersAPI.getOne(orderId).then(res => setOrder(res.data)) : Promise.resolve(),
      ]);
      setDispatchers(locationsRes.data.locations || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loadError) {
    return (
      <div className= "container mx-auto px-4 py-8 ">
        <Card className= "bg-zinc-900/50 border-zinc-800 ">
          <CardContent className= "p-8 text-center ">
            <MapPin className= "h-16 w-16 mx-auto text-zinc-600 mb-4 " />
            <h2 className= "text-xl font-bold mb-2 ">Map Failed to Load</h2>
            <p className= "text-zinc-400 ">
              Google Maps API key is required. Please configure REACT_APP_GOOGLE_MAPS_API_KEY.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className= "container mx-auto px-4 py-8 ">
        <p className= "text-zinc-400 ">Loading map...</p>
      </div>
    );
  }

  return (
    <div className= "container mx-auto px-4 py-8 ">
      <div className= "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 ">
        <div>
          <h1 className= "text-3xl font-black ">Track Delivery</h1>
          <p className= "text-zinc-400 ">
            {order ? `Tracking order #${order.id.slice(0, 8)}` : 'View dispatcher locations in real-time'}
          </p>
        </div>
        <Button variant= "outline " onClick={fetchData} className= "border-zinc-700 ">
          <RefreshCw className= "h-4 w-4 mr-2 " />
          Refresh
        </Button>
      </div>

      <div className= "grid lg:grid-cols-4 gap-6 ">
        {/* Map */}
        <div className= "lg:col-span-3 ">
          <Card className= "bg-zinc-900/50 border-zinc-800 overflow-hidden ">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={portHarcourtCenter}
              zoom={13}
              options={{
                styles: darkMapStyles,
                disableDefaultUI: true,
                zoomControl: true,
              }}
            >
              {dispatchers.map((dispatcher) => (
                <Marker
                  key={dispatcher.user_id}
                  position={{ lat: dispatcher.latitude, lng: dispatcher.longitude }}
                  onClick={() => setSelectedDispatcher(dispatcher)}
                  icon={{
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                      <svg xmlns= "http://www.w3.org/2000/svg " width= "40 " height= "40 " viewBox= "0 0 24 24 " fill= "#f59e0b ">
                        <path d= "M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z "/>
                      </svg>
                    `),
                    scaledSize: new window.google.maps.Size(40, 40),
                  }}
                />
              ))}
              {selectedDispatcher && (
                <InfoWindow
                  position={{ lat: selectedDispatcher.latitude, lng: selectedDispatcher.longitude }}
                  onCloseClick={() => setSelectedDispatcher(null)}
                >
                  <div className= "p-2 ">
                    <p className= "font-bold text-black ">{selectedDispatcher.user_name}</p>
                    <p className= "text-sm text-gray-600 ">
                      Updated: {new Date(selectedDispatcher.updated_at).toLocaleTimeString()}
                    </p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </Card>
        </div>

        {/* Dispatcher List */}
        <div>
          <Card className= "bg-zinc-900/50 border-zinc-800 ">
            <CardHeader>
              <CardTitle className= "text-lg ">Active Dispatchers</CardTitle>
            </CardHeader>
            <CardContent className= "space-y-3 ">
              {dispatchers.length === 0 ? (
                <p className= "text-zinc-400 text-sm ">No active dispatchers</p>
              ) : (
                dispatchers.map((dispatcher) => (
                  <div
                    key={dispatcher.user_id}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      selectedDispatcher?.user_id === dispatcher.user_id
                        ? 'bg-amber-500/20 border border-amber-500/30'
                        : 'bg-zinc-800/50 hover:bg-zinc-800'
                    }`}
                    onClick={() => setSelectedDispatcher(dispatcher)}
                  >
                    <div className= "flex items-center gap-3 ">
                      <div className= "w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center ">
                        <Truck className= "h-4 w-4 text-amber-500 " />
                      </div>
                      <div>
                        <p className= "font-bold text-sm ">{dispatcher.user_name}</p>
                        <p className= "text-xs text-zinc-400 ">
                          {new Date(dispatcher.updated_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function DispatcherMap() {
  const { user } = useAuth();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [watchId, setWatchId] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
  });

  useEffect(() => {
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  const startTracking = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        
        try {
          await locationAPI.update({ latitude, longitude });
        } catch (error) {
          console.error('Failed to update location:', error);
        }
      },
      (error) => {
        toast.error('Failed to get location: ' + error.message);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
    setWatchId(id);
    toast.success('Location tracking started');
  };

  const stopTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      toast.info('Location tracking stopped');
    }
  };

  const updateLocationOnce = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported');
      return;
    }

    setUpdating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        try {
          await locationAPI.update({ latitude, longitude });
          toast.success('Location updated');
        } catch (error) {
          toast.error('Failed to update location');
        } finally {
          setUpdating(false);
        }
      },
      (error) => {
        toast.error('Failed to get location');
        setUpdating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  if (loadError || !isLoaded) {
    return (
      <div className= "container mx-auto px-4 py-8 ">
        <Card className= "bg-zinc-900/50 border-zinc-800 ">
          <CardContent className= "p-8 text-center ">
            <MapPin className= "h-16 w-16 mx-auto text-zinc-600 mb-4 " />
            <h2 className= "text-xl font-bold mb-2 ">
              {loadError ? 'Map Failed to Load' : 'Loading Map...'}
            </h2>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className= "container mx-auto px-4 py-8 ">
      <div className= "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 ">
        <div>
          <h1 className= "text-3xl font-black ">Live Map</h1>
          <p className= "text-zinc-400 ">Update your location for clients to track</p>
        </div>
        <div className= "flex gap-2 ">
          <Button
            onClick={updateLocationOnce}
            disabled={updating}
            variant= "outline "
            className= "border-zinc-700 "
          >
            <Navigation className= "h-4 w-4 mr-2 " />
            {updating ? 'Updating...' : 'Update Location'}
          </Button>
          {!watchId ? (
            <Button onClick={startTracking} className= "bg-amber-500 text-black hover:bg-amber-400 font-bold ">
              Start Tracking
            </Button>
          ) : (
            <Button onClick={stopTracking} variant= "destructive ">
              Stop Tracking
            </Button>
          )}
        </div>
      </div>

      <Card className= "bg-zinc-900/50 border-zinc-800 overflow-hidden ">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={currentLocation || portHarcourtCenter}
          zoom={15}
          options={{
            styles: darkMapStyles,
            disableDefaultUI: true,
            zoomControl: true,
          }}
        >
          {currentLocation && (
            <Marker
              position={currentLocation}
              icon={{
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg xmlns= "http://www.w3.org/2000/svg " width= "40 " height= "40 " viewBox= "0 0 24 24 " fill= "#f59e0b ">
                    <circle cx= "12 " cy= "12 " r= "10 " stroke= "#18181b " stroke-width= "2 "/>
                    <circle cx= "12 " cy= "12 " r= "6 " fill= "#f59e0b "/>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(40, 40),
              }}
            />
          )}
        </GoogleMap>
      </Card>

      {watchId && (
        <div className= "mt-4 ">
          <Badge className= "bg-green-500/10 text-green-500 border border-green-500/20 ">
            <div className= "w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse " />
            Live Tracking Active
          </Badge>
        </div>
      )}
    </div>
  );
}
