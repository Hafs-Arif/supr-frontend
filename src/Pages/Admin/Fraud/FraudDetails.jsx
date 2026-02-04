import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, User, Phone, Mail, MapPin, Clock, CheckCircle, ArrowLeft, Shield } from 'lucide-react';
import api from '../../../utils/api';

export default function FraudDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pattern, setPattern] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [success, setSuccess] = useState('');

  const fetchDetails = async () => {
    try {
      const res = await api.get(`/fraud/patterns/${id}`);
      setPattern(res.data?.data || null);
      setReviewStatus(res.data?.data?.status || '');
    } catch (err) {
      console.error('Failed to fetch fraud pattern', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const submitReview = async () => {
    if (!reviewStatus) {
      setSuccess('Error: Please select a status');
      return;
    }
    setActionLoading(true);
    try {
      await api.post(`/fraud/patterns/${id}/review`, {
        status: reviewStatus,
        reviewNotes: reviewNotes,
      });
      setSuccess('Pattern reviewed successfully');
      setTimeout(() => {
        fetchDetails();
        setSuccess('');
        setReviewNotes('');
      }, 1500);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to review pattern';
      setSuccess(`Error: ${msg}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-40">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!pattern) {
    return (
      <div className="p-6" style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
        <button
          onClick={() => navigate('/admin/fraud/patterns')}
          className="mb-4 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft size={16} />
          <span>Back to Patterns</span>
        </button>
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <AlertTriangle size={40} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600">Fraud pattern not found</p>
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    const colors = {
      flagged: 'text-red-600',
      investigating: 'text-yellow-600',
      confirmed: 'text-orange-600',
      dismissed: 'text-green-600',
    };
    return colors[pattern.status] || 'text-gray-600';
  };

  const getStatusBgColor = () => {
    const colors = {
      flagged: 'bg-red-500/20 border border-red-500/30',
      investigating: 'bg-yellow-500/20 border border-yellow-500/30',
      confirmed: 'bg-orange-500/20 border border-orange-500/30',
      dismissed: 'bg-green-500/20 border border-green-500/30',
    };
    return colors[pattern.status] || 'bg-gray-500/20 border border-gray-500/30';
  };

  const getRiskColor = (score) => {
    if (score >= 80) return 'text-red-600 bg-red-500/10';
    if (score >= 60) return 'text-orange-600 bg-orange-500/10';
    if (score >= 40) return 'text-yellow-600 bg-yellow-500/10';
    return 'text-green-600 bg-green-500/10';
  };

  const formatTime = (date) => new Date(date).toLocaleString();

  return (
    <div className="p-6" style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
      <button
        onClick={() => navigate('/admin/fraud/patterns')}
        className="mb-4 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition"
      >
        <ArrowLeft size={16} />
        <span>Back to Patterns</span>
      </button>

      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Fraud Pattern Details</h2>
            <p className="text-gray-600 text-sm mt-1">ID: {pattern.id}</p>
          </div>
          <div className="text-right">
            <span className={`px-4 py-2 rounded-lg font-semibold text-sm inline-block ${getStatusBgColor()} ${getStatusColor()}`}>
              {pattern.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {success && (
        <div className={`mb-4 p-4 rounded-lg text-sm border ${
          success.includes('Error')
            ? 'bg-red-500/10 text-red-600 border-red-500/30'
            : 'bg-green-500/10 text-green-600 border-green-500/30'
        }`}>
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pattern Info */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Shield size={20} className={getStatusColor()} />
              <span>Pattern Information</span>
            </h3>

            <div className="space-y-4 text-sm">
              <div className="pb-4 border-b border-gray-200">
                <p className="text-gray-600 mb-1">Pattern Type</p>
                <p className="text-gray-900 capitalize font-medium">{pattern.patternType.replace(/_/g, ' ')}</p>
              </div>

              <div className="pb-4 border-b border-gray-200">
                <p className="text-gray-600 mb-1">Risk Score</p>
                <div className="flex items-center space-x-2">
                  <div className={`px-3 py-1 rounded-full font-bold ${getRiskColor(pattern.riskScore)}`}>
                    {pattern.riskScore}
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        pattern.riskScore >= 80
                          ? 'bg-red-600'
                          : pattern.riskScore >= 60
                          ? 'bg-orange-600'
                          : pattern.riskScore >= 40
                          ? 'bg-yellow-600'
                          : 'bg-green-600'
                      }`}
                      style={{ width: `${pattern.riskScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="pb-4 border-b border-gray-200">
                <p className="text-gray-600 mb-1 flex items-center space-x-2">
                  <Clock size={14} />
                  <span>Timeline</span>
                </p>
                <p className="text-gray-900"><strong>Detected:</strong> {formatTime(pattern.createdAt)}</p>
                {pattern.reviewedAt && (
                  <p className="text-gray-900 mt-1"><strong>Reviewed:</strong> {formatTime(pattern.reviewedAt)}</p>
                )}
              </div>

              {pattern.details && (
                <div>
                  <p className="text-gray-600 mb-2">Details</p>
                  <pre className="text-gray-900 text-xs bg-gray-50 p-3 rounded border border-gray-200 overflow-auto">
                    {JSON.stringify(JSON.parse(pattern.details), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* User & Related Info */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <User size={20} />
              <span>Related Users & Rides</span>
            </h3>

            <div className="space-y-3 text-sm">
              {pattern.userId && (
                <div className="pb-3 border-b border-gray-200">
                  <p className="text-gray-600 mb-1">User ID</p>
                  <p className="text-gray-900 font-mono">{pattern.userId}</p>
                </div>
              )}
              {pattern.driverId && (
                <div className="pb-3 border-b border-gray-200">
                  <p className="text-gray-600 mb-1">Driver ID</p>
                  <p className="text-gray-900 font-mono">{pattern.driverId}</p>
                </div>
              )}
              {pattern.rideId && (
                <div className="pb-3 border-b border-gray-200">
                  <p className="text-gray-600 mb-1">Ride ID</p>
                  <p className="text-gray-900 font-mono">{pattern.rideId}</p>
                </div>
              )}
              {pattern.relatedUserId && (
                <div>
                  <p className="text-gray-600 mb-1">Related User ID</p>
                  <p className="text-gray-900 font-mono">{pattern.relatedUserId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Review History */}
          {pattern.reviewedAt && (
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <CheckCircle size={20} className="text-green-600" />
                <span>Review Information</span>
              </h3>

              <div className="space-y-3 text-sm">
                <div className="pb-3 border-b border-gray-200">
                  <p className="text-gray-600 mb-1">Reviewed By</p>
                  <p className="text-gray-900 font-mono">{pattern.reviewedBy || 'N/A'}</p>
                </div>
                {pattern.reviewNotes && (
                  <div>
                    <p className="text-gray-600 mb-2">Review Notes</p>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">{pattern.reviewNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Review Panel */}
        {pattern.status !== 'confirmed' && pattern.status !== 'dismissed' && (
          <div className="bg-white rounded-lg p-6 border border-gray-200 h-fit">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Pattern</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Status</label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Select status...</option>
                  <option value="investigating">Investigating</option>
                  <option value="confirmed">Confirmed Fraud</option>
                  <option value="dismissed">Dismiss Alert</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Review Notes (Optional)</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about this review..."
                  className="w-full px-4 py-2 bg-gray-50 text-gray-900 rounded-lg border border-gray-300 focus:border-indigo-500 focus:outline-none text-sm"
                  rows={4}
                />
              </div>

              <button
                onClick={submitReview}
                disabled={actionLoading || !reviewStatus}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition flex items-center justify-center space-x-2"
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    <span>Submit Review</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Confirmed/Dismissed Info */}
        {(pattern.status === 'confirmed' || pattern.status === 'dismissed') && (
          <div className="bg-white rounded-lg p-6 border border-gray-200 h-fit">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <CheckCircle size={20} className={pattern.status === 'confirmed' ? 'text-orange-600' : 'text-green-600'} />
              <span>Status Details</span>
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Current Status</p>
                <p className={`text-lg font-bold ${pattern.status === 'confirmed' ? 'text-orange-600' : 'text-green-600'}`}>
                  {pattern.status === 'confirmed' ? 'Confirmed Fraud' : 'Dismissed'}
                </p>
              </div>
              {pattern.reviewedAt && (
                <div>
                  <p className="text-gray-600 mb-1">Status Changed At</p>
                  <p className="text-gray-900 text-xs">{formatTime(pattern.reviewedAt)}</p>
                </div>
              )}
              {pattern.reviewNotes && (
                <div>
                  <p className="text-gray-600 mb-1">Final Notes</p>
                  <p className="text-gray-700 text-xs bg-gray-50 p-2 rounded">{pattern.reviewNotes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
