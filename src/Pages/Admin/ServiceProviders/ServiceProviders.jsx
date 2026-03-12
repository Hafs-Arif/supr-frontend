import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Users, 
  UserCheck, 
  UserX, 
  Shield,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FileText,
  MessageCircle,
  ChevronDown,
  Download,
  Home,
  Car,
  Wrench,
  GraduationCap,
  Heart
} from 'lucide-react';

function ServiceProviders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [providers, setProviders] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [suspendReason, setSuspendReason] = useState('Violation of terms of service');
  const api = require('../../../utils/api').default;

  // Fetch providers - defined before useEffect to avoid use-before-define
  const fetchProviders = React.useCallback(async () => {
    try {
      const params = { role: 'service_provider', page: 1, limit: 100 };
      const res = await api.get('/admin/users', { params });
      const body = res?.data || {};
      const list = Array.isArray(body.data?.users) ? body.data.users : (Array.isArray(body.users) ? body.users : (Array.isArray(body.data) ? body.data : []));
      // map to UI-friendly provider shape with fallbacks; do not assume provider-profile fields exist
      const mapped = list.map(u => ({
        id: u.id || u.userId || u.user_id,
        name: u.name || (u.user && u.user.name) || u.fullName || u.username || u.email || 'Unknown',
        phone: u.phone || u.mobile || u.phone_number || (u.user && (u.user.phone || u.user.mobile)) || '',
        serviceType: u.serviceType || u.service_type || (u.user && u.user.serviceType) || 'General',
        serviceDescription: u.description || u.profileDescription || u.profile?.description || '',
        // use `status` to reflect user status (active/suspended/etc.) consistent with Users component
        status: (u.status || u.verificationStatus || (u.user && u.user.status) || 'pending').toString(),
        availability: (u.isAvailable !== undefined ? (u.isAvailable ? 'online' : 'offline') : (u.availability || 'offline')),
        // provider-specific stats may not be available from this endpoint; use null to indicate missing
        rating: (u.rating !== undefined ? Number(u.rating) : (u.rating === 0 ? 0 : null)),
        totalServices: (u.completedJobs !== undefined ? Number(u.completedJobs) : (u.completed_jobs !== undefined ? Number(u.completed_jobs) : null)),
        totalCustomers: (u.totalReviews !== undefined ? Number(u.totalReviews) : (u.total_reviews !== undefined ? Number(u.total_reviews) : null)),
        totalEarning: u.totalEarning || null,
        joinDate: u.createdAt || u.created_at || (u.user && (u.user.createdAt || u.user.created_at)) || new Date().toISOString(),
        documents: u.verificationDocs || u.verification_docs || u.documents || {}
      }));
      setProviders(mapped);
    } catch (err) {
      console.error('Failed to fetch providers', err);
      setProviders([]);
    }
  }, [api]);
  const serviceCategories = [
    { value: 'all', label: 'All Services', icon: <Users size={16} /> },
    { value: 'home-cleaning', label: 'Home Cleaning', icon: <Home size={16} /> },
    { value: 'driver', label: 'Driver Service', icon: <Car size={16} /> },
    { value: 'plumbing', label: 'Plumbing', icon: <Wrench size={16} /> },
    { value: 'tutoring', label: 'Tutoring', icon: <GraduationCap size={16} /> },
    { value: 'healthcare', label: 'Healthcare', icon: <Heart size={16} /> },
    { value: 'laundry', label: 'Laundry', icon: <Home size={16} /> }
  ];

  // Verification status filters
  const statusFilters = [
    { value: 'all', label: 'All Status', icon: <Users size={16} /> },
    { value: 'verified', label: 'Verified', icon: <CheckCircle size={16} /> },
    { value: 'pending', label: 'Pending', icon: <Clock size={16} /> },
    { value: 'rejected', label: 'Rejected', icon: <XCircle size={16} /> }
  ];

  // providers will be fetched from admin API
  
  // Fetch providers on mount and when filters change
  React.useEffect(() => {
    fetchProviders();
  }, [selectedService, selectedStatus, fetchProviders]);

  // Approve by activating the user status (backend does not expose provider-profile id here)
  const suspendProvider = async (userId) => {
    try {
      const reason = window.prompt('Enter suspension reason:', 'Violation of terms of service');
      if (!reason) return;
      setActionLoading(true);
      await api.post(`/admin/users/${userId}/suspend`, { reason });
      await fetchProviders();
    } catch (err) {
      console.error('Suspend failed', err);
    } finally {
      setActionLoading(false);
    }
  };

  const updateProviderStatus = async (userId, status) => {
    try {
      setActionLoading(true);
      await api.put(`/admin/users/${userId}/status`, { status });
      await fetchProviders();
    } catch (err) {
      console.error('Update status failed', err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = selectedService === 'all' || (provider.serviceType || '').toLowerCase().includes(selectedService);
    const matchesStatus = selectedStatus === 'all' || (provider.status || '').toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesService && matchesStatus;
  });
 
  // Compute stats based on currently displayed providers (reflects table)
  const getStatsData = () => {
    const all = filteredProviders.length;
    const online = filteredProviders.filter(p => (p.availability || '').toLowerCase() === 'online').length;
    const active = filteredProviders.filter(p => (p.status || '').toLowerCase() === 'active' || (p.status || '').toLowerCase() === 'verified').length;
    const rejected = filteredProviders.filter(p => ['rejected', 'banned'].includes((p.status || '').toLowerCase())).length;

    return [
      {
        title: 'All Providers',
        value: all.toString(),
        color: 'bg-blue-500',
        icon: <Users className="text-white" size={20} />,
        trend: `${all} total`
      },
      {
        title: 'Online Providers',
        value: online.toString(),
        color: 'bg-green-500',
        icon: <UserCheck className="text-white" size={20} />,
        trend: `${all > 0 ? Math.round((online / all) * 100) : 0}% online`
      },
      {
        title: 'Verified / Active',
        value: active.toString(),
        color: 'bg-purple-500',
        icon: <Shield className="text-white" size={20} />,
        trend: `${all > 0 ? Math.round((active / all) * 100) : 0}% approved`
      },
      {
        title: 'Rejected Providers',
        value: rejected.toString(),
        color: 'bg-red-500',
        icon: <UserX className="text-white" size={20} />,
        trend: `${all > 0 ? Math.round((rejected / all) * 100) : 0}% rejected`
      }
    ];
  };
 
  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border border-green-200';
      case 'suspended': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'banned': return 'bg-red-100 text-red-800 border border-red-200';
      case 'pending_verification':
      case 'pending_approval':
      case 'pending': return 'bg-blue-100 text-blue-800 border border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'active': return <CheckCircle size={16} className="mr-1" />;
      case 'suspended': return <XCircle size={16} className="mr-1" />;
      case 'banned': return <XCircle size={16} className="mr-1" />;
      case 'pending_verification':
      case 'pending_approval':
      case 'pending': return <Clock size={16} className="mr-1" />;
      default: return <Users size={16} className="mr-1" />;
    }
  };

  const getAvailabilityColor = (availability) => {
    return availability === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getServiceIcon = (serviceType) => {
    switch (serviceType.toLowerCase()) {
      case 'driver service': return <Car size={16} className="text-blue-600" />;
      case 'home cleaning': return <Home size={16} className="text-green-600" />;
      case 'plumbing': return <Wrench size={16} className="text-orange-600" />;
      case 'tutoring': return <GraduationCap size={16} className="text-purple-600" />;
      case 'healthcare': return <Heart size={16} className="text-red-600" />;
      case 'laundry': return <Home size={16} className="text-cyan-600" />;
      default: return <Users size={16} className="text-gray-600" />;
    }
  };

  const getInitials = (name, id) => {
    const s = (name || '').toString().trim();
    if (s) {
      const parts = s.split(/\s+/).filter(Boolean);
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } 
    // fallback to id fragments
    if (id && id.toString().length >= 2) return id.toString().slice(0, 2).toUpperCase();
    return '--';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const handleViewDetails = (provider) => {
    setSelectedProvider(provider);
    setIsModalOpen(true);
  };

  const handleExport = () => {
    console.log('Exporting providers data...');
  };

  const getSelectedServiceLabel = () => {
    return serviceCategories.find(service => service.value === selectedService)?.label || 'All Services';
  };

  const getSelectedStatusLabel = () => {
    return statusFilters.find(filter => filter.value === selectedStatus)?.label || 'All Status';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 ">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <Users className="mr-3 text-blue-600" size={28} />
              Service Providers
            </h1>
            <p className="text-gray-600 mt-1">Manage and monitor all service providers</p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition shadow-sm"
            >
              <Download size={18} />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div> 

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {getStatsData().map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</p>
                <div className="flex items-center mt-2 text-xs text-green-600">
                  <span>↑ {stat.trend}</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center shadow-md`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by Provider ID, Name or Service Type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap gap-3">
            {/* Service Type Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition shadow-sm min-w-[150px] justify-between"
              >
                <span className="flex items-center space-x-2">
                  <Home size={16} />
                  <span>{getSelectedServiceLabel()}</span>
                </span>
                <ChevronDown size={16} className={`transition-transform ${isServiceDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isServiceDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  {serviceCategories.map((service) => (
                    <button
                      key={service.value}
                      onClick={() => {
                        setSelectedService(service.value);
                        setIsServiceDropdownOpen(false);
                      }}
                      className={`flex items-center space-x-2 w-full px-4 py-2 text-left text-sm transition ${
                        selectedService === service.value
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {service.icon}
                      <span>{service.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition shadow-sm min-w-[150px] justify-between"
              >
                <span className="flex items-center space-x-2">
                  <Shield size={16} />
                  <span>{getSelectedStatusLabel()}</span>
                </span>
                <ChevronDown size={16} className={`transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isStatusDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {statusFilters.map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => {
                        setSelectedStatus(filter.value);
                        setIsStatusDropdownOpen(false);
                      }}
                      className={`flex items-center space-x-2 w-full px-4 py-2 text-left text-sm transition ${
                        selectedStatus === filter.value
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {filter.icon}
                      <span>{filter.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* More Filters Button */}
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition shadow-sm">
              <Filter size={18} />
              <span>More Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center mb-2 sm:mb-0">
              <Users className="mr-2 text-blue-600" size={20} />
              Service Providers List
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Total: {filteredProviders.length} providers</span>
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="overflow-x-auto">
          <table className="w-full hidden lg:table">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verification</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Services</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earning</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProviders.map((provider) => (
                <tr key={provider.id} className="hover:bg-gray-50 transition">
                  {/* Provider Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-semibold text-sm">
                          {getInitials(provider.name, provider.id)}
                        </span>
                      </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{provider.name}</div>
                              <div className="text-sm text-gray-500">{provider.phone || provider.id || '-'}</div>
                            </div>
                    </div>
                  </td>

                  {/* Service Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getServiceIcon(provider.serviceType)}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{provider.serviceType}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[150px]">{provider.serviceDescription}</div>
                      </div>
                    </div>
                  </td>

                  {/* Verification Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(provider.status)}`}>
                      {getStatusIcon(provider.status)}
                      <span className="ml-1 capitalize">{provider.status}</span>
                    </span>
                  </td>

                  {/* Availability */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAvailabilityColor(provider.availability)}`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${provider.availability === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                      <span className="capitalize">{provider.availability}</span>
                    </span>
                  </td>

                  {/* Rating */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="text-yellow-500 mr-1" size={14} />
                      <span className="text-sm font-medium text-gray-900">{provider.rating !== null && provider.rating !== undefined ? provider.rating : '-'}</span>
                    </div>
                  </td>

                  {/* Total Services */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{provider.totalServices !== null && provider.totalServices !== undefined ? provider.totalServices : '-'}</div>
                    <div className="text-xs text-gray-500">completed</div>
                  </td>

                  {/* Total Customers */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{provider.totalCustomers !== null && provider.totalCustomers !== undefined ? provider.totalCustomers : '-'}</div>
                    <div className="text-xs text-gray-500">served</div>
                  </td>

                  {/* Total Earning */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">{provider.totalEarning !== null && provider.totalEarning !== undefined ? provider.totalEarning : '-'}</div>
                    <div className="text-xs text-gray-500">lifetime</div>
                  </td>

                  {/* Join Date */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(provider.joinDate).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">joined</div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewDetails(provider)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="View Details & Documents"
                      >
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="Message">
                        <MessageCircle size={16} />
                      </button>
                      {provider.status && provider.status.toLowerCase() !== 'active' && (
                        <button
                          onClick={() => updateProviderStatus(provider.id, 'active')}
                          disabled={actionLoading}
                          className="p-2 text-white bg-[#018a3e] hover:bg-[#004036] rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Activate Provider"
                        >
                          {actionLoading ? '...' : 'Activate'}
                        </button>
                      )}

                      {provider.status && provider.status.toLowerCase() === 'active' && (
                        <button
                          onClick={() => suspendProvider(provider.id)}
                          disabled={actionLoading}
                          className="p-2 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Suspend Provider"
                        >
                          Suspend
                        </button>
                      )}
                      {/* Removed extra menu for clarity */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="lg:hidden p-4 space-y-4">
            {filteredProviders.map((provider) => (
              <div key={provider.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-semibold text-sm">
                        {getInitials(provider.name, provider.id)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{provider.name}</div>
                      <div className="text-sm text-gray-500">{provider.phone || provider.id || '-'}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(provider.status)}`}>
                      {getStatusIcon(provider.status)}
                      <span className="ml-1 capitalize">{provider.status}</span>
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAvailabilityColor(provider.availability)}`}>
                      <div className={`w-2 h-2 rounded-full mr-1 ${provider.availability === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                      <span className="capitalize">{provider.availability}</span>
                    </span>
                  </div>
                </div>

                {/* Service Info */}
                <div className="flex items-center space-x-2 mb-3">
                  {getServiceIcon(provider.serviceType)}
                  <div>
                    <div className="text-sm font-medium text-gray-900">{provider.serviceType}</div>
                    <div className="text-xs text-gray-500">{provider.serviceDescription}</div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-gray-600">Rating</div>
                    <div className="flex items-center text-sm">
                      <Star className="text-yellow-500 mr-1" size={12} />
                      <span>{provider.rating !== null && provider.rating !== undefined ? provider.rating : '-'}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Services</div>
                    <div className="text-sm font-medium">{provider.totalServices !== null && provider.totalServices !== undefined ? provider.totalServices : '-'}</div>
                  </div>
                </div>

                {/* Earnings and Customers */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-600">Customers</div>
                    <div className="text-sm font-medium text-blue-600">{provider.totalCustomers !== null && provider.totalCustomers !== undefined ? provider.totalCustomers : '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Earnings</div>
                    <div className="text-sm font-medium text-green-600">{provider.totalEarning !== null && provider.totalEarning !== undefined ? provider.totalEarning : '-'}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Joined: {new Date(provider.joinDate).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleViewDetails(provider)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Eye size={16} />
                    </button>
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition">
                      <MessageCircle size={16} />
                    </button>
                    {provider.status && provider.status.toLowerCase() !== 'active' && (
                      <button
                        onClick={() => updateProviderStatus(provider.id, 'active')}
                        disabled={actionLoading}
                        className="px-3 py-1 bg-[#018a3e] text-white rounded-md text-sm hover:bg-[#004036] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading ? '...' : 'Activate'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* No Results */}
        {filteredProviders.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No providers found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Provider Details Modal */}
      {isModalOpen && selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FileText className="mr-2 text-blue-600" size={20} />
                  Provider Details & Documents
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <XCircle size={20} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Provider Basic Info */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-lg">
                    {getInitials(selectedProvider.name, selectedProvider.id)}
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-800">{selectedProvider.name}</h4>
                  <p className="text-gray-600">{selectedProvider.id || '-'}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedProvider.status)}`}>
                      {getStatusIcon(selectedProvider.status)}
                      <span className="ml-1 capitalize">{selectedProvider.status}</span>
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAvailabilityColor(selectedProvider.availability)}`}>
                      <div className={`w-2 h-2 rounded-full mr-1 ${selectedProvider.availability === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                      <span className="capitalize">{selectedProvider.availability}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Service Information */}
              <div className="mb-6">
                <h5 className="text-sm font-medium text-gray-700 mb-3">SERVICE INFORMATION</h5>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    {getServiceIcon(selectedProvider.serviceType)}
                    <span className="font-medium text-gray-900">{selectedProvider.serviceType}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{selectedProvider.serviceDescription}</p>
                </div>
              </div>

              {/* Documents & Details */}
              <div className="mb-6">
                <h5 className="text-sm font-medium text-gray-700 mb-3">DOCUMENTS & DETAILS</h5>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {Object.entries(selectedProvider.documents).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="text-sm text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedProvider.totalServices !== null && selectedProvider.totalServices !== undefined ? selectedProvider.totalServices : '-'}</div>
                  <div className="text-xs text-gray-600">Total Services</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedProvider.totalCustomers !== null && selectedProvider.totalCustomers !== undefined ? selectedProvider.totalCustomers : '-'}</div>
                  <div className="text-xs text-gray-600">Customers Served</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{selectedProvider.rating !== null && selectedProvider.rating !== undefined ? selectedProvider.rating : '-'}</div>
                  <div className="text-xs text-gray-600">Rating</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{selectedProvider.totalEarning !== null && selectedProvider.totalEarning !== undefined ? selectedProvider.totalEarning : '-'}</div>
                  <div className="text-xs text-gray-600">Total Earnings</div>
                </div>
              </div>

              {/* Action Buttons */}
              {/* Admin Actions */}
              <div className="mb-6 bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                  <Shield className="mr-2 text-blue-600" size={18} />
                  Admin Actions
                </h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">Update Status</div>
                      <div className="text-xs text-gray-500">Current: <span className="capitalize">{(selectedProvider.status || '').replace(/_/g, ' ')}</span></div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={async () => {
                          if (!window.confirm('Activate this provider?')) return;
                          await updateProviderStatus(selectedProvider.id, 'active');
                        }}
                        disabled={actionLoading || selectedProvider.status === 'active'}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                          selectedProvider.status === 'active' ? 'bg-green-100 text-green-800 cursor-default' : 'bg-green-600 text-white hover:bg-green-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        Activate
                      </button>
                      <button
                        onClick={async () => {
                          if (!window.confirm('Suspend this provider?')) return;
                          await updateProviderStatus(selectedProvider.id, 'suspended');
                        }}
                        disabled={actionLoading || selectedProvider.status === 'suspended'}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                          selectedProvider.status === 'suspended' ? 'bg-yellow-100 text-yellow-800 cursor-default' : 'bg-yellow-600 text-white hover:bg-yellow-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        Suspend
                      </button>
                    </div>
                  </div>

                  {selectedProvider.status !== 'suspended' && (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Suspend with Reason</label>
                        <input
                          type="text"
                          value={suspendReason}
                          onChange={(e) => setSuspendReason(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="Enter suspend reason"
                        />
                      </div>
                      <button
                        onClick={async () => {
                          if (!window.confirm('Suspend this provider with the specified reason?')) return;
                          await suspendProvider(selectedProvider.id);
                        }}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center space-x-1 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle size={14} />
                        <span>Suspend Provider</span>
                      </button>
                    </div>
                  )}

                  <button
                    onClick={async () => {
                      if (!window.confirm('Ban this provider permanently?')) return;
                      await updateProviderStatus(selectedProvider.id, 'banned');
                    }}
                    disabled={actionLoading || selectedProvider.status === 'banned'}
                    className={`w-full flex items-center justify-center space-x-1 px-3 py-2 text-sm font-medium rounded-lg transition ${
                      selectedProvider.status === 'banned' ? 'bg-red-100 text-red-800 cursor-default' : 'bg-red-600 text-white hover:bg-red-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <XCircle size={14} />
                    <span>{selectedProvider.status === 'banned' ? 'Banned' : 'Ban Provider'}</span>
                  </button>
                </div>
              </div>

              {/* Raw Data Section */}
              <div className="mt-6 bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-200">Raw Provider Data</h4>
                  <button
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(selectedProvider, null, 2))}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Copy JSON
                  </button>
                </div>
                <pre className="text-xs text-gray-300 overflow-auto max-h-40">
                  {JSON.stringify(selectedProvider, null, 2)}
                </pre>
              </div>
              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Send message to this provider?')) {
                        console.log('Message feature coming soon');
                      }
                    }}
                    className="flex items-center space-x-1 px-4 py-2 bg-[#0F4D0F] text-white rounded-lg text-sm font-medium hover:bg-[#004036] transition"
                  >
                    <MessageCircle size={14} />
                    <span>Message Provider</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServiceProviders;