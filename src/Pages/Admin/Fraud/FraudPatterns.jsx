import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, User, Clock, Shield } from 'lucide-react';
import api from '../../../utils/api';

export default function FraudPatterns() {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patternType, setPatternType] = useState('');
  const [status, setStatus] = useState('');
  const [minRiskScore, setMinRiskScore] = useState(0);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 20;

  const fetchPatterns = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit,
        ...(patternType && { patternType }),
        ...(status && { status }),
        ...(minRiskScore > 0 && { minRiskScore }),
      });
      const res = await api.get(`/fraud/patterns?${params}`);
      setPatterns(res.data?.data || []);
      setTotal(res.data?.meta?.total || 0);
    } catch (err) {
      console.error('Failed to fetch fraud patterns', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatterns();
  }, [page, patternType, status, minRiskScore]);

  const handleFilterChange = () => {
    setPage(1);
  };

  const formatTime = (date) => new Date(date).toLocaleString();

  const getStatusBadge = (status) => {
    const badges = {
      flagged: 'bg-red-500/10 text-red-600 border border-red-500/30',
      investigating: 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/30',
      confirmed: 'bg-orange-500/10 text-orange-600 border border-orange-500/30',
      dismissed: 'bg-green-500/10 text-green-600 border border-green-500/30',
    };
    return badges[status] || badges.flagged;
  };

  const getRiskBadge = (score) => {
    if (score >= 80) return 'bg-red-500/10 text-red-600';
    if (score >= 60) return 'bg-orange-500/10 text-orange-600';
    if (score >= 40) return 'bg-yellow-500/10 text-yellow-600';
    return 'bg-green-500/10 text-green-600';
  };

  const patternTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'frequent_cancellation', label: 'Frequent Cancellation' },
    { value: 'same_rider_driver', label: 'Same Rider-Driver Pair' },
    { value: 'location_gaming', label: 'Location Gaming' },
    { value: 'fake_trips', label: 'Fake Trips' },
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'flagged', label: 'Flagged' },
    { value: 'investigating', label: 'Investigating' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'dismissed', label: 'Dismissed' },
  ];

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6" style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-red-500/20 rounded-lg">
            <AlertTriangle className="text-red-600" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Fraud Patterns</h2>
            <p className="text-gray-600 text-sm">Review and investigate suspicious activities</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pattern Type Filter */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Pattern Type</label>
            <select
              value={patternType}
              onChange={(e) => {
                setPatternType(e.target.value);
                handleFilterChange();
              }}
              className="w-full px-4 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-indigo-500 focus:outline-none"
            >
              {patternTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                handleFilterChange();
              }}
              className="w-full px-4 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-indigo-500 focus:outline-none"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Min Risk Score Filter */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Min Risk Score</label>
            <select
              value={minRiskScore}
              onChange={(e) => {
                setMinRiskScore(Number(e.target.value));
                handleFilterChange();
              }}
              className="w-full px-4 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-indigo-500 focus:outline-none"
            >
              <option value={0}>All (0+)</option>
              <option value={50}>Medium (50+)</option>
              <option value={70}>High (70+)</option>
              <option value={80}>Critical (80+)</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setPatternType('');
                setStatus('');
                setMinRiskScore(0);
                setPage(1);
              }}
              className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg transition"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Patterns List */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
        </div>
      ) : patterns.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Shield size={40} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600">No fraud patterns found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {patterns.map((pattern) => (
            <Link
              key={pattern.id}
              to={`/admin/fraud/patterns/${pattern.id}`}
              className="block bg-white hover:bg-gray-50 rounded-lg p-4 transition border border-gray-200 hover:border-gray-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(pattern.status)}`}>
                      {pattern.status.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskBadge(pattern.riskScore)}`}>
                      Risk: {pattern.riskScore}
                    </span>
                    <span className="text-xs text-gray-500">#{pattern.id.slice(0, 8)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mt-3">
                    <div className="flex items-center space-x-2">
                      <Shield size={14} className="text-gray-500" />
                      <span className="capitalize">{pattern.patternType.replace(/_/g, ' ')}</span>
                    </div>
                    {pattern.userId && (
                      <div className="flex items-center space-x-2">
                        <User size={14} className="text-gray-500" />
                        <span>User: {pattern.userId.slice(0, 8)}...</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Clock size={14} className="text-gray-500" />
                      <span>{formatTime(pattern.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <div className={`text-2xl font-bold ${getRiskBadge(pattern.riskScore)}`}>
                    {pattern.riskScore}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Risk Score</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {patterns.length > 0 ? (page - 1) * limit + 1 : 0} - {Math.min(page * limit, total)} of {total} patterns
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-2 rounded-lg font-medium transition ${
                  page === p
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
