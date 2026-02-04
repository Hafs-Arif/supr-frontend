import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, MapPin, Check } from 'lucide-react';
import api from '../../../utils/api';

export default function SOSTrigger() {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [rideId, setRideId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
        },
        () => setError('Failed to get location')
      );
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      if (!latitude || !longitude) {
        setError('Location is required');
        setLoading(false);
        return;
      }

      const payload = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        rideId: rideId || undefined,
      };
      
      const res = await api.post('/sos/trigger', payload);
      setSuccess('SOS triggered successfully!');
      setTimeout(() => {
        if (res?.data?.data?.id) {
          navigate(`/admin/sos/${res.data.data.id}`);
        } else {
          navigate('/admin/sos');
        }
      }, 1500);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to trigger SOS';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6" style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-red-500/20 rounded-lg">
            <AlertTriangle className="text-red-500" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Trigger SOS Emergency</h2>
            <p className="text-gray-600 text-sm">Report an emergency situation</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-600 text-sm flex items-center space-x-2">
            <Check size={16} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={submit} className="space-y-6 bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
          {/* Ride ID */}
          <div>
            <label className="block text-gray-900 text-sm font-medium mb-2">Ride ID (Optional)</label>
            <input
              type="text"
              value={rideId}
              onChange={(e) => setRideId(e.target.value)}
              placeholder="Enter ride ID if applicable"
              className="w-full px-4 py-2 bg-gray-50 text-gray-900 rounded-lg border border-gray-300 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Location Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-gray-900 text-sm font-medium">Location *</label>
              <button
                type="button"
                onClick={handleGetLocation}
                className="text-xs px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition"
              >
                <MapPin size={14} className="inline mr-1" /> Use Current Location
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-xs font-medium mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="0.0000"
                  className="w-full px-4 py-2 bg-gray-50 text-gray-900 rounded-lg border border-gray-300 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-xs font-medium mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="0.0000"
                  className="w-full px-4 py-2 bg-gray-50 text-gray-900 rounded-lg border border-gray-300 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Triggering SOS...</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={18} />
                  <span>Trigger SOS Emergency</span>
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-gray-600 text-xs mt-4 text-center">
          Emergency alerts will notify safety team and emergency contacts immediately.
        </p>
      </div>
    </div>
  );
}
