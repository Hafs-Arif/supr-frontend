import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  User, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageCircle,
  Shield,
  Download,
  Eye,
  ChevronDown,
  Bike,
  Car,
  Package,
  Wrench,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  AlertCircle,
  MapPin,
  Edit,
  Trash2
} from 'lucide-react';

import api from '../../../utils/api';

function Users() {
  const [users, setUsers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    usersByRole: [],
    usersByStatus: []
  });
  
  // User detail modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [suspendReason, setSuspendReason] = useState('Violation of terms of service');

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setDashboardLoading(true);
      const res = await api.get('/admin/dashboard/stats');
      const data = res?.data?.data || {};
      
      setDashboardStats({
        totalUsers: data.totalUsers || 0,
        usersByRole: Array.isArray(data.usersByRole) ? data.usersByRole : [],
        usersByStatus: Array.isArray(data.usersByStatus) ? data.usersByStatus : []
      });
      
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setDashboardLoading(false);
    }
  };

  // Fetch users from API with pagination
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Prepare query parameters according to API documentation
      const params = {
        page,
        limit,
        ...(selectedRole !== 'all' && { role: selectedRole }),
        ...(selectedStatus !== 'all' && { status: selectedStatus })
      };

      const res = await api.get('/admin/users', { params });
      const response = res?.data;
      
      // Extract users array from response according to API spec
      let usersArray = [];
      let totalUsers = 0;
      
      if (response && response.data) {
        if (Array.isArray(response.data.users)) {
          usersArray = response.data.users;
          // Exclude admin and service_provider from the Users page listing when showing "all"
          if (!params.role) {
            usersArray = usersArray.filter(u => {
              const r = (u.role || u.userRole || '').toString().toLowerCase();
              return r !== 'admin' && r !== 'service_provider';
            });
          }
          totalUsers = usersArray.length;
          setTotalPages(Math.ceil((totalUsers || 1) / limit));
        }
      }
      
      setUsers(usersArray);
      setTotal(totalUsers);
      
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users: ' + (error.response?.data?.message || error.message));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchUsers();
  }, [page, limit, selectedRole, selectedStatus]);

  // Stats data based on current table data (reflects filters/search)
  const getStatsData = () => {
    const list = filteredUsers; // reflect what is shown in the table
    const total = list.length;
    const activeUsers = list.filter(u => (u.status || '').toLowerCase() === 'active').length;
    const pendingUsers = list.filter(u => ['pending', 'pending_verification', 'pending_approval'].includes((u.status || '').toLowerCase())).length;
    const adminUsers = list.filter(u => (u.role || u.userRole || '').toString().toLowerCase() === 'admin').length;

    return [
      {
        title: 'All Users',
        value: total.toString(),
        color: 'bg-blue-500',
        icon: <User className="text-white" size={20} />,
        trend: `Total registered`
      },
      {
        title: 'Active Users',
        value: activeUsers.toString(),
        color: 'bg-green-500',
        icon: <CheckCircle className="text-white" size={20} />,
        trend: `${total > 0 ? Math.round((activeUsers / total) * 100) : 0}% active`
      },
      {
        title: 'Pending Verification',
        value: pendingUsers.toString(),
        color: 'bg-yellow-500',
        icon: <Clock className="text-white" size={20} />,
        trend: `${total > 0 ? Math.round((pendingUsers / total) * 100) : 0}% pending`
      },
      {
        title: 'Admin Users',
        value: adminUsers.toString(),
        color: 'bg-purple-500',
        icon: <Shield className="text-white" size={20} />,
        trend: `${total > 0 ? Math.round((adminUsers / total) * 100) : 0}% admins`
      }
    ];
  };

  // Role filters based on API — exclude admin and service_provider here
  const roleFilters = [
    { value: 'all', label: 'All Roles', icon: <User size={16} /> },
    { value: 'customer', label: 'Customers', icon: <User size={16} /> },
    { value: 'driver', label: 'Drivers', icon: <Car size={16} /> },
    { value: 'rider', label: 'Riders', icon: <Bike size={16} /> },
    { value: 'delivery_person', label: 'Delivery Persons', icon: <Package size={16} /> }
  ];

  // Status filters based on API
  const statusFilters = [
    { value: 'all', label: 'All Status', icon: <User size={16} /> },
    { value: 'active', label: 'Active', icon: <CheckCircle size={16} /> },
    { value: 'suspended', label: 'Suspended', icon: <XCircle size={16} /> },
    { value: 'banned', label: 'Banned', icon: <XCircle size={16} /> },
    { value: 'pending', label: 'Pending', icon: <Clock size={16} /> },
    { value: 'pending_verification', label: 'Pending Verification', icon: <Clock size={16} /> },
    { value: 'pending_approval', label: 'Pending Approval', icon: <Clock size={16} /> }
  ];

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.phone || '').includes(searchTerm) ||
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Helper functions
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
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
    switch (status?.toLowerCase()) {
      case 'active': return <CheckCircle size={16} className="mr-1" />;
      case 'suspended': 
      case 'banned': return <XCircle size={16} className="mr-1" />;
      case 'pending_verification':
      case 'pending_approval':
      case 'pending': return <Clock size={16} className="mr-1" />;
      default: return <User size={16} className="mr-1" />;
    }
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'rider': return <Bike size={16} className="mr-1" />;
      case 'driver': return <Car size={16} className="mr-1" />;
      case 'admin': return <Shield size={16} className="mr-1" />;
      case 'delivery_person': return <Package size={16} className="mr-1" />;
      case 'service_provider': return <Wrench size={16} className="mr-1" />;
      default: return <User size={16} className="mr-1" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'rider': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'driver': return 'bg-green-100 text-green-800 border border-green-200';
      case 'admin': return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'delivery_person': return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'service_provider': return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      case 'customer': return 'bg-gray-100 text-gray-800 border border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const formatRole = (role) => {
    if (!role) return 'Unknown';
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now - date;
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours}h ago`;
      if (diffInDays < 7) return `${diffInDays}d ago`;
      return formatDate(dateString);
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Open user detail modal
  const openUserModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    setActionMessage('');
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setActionMessage('');
    setSuspendReason('Violation of terms of service');
  };

  // Admin actions
  const updateUserStatus = async (id, status, reason = '') => {
    try {
      setActionLoading(true);
      const payload = { status };
      if (reason) payload.reason = reason;
      
      await api.put(`/admin/users/${id}/status`, payload);
      setActionMessage(`User status updated to ${status} successfully`);
      
      // Refresh data
      fetchUsers();
      fetchDashboardStats();
      
    } catch (err) {
      console.error('Failed to update status', err);
      setActionMessage(`Failed to update status: ${err.response?.data?.message || err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const suspendUser = async (id, reason) => {
    try {
      setActionLoading(true);
      await api.post(`/admin/users/${id}/suspend`, { reason });
      setActionMessage('User suspended successfully');
      
      // Refresh data
      fetchUsers();
      fetchDashboardStats();
      
    } catch (err) {
      console.error('Failed to suspend user', err);
      setActionMessage(`Failed to suspend user: ${err.response?.data?.message || err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const approveProvider = async (id) => {
    try {
      setActionLoading(true);
      await api.post(`/admin/service-providers/${id}/approve`);
      setActionMessage('Service provider approved successfully');
      
      // Refresh data
      fetchUsers();
      fetchDashboardStats();
      
    } catch (err) {
      console.error('Failed to approve provider', err);
      setActionMessage(`Failed to approve provider: ${err.response?.data?.message || err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = () => {
    console.log('Exporting users data...');
    // Implement export functionality here
    setActionMessage('Export feature coming soon');
  };

  const getSelectedRoleLabel = () => {
    return roleFilters.find(filter => filter.value === selectedRole)?.label || 'All Roles';
  };

  const getSelectedStatusLabel = () => {
    return statusFilters.find(filter => filter.value === selectedStatus)?.label || 'All Status';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <User className="mr-3 text-blue-600" size={28} />
              Users Management
            </h1>
            <p className="text-gray-600 mt-1">Manage and monitor all users in your system</p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => { fetchUsers(); fetchDashboardStats(); }}
              disabled={loading || dashboardLoading}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
              <Download size={18} />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError('')}
                className="text-red-500 hover:text-red-700"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {getStatsData().map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</p>
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <span>{stat.trend}</span>
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
                placeholder="Search by Name, ID, Phone or Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap gap-3">
            {/* Role Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition shadow-sm min-w-[150px] justify-between"
              >
                <span className="flex items-center space-x-2">
                  <Filter size={16} />
                  <span>{getSelectedRoleLabel()}</span>
                </span>
                <ChevronDown size={16} className={`transition-transform ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isRoleDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {roleFilters.map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => {
                        setSelectedRole(filter.value);
                        setIsRoleDropdownOpen(false);
                        setPage(1);
                      }}
                      className={`flex items-center space-x-2 w-full px-4 py-2 text-left text-sm transition ${
                        selectedRole === filter.value
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

            {/* Status Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition shadow-sm min-w-[150px] justify-between"
              >
                <span className="flex items-center space-x-2">
                  <Filter size={16} />
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
                        setPage(1);
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
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Table Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center mb-2 sm:mb-0">
              <User className="mr-2 text-blue-600" size={20} />
              Users List
            </h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Total: {total} users</span>
              <span>Showing: {filteredUsers.length} users</span>
              {loading && (
                <div className="flex items-center gap-2 text-blue-600">
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Loading...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="overflow-x-auto">
          <table className="w-full hidden lg:table">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    {/* User Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          {user.profilePhotoUrl ? (
                            <img 
                              src={user.profilePhotoUrl} 
                              alt={user.name || 'User'}
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = 
                                  `<span class="text-blue-600 font-semibold text-sm">
                                    ${(user.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </span>`;
                              }}
                            />
                          ) : (
                            <span className="text-blue-600 font-semibold text-sm">
                              {(user.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{user.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{user.email || 'No email'}</div>
                      <div className="text-sm text-gray-500">{user.phone || 'No phone'}</div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span>{formatRole(user.role)}</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {getStatusIcon(user.status)}
                        <span className="capitalize">{(user.status || '').replace(/_/g, ' ')}</span>
                      </span>
                    </td>

                    {/* Last Login */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getTimeAgo(user.lastLoginAt)}
                      </div>
                    </td>

                    {/* Joined Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(user.createdAt)}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => openUserModal(user)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="Message">
                          <MessageCircle size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium">No users found</h3>
                      <p className="mt-1 text-sm">Try adjusting your search or filter criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="lg:hidden p-4 space-y-4">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div key={user.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        {user.profilePhotoUrl ? (
                          <img 
                            src={user.profilePhotoUrl} 
                            alt={user.name || 'User'}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = 
                                `<span class="text-blue-600 font-semibold text-sm">
                                  ${(user.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
                                </span>`;
                            }}
                          />
                        ) : (
                          <span className="text-blue-600 font-semibold text-sm">
                            {(user.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{user.id}</div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {getStatusIcon(user.status)}
                      <span className="ml-1 capitalize">{(user.status || '').replace(/_/g, ' ')}</span>
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Role</div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {getRoleIcon(user.role)}
                          <span className="ml-1">{formatRole(user.role)}</span>
                        </span>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Contact</div>
                        <div className="text-sm">
                          <div className="truncate">{user.email || 'No email'}</div>
                          <div>{user.phone || 'No phone'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Last Login</div>
                        <div className="text-sm text-gray-900">
                          {getTimeAgo(user.lastLoginAt)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Joined</div>
                        <div className="text-sm text-gray-900">
                          {formatDate(user.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end items-center mt-4 pt-3 border-t border-gray-200">
                    <button 
                      onClick={() => openUserModal(user)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                    >
                      <Eye size={14} />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium">No users found</h3>
                  <p className="mt-1 text-sm">Try adjusting your search or filter criteria</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Show</span>
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                className="px-2 py-1 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>entries per page</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1 || loading}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
                First
              </button>
              
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              
              <div className="flex items-center space-x-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`min-w-[40px] px-3 py-1.5 rounded-md text-sm font-medium transition ${
                        page === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                      disabled={loading}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                {totalPages > 5 && page < totalPages - 2 && (
                  <>
                    <span className="px-2 text-gray-500">...</span>
                    <button
                      onClick={() => setPage(totalPages)}
                      className="min-w-[40px] px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
                      disabled={loading}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
                <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages || loading}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Last
                <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </div>
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-3">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  {selectedUser.profilePhotoUrl ? (
                    <img 
                      src={selectedUser.profilePhotoUrl} 
                      alt={selectedUser.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-blue-600 font-semibold text-lg">
                      {(selectedUser.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{selectedUser.name || 'Unknown User'}</h3>
                  <p className="text-sm text-gray-600">User ID: {selectedUser.id}</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
              {/* Action Message */}
              {actionMessage && (
                <div className={`mb-4 p-3 rounded-lg ${actionMessage.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  <div className="flex items-center">
                    {actionMessage.includes('Failed') ? (
                      <XCircle className="h-5 w-5 mr-2" />
                    ) : (
                      <CheckCircle className="h-5 w-5 mr-2" />
                    )}
                    <span className="text-sm">{actionMessage}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - User Info */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                      <User className="mr-2 text-blue-600" size={18} />
                      Basic Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">User ID:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedUser.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Name:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedUser.name || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Role:</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedUser.role)}`}>
                          {getRoleIcon(selectedUser.role)}
                          <span className="ml-1">{formatRole(selectedUser.role)}</span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedUser.status)}`}>
                          {getStatusIcon(selectedUser.status)}
                          <span className="ml-1 capitalize">{(selectedUser.status || '').replace(/_/g, ' ')}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                      <Calendar className="mr-2 text-blue-600" size={18} />
                      Timeline
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Joined:</span>
                        <span className="text-sm font-medium text-gray-900">{formatDate(selectedUser.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Last Updated:</span>
                        <span className="text-sm font-medium text-gray-900">{formatDate(selectedUser.updatedAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Last Login:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedUser.lastLoginAt ? getTimeAgo(selectedUser.lastLoginAt) : 'Never'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Contact & Actions */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                      <Mail className="mr-2 text-blue-600" size={18} />
                      Contact Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedUser.email || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Phone:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedUser.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Profile Photo:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedUser.profilePhotoUrl ? (
                            <a href={selectedUser.profilePhotoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              View Image
                            </a>
                          ) : 'Not provided'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Admin Actions */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                      <Shield className="mr-2 text-blue-600" size={18} />
                      Admin Actions
                    </h4>
                    
                    <div className="space-y-3">
                      {/* Approve Provider Button */}
                      {selectedUser.role === 'service_provider' && 
                        (selectedUser.status === 'pending_approval' || selectedUser.status === 'pending') && (
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-900">Approve Service Provider</div>
                            <div className="text-xs text-gray-500">Change status to active and approve registration</div>
                          </div>
                          <button
                            onClick={async () => {
                              if (!window.confirm('Approve this service provider?')) return;
                              await approveProvider(selectedUser.id);
                            }}
                            disabled={actionLoading}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ShieldCheck size={14} />
                            <span>Approve</span>
                          </button>
                        </div>
                      )}

                      {/* Status Toggle */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Update Status</div>
                          <div className="text-xs text-gray-500">
                            Current: <span className="capitalize">{(selectedUser.status || '').replace(/_/g, ' ')}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={async () => {
                              if (!window.confirm('Activate this user?')) return;
                              await updateUserStatus(selectedUser.id, 'active');
                            }}
                            disabled={actionLoading || selectedUser.status === 'active'}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                              selectedUser.status === 'active'
                                ? 'bg-green-100 text-green-800 cursor-default'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            Activate
                          </button>
                          <button
                            onClick={async () => {
                              if (!window.confirm('Suspend this user?')) return;
                              await updateUserStatus(selectedUser.id, 'suspended');
                            }}
                            disabled={actionLoading || selectedUser.status === 'suspended'}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                              selectedUser.status === 'suspended'
                                ? 'bg-yellow-100 text-yellow-800 cursor-default'
                                : 'bg-yellow-600 text-white hover:bg-yellow-700'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            Suspend
                          </button>
                        </div>
                      </div>

                      {/* Suspend with Reason */}
                      {selectedUser.status !== 'suspended' && (
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
                              if (!window.confirm('Suspend this user with the specified reason?')) return;
                              await suspendUser(selectedUser.id, suspendReason);
                            }}
                            disabled={actionLoading}
                            className="w-full flex items-center justify-center space-x-1 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <AlertCircle size={14} />
                            <span>Suspend User</span>
                          </button>
                        </div>
                      )}

                      {/* Ban User */}
                      <button
                        onClick={async () => {
                          if (!window.confirm('Ban this user permanently?')) return;
                          await updateUserStatus(selectedUser.id, 'banned');
                        }}
                        disabled={actionLoading || selectedUser.status === 'banned'}
                        className={`w-full flex items-center justify-center space-x-1 px-3 py-2 text-sm font-medium rounded-lg transition ${
                          selectedUser.status === 'banned'
                            ? 'bg-red-100 text-red-800 cursor-default'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <XCircle size={14} />
                        <span>{selectedUser.status === 'banned' ? 'Banned' : 'Ban User'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Raw Data Section */}
              <div className="mt-6 bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-200">Raw User Data</h4>
                  <button
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(selectedUser, null, 2))}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Copy JSON
                  </button>
                </div>
                <pre className="text-xs text-gray-300 overflow-auto max-h-40">
                  {JSON.stringify(selectedUser, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Send message to this user?')) {
                      // Implement message functionality
                      setActionMessage('Message feature coming soon');
                    }
                  }}
                  className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  <MessageCircle size={14} />
                  <span>Message User</span>
                </button>
              </div> 
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;