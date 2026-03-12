import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, MapPin, Clock, User, RefreshCw } from 'lucide-react';
import api from '../../../utils/api';

export default function SOSList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const fetchSOS = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('page', page);
      params.append('limit', 20);
      
      const res = await api.get(`/sos?${params}`);
      setItems(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch SOS alerts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSOS();
  }, [status, page]);

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-red-500/20 text-red-400 border border-red-500/30',
      resolved: 'bg-green-500/20 text-green-400 border border-green-500/30',
      cancelled: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
    };
    return badges[status] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="p-6" style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">SOS Alerts</h2>
          <p className="text-gray-600 text-sm mt-1">Manage emergency alerts</p>
        </div>
        <Link
          to="/admin/sos/trigger"
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition flex items-center space-x-2"
        >
          <AlertTriangle size={16} />
          <span>Trigger SOS</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['', 'active', 'resolved', 'cancelled'].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
              status === s
                ? 'bg-[#018a3e] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <AlertTriangle size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">No SOS alerts found</p>
            </div>
          ) : (
            items.map((s) => (
              <div
                key={s.id}
                className="bg-white hover:bg-gray-50 rounded-lg p-4 transition border border-gray-200 hover:border-gray-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(s.status)}`}>
                        {s.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">#{s.id.slice(0, 8)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mt-3">
                      <div className="flex items-center space-x-2">
                        <User size={14} className="text-gray-500" />
                        <span>User: {s.userId.slice(0, 8)}...</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock size={14} className="text-gray-500" />
                        <span>{formatTime(s.createdAt)}</span>
                      </div>
                      {s.rideId && (
                        <div className="flex items-center space-x-2">
                          <MapPin size={14} className="text-gray-500" />
                          <span>Ride: {s.rideId.slice(0, 8)}...</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <AlertTriangle size={14} className="text-orange-500" />
                        <span className="capitalize">{s.alertType}</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/admin/sos/${s.id}`}
                    className="ml-4 px-4 py-2 bg-[#018a3e] hover:bg-[#004036] text-white text-sm font-medium rounded-lg transition whitespace-nowrap"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
