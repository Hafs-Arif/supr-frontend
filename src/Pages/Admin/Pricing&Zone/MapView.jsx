import React, { useState, useRef, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  TrendingUp, 
  Building,
  Eye,
  Navigation,
  Layers,
  ZoomIn,
  ZoomOut,
  Download,
  ChevronDown,
  Car,
  Bike,
  Clock
} from 'lucide-react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '100%'
};

const INITIAL_CENTER = {
  lat: 31.5497,
  lng: 74.3436
};

const MAP_OPTIONS = {
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: true,
  zoomControl: false,
  gestureHandling: 'greedy',
  clickableIcons: false,
  disableDoubleClickZoom: false
};

function MapView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState('all');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isVehicleDropdownOpen, setIsVehicleDropdownOpen] = useState(false);
  const [mapZoom, setMapZoom] = useState(12);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const mapRef = useRef(null);

  // Zone data for cards
  const zoneCards = [
    {
      id: 'ZONE001',
      city: 'Downtown Core',
      surge: '1.8x',
      status: 'active',
      basePrice: '$2.50',
      vehicleCount: 45,
      activeTrips: 23,
      area: '15 sq km',
      color: 'bg-blue-500',
      lat: 31.5497,
      lng: 74.3436
    },
    {
      id: 'ZONE002',
      city: 'University District',
      surge: '1.0x',
      status: 'active',
      basePrice: '$2.00',
      vehicleCount: 32,
      activeTrips: 18,
      area: '8 sq km',
      color: 'bg-green-500',
      lat: 31.5204,
      lng: 74.3587
    },
    {
      id: 'ZONE003',
      city: 'Airport Zone',
      surge: '2.2x',
      status: 'active',
      basePrice: '$3.50',
      vehicleCount: 28,
      activeTrips: 15,
      area: '5 sq km',
      color: 'bg-orange-500',
      lat: 31.5217,
      lng: 74.1781
    },
    {
      id: 'ZONE004',
      city: 'Suburban East',
      surge: '1.0x',
      status: 'inactive',
      basePrice: '$1.80',
      vehicleCount: 12,
      activeTrips: 5,
      area: '25 sq km',
      color: 'bg-gray-500',
      lat: 31.5500,
      lng: 74.4500
    }
  ];

  const statusFilters = [
    { value: 'all', label: 'All Zones', icon: <Layers size={16} /> },
    { value: 'active', label: 'Active', icon: <MapPin size={16} /> },
    { value: 'inactive', label: 'Inactive', icon: <Clock size={16} /> }
  ];

  const vehicleFilters = [
    { value: 'all', label: 'All Vehicles', icon: <Car size={16} /> },
    { value: 'car', label: 'Cars', icon: <Car size={16} /> },
    { value: 'bike', label: 'Bikes', icon: <Bike size={16} /> },
    { value: 'premium', label: 'Premium', icon: <Navigation size={16} /> }
  ];

  const filteredZoneCards = zoneCards.filter(zone => {
    const matchesSearch = zone.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         zone.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || zone.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-500' : 'bg-gray-400';
  };

  const getSurgeColor = (surge) => {
    const multiplier = parseFloat(surge);
    if (multiplier >= 2.0) return 'bg-red-500';
    if (multiplier >= 1.5) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getSelectedStatusLabel = () => {
    return statusFilters.find(filter => filter.value === selectedStatus)?.label || 'All Zones';
  };

  const getSelectedVehicleLabel = () => {
    return vehicleFilters.find(filter => filter.value === selectedVehicle)?.label || 'All Vehicles';
  };

  const handleExport = () => {
    console.log('Exporting map data...');
  };

  // Handle map load
  const onMapLoad = useCallback((mapInstance) => {
    mapRef.current = mapInstance;
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <MapPin className="mr-3 text-blue-600" size={28} />
              Zone Map View
            </h1>
            <p className="text-gray-600 mt-1">Interactive map showing all zones with real-time pricing and surge data</p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition shadow-sm"
            >
              <Download size={18} />
              <span>Export Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by Zone ID or City name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap gap-3">
            {/* Status Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition shadow-sm min-w-[150px] justify-between"
              >
                <span className="flex items-center space-x-2">
                  <Layers size={16} />
                  <span>{getSelectedStatusLabel()}</span>
                </span>
                <ChevronDown size={16} className={`transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isStatusDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  {statusFilters.map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => {
                        setSelectedStatus(filter.value);
                        setIsStatusDropdownOpen(false);
                      }}
                      className={`flex items-center space-x-2 w-full px-4 py-2 text-left text-sm transition ${
                        selectedStatus === filter.value
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {filter.icon}
                      <span>{filter.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsVehicleDropdownOpen(!isVehicleDropdownOpen)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition shadow-sm min-w-[160px] justify-between"
              >
                <span className="flex items-center space-x-2">
                  <Car size={16} />
                  <span>{getSelectedVehicleLabel()}</span>
                </span>
                <ChevronDown size={16} className={`transition-transform ${isVehicleDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isVehicleDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  {vehicleFilters.map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => {
                        setSelectedVehicle(filter.value);
                        setIsVehicleDropdownOpen(false);
                      }}
                      className={`flex items-center space-x-2 w-full px-4 py-2 text-left text-sm transition ${
                        selectedVehicle === filter.value
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {filter.icon}
                      <span>{filter.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* More Filters Button */}
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition shadow-sm">
              <Filter size={18} />
              <span>More Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Map Container - 2/3 width on large screens */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Map Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <Navigation className="mr-2 text-blue-600" size={20} />
                Interactive Zone Map
              </h2>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Active</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span>Inactive</span>
                </div>
              </div>
            </div>

            {/* Map Container */}
            <div className="relative bg-white h-96 xl:h-[500px] overflow-hidden flex flex-col">
              {/* Zoom Controls */}
              <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
                <button
                  onClick={handleZoomIn}
                  className="p-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition"
                  title="Zoom in"
                >
                  <ZoomIn size={18} />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition"
                  title="Zoom out"
                >
                  <ZoomOut size={18} />
                </button>
              </div>

              {/* Google Map */}
              <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                  mapContainerStyle={MAP_CONTAINER_STYLE}
                  center={INITIAL_CENTER}
                  zoom={mapZoom}
                  onLoad={onMapLoad}
                  onZoomChanged={() => {
                    if (mapRef.current) {
                      setMapZoom(mapRef.current.getZoom());
                    }
                  }}
                  options={MAP_OPTIONS}
                >
                  {/* Render zone markers */}
                  {filteredZoneCards.map((zone) => {
                    const isSelected = selectedMarker === zone.id;
                    const surgeLevel = parseFloat(zone.surge);
                    let markerColor = '#94a3b8'; // gray for 1.0x
                    if (surgeLevel >= 2.0) markerColor = '#dc2626'; // red for 2.0x+
                    else if (surgeLevel >= 1.5) markerColor = '#f97316'; // orange for 1.5x+
                    else if (surgeLevel > 1.0) markerColor = '#eab308'; // yellow for medium
                    else markerColor = '#22c55e'; // green for normal

                    return (
                      <Marker
                        key={zone.id}
                        position={{ lat: zone.lat, lng: zone.lng }}
                        title={zone.city}
                        onClick={() => setSelectedMarker(isSelected ? null : zone.id)}
                        icon={{
                          path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                          scale: isSelected ? 12 : 8,
                          fillColor: markerColor,
                          fillOpacity: 1,
                          strokeColor: '#ffffff',
                          strokeWeight: 2,
                        }}
                        label={
                          isSelected
                            ? {
                                text: zone.surge,
                                color: '#ffffff',
                                fontSize: '11px',
                                fontWeight: 'bold',
                              }
                            : undefined
                        }
                      >
                        {isSelected && (
                          <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                            <div className="p-2" style={{ maxWidth: '250px', minWidth: '200px' }}>
                              <h3 className="font-bold text-gray-900 mb-2">{zone.city}</h3>
                              <div className="space-y-1 text-sm text-gray-600">
                                <p><strong>Zone ID:</strong> {zone.id}</p>
                                <p><strong>Status:</strong> {zone.status === 'active' ? '🟢 Active' : '🔴 Inactive'}</p>
                                <p><strong>Surge:</strong> <span className="font-bold text-orange-600">{zone.surge}</span></p>
                                <p><strong>Base Price:</strong> {zone.basePrice}</p>
                                <p><strong>Coverage Area:</strong> {zone.area}</p>
                                <p><strong>Vehicles:</strong> {zone.vehicleCount}</p>
                                <p><strong>Active Trips:</strong> {zone.activeTrips}</p>
                              </div>
                            </div>
                          </InfoWindow>
                        )}
                      </Marker>
                    );
                  })}
                </GoogleMap>
              </LoadScript>
            </div>

            {/* Map Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div>Total Zones: {filteredZoneCards.length}</div>
                <div>Zoom: {mapZoom}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Zone Cards Container - 1/3 width on large screens */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
              <Building className="mr-2 text-blue-600" size={20} />
              Zone Overview
            </h3>
            
            {/* Zone Cards */}
            <div className="space-y-3 max-h-[420px] overflow-y-auto">
              {filteredZoneCards.map((zone) => (
                <div key={zone.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition">
                  {/* Zone Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-medium text-gray-900">{zone.city}</div>
                      <div className="text-sm text-gray-500">{zone.id}</div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSurgeColor(zone.surge)} text-white`}>
                        <TrendingUp size={12} className="mr-1" />
                        {zone.surge} Surge
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        zone.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {zone.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Zone Details */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <div className="text-xs text-gray-600">Base Price</div>
                      <div className="text-sm font-medium text-green-600">{zone.basePrice}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Area</div>
                      <div className="text-sm font-medium">{zone.area}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Vehicles</div>
                      <div className="text-sm font-medium">{zone.vehicleCount}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Active Trips</div>
                      <div className="text-sm font-medium">{zone.activeTrips}</div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className="w-full flex items-center justify-center space-x-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                    <Eye size={14} />
                    <span>View Zone Details</span>
                  </button>
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredZoneCards.length === 0 && (
              <div className="text-center py-8">
                <Building className="text-gray-400 mx-auto mb-2" size={32} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No zones found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{filteredMarkers.length}</div>
                <div className="text-xs text-gray-600">Active Zones</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {filteredZoneCards.filter(z => z.surge !== '1.0x').length}
                </div>
                <div className="text-xs text-gray-600">With Surge</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapView;