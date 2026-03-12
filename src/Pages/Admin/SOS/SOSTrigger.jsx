import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, MapPin, Check, Loader } from 'lucide-react';
import SOSService from '../../../Services/SOSService';
import SOSManager from '../../../Components/SOS/SOSManager';

export default function SOSTrigger() {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [rideId, setRideId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showManager, setShowManager] = useState(false);
  const navigate = useNavigate();

  const handleGetLocation = async () => {
    try {
      const position = await SOSService.getCurrentLocation();
      setLatitude(position.coords.latitude.toString());
      setLongitude(position.coords.longitude.toString());
      setError('');
    } catch (err) {
      setError(SOSService.getErrorMessage(err));
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

      if (!SOSService.validateCoordinates(parseFloat(latitude), parseFloat(longitude))) {
        setError('Invalid coordinates. Latitude must be -90 to 90, Longitude must be -180 to 180');
        setLoading(false);
        return;
      }

      const sosData = await SOSService.triggerSOS(
        parseFloat(latitude),
        parseFloat(longitude),
        rideId || null
      );

      setSuccess('SOS triggered successfully!');
      setShowManager(true);

      setTimeout(() => {
        if (sosData?.id) {
          navigate(`/admin/sos/${sosData.id}`);
        } else {
          navigate('/admin/sos');
        }
      }, 2000);
    } catch (err) {
      const msg = SOSService.getErrorMessage(err);
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
            <p className="text-gray-600 text-sm">Report an emergency situation and connect with admin support</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-600 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-right">✕</button>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-600 text-sm flex items-center space-x-2">
            <Check size={16} />
            <span>{success}</span>
          </div>
        )}

        {!showManager ? (
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
                disabled={loading}
              />
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-gray-900 text-sm font-medium">Location *</label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={loading}
                  className="text-xs px-3 py-1 bg-[#0F4D0F] hover:bg-[#004036] disabled:bg-gray-400 text-white rounded transition flex items-center gap-1"
                >
                  <MapPin size={14} />
                  Use Current Location
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
                    disabled={loading}
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
                    disabled={loading}
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
                    <Loader size={18} className="animate-spin" />
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
        ) : (
          <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SOS System Active</h3>
            <SOSManager rideId={rideId} />
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
              <p className="font-semibold mb-2">✓ SOS Triggered Successfully</p>
              <p>Live location tracking is active. Your location is being streamed to admin in real-time.</p>
            </div>
          </div>
        )}

        <p className="text-gray-600 text-xs mt-4 text-center">
          Emergency alerts will notify safety team immediately. Your location will be streamed in real-time.
        </p>
      </div>
    </div>
  );
}
