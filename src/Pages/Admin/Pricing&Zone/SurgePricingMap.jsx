import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MapPin, AlertTriangle, TrendingUp, ZoomIn, ZoomOut, Navigation, RefreshCw } from 'lucide-react';
import { GoogleMap, LoadScript, Marker, InfoWindow, Polygon } from '@react-google-maps/api';
import api from '../../../utils/api';

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '100%'
};

const INITIAL_CENTER = {
  lat: 30.1843,
  lng: 72.7517
};

const MAP_OPTIONS = {
  disableDefaultUI: false,
  zoomControl: false,
  fullscreenControl: false,
  streetViewControl: false,
};

const LIBRARIES = ['maps'];

// Function to decode geohash to approximate center coordinates
const decodeGeohash = (geohash) => {
  const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  let lat = [-90, 90];
  let lon = [-180, 180];
  let isEvenBit = true;
  
  for (let i = 0; i < geohash.length; i++) {
    const idx = BASE32.indexOf(geohash[i]);
    if (idx === -1) {
      console.warn(`Invalid geohash character: ${geohash[i]}`);
      return null;
    }
    
    for (let mask = 16; mask >= 1; mask /= 2) {
      if (isEvenBit) {
        const midLon = (lon[0] + lon[1]) / 2;
        if (idx & mask) {
          lon[0] = midLon;
        } else {
          lon[1] = midLon;
        }
      } else {
        const midLat = (lat[0] + lat[1]) / 2;
        if (idx & mask) {
          lat[0] = midLat;
        } else {
          lat[1] = midLat;
        }
      }
      isEvenBit = !isEvenBit;
    }
  }
  
  const centerLat = (lat[0] + lat[1]) / 2;
  const centerLon = (lon[0] + lon[1]) / 2;
  
  return { centerLat, centerLon };
};

