import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, MapPin, StopCircle, Loader } from 'lucide-react';
import SOSService from '../../Services/SOSService';
import wsService from '../../Services/WebSocketService';
import './SOSManager.css';

export default function SOSManager({ rideId = null }) {
  const [sosActive, setSOSActive] = useState(false);
  const [sosAlertId, setSosAlertId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationUpdates, setLocationUpdates] = useState(0);
  const [lastLocation, setLastLocation] = useState(null);
  const watchIdRef = useRef(null);
  const updateIntervalRef = useRef(null);

  // Check for existing SOS on component mount
  useEffect(() => {
    checkActiveSOSAlert();
    return () => {
      stopTracking();
    };
  }, []);

  const checkActiveSOSAlert = async () => {
    try {
      const alerts = await SOSService.getActiveSOSAlerts();
      if (alerts && alerts.length > 0) {
        const active = alerts[0];
        setSosAlertId(active.id);
        setSOSActive(true);
        startTracking(active.id);
      }
    } catch (err) {
      console.error('Failed to check active SOS alerts:', err);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const position = await SOSService.getCurrentLocation();
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch (error) {
      throw new Error(`Location error: ${error.message}`);
    }
  };

  const triggerSOS = async () => {
    setError('');
    setIsLoading(true);

    try {
      const location = await getCurrentLocation();

      // Validate coordinates
      if (!SOSService.validateCoordinates(location.latitude, location.longitude)) {
        throw new Error('Invalid coordinates');
      }

      setLastLocation(location);

      // Trigger SOS via API
      const sosData = await SOSService.triggerSOS(location.latitude, location.longitude, rideId);

      setSosAlertId(sosData.id);
      setSOSActive(true);
      setLocationUpdates(0);

      // Start continuous location tracking
      startTracking(sosData.id);

      console.log('🚨 SOS Alert Triggered:', sosData.id);
    } catch (err) {
      const errorMsg = SOSService.getErrorMessage(err);
      setError(errorMsg);
      console.error('SOS trigger error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const startTracking = (alertId) => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    // Watch position changes
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        updateLocation(
          alertId,
          position.coords.latitude,
          position.coords.longitude
        );
      },
      (error) => {
        console.error('Location watch error:', error.message);
        setError(`Location tracking error: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 5000,
      }
    );

    console.log('📍 Location tracking started');
  };

  const updateLocation = async (alertId, latitude, longitude) => {
    if (!SOSService.validateCoordinates(latitude, longitude)) {
      return;
    }

    setLastLocation({ latitude, longitude });

    try {
      // Update via REST API
      await SOSService.updateSOSLocation(alertId, latitude, longitude);

      // Also send via WebSocket if connected
      if (wsService.isConnected()) {
        wsService.sendSOSLocation(alertId, latitude, longitude);
      }

      setLocationUpdates((prev) => prev + 1);
    } catch (err) {
      console.error('Failed to update location:', err);
    }
  };

  const stopTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }

    console.log('🛑 Location tracking stopped');
  };

  const resolveSOS = async (notes = '') => {
    if (!sosAlertId) return;

    setError('');
    setIsLoading(true);

    try {
      await SOSService.resolveSOSAlert(sosAlertId, notes || 'SOS resolved by user');

      stopTracking();
      setSOSActive(false);
      setSosAlertId(null);
      setLocationUpdates(0);
      setLastLocation(null);

      console.log('✅ SOS Resolved');
    } catch (err) {
      const errorMsg = SOSService.getErrorMessage(err);
      setError(errorMsg);
      console.error('SOS resolution error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sos-manager">
      {/* SOS Button */}
      <button
        className={`sos-btn ${sosActive ? 'active' : ''}`}
        onClick={sosActive ? () => resolveSOS() : triggerSOS}
        disabled={isLoading}
        title={sosActive ? 'Click to resolve SOS' : 'Click to trigger SOS'}
      >
        {isLoading && <Loader size={20} className="spinner" />}
        {!isLoading && (
          <>
            {sosActive ? (
              <>
                <StopCircle size={20} />
                <span>🚨 SOS ACTIVE - Tap to Resolve</span>
              </>
            ) : (
              <>
                <AlertTriangle size={20} />
                <span>🆘 Trigger SOS</span>
              </>
            )}
          </>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="sos-error">
          <span>{error}</span>
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      {/* SOS Status Panel */}
      {sosActive && (
        <div className="sos-status-panel">
          <div className="status-header">
            <div className="status-indicator active"></div>
            <h4>SOS Active</h4>
          </div>

          <div className="status-details">
            <div className="detail-item">
              <label>Alert ID:</label>
              <code>{sosAlertId}</code>
            </div>

            {lastLocation && (
              <div className="detail-item">
                <label>Location:</label>
                <div className="location-info">
                  <MapPin size={14} />
                  <span>
                    {lastLocation.latitude.toFixed(6)}, {lastLocation.longitude.toFixed(6)}
                  </span>
                </div>
              </div>
            )}

            <div className="detail-item">
              <label>Location Updates:</label>
              <span className="updates-count">{locationUpdates}</span>
            </div>

            {rideId && (
              <div className="detail-item">
                <label>Ride ID:</label>
                <code>{rideId}</code>
              </div>
            )}
          </div>

          <button
            className="resolve-btn"
            onClick={() => {
              const notes = prompt('Enter resolution notes (optional):', '');
              if (notes !== null) {
                resolveSOS(notes);
              }
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Resolving...' : 'Resolve SOS'}
          </button>
        </div>
      )}
    </div>
  );
}
