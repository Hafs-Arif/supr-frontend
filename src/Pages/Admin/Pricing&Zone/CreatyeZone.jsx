import React, { useState } from 'react';
import { 
  MapPin, 
  Save, 
  X,
  Car,
  Bike,
  Navigation,
  Shield,
  Star,
  Plus,
  Minus
} from 'lucide-react';

function CreateZone() {
  const [formData, setFormData] = useState({
    zoneName: '',
    description: '',
    city: '',
    state: '',
    country: 'Pakistan',
    priority: 'medium',
    timeZone: 'UTC+5',
    isActive: true,
    enableSurge: false,
    surgeMultiplier: 1.0
  });

  const [pricing, setPricing] = useState({
    bike: { baseFare: '', perKm: '', perMin: '', minFare: '', bookingFee: '' },
    auto: { baseFare: '', perKm: '', perMin: '', minFare: '', bookingFee: '' },
    sedan: { baseFare: '', perKm: '', perMin: '', minFare: '', bookingFee: '' },
    suv: { baseFare: '', perKm: '', perMin: '', minFare: '', bookingFee: '' },
    mini: { baseFare: '', perKm: '', perMin: '', minFare: '', bookingFee: '' },
    luxury: { baseFare: '', perKm: '', perMin: '', minFare: '', bookingFee: '' }
  });

  const [mapPoints, setMapPoints] = useState([]);

  const vehicleTypes = [
    { key: 'bike', label: 'Bike', icon: <Bike size={20} />, color: 'bg-blue-500' },
    { key: 'auto', label: 'Auto Rickshaw', icon: <Navigation size={20} />, color: 'bg-green-500' },
    { key: 'sedan', label: 'Sedan', icon: <Car size={20} />, color: 'bg-purple-500' },
    { key: 'suv', label: 'SUV', icon: <Shield size={20} />, color: 'bg-orange-500' },
    { key: 'mini', label: 'Mini', icon: <Car size={20} />, color: 'bg-pink-500' },
    { key: 'luxury', label: 'Luxury', icon: <Star size={20} />, color: 'bg-yellow-500' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePricingChange = (vehicleType, field, value) => {
    setPricing(prev => ({
      ...prev,
      [vehicleType]: {
        ...prev[vehicleType],
        [field]: value
      }
    }));
  };

  const handleMapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newPoints = [...mapPoints, { x, y }];
    setMapPoints(newPoints);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Zone Data:', formData);
    console.log('Pricing Data:', pricing);
    console.log('Zone Area:', mapPoints);
    // Submit logic here
  };

  const resetMap = () => {
    setMapPoints([]);
  };

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
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition shadow-sm">
              <X size={18} />
              <span>Cancel</span>
            </button>
            <button 
              onClick={handleSubmit}
              className="flex items-center space-x-2 px-4 py-2 bg-[#0F4D0F] text-white rounded-lg hover:bg-[#004036] transition shadow-sm"
            >
              <Save size={18} />
              <span>Create Zone</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Section - Map and Zone Information */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Left Side - Map */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <MapPin className="mr-2 text-blue-600" size={20} />
            Zone Area Selection
          </h2>
          
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg h-96 relative border-2 border-dashed border-gray-300 cursor-crosshair overflow-hidden">
            {/* Clickable Map Area */}
            <div 
              className="w-full h-full relative"
              onClick={handleMapClick}
            >
              {/* Grid Pattern */}
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}
              ></div>
              
              {/* Roads */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-300 transform -translate-y-1/2"></div>
              <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-300 transform -translate-x-1/2"></div>
              <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-gray-200"></div>
              <div className="absolute top-3/4 left-0 right-0 h-0.5 bg-gray-200"></div>
              <div className="absolute left-1/4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div className="absolute left-3/4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

              {/* Zone Polygon */}
              {mapPoints.length > 2 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <polygon
                    points={mapPoints.map(point => `${point.x},${point.y}`).join(' ')}
                    fill="rgba(59, 130, 246, 0.3)"
                    stroke="rgb(59, 130, 246)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                  {mapPoints.map((point, index) => (
                    <circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill="rgb(59, 130, 246)"
                      stroke="white"
                      strokeWidth="2"
                    />
                  ))}
                </svg>
              )}

              {/* Points */}
              {mapPoints.map((point, index) => (
                <div
                  key={index}
                  className="absolute w-3 h-3 bg-[#0F4D0F] border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg"
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                  }}
                />
              ))}

              {/* Instructions */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-sm">
                <div className="text-sm text-gray-700">
                  <div className="font-medium mb-1">Click to create zone boundary</div>
                  <div className="text-xs text-gray-600">
                    Click on the map to add points. Minimum 3 points required.
                  </div>
                </div>
              </div>

              {/* Reset Button */}
              {mapPoints.length > 0 && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    resetMap();
                  }}
                  className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm text-sm text-gray-700 hover:bg-white transition"
                >
                  Reset Area
                </button>
              )}

              {/* Points Counter */}
              <div className="absolute bottom-4 left-4 bg-[#0F4D0F] text-white px-3 py-1 rounded-full text-sm font-medium">
                {mapPoints.length} points
              </div>
            </div>
          </div>

          <div className="mt-3 text-xs text-gray-500">
            Click on the map to define your service zone boundary. Minimum 3 points required to create a zone.
          </div>
        </div>

        {/* Right Side - Zone Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Zone Information</h2>
          
          <div className="space-y-4">
            {/* Zone Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zone Name *
              </label>
              <input
                type="text"
                value={formData.zoneName}
                onChange={(e) => handleInputChange('zoneName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter zone name"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe this zone..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="City name"
                  required
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="State name"
                  required
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country *
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Pakistan">Pakistan</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Time Zone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Zone
                </label>
                <select
                  value={formData.timeZone}
                  onChange={(e) => handleInputChange('timeZone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="UTC+5">UTC+5 (Pakistan Standard Time)</option>
                  <option value="UTC+4">UTC+4</option>
                  <option value="UTC+6">UTC+6</option>
                </select>
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
            </div>

            {/* Surge Pricing */}
            <div className="border-t pt-4">
              <h3 className="text-md font-semibold text-gray-800 mb-3">Surge Pricing</h3>
              
              <div className="space-y-4">
                {/* Enable Surge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="enableSurge"
                      checked={formData.enableSurge}
                      onChange={(e) => handleInputChange('enableSurge', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="enableSurge" className="text-sm font-medium text-gray-700">
                      Enable Surge Pricing
                    </label>
                  </div>
                </div>

                {/* Surge Multiplier */}
                {formData.enableSurge && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Surge Multiplier
                    </label>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleInputChange('surgeMultiplier', Math.max(1.0, formData.surgeMultiplier - 0.1))}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                      >
                        <Minus size={16} />
                      </button>
                      <div className="flex-1 text-center">
                        <span className="text-2xl font-bold text-orange-600">
                          {formData.surgeMultiplier.toFixed(1)}x
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          Current multiplier
                        </div>
                      </div>
                      <button
                        onClick={() => handleInputChange('surgeMultiplier', Math.min(3.0, formData.surgeMultiplier + 0.1))}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Adjust surge pricing multiplier from 1.0x to 3.0x
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Pricing Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Pricing Configuration</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {vehicleTypes.map((vehicle) => (
            <div key={vehicle.key} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              {/* Vehicle Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-12 h-12 rounded-full ${vehicle.color} flex items-center justify-center text-white`}>
                  {vehicle.icon}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{vehicle.label}</div>
                  <div className="text-sm text-gray-500">Pricing rates</div>
                </div>
              </div>

              {/* Pricing Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Base Fare (₨)
                  </label>
                  <input
                    type="number"
                    value={pricing[vehicle.key].baseFare}
                    onChange={(e) => handlePricingChange(vehicle.key, 'baseFare', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    min="0"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Per Km (₨)
                    </label>
                    <input
                      type="number"
                      value={pricing[vehicle.key].perKm}
                      onChange={(e) => handlePricingChange(vehicle.key, 'perKm', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Per Min (₨)
                    </label>
                    <input
                      type="number"
                      value={pricing[vehicle.key].perMin}
                      onChange={(e) => handlePricingChange(vehicle.key, 'perMin', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Min Fare (₨)
                    </label>
                    <input
                      type="number"
                      value={pricing[vehicle.key].minFare}
                      onChange={(e) => handlePricingChange(vehicle.key, 'minFare', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Booking Fee (₨)
                    </label>
                    <input
                      type="number"
                      value={pricing[vehicle.key].bookingFee}
                      onChange={(e) => handlePricingChange(vehicle.key, 'bookingFee', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CreateZone;