export default function SurgePricingMap() {
  const [zones, setZones] = useState([]);
  const [filteredZones, setFilteredZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState(null);
  const [mapZoom, setMapZoom] = useState(12);
  const [searchTerm, setSearchTerm] = useState('');
  const [minMultiplier, setMinMultiplier] = useState(0);
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const mapRef = useRef(null);

  const fetchSurgeZones = async () => {
    try {
      setLoading(true);
      const res = await api.get('/pricing/surge/zones');
      let zoneData = res.data?.data || [];
      console.log('Fetched zones from API:', zoneData);
      console.log('Zone data length:', zoneData.length);
      
      // Decode geohash to get coordinates
      const zonesWithCoords = zoneData.map(zone => {
        console.log('Processing zone:', zone);
        console.log(`Zone ${zone.id}: Has centerLat=${zone.centerLat}, centerLon=${zone.centerLon}, geohash=${zone.geohash}`);
        
        let centerLat = 30.1843;  // Hussainabad fallback
        let centerLon = 72.7517;  // Hussainabad fallback
        
        // Use provided coordinates if available (prefer this over geohash)
        if (zone.centerLat && zone.centerLon) {
          centerLat = zone.centerLat;
          centerLon = zone.centerLon;
          console.log(`Zone ${zone.id}: Using provided coordinates Lat=${centerLat}, Lon=${centerLon}`);
        } 
        // Try to decode geohash if no provided coordinates
        else if (zone.geohash) {
          const decoded = decodeGeohash(zone.geohash);
          if (decoded) {
            centerLat = decoded.centerLat;
            centerLon = decoded.centerLon;
            console.log(`Zone ${zone.id}: Decoded geohash ${zone.geohash} to Lat=${centerLat}, Lon=${centerLon}`);
          }
        }
        
        const radius = zone.radiusKm || 5;
        const multiplier = zone.multiplier || 1.0;
        
        const processedZone = {
          ...zone,
          centerLat,
          centerLon,
          multiplier,
          radiusKm: radius
        };
        
        console.log('Processed zone:', processedZone);
        return processedZone;
      });
      
      console.log('Zones with coordinates:', zonesWithCoords);
      console.log('Zones to display count:', zonesWithCoords.length);
      setZones(zonesWithCoords);
      setFilteredZones(zonesWithCoords);
    } catch (err) {
      console.error('Failed to fetch surge zones:', err);
      // No sample data fallback - show empty state to user
      setZones([]);
      setFilteredZones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurgeZones();
  }, []);

  useEffect(() => {
    let filtered = zones;
    console.log('Filtering zones. Initial zones:', zones.length);

    if (searchTerm) {
      filtered = filtered.filter(zone =>
        zone.areaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        zone.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log(`After search filter: ${filtered.length} zones`);
    }

    if (minMultiplier > 0) {
      filtered = filtered.filter(zone => zone.multiplier >= minMultiplier);
      console.log(`After multiplier filter (${minMultiplier}): ${filtered.length} zones`);
    }

    if (showOnlyActive) {
      filtered = filtered.filter(zone => zone.isActive);
      console.log(`After active filter: ${filtered.length} zones`);
    }

    console.log('Final filtered zones:', filtered);
    setFilteredZones(filtered);
  }, [searchTerm, minMultiplier, showOnlyActive, zones]);

  const getMultiplierColor = (multiplier) => {
    if (multiplier >= 2.0) return { bg: 'bg-red-500', bgLight: 'bg-red-500/10', text: 'text-red-600', badge: 'bg-red-100 text-red-800' };
    if (multiplier >= 1.5) return { bg: 'bg-orange-500', bgLight: 'bg-orange-500/10', text: 'text-orange-600', badge: 'bg-orange-100 text-orange-800' };
    if (multiplier >= 1.0) return { bg: 'bg-yellow-500', bgLight: 'bg-yellow-500/10', text: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-800' };
    return { bg: 'bg-green-500', bgLight: 'bg-green-500/10', text: 'text-green-600', badge: 'bg-green-100 text-green-800' };
  };

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

  // Handle map load and auto-fit bounds
  const onMapLoad = useCallback((mapInstance) => {
    mapRef.current = mapInstance;
    fitMapToBounds(mapInstance);
  }, []);

  const fitMapToBounds = useCallback((mapInstance) => {
    if (!mapInstance || !filteredZones || filteredZones.length === 0 || !window.google) return;
    
    const bounds = new window.google.maps.LatLngBounds();
    filteredZones.forEach(zone => {
      if (zone.centerLat && zone.centerLon) {
        const radius = zone.radiusKm || 5;
        const latDelta = radius / 111;
        const lonDelta = radius / (111 * Math.cos(zone.centerLat * Math.PI / 180));
        
        bounds.extend(new window.google.maps.LatLng(zone.centerLat + latDelta, zone.centerLon - lonDelta));
        bounds.extend(new window.google.maps.LatLng(zone.centerLat - latDelta, zone.centerLon + lonDelta));
      }
    });
    
    if (!bounds.isEmpty()) {
      mapInstance.fitBounds(bounds, 50);
      console.log('Map fitted to bounds to show all zones');
    }
  }, [filteredZones]);

  // Re-fit bounds when filtered zones change
  useEffect(() => {
    if (mapRef.current) {
      fitMapToBounds(mapRef.current);
    }
  }, [filteredZones, fitMapToBounds]);

  return (
    <div className="p-6" style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-indigo-500/20 rounded-lg">
            <MapPin className="text-indigo-600" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Surge Pricing Zones Map</h2>
            <p className="text-gray-600 text-sm">View all active surge pricing zones with real-time multipliers</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Search Zone</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or ID..."
              className="w-full px-4 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Min Multiplier Filter */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Min Multiplier</label>
            <select
              value={minMultiplier}
              onChange={(e) => setMinMultiplier(parseFloat(e.target.value))}
              className="w-full px-4 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-indigo-500 focus:outline-none"
            >
              <option value={0}>All Multipliers</option>
              <option value={1.0}>1.0x or higher</option>
              <option value={1.5}>1.5x or higher</option>
              <option value={2.0}>2.0x or higher (High)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Status</label>
            <select
              value={showOnlyActive ? 'active' : 'all'}
              onChange={(e) => setShowOnlyActive(e.target.value === 'active')}
              className="w-full px-4 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-indigo-500 focus:outline-none"
            >
              <option value="active">Active Only</option>
              <option value="all">All Zones</option>
            </select>
          </div>

          {/* Refresh Button */}
          <div className="flex items-end">
            <button
              onClick={fetchSurgeZones}
              disabled={loading}
              className="w-full px-4 py-2 bg-[#018a3e] hover:bg-[#004036] disabled:bg-gray-400 text-white font-medium rounded-lg transition flex items-center justify-center space-x-2"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Normal (1.0x)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Medium (1.0-1.5x)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            <span className="text-sm text-gray-600">High (1.5-2.0x)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Critical (2.0x+)</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Map Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Navigation size={20} className="text-indigo-600" />
                <span>Interactive Zone Map</span>
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleZoomIn}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                  title="Zoom In"
                >
                  <ZoomIn size={18} />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                  title="Zoom Out"
                >
                  <ZoomOut size={18} />
                </button>
              </div>
            </div>

            {/* Map Container */}
            {loading ? (
              <div className="h-96 lg:h-[500px] flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
              </div>
            ) : filteredZones.length === 0 ? (
              <div className="h-96 lg:h-[500px] flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <AlertTriangle size={40} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600">No zones found with selected filters</p>
                </div>
              </div>
            ) : (
              <div className="relative bg-white h-96 lg:h-[500px] overflow-hidden flex flex-col">
                {!process.env.REACT_APP_GOOGLE_MAPS_API_KEY || process.env.REACT_APP_GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE' ? (
                  <div className="h-full flex items-center justify-center bg-yellow-50 border-2 border-yellow-400">
                    <div className="text-center p-6">
                      <AlertTriangle size={48} className="mx-auto text-yellow-600 mb-4" />
                      <h3 className="text-lg font-bold text-yellow-800 mb-2">Google Maps API Key Missing</h3>
                      <p className="text-yellow-700 text-sm mb-3">Please configure your Google Maps API key in the .env file</p>
                      <p className="text-xs text-yellow-600 font-mono">REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_key</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <LoadScript 
                      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
                      onError={() => console.error('Failed to load Google Maps script')}
                      libraries={LIBRARIES}
                    >
                      <GoogleMap
                        mapContainerStyle={MAP_CONTAINER_STYLE}
                        center={INITIAL_CENTER}
                        zoom={mapZoom}
                        onLoad={onMapLoad}
                        options={MAP_OPTIONS}
                      >
                        {/* Render zone rectangles/boxes */}
                        {filteredZones && filteredZones.length > 0 ? (
                          filteredZones.map((zone, index) => {
                            console.log(`[Zone ${index}] Processing zone:`, zone);
                            // Skip zones without coordinates
                            if (!zone.centerLat || !zone.centerLon) {
                              console.warn(`[Zone ${index}] Zone missing coordinates:`, zone);
                              return null;
                            }
                            
                            const isSelected = selectedZone?.id === zone.id;
                            const multiplier = zone.multiplier || 1.0;
                            const radiusKm = zone.radiusKm || 5;
                            
                            console.log(`[Zone ${index}] Rendering zone ${zone.id}: lat=${zone.centerLat}, lon=${zone.centerLon}, multiplier=${multiplier}, radiusKm=${radiusKm}`);
                            
                            // Calculate rectangle bounds (approximately 111 km per degree of latitude)
                            const latDelta = radiusKm / 111;
                            const lonDelta = radiusKm / (111 * Math.cos(zone.centerLat * Math.PI / 180));
                            
                            console.log(`[Zone ${index}] Rectangle bounds: latDelta=${latDelta}, lonDelta=${lonDelta}`);
                            
                            // Create rectangle corners
                            const rectangleCoords = [
                              { lat: zone.centerLat + latDelta, lng: zone.centerLon - lonDelta }, // Top-left
                              { lat: zone.centerLat + latDelta, lng: zone.centerLon + lonDelta }, // Top-right
                              { lat: zone.centerLat - latDelta, lng: zone.centerLon + lonDelta }, // Bottom-right
                              { lat: zone.centerLat - latDelta, lng: zone.centerLon - lonDelta }, // Bottom-left
                            ];
                            
                            console.log(`[Zone ${index}] Rectangle coords:`, rectangleCoords);
                            
                            // Determine color based on surge multiplier
                            let color = '#22c55e'; // green for normal
                            let opacity = 0.35;
                            
                            if (multiplier >= 2.0) {
                              color = '#dc2626'; // red for high
                              opacity = 0.65;
                            } else if (multiplier >= 1.5) {
                              color = '#f97316'; // orange for medium-high
                              opacity = 0.55;
                            } else if (multiplier > 1.0) {
                              color = '#eab308'; // yellow for medium
                              opacity = 0.45;
                            }
                            
                            console.log(`[Zone ${index}] Color: ${color}, Opacity: ${opacity}`);
                            console.log(`[Zone ${index}] About to render Polygon with paths:`, rectangleCoords);

                            return (
                              <React.Fragment key={zone.id}>
                                {/* Zone Coverage Rectangle */}
                                <Polygon
                                  paths={rectangleCoords}
                                  options={{
                                    fillColor: color,
                                    fillOpacity: isSelected ? opacity + 0.15 : opacity,
                                    strokeColor: color,
                                    strokeOpacity: isSelected ? 1 : 0.8,
                                    strokeWeight: isSelected ? 4 : 2.5,
                                  }}
                                  onClick={() => {
                                    console.log('Polygon clicked:', zone.id);
                                    setSelectedZone(isSelected ? null : zone);
                                  }}
                                  onLoad={() => console.log(`[Zone ${index}] Polygon loaded on map:`, zone.id)}
                                  onUnmount={() => console.log(`[Zone ${index}] Polygon removed from map:`, zone.id)}
                                />
                                
                                {/* Center Marker with Large Label - No Icon */}
                                <Marker
                                  position={{ lat: zone.centerLat, lng: zone.centerLon }}
                                  title={zone.areaName}
                                  onClick={() => {
                                    console.log('Marker clicked:', zone.id);
                                    setSelectedZone(isSelected ? null : zone);
                                  }}
                                  icon={{
                                    path: 'M 0,0 C -2,-2 -2,-10 0,-10 C 2,-10 2,-2 0,0 z',
                                    scale: 0,
                                    fillColor: 'transparent',
                                    strokeColor: 'transparent',
                                  }}
                                  label={{
                                    text: `${multiplier.toFixed(1)}x`,
                                    color: '#ffffff',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    className: 'surge-zone-label',
                                  }}
                                  onLoad={() => console.log(`[Zone ${index}] Marker loaded:`, zone.id, `at ${zone.centerLat}, ${zone.centerLon}`)}
                                  onUnmount={() => console.log(`[Zone ${index}] Marker removed:`, zone.id)}
                                >
                                  {isSelected && (
                                    <InfoWindow onCloseClick={() => setSelectedZone(null)}>
                                      <div className="p-3" style={{ maxWidth: '300px', minWidth: '250px' }}>
                                        <h3 className="font-bold text-gray-900 mb-2 text-base">{zone.areaName}</h3>
                                        <div className="space-y-1.5 text-sm text-gray-600">
                                          <p><strong>Zone ID:</strong> {zone.id}</p>
                                          <p><strong>Status:</strong> {zone.isActive ? '🟢 Active' : '🔴 Inactive'}</p>
                                          <p><strong>Surge Multiplier:</strong> <span className="font-bold text-orange-600">{multiplier.toFixed(2)}x</span></p>
                                          <p><strong>Coverage Radius:</strong> {radiusKm} km</p>
                                          <p><strong>Center Location:</strong> {zone.centerLat.toFixed(4)}, {zone.centerLon.toFixed(4)}</p>
                                          <p><strong>Impact Level:</strong> {
                                            multiplier >= 2.0 ? 'Critical' : 
                                            multiplier >= 1.5 ? 'High' : 
                                            multiplier > 1.0 ? 'Medium' : 
                                            'Normal'
                                          }</p>
                                        </div>
                                      </div>
                                    </InfoWindow>
                                  )}
                                </Marker>
                              </React.Fragment>
                            );
                          })
                        ) : (
                          <Marker
                            position={INITIAL_CENTER}
                            title="No zones to display"
                          />
                        )}
                      </GoogleMap>
                    </LoadScript>

                    {/* Map Footer */}
                    <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center text-sm text-gray-600">
                      <div>Total Zones: {filteredZones.length}</div>
                      <div>Zoom: {mapZoom}</div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Zone Details Sidebar */}
        <div className="space-y-6">
          {/* Selected Zone Details */}
          {selectedZone ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedZone.areaName}</h3>
                  <p className="text-sm text-gray-500 font-mono">{selectedZone.id}</p>
                </div>
                <button
                  onClick={() => setSelectedZone(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Multiplier */}
                <div>
                  <p className="text-xs text-gray-600 mb-1">Surge Multiplier</p>
                  <div className={`px-4 py-2 rounded-lg font-bold text-lg flex items-center space-x-2 ${getMultiplierColor(selectedZone.multiplier).badge}`}>
                    <TrendingUp size={18} />
                    <span>{selectedZone.multiplier.toFixed(2)}x</span>
                  </div>
                </div>

                {/* Radius */}
                <div>
                  <p className="text-xs text-gray-600 mb-1">Coverage Radius</p>
                  <div className="px-4 py-2 rounded-lg bg-indigo-50 border border-indigo-200">
                    <p className="text-gray-900 font-semibold">{selectedZone.radiusKm} km</p>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <p className="text-xs text-gray-600 mb-1">Status</p>
                  <div className={`px-4 py-2 rounded-lg text-center font-medium ${
                    selectedZone.isActive
                      ? 'bg-green-500/10 text-green-700'
                      : 'bg-gray-500/10 text-gray-700'
                  }`}>
                    {selectedZone.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>

                {/* Impact Indicator */}
                <div>
                  <p className="text-xs text-gray-600 mb-2">Impact Level</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getMultiplierColor(selectedZone.multiplier).bg}`}
                      style={{ width: `${(selectedZone.multiplier / 3) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedZone.multiplier >= 2.0 ? 'Critical' : selectedZone.multiplier >= 1.5 ? 'High' : selectedZone.multiplier >= 1.0 ? 'Medium' : 'Normal'} Impact
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <MapPin size={32} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 text-sm">Click on a zone to view details</p>
            </div>
          )}

          {/* Zone Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Zone Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Total Zones</span>
                <span className="text-xl font-bold text-gray-900">{filteredZones.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-sm text-gray-600">High Surge (2.0x+)</span>
                <span className="text-xl font-bold text-red-600">{filteredZones.filter(z => z.multiplier >= 2.0).length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-sm text-gray-600">Medium Surge (1.5x+)</span>
                <span className="text-xl font-bold text-orange-600">{filteredZones.filter(z => z.multiplier >= 1.5).length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-600">Normal Rate (1.0x)</span>
                <span className="text-xl font-bold text-green-600">{filteredZones.filter(z => z.multiplier < 1.5).length}</span>
              </div>
            </div>
          </div>

          {/* Avg Multiplier */}
          <div className="bg-indigo-50 rounded-lg border border-indigo-200 p-6">
            <p className="text-sm text-indigo-700 mb-2">Average Surge Multiplier</p>
            <p className="text-3xl font-bold text-indigo-900">
              {(filteredZones.reduce((sum, z) => sum + z.multiplier, 0) / (filteredZones.length || 1)).toFixed(2)}x
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
