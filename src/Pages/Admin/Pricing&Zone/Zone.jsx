import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  Building,
  CheckCircle,
  XCircle,
  MoreVertical,
  Edit,
  Eye,
  Plus,
  Download,
  ChevronDown,
  X,
  Minus,
  ZoomIn
} from 'lucide-react';
import { GoogleMap, LoadScript, Marker, InfoWindow, Circle } from '@react-google-maps/api';

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '100%'
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

function Zone() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);

  // Stats data
  const statsData = [
    { 
      title: 'Total Zones', 
      value: '48', 
      color: 'bg-blue-500',
      icon: <MapPin className="text-white" size={20} />,
      trend: '+12%'
    },
    { 
      title: 'Active Zones', 
      value: '36', 
      color: 'bg-green-500',
      icon: <CheckCircle className="text-white" size={20} />,
      trend: '+8%'
    },
    { 
      title: 'With Surge', 
      value: '15', 
      color: 'bg-orange-500',
      icon: <TrendingUp className="text-white" size={20} />,
      trend: '+25%'
    },
    { 
      title: 'Cities Covered', 
      value: '8', 
      color: 'bg-purple-500',
      icon: <Building className="text-white" size={20} />,
      trend: '+5%'
    }
  ];

  // Zones data
  const zonesData = [
    {
      id: 'ZONE001',
      name: 'Downtown Core',
      location: 'Central Business District',
      priority: 'High',
      lat: 31.5497,
      lng: 74.3436,
      basePricing: {
        car: '$2.50',
        bike: '$1.20',
        premium: '$4.00'
      },
      surge: {
        active: true,
        multiplier: '1.8x',
        reason: 'Peak Hours'
      },
      status: 'active',
      coverage: '15 sq km',
      population: '250,000',
      lastUpdated: '2 hours ago',
      radius: 3000
    },
    {
      id: 'ZONE002',
      name: 'University District',
      location: 'Campus Area',
      priority: 'Medium',
      lat: 31.5204,
      lng: 74.3587,
      basePricing: {
        car: '$2.00',
        bike: '$1.00',
        premium: '$3.50'
      },
      surge: {
        active: false,
        multiplier: '1.0x',
        reason: 'Normal'
      },
      status: 'active',
      coverage: '8 sq km',
      population: '180,000',
      lastUpdated: '1 day ago',
      radius: 2000
    },
    {
      id: 'ZONE003',
      name: 'Airport Zone',
      location: 'International Airport',
      priority: 'High',
      lat: 31.5217,
      lng: 74.4781,
      basePricing: {
        car: '$3.50',
        bike: '$1.80',
        premium: '$6.00'
      },
      surge: {
        active: true,
        multiplier: '2.2x',
        reason: 'Flight Arrivals'
      },
      status: 'active',
      coverage: '5 sq km',
      population: '50,000',
      lastUpdated: '30 min ago',
      radius: 1500
    },
    {
      id: 'ZONE004',
      name: 'Suburban East',
      location: 'Residential Area East',
      priority: 'Low',
      lat: 31.5500,
      lng: 74.4500,
      basePricing: {
        car: '$1.80',
        bike: '$0.90',
        premium: '$3.00'
      },
      surge: {
        active: false,
        multiplier: '1.0x',
        reason: 'Normal'
      },
      status: 'inactive',
      coverage: '25 sq km',
      population: '120,000',
      lastUpdated: '3 days ago',
      radius: 4000
    },
    {
      id: 'ZONE005',
      name: 'Industrial West',
      location: 'Industrial Complex',
      priority: 'Medium',
      lat: 31.4800,
      lng: 74.2800,
      basePricing: {
        car: '$2.20',
        bike: '$1.10',
        premium: '$3.80'
      },
      surge: {
        active: true,
        multiplier: '1.5x',
        reason: 'Shift Changes'
      },
      status: 'active',
      coverage: '12 sq km',
      population: '75,000',
      lastUpdated: '5 hours ago',
      radius: 2500
    }
  ];

  const statusFilters = [
    { value: 'all', label: 'All Zones', icon: <MapPin size={16} /> },
    { value: 'active', label: 'Active', icon: <CheckCircle size={16} /> },
    { value: 'inactive', label: 'Inactive', icon: <XCircle size={16} /> }
  ];

  const filteredZones = zonesData.filter(zone => {
    const matchesSearch = zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         zone.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         zone.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || zone.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle size={14} />;
      case 'inactive': return <XCircle size={14} />;
      default: return <MapPin size={14} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSurgeColor = (surge) => {
    if (!surge.active) return 'bg-gray-100 text-gray-800';
    const multiplierValue = parseFloat(surge.multiplier);
    return multiplierValue >= 2.0 ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800';
  };

  const getCircleColor = (surge) => {
    if (!surge.active) return '#94a3b8';
    const multiplierValue = parseFloat(surge.multiplier);
    return multiplierValue >= 2.0 ? '#dc2626' : '#f97316';
  };

  const getSelectedStatusLabel = () => {
    return statusFilters.find(filter => filter.value === selectedStatus)?.label || 'All Zones';
  };

  const handleExport = () => {
    console.log('Exporting zones data...');
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
              Pricing & Zone Management
            </h1>
            <p className="text-gray-600 mt-1">Manage zones, pricing, and surge multipliers</p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition shadow-sm"
            >
              <Download size={18} />
              <span>Export Report</span>
            </button>
            <button 
              onClick={() => navigate('/admin/create-zone')}
              className="flex items-center space-x-2 px-4 py-2 bg-[#0F4D0F] text-white rounded-lg hover:bg-[#004036] transition shadow-sm"
            >
              <Plus size={18} />
              <span>Add Zone</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsData.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</p>
                <div className="flex items-center mt-2 text-xs text-green-600">
                  <span>↑ {stat.trend}</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center shadow-md`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
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
                placeholder="Search by Zone ID, Name or Location..."
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
                  <Filter size={16} />
                  <span>{getSelectedStatusLabel()}</span>
                </span>
                <ChevronDown size={16} className={`transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isStatusDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
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

            {/* More Filters Button */}
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition shadow-sm">
              <Filter size={18} />
              <span>More Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center mb-2 sm:mb-0">
              <MapPin className="mr-2 text-blue-600" size={20} />
              Zones List
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Total: {filteredZones.length} zones</span>
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="overflow-x-auto">
          <table className="w-full hidden lg:table">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Pricing</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Surge</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredZones.map((zone) => (
                <tr key={zone.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <MapPin className="text-blue-600" size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{zone.name}</div>
                        <div className="text-sm text-gray-500">{zone.id}</div>
                        <div className="text-xs text-gray-500">
                          {zone.coverage} • {zone.population}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{zone.location}</div>
                    <div className="text-xs text-gray-500">Updated: {zone.lastUpdated}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(zone.priority)}`}>
                      {zone.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Car:</span>
                        <span className="font-medium">{zone.basePricing.car}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Bike:</span>
                        <span className="font-medium">{zone.basePricing.bike}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Premium:</span>
                        <span className="font-medium">{zone.basePricing.premium}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSurgeColor(zone.surge)}`}>
                        <TrendingUp size={12} className="mr-1" />
                        {zone.surge.multiplier}
                      </span>
                      <div className="text-xs text-gray-500">
                        {zone.surge.reason}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(zone.status)}`}>
                      {getStatusIcon(zone.status)}
                      <span className="ml-1 capitalize">{zone.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit Pricing">
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedZone(zone);
                          setShowMapModal(true);
                          setSelectedMarker(zone.id);
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" 
                        title="View on Map"
                      >
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="lg:hidden p-4 space-y-4">
            {filteredZones.map((zone) => (
              <div key={zone.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <MapPin className="text-blue-600" size={18} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{zone.name}</div>
                      <div className="text-sm text-gray-500">{zone.id}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(zone.status)}`}>
                      {getStatusIcon(zone.status)}
                      <span className="ml-1 capitalize">{zone.status}</span>
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(zone.priority)}`}>
                      {zone.priority}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-600">Location</div>
                    <div className="text-sm">{zone.location}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-600">Coverage</div>
                      <div className="text-sm font-medium">{zone.coverage}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Population</div>
                      <div className="text-sm font-medium">{zone.population}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-600 mb-1">Base Pricing</div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-white p-2 rounded border">
                        <div className="text-gray-600">Car</div>
                        <div className="font-medium text-green-600">{zone.basePricing.car}</div>
                      </div>
                      <div className="bg-white p-2 rounded border">
                        <div className="text-gray-600">Bike</div>
                        <div className="font-medium text-green-600">{zone.basePricing.bike}</div>
                      </div>
                      <div className="bg-white p-2 rounded border">
                        <div className="text-gray-600">Premium</div>
                        <div className="font-medium text-green-600">{zone.basePricing.premium}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs text-gray-600">Surge Pricing</div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSurgeColor(zone.surge)}`}>
                        <TrendingUp size={12} className="mr-1" />
                        {zone.surge.multiplier} • {zone.surge.reason}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Updated: {zone.lastUpdated}
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedZone(zone);
                        setShowMapModal(true);
                        setSelectedMarker(zone.id);
                      }}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* No Results */}
        {filteredZones.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No zones found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Map Modal - Using the same pattern as CreateZone */}
      {showMapModal && selectedZone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Interactive Zone Map</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Viewing: <span className="font-medium">{selectedZone.name}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setShowMapModal(false);
                  setSelectedZone(null);
                  setSelectedMarker(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Map Legend */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>High Surge (2.0x+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span>Medium Surge (1.5x - 1.9x)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <span>No Surge (1.0x)</span>
                </div>
              </div>
            </div>

            {/* Modal Content - Map */}
            <div className="flex-1 relative overflow-hidden">
              <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                  key="zone-view-map"
                  mapContainerStyle={MAP_CONTAINER_STYLE}
                  center={{
                    lat: selectedZone.lat,
                    lng: selectedZone.lng,
                  }}
                  zoom={12}
                  onLoad={onMapLoad}
                  options={MAP_OPTIONS}
                >
                  {/* Render all zones */}
                  {filteredZones.map((zone) => {
                    const isSelected = selectedMarker === zone.id;
                    const circleColor = getCircleColor(zone.surge);
                    
                    return (
                      <React.Fragment key={zone.id}>
                        {/* Zone Circle */}
                        <Circle
                          center={{ lat: zone.lat, lng: zone.lng }}
                          radius={zone.radius}
                          options={{
                            fillColor: circleColor,
                            fillOpacity: isSelected ? 0.35 : 0.2,
                            strokeColor: circleColor,
                            strokeOpacity: isSelected ? 0.9 : 0.6,
                            strokeWeight: isSelected ? 3 : 2,
                          }}
                        />
                        
                        {/* Marker */}
                        <Marker
                          position={{ lat: zone.lat, lng: zone.lng }}
                          title={zone.name}
                          onClick={() => setSelectedMarker(zone.id)}
                          icon={{
                            path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                            scale: isSelected ? 12 : 8,
                            fillColor: circleColor,
                            fillOpacity: 1,
                            strokeColor: '#ffffff',
                            strokeWeight: 2,
                          }}
                          label={
                            isSelected
                              ? {
                                  text: zone.surge.multiplier,
                                  color: '#ffffff',
                                  fontSize: '10px',
                                  fontWeight: 'bold',
                                }
                              : undefined
                          }
                        />
                        
                        {/* Info Window */}
                        {isSelected && (
                          <InfoWindow
                            position={{ lat: zone.lat, lng: zone.lng }}
                            onCloseClick={() => setSelectedMarker(null)}
                          >
                            <div className="p-2" style={{ maxWidth: '280px', minWidth: '250px' }}>
                              <h3 className="font-bold text-gray-900 mb-2 text-base">{zone.name}</h3>
                              <div className="space-y-1.5 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">ID:</span>
                                  <span className="font-medium">{zone.id}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Status:</span>
                                  <span className={`font-medium ${zone.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                                    {zone.status === 'active' ? '🟢 Active' : '🔴 Inactive'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Priority:</span>
                                  <span className="font-medium">{zone.priority}</span>
                                </div>
                                <hr className="my-2" />
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Surge:</span>
                                  <span className="font-bold text-orange-600">{zone.surge.multiplier}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Reason:</span>
                                  <span className="text-gray-700">{zone.surge.reason}</span>
                                </div>
                                <hr className="my-2" />
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Car:</span>
                                  <span className="font-medium">{zone.basePricing.car}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Bike:</span>
                                  <span className="font-medium">{zone.basePricing.bike}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Premium:</span>
                                  <span className="font-medium">{zone.basePricing.premium}</span>
                                </div>
                                <hr className="my-2" />
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Coverage:</span>
                                  <span className="font-medium">{zone.coverage}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Population:</span>
                                  <span className="font-medium">{zone.population}</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-2">
                                  Last updated: {zone.lastUpdated}
                                </div>
                              </div>
                            </div>
                          </InfoWindow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </GoogleMap>
              </LoadScript>

              {/* Enhanced Zoom Controls - Same as CreateZone */}
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
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Total Zones: {filteredZones.length}</span>
                {mapRef.current && <> • Zoom: {mapRef.current.getZoom()?.toFixed(1)}</>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Zone;