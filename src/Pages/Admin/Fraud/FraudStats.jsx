import React, { useEffect, useState } from 'react';
import { BarChart3, AlertTriangle, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../../../utils/api';

export default function FraudStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.get('/fraud/stats');
      setStats(res.data?.data || null);
    } catch (err) {
      console.error('Failed to fetch fraud stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-40">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      flagged: { bg: 'bg-red-500/10', text: 'text-red-600', icon: 'AlertTriangle' },
      investigating: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', icon: 'Clock' },
      confirmed: { bg: 'bg-orange-500/10', text: 'text-orange-600', icon: 'TrendingUp' },
      dismissed: { bg: 'bg-green-500/10', text: 'text-green-600', icon: 'CheckCircle' },
    };
    return colors[status] || colors.flagged;
  };

  const statusCards = [
    {
      label: 'Flagged Patterns',
      value: stats?.flaggedCount || 0,
      icon: AlertTriangle,
      color: 'red',
      bgColor: 'bg-red-500/10',
    },
    {
      label: 'Investigating',
      value: stats?.investigatingCount || 0,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-500/10',
    },
    {
      label: 'Confirmed Fraud',
      value: stats?.confirmedCount || 0,
      icon: TrendingUp,
      color: 'orange',
      bgColor: 'bg-orange-500/10',
    },
    {
      label: 'Dismissed',
      value: stats?.dismissedCount || 0,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-500/10',
    },
  ];

  return (
    <div className="p-6" style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-3 bg-indigo-500/20 rounded-lg">
            <BarChart3 className="text-indigo-600" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Fraud Detection Dashboard</h2>
            <p className="text-gray-600 text-sm">Monitor suspicious patterns and activities</p>
          </div>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Patterns</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalPatterns || 0}</p>
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-lg">
              <BarChart3 className="text-indigo-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">High Risk (80+)</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats?.highRiskCount || 0}</p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Confirmed Fraud</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{stats?.confirmedCount || 0}</p>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <TrendingUp className="text-orange-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Cleared Cases</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats?.dismissedCount || 0}</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status Distribution */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
          <div className="space-y-4">
            {statusCards.map((card) => {
              const Icon = card.icon;
              const colors = getStatusColor(card.label.toLowerCase().split(' ')[0]);
              return (
                <div key={card.label} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${card.bgColor}`}>
                      <Icon className={`text-${card.color}-600`} size={18} />
                    </div>
                    <span className="text-gray-700 font-medium">{card.label}</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{card.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pattern Types */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fraud Types Distribution</h3>
          <div className="space-y-4">
            {stats?.byType && Object.entries(stats.byType).length > 0 ? (
              Object.entries(stats.byType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-gray-700 capitalize font-medium text-sm mb-1">{type.replace(/_/g, ' ')}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#018a3e] h-2 rounded-full"
                        style={{ width: `${(count / (stats?.totalPatterns || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="ml-4 text-gray-900 font-semibold text-sm min-w-[3rem] text-right">{count}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No fraud patterns detected</p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-indigo-600">{stats?.flaggedCount || 0}</p>
            <p className="text-gray-600 text-xs mt-1">Awaiting Review</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-yellow-600">{stats?.investigatingCount || 0}</p>
            <p className="text-gray-600 text-xs mt-1">Under Investigation</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-600">{stats?.dismissedCount || 0}</p>
            <p className="text-gray-600 text-xs mt-1">False Positives</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-red-600">{stats?.highRiskCount || 0}</p>
            <p className="text-gray-600 text-xs mt-1">Critical Risk</p>
          </div>
        </div>
      </div>
    </div>
  );
}
