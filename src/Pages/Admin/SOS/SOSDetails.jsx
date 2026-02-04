import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, MapPin, Clock, User, Phone, Mail, CheckCircle, X, ArrowLeft } from 'lucide-react';
import api from '../../../utils/api';

export default function SOSDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState('');

  const fetchDetails = async () => {
    try {
      const res = await api.get(`/sos/${id}`);
      setItem(res.data?.data || null);
    } catch (err) {
      console.error('Failed to fetch SOS details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const action = async (act) => {
    setActionLoading(act);
    try {
      const payload = act === 'resolve' ? { notes } : {};
      await api.post(`/sos/${id}/${act}`, payload);
      setSuccess(`SOS ${act}d successfully`);
      setTimeout(() => {
        fetchDetails();
        setSuccess('');
        setNotes('');
      }, 1500);
    } catch (err) {
      const msg = err?.response?.data?.message || `Failed to ${act} SOS`;
      setSuccess(`Error: ${msg}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-40">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-6" style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
        <button
          onClick={() => navigate('/admin/sos')}
          className="mb-4 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft size={16} />
          <span>Back to Alerts</span>
        </button>
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <AlertTriangle size={40} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600">SOS alert not found</p>
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    const colors = {
      active: 'text-red-500',
      resolved: 'text-green-500',
      cancelled: 'text-gray-500',
    };
    return colors[item.status] || 'text-gray-500';
  };

  const getStatusBgColor = () => {
    const colors = {
      active: 'bg-red-500/20 border border-red-500/30',
      resolved: 'bg-green-500/20 border border-green-500/30',
      cancelled: 'bg-gray-500/20 border border-gray-500/30',
    };
    return colors[item.status] || 'bg-gray-500/20 border border-gray-500/30';
  };

  const formatTime = (date) => new Date(date).toLocaleString();

  return (
    <div className="p-6" style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
      <button
        onClick={() => navigate('/admin/sos')}
        className="mb-4 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition"
      >
        <ArrowLeft size={16} />
        <span>Back to Alerts</span>
      </button>

      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">SOS Alert Details</h2>
            <p className="text-gray-600 text-sm mt-1">ID: {item.id}</p>
          </div>
          <span className={`px-4 py-2 rounded-lg font-semibold text-sm ${getStatusBgColor()} ${getStatusColor()}`}>
            {item.status.toUpperCase()}
          </span>
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
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Alert Info */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <AlertTriangle size={20} className={getStatusColor()} />
              <span>Alert Information</span>
            </h3>

            <div className="space-y-4 text-sm">
              <div className="pb-4 border-b border-gray-200">
                <p className="text-gray-600 mb-1">Alert Type</p>
                <p className="text-gray-900 capitalize font-medium">{item.alertType}</p>
              </div>

              <div className="pb-4 border-b border-gray-200">
                <p className="text-gray-600 mb-1 flex items-center space-x-2">
                  <Clock size={14} />
                  <span>Timeline</span>
                </p>
                <p className="text-gray-900"><strong>Triggered:</strong> {formatTime(item.createdAt)}</p>
                {item.safetyTeamNotifiedAt && (
                  <p className="text-green-600 text-xs mt-1">✓ Safety team notified at {formatTime(item.safetyTeamNotifiedAt)}</p>
                )}
                {item.resolvedAt && (
                  <p className="text-green-600 text-xs">✓ Resolved at {formatTime(item.resolvedAt)}</p>
                )}
              </div>

              <div className="pb-4 border-b border-gray-200">
                <p className="text-gray-600 mb-1 flex items-center space-x-2">
                  <MapPin size={14} />
                  <span>Location</span>
                </p>
                <p className="text-gray-900">Lat: {item.latitude.toFixed(6)}, Lon: {item.longitude.toFixed(6)}</p>
                <a
                  href={`https://maps.google.com/?q=${item.latitude},${item.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 text-xs mt-1 inline-block"
                >
                  → Open in Google Maps
                </a>
              </div>

              {item.rideId && (
                <div>
                  <p className="text-gray-600 mb-1">Associated Ride</p>
                  <p className="text-gray-900 font-mono text-xs">{item.rideId}</p>
                </div>
              )}

              {item.notes && (
                <div>
                  <p className="text-gray-600 mb-1">Resolution Notes</p>
                  <p className="text-gray-700 text-sm bg-gray-100 p-3 rounded">{item.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* User Information */}
          {item.user && (
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <User size={20} />
                <span>User Information</span>
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <p className="text-gray-600">Name</p>
                  <p className="text-gray-900 font-medium">{item.user.name}</p>
                </div>
                {item.user.phone && (
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                    <p className="text-gray-600 flex items-center space-x-2">
                      <Phone size={14} />
                      <span>Phone</span>
                    </p>
                    <p className="text-gray-900">{item.user.phone}</p>
                  </div>
                )}
                {item.user.email && (
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                    <p className="text-gray-600 flex items-center space-x-2">
                      <Mail size={14} />
                      <span>Email</span>
                    </p>
                    <p className="text-gray-900 text-xs">{item.user.email}</p>
                  </div>
                )}
                {item.user.emergencyContactPhone && (
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600">Emergency Contact</p>
                    <p className="text-orange-600 font-medium">{item.user.emergencyContactPhone}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions Panel */}
        {item.status === 'active' && (
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
                onClick={() => action('resolve')}
                disabled={actionLoading === 'resolve'}
                className="w-full py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition flex items-center justify-center space-x-2"
              >
                {actionLoading === 'resolve' ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
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
                onClick={() => action('cancel')}
                disabled={actionLoading === 'cancel'}
                className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition flex items-center justify-center space-x-2"
              >
                {actionLoading === 'cancel' ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
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
        )}

        {/* Resolved/Cancelled Info */}
        {item.status !== 'active' && (
          <div className="bg-white rounded-lg p-6 border border-gray-200 h-fit">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <CheckCircle size={20} className={item.status === 'resolved' ? 'text-green-500' : 'text-gray-500'} />
              <span>Status Information</span>
            </h3>
            <div className="space-y-3 text-sm">
              {item.resolvedAt && (
                <div>
                  <p className="text-gray-600">Resolved At</p>
                  <p className="text-gray-900 font-mono text-xs">{formatTime(item.resolvedAt)}</p>
                </div>
              )}
              {item.resolvedBy && (
                <div>
                  <p className="text-gray-600">Resolved By</p>
                  <p className="text-gray-900">{item.resolvedBy}</p>
                </div>
              )}
              {item.notes && (
                <div>
                  <p className="text-gray-600">Resolution Notes</p>
                  <p className="text-gray-700 text-xs bg-gray-100 p-2 rounded mt-1">{item.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
