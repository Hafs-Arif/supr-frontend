import React, { useEffect, useState } from 'react';
import { AlertTriangle, MapPin, Clock, User, Phone, Mail, CheckCircle, X, Loader } from 'lucide-react';
import SOSService from '../../../Services/SOSService';
import wsService from '../../../Services/WebSocketService';

export default function SOSActive() {
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState('');
  const [liveLocation, setLiveLocation] = useState(null);
  const [locationUpdateCount, setLocationUpdateCount] = useState(0);

  const fetchActive = async () => {
    try {
      const alerts = await SOSService.getActiveSOSAlerts();
      if (alerts && alerts.length > 0) {
        setAlert(alerts[0]);
        setLocationUpdateCount(0);
      } else {
        setAlert(null);
      }
    } catch (err) {
      console.error('Error fetching active SOS alerts:', err);
      setAlert(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActive();
    const interval = setInterval(fetchActive, 5000);

    // Setup WebSocket listener for live location updates
    const handleSOSUpdate = (data) => {
      if (data.sosActive) {
        setLiveLocation({
          latitude: data.location.latitude,
          longitude: data.location.longitude,
        });
        setLocationUpdateCount((prev) => prev + 1);
      }
    };

    wsService.on('sos_update', handleSOSUpdate);

    return () => {
      clearInterval(interval);
      wsService.off('sos_update', handleSOSUpdate);
    };
  }, []);

  const postAction = async (action) => {
    if (!alert) return;
    setActionLoading(action);
    try {
      const payload = action === 'resolve' ? { notes } : {};
      
      if (action === 'resolve') {
        await SOSService.resolveSOSAlert(alert.id, notes);
      } else {
        // For cancel or other actions, could be extended
        await SOSService.resolveSOSAlert(alert.id, `SOS ${action}led`);
      }

      setSuccess(`SOS ${action}d successfully`);
      setTimeout(() => {
        fetchActive();
        setSuccess('');
        setNotes('');
      }, 1500);
    } catch (err) {
      const msg = SOSService.getErrorMessage(err);
      setSuccess(`Error: ${msg}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-40">
        <Loader size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="p-6" style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <CheckCircle size={40} className="mx-auto text-green-500 mb-3" />
          <h3 className="text-xl font-semibold text-gray-900 mb-1">All Clear</h3>
          <p className="text-gray-600">No active SOS alerts at this moment</p>
        </div>
      </div>
    );
  }

  const formatTime = (date) => new Date(date).toLocaleString();
  const displayLocation = liveLocation || alert;

  return (
    <div className="p-6" style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-500/20 rounded-lg animate-pulse">
            <AlertTriangle className="text-red-500" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Active SOS Emergency</h2>
            <p className="text-red-600 text-sm">
              {locationUpdateCount > 0 ? `📍 Live location streaming (${locationUpdateCount} updates)` : 'Immediate attention required'}
            </p>
          </div>
        </div>
      </div>

      {success && (
        <div className={`mb-4 p-4 rounded-lg text-sm border ${
          success.includes('Error')
            ? 'bg-red-500/10 text-red-400 border-red-500/30'
            : 'bg-green-500/10 text-green-400 border-green-500/30'
        }`}>
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Alert Info */}
        <div className="lg:col-span-2 bg-white rounded-lg p-6 border border-red-500/30">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <AlertTriangle size={20} className="text-red-500" />
            <span>Alert Details</span>
          </h3>

          <div className="space-y-4 text-sm">
            <div className="pb-4 border-b border-gray-200">
              <p className="text-gray-600 mb-1">Alert ID</p>
              <p className="text-gray-900 font-mono">{alert.id}</p>
            </div>

            {alert.user && (
              <>
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-gray-600 mb-2 flex items-center space-x-2">
                    <User size={14} />
                    <span>User Information</span>
                  </p>
                  <div className="space-y-2">
                    <p className="text-gray-900"><strong>Name:</strong> {alert.user.name}</p>
                    {alert.user.phone && (
                      <p className="text-gray-900 flex items-center space-x-2">
                        <Phone size={14} />
                        <span>{alert.user.phone}</span>
                      </p>
                    )}
                    {alert.user.email && (
                      <p className="text-gray-900 flex items-center space-x-2">
                        <Mail size={14} />
                        <span>{alert.user.email}</span>
                      </p>
                    )}
                    {alert.user.emergencyContactPhone && (
                      <p className="text-orange-600">
                        <strong>Emergency Contact:</strong> {alert.user.emergencyContactPhone}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="pb-4 border-b border-gray-200">
              <p className="text-gray-600 mb-1 flex items-center space-x-2">
                <MapPin size={14} />
                <span>Live Location {locationUpdateCount > 0 && '(Updating)'}</span>
              </p>
              <p className="text-gray-900">
                Lat: {displayLocation.latitude.toFixed(6)}, Lon: {displayLocation.longitude.toFixed(6)}
              </p>
              <a
                href={`https://maps.google.com/?q=${displayLocation.latitude},${displayLocation.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:text-indigo-700 text-xs mt-1 block"
              >
                → Open in Google Maps
              </a>
              {locationUpdateCount > 0 && (
                <p className="text-green-600 text-xs mt-2">✓ Location being streamed in real-time</p>
              )}
            </div>

            <div className="pb-4 border-b border-gray-200">
              <p className="text-gray-600 mb-1 flex items-center space-x-2">
                <Clock size={14} />
                <span>Timeline</span>
              </p>
              <p className="text-gray-900"><strong>Triggered:</strong> {formatTime(alert.createdAt)}</p>
              {alert.safetyTeamNotifiedAt && (
                <p className="text-green-600 text-xs mt-1">✓ Safety team notified</p>
              )}
              {alert.emergencyContactsNotified && (
                <p className="text-green-600 text-xs">✓ Emergency contacts notified</p>
              )}
            </div>

            {alert.rideId && (
              <div>
                <p className="text-gray-600 mb-1">Associated Ride</p>
                <p className="text-gray-900 font-mono text-xs">{alert.rideId}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 h-fit">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-gray-700 text-xs font-medium mb-2">Resolution Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes before resolving..."
                className="w-full px-3 py-2 bg-gray-50 text-gray-900 text-sm rounded border border-gray-300 focus:border-indigo-500 focus:outline-none"
                rows={4}
              />
            </div>

            <button
              onClick={() => postAction('resolve')}
              disabled={actionLoading === 'resolve'}
              className="w-full py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition flex items-center justify-center space-x-2"
            >
              {actionLoading === 'resolve' ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  <span>Resolving...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  <span>Resolve SOS</span>
                </>
              )}
            </button>

            <button
              onClick={() => postAction('cancel')}
              disabled={actionLoading === 'cancel'}
              className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition flex items-center justify-center space-x-2"
            >
              {actionLoading === 'cancel' ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  <span>Cancelling...</span>
                </>
              ) : (
                <>
                  <X size={16} />
                  <span>Cancel Alert</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
