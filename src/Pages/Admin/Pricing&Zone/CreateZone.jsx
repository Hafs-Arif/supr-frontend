import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Save, 
  X,
  Plus,
  Minus,
  Trash2,
  Maximize2
} from 'lucide-react';
import { GoogleMap, LoadScript, Marker, Polygon } from '@react-google-maps/api';
import api from '../../../utils/api';
import ToastService from '../../../Services/ToastService';

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '100%'
};

const INITIAL_CENTER = {
  lat: 30.3753,
  lng: 69.3451
};

const INITIAL_ZOOM = 6;

const MAP_OPTIONS = {
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: true,
  zoomControl: false,
  gestureHandling: 'greedy',
  clickableIcons: false,
  disableDoubleClickZoom: false
};

function CreateZone() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  
  const [formData, setFormData] = useState({
    areaName: '',
    isActive: true,
    multiplier: 1.0
  });

  const [mapPoints, setMapPoints] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle map load
  const onMapLoad = useCallback((mapInstance) => {
    mapRef.current = mapInstance;
  }, []);

  // Handle map click - Add point without affecting zoom
  const handleMapClick = useCallback((e) => {
    const newPoint = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    
    setMapPoints(prev => [...prev, newPoint]);
  }, []);

  // Remove specific point
  const removePoint = useCallback((indexToRemove) => {
    setMapPoints(prev => prev.filter((_, index) => index !== indexToRemove));
  }, []);

  // Handle zoom changes
  const handleZoomIn = useCallback(() => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      mapRef.current.setZoom(Math.min(currentZoom + 1, 20));
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      mapRef.current.setZoom(Math.max(currentZoom - 1, 1));
    }
  }, []);

  // Fit bounds to show all points
  const fitBoundsToPoints = useCallback(() => {
    if (!mapRef.current || mapPoints.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();
    mapPoints.forEach(point => {
      bounds.extend(new window.google.maps.LatLng(point.lat, point.lng));
    });
    
    mapRef.current.fitBounds(bounds, {
      padding: { top: 50, right: 50, bottom: 50, left: 50 }
    });
  }, [mapPoints]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.areaName.trim()) {
      ToastService.error('Zone name is required');
      return;
    }

    if (mapPoints.length < 3) {
      ToastService.error('Minimum 3 points required for zone boundary');
      return;
    }

    try {
      setIsLoading(true);

      // Calculate center point from map points
      const avgLat = mapPoints.reduce((sum, point) => sum + point.lat, 0) / mapPoints.length;
      const avgLng = mapPoints.reduce((sum, point) => sum + point.lng, 0) / mapPoints.length;
      
      const centerLat = avgLat;
      const centerLon = avgLng;

      // Calculate radius as average distance from center to points using Haversine formula
      let totalDistance = 0;
      
      mapPoints.forEach(point => {
        // Haversine formula for distance
        const R = 6371; // Earth's radius in km
        const dLat = (point.lat - centerLat) * Math.PI / 180;
        const dLng = (point.lng - centerLon) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(centerLat * Math.PI / 180) * Math.cos(point.lat * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        totalDistance += distance;
      });
      const radiusKm = Math.round((totalDistance / mapPoints.length) * 10) / 10 || 5; // minimum 5 km

      // Validate radius is within limit
      if (radiusKm > 100) {
        ToastService.error(`Zone radius of ${radiusKm.toFixed(1)} km exceeds maximum limit of 100 km. Please adjust your zone boundary.`);
        setIsLoading(false);
        return;
      }

      // Generate geohash from coordinates
      const encodeGeohash = (lat, lon, precision = 8) => {
        const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
        lat = parseFloat(lat);
        lon = parseFloat(lon);
        
        let idx = 0;
        let bit = 0;
        let evenBit = true;
        let geohash = '';
        
        let latMin = -90, latMax = 90;
        let lonMin = -180, lonMax = 180;
        
        while (geohash.length < precision) {
          if (evenBit) {
            const mid = (lonMin + lonMax) / 2;
            if (lon > mid) {
              idx = (idx << 1) + 1;
              lonMin = mid;
            } else {
              idx = idx << 1;
              lonMax = mid;
            }
          } else {
            const mid = (latMin + latMax) / 2;
            if (lat > mid) {
              idx = (idx << 1) + 1;
              latMin = mid;
            } else {
              idx = idx << 1;
              latMax = mid;
            }
          }
          evenBit = !evenBit;
          
          if (++bit === 5) {
            geohash += BASE32[idx];
            bit = 0;
            idx = 0;
          }
        }
        return geohash;
      };

      const areaGeohash = encodeGeohash(centerLat, centerLon, 8);

      // Prepare request payload
      const payload = {
        areaName: formData.areaName,
        centerLat: parseFloat((Math.round(centerLat * 100) / 100).toFixed(2)),
        centerLon: parseFloat((Math.round(centerLon * 100) / 100).toFixed(2)),
        radiusKm: parseFloat(radiusKm.toFixed(2)),
        isActive: formData.isActive,
        multiplier: parseFloat(formData.multiplier.toFixed(2)),
        areaGeohash: areaGeohash,
        activeFrom: new Date().toISOString(),
        activeUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      };

      console.log('Sending payload:', JSON.stringify(payload, null, 2));

      // Make API call
      const response = await api.post('/pricing/surge/zones', payload);

      if (response.data.success) {
        ToastService.success('Surge pricing zone created successfully!');
        
        // Reset form
        setFormData({
          areaName: '',
          isActive: true,
          multiplier: 1.0
        });
        setMapPoints([]);
      } else {
        const errorMessage = response.data.message || 'Failed to create zone';
        ToastService.error(errorMessage);
      }
    } catch (error) {
      console.error('Error creating zone:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.message ||
                          error.message || 
                          'Error creating surge pricing zone';
      console.log('API Response:', error.response?.data);
      ToastService.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetMap = useCallback(() => {
    setMapPoints([]);
  }, []);

  const polygonPath = mapPoints.map(point => ({
    lat: point.lat,
    lng: point.lng
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <MapPin className="mr-3 text-blue-600" size={28} />
              Create New Zone
            </h1>
            <p className="text-gray-600 mt-1">Define new service zone with pricing and coverage area</p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition shadow-sm"
            >
              <X size={18} />
              <span>Cancel</span>
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isLoading}
              className={`flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Save size={18} />
              <span>{isLoading ? 'Creating...' : 'Create Zone'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Section - Map and Zone Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Map */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <MapPin className="mr-2 text-blue-600" size={20} />
            Zone Area Selection
          </h2>
          
          <div className="flex-1 min-h-[500px] bg-gradient-to-br from-blue-50 to-green-50 rounded-lg relative border-2 border-gray-300 overflow-hidden flex flex-col">
            {/* Google Map */}
            <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                key="zone-map"
                mapContainerStyle={MAP_CONTAINER_STYLE}
                center={INITIAL_CENTER}
                zoom={INITIAL_ZOOM}
                onClick={handleMapClick}
                onLoad={onMapLoad}
                options={MAP_OPTIONS}
              >
                {/* Markers for each point */}
                {mapPoints.map((point, index) => (
                  <Marker
                    key={`marker-${index}`}
                    position={{ lat: point.lat, lng: point.lng }}
                    label={{
                      text: `${index + 1}`,
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                    title={`Point ${index + 1} - Click to remove`}
                    onClick={() => removePoint(index)}
                    icon={{
                      path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                      scale: 12,
                      fillColor: '#3B82F6',
                      fillOpacity: 1,
                      strokeColor: '#1E40AF',
                      strokeWeight: 2,
                    }}
                  />
                ))}

                {/* Polygon for zone boundary */}
                {mapPoints.length > 2 && (
                  <Polygon
                    paths={polygonPath}
                    options={{
                      fillColor: '#3B82F6',
                      fillOpacity: 0.25,
                      strokeColor: '#2563EB',
                      strokeOpacity: 0.9,
                      strokeWeight: 3,
                      clickable: false,
                      draggable: false,
                      editable: false
                    }}
                  />
                )}
              </GoogleMap>
            </LoadScript>

            {/* Enhanced Zoom Controls */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-white rounded-lg shadow-lg border border-gray-200">
              <button
                onClick={handleZoomIn}
                className="p-2.5 hover:bg-blue-50 transition rounded-t-lg group"
                title="Zoom in"
              >
                <Plus size={20} className="text-gray-700 group-hover:text-blue-600" />
              </button>
              <div className="h-px bg-gray-200"></div>
              <button
                onClick={handleZoomOut}
                className="p-2.5 hover:bg-blue-50 transition rounded-b-lg group"
                title="Zoom out"
              >
                <Minus size={20} className="text-gray-700 group-hover:text-blue-600" />
              </button>
            </div>

            {/* Map Control Buttons */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {mapPoints.length > 0 && (
                <>
                  <button 
                    onClick={resetMap}
                    className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition flex items-center gap-2 border border-gray-200"
                    title="Clear all points"
                  >
                    <Trash2 size={16} />
                    <span>Clear All</span>
                  </button>
                  
                  {mapPoints.length > 2 && (
                    <button 
                      onClick={fitBoundsToPoints}
                      className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition flex items-center gap-2 border border-gray-200"
                      title="Fit zone to view"
                    >
                      <Maximize2 size={16} />
                      <span>Fit Zone</span>
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Points Counter */}
            <div className="absolute bottom-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-2">
              <MapPin size={16} />
              <span>{mapPoints.length} point{mapPoints.length !== 1 ? 's' : ''}</span>
              {mapPoints.length >= 3 && (
                <span className="ml-1 text-blue-200">✓</span>
              )}
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="text-sm text-gray-600 flex items-start gap-2">
              <span className="text-blue-600 font-semibold">•</span>
              <span>Click on the map to add boundary points (minimum 3 required)</span>
            </div>
            <div className="text-sm text-gray-600 flex items-start gap-2">
              <span className="text-blue-600 font-semibold">•</span>
              <span>Click on any marker to remove that point</span>
            </div>
            <div className="text-sm text-gray-600 flex items-start gap-2">
              <span className="text-blue-600 font-semibold">•</span>
              <span>Use "Fit Zone" to auto-center all points in view</span>
            </div>
          </div>
        </div>

        {/* Right Side - Zone Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Zone Information</h2>
          
          <div className="space-y-4 flex-1">
            {/* Area Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Area Name *
              </label>
              <input
                type="text"
                value={formData.areaName}
                onChange={(e) => handleInputChange('areaName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter area name (e.g., Downtown Karachi)"
                required
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Zone is Active
              </label>
            </div>

            {/* Multiplier */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Surge Multiplier
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleInputChange('multiplier', Math.max(1.0, formData.multiplier - 0.1))}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  <Minus size={16} />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-2xl font-bold text-orange-600">
                    {formData.multiplier.toFixed(1)}x
                  </span>
                  <div className="text-xs text-gray-500 mt-1">
                    Surge multiplier (1.0x - 3.0x)
                  </div>
                </div>
                <button
                  onClick={() => handleInputChange('multiplier', Math.min(3.0, formData.multiplier + 0.1))}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Set surge pricing multiplier for this zone
              </div>
            </div>

            {/* Points List */}
            {mapPoints.length > 0 && (
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Boundary Points ({mapPoints.length})
                </label>
                <div className="max-h-48 overflow-y-auto space-y-1 bg-gray-50 rounded-lg p-3">
                  {mapPoints.map((point, index) => (
                    <div 
                      key={`point-${index}`}
                      className="flex items-center justify-between text-xs bg-white rounded px-3 py-2 shadow-sm"
                    >
                      <span className="font-medium text-gray-700">
                        Point {index + 1}
                      </span>
                      <span className="text-gray-500 font-mono">
                        {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                      </span>
                      <button
                        onClick={() => removePoint(index)}
                        className="text-red-500 hover:text-red-700 transition"
                        title="Remove point"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateZone;