import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  DollarSign, 
  Clock, 
  Wallet, 
  Users, 
  MessageCircle,
  MoreVertical,
  Star,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  ChevronDown,
  FileText,
  XCircle,
  Car,
  Home,
  Wrench,
  GraduationCap,
  Heart
} from 'lucide-react';

function Earning() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Stats data - updated for all providers
  const statsData = [
    { 
      title: 'Total Earning', 
      value: '$89,456', 
      color: 'bg-green-500',
      icon: <DollarSign className="text-white" size={20} />,
      trend: '+22%'
    },
    { 
      title: 'Pending Payout', 
      value: '$12,789', 
      color: 'bg-yellow-500',
      icon: <Clock className="text-white" size={20} />,
      trend: '+15%'
    },
    { 
      title: 'Wallet Balance', 
      value: '$34,567', 
      color: 'bg-blue-500',
      icon: <Wallet className="text-white" size={20} />,
      trend: '+12%'
    },
    { 
      title: 'Active Providers', 
      value: '156', 
      color: 'bg-purple-500',
      icon: <Users className="text-white" size={20} />,
      trend: '+18%'
    }
  ];

  // Service categories
  const serviceCategories = [
    { value: 'all', label: 'All Services', icon: <Users size={16} /> },
    { value: 'driver', label: 'Driver Service', icon: <Car size={16} /> },
    { value: 'home-cleaning', label: 'Home Cleaning', icon: <Home size={16} /> },
    { value: 'plumbing', label: 'Plumbing', icon: <Wrench size={16} /> },
    { value: 'tutoring', label: 'Tutoring', icon: <GraduationCap size={16} /> },
    { value: 'healthcare', label: 'Healthcare', icon: <Heart size={16} /> }
  ];

  // Status filters
  const statusFilters = [
    { value: 'all', label: 'All Status', icon: <Users size={16} /> },
    { value: 'active', label: 'Active', icon: <CheckCircle size={16} /> },
    { value: 'inactive', label: 'Inactive', icon: <AlertCircle size={16} /> }
  ];

  // All providers earnings data - including all service types
  const providersData = [
    {
      id: 'DRV001',
      name: 'John Smith',
      serviceType: 'Driver Service',
      phone: '+1 234 567 8900',
      rating: 4.8,
      status: 'active',
      totalServices: 156,
      totalEarning: '$2,456.80',
      pendingPayout: '$245.50',
      walletBalance: '$567.30',
      joinDate: '2023-01-15',
      lastService: '2 hours ago',
      serviceInfo: {
        type: 'Driver Service',
        vehicleType: 'SUV',
        vehiclePlate: 'ABC 1234',
        completedTrips: 156,
        acceptanceRate: '98%'
      }
    },
    {
      id: 'SP002',
      name: 'Maria Garcia',
      serviceType: 'Home Cleaning',
      phone: '+1 234 567 8901',
      rating: 4.9,
      status: 'active',
      totalServices: 203,
      totalEarning: '$1,789.45',
      pendingPayout: '$189.75',
      walletBalance: '$392.10',
      joinDate: '2023-02-20',
      lastService: '1 hour ago',
      serviceInfo: {
        type: 'Home Cleaning',
        specialization: 'Deep Cleaning',
        completedJobs: 203,
        customerSatisfaction: '99%'
      }
    },
    {
      id: 'SP003',
      name: 'Mike Johnson',
      serviceType: 'Plumbing',
      phone: '+1 234 567 8902',
      rating: 4.7,
      status: 'inactive',
      totalServices: 98,
      totalEarning: '$3,456.20',
      pendingPayout: '$456.20',
      walletBalance: '$734.50',
      joinDate: '2023-03-10',
      lastService: '2 days ago',
      serviceInfo: {
        type: 'Plumbing',
        specialization: 'Emergency Repairs',
        completedJobs: 98,
        emergencyRate: '95%'
      }
    },
    {
      id: 'SP004',
      name: 'Emma Davis',
      serviceType: 'Tutoring',
      phone: '+1 234 567 8903',
      rating: 4.6,
      status: 'active',
      totalServices: 167,
      totalEarning: '$2,178.90',
      pendingPayout: '$178.90',
      walletBalance: '$478.40',
      joinDate: '2023-01-08',
      lastService: '45 min ago',
      serviceInfo: {
        type: 'Tutoring',
        subjects: 'Math, Physics, Chemistry',
        completedSessions: 167,
        studentProgress: '94%'
      }
    },
    {
      id: 'SP005',
      name: 'Robert Brown',
      serviceType: 'Healthcare',
      phone: '+1 234 567 8904',
      rating: 4.5,
      status: 'active',
      totalServices: 134,
      totalEarning: '$4,112.45',
      pendingPayout: '$512.45',
      walletBalance: '$845.60',
      joinDate: '2023-04-05',
      lastService: '3 hours ago',
      serviceInfo: {
        type: 'Healthcare',
        specialization: 'Home Nursing',
        completedVisits: 134,
        patientSatisfaction: '96%'
      }
    },
    {
      id: 'SP006',
      name: 'Sarah Wilson',
      serviceType: 'Home Cleaning',
      phone: '+1 234 567 8905',
      rating: 4.9,
      status: 'active',
      totalServices: 289,
      totalEarning: '$3,234.67',
      pendingPayout: '$334.67',
      walletBalance: '$678.90',
      joinDate: '2023-05-12',
      lastService: '30 min ago',
      serviceInfo: {
        type: 'Home Cleaning',
        specialization: 'Premium Service',
        completedJobs: 289,
        repeatCustomers: '85%'
      }
    }
  ];

  const filteredProviders = providersData.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.phone.includes(searchTerm);
    const matchesService = selectedService === 'all' || provider.serviceType.toLowerCase().includes(selectedService);
    const matchesStatus = selectedStatus === 'all' || provider.status === selectedStatus;
    return matchesSearch && matchesService && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle size={14} />;
      case 'inactive': return <AlertCircle size={14} />;
      default: return <Users size={14} />;
    }
  };

  const getServiceIcon = (serviceType) => {
    switch (serviceType.toLowerCase()) {
      case 'driver service': return <Car size={16} className="text-blue-600" />;
      case 'home cleaning': return <Home size={16} className="text-green-600" />;
      case 'plumbing': return <Wrench size={16} className="text-orange-600" />;
      case 'tutoring': return <GraduationCap size={16} className="text-purple-600" />;
      case 'healthcare': return <Heart size={16} className="text-red-600" />;
      default: return <Users size={16} className="text-gray-600" />;
    }
  };

  const handleViewDetails = (provider) => {
    setSelectedProvider(provider);
    setIsModalOpen(true);
  };

  const handleExport = () => {
    console.log('Exporting earnings data...');
  };

  const getSelectedServiceLabel = () => {
    return serviceCategories.find(service => service.value === selectedService)?.label || 'All Services';
  };

  const getSelectedStatusLabel = () => {
    return statusFilters.find(filter => filter.value === selectedStatus)?.label || 'All Status';
  };

  return ( 
     <div className="min-h-screen bg-gray-50 p-4 sm:p-6 max-w-5xl">
      {/* Header - unchanged */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <DollarSign className="mr-3 text-green-600" size={28} />
              Providers Earnings
            </h1>
            <p className="text-gray-600 mt-1">Manage and monitor all service providers earnings and payouts</p>
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
        {statsData.map((stat, index) => (
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
                placeholder="Search by Provider ID, Name or Phone..."
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
                  <Users size={16} />
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
                  <CheckCircle size={16} />
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

      {/* Table Section - Fixed scrollbar issue */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center mb-2 sm:mb-0">
              <Users className="mr-2 text-blue-600" size={20} />
              Providers Earnings Report
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Total: {filteredProviders.length} providers</span>
            </div>
          </div>
        </div>

        {/* Desktop Table - Fixed width to prevent horizontal scroll */}
        <div className="overflow-x-auto">
          <table className="w-full hidden lg:table">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Services</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Earning</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Payout</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet Balance</th>
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
                          {provider.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{provider.name}</div>
                        <div className="text-sm text-gray-500">{provider.id}</div>
                        <div className="flex items-center mt-1">
                          <Star className="text-yellow-500 mr-1" size={12} />
                          <span className="text-xs text-gray-600">{provider.rating}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Service Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getServiceIcon(provider.serviceType)}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{provider.serviceType}</div>
                        <div className="text-xs text-gray-500">{provider.phone}</div>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(provider.status)}`}>
                      {getStatusIcon(provider.status)}
                      <span className="ml-1 capitalize">{provider.status}</span>
                    </span>
                  </td>

                  {/* Total Services */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{provider.totalServices}</div>
                    <div className="text-xs text-gray-500">completed</div>
                  </td>

                  {/* Total Earning */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">{provider.totalEarning}</div>
                    <div className="text-xs text-gray-500">lifetime</div>
                  </td>

                  {/* Pending Payout */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-yellow-600">{provider.pendingPayout}</div>
                    <div className="text-xs text-gray-500">awaiting</div>
                  </td>

                  {/* Wallet Balance */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-600">{provider.walletBalance}</div>
                    <div className="text-xs text-gray-500">available</div>
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
                        title="View Details & Earnings"
                      >
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="Message">
                        <MessageCircle size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition">
                        <MoreVertical size={16} />
                      </button>
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
                        {provider.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{provider.name}</div>
                      <div className="text-sm text-gray-500">{provider.id}</div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(provider.status)}`}>
                    {getStatusIcon(provider.status)}
                    <span className="ml-1 capitalize">{provider.status}</span>
                  </span>
                </div>

                {/* Service Info */}
                <div className="flex items-center space-x-2 mb-3">
                  {getServiceIcon(provider.serviceType)}
                  <div>
                    <div className="text-sm font-medium text-gray-900">{provider.serviceType}</div>
                    <div className="text-xs text-gray-500">{provider.phone}</div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-gray-600">Rating</div>
                    <div className="flex items-center text-sm">
                      <Star className="text-yellow-500 mr-1" size={12} />
                      <span>{provider.rating}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Services</div>
                    <div className="text-sm font-medium">{provider.totalServices}</div>
                  </div>
                </div>

                {/* Earnings Grid */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-600">Total</div>
                    <div className="text-sm font-medium text-green-600">{provider.totalEarning}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600">Pending</div>
                    <div className="text-sm font-medium text-yellow-600">{provider.pendingPayout}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600">Wallet</div>
                    <div className="text-sm font-medium text-blue-600">{provider.walletBalance}</div>
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
                  Provider Earnings Details
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
                    {selectedProvider.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-800">{selectedProvider.name}</h4>
                  <p className="text-gray-600">{selectedProvider.id}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedProvider.status)}`}>
                      {getStatusIcon(selectedProvider.status)}
                      <span className="ml-1 capitalize">{selectedProvider.status}</span>
                    </span>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="text-yellow-500 mr-1" size={14} />
                      <span>{selectedProvider.rating}</span>
                    </div>
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
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    {Object.entries(selectedProvider.serviceInfo).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-sm font-medium text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="text-sm text-gray-900 ml-2">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="mb-6">
                <h5 className="text-sm font-medium text-gray-700 mb-3">PERFORMANCE STATS</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedProvider.totalServices}</div>
                    <div className="text-xs text-gray-600">Total Services</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{selectedProvider.rating}</div>
                    <div className="text-xs text-gray-600">Average Rating</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{selectedProvider.totalEarning}</div>
                    <div className="text-xs text-gray-600">Total Earnings</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{selectedProvider.lastService}</div>
                    <div className="text-xs text-gray-600">Last Service</div>
                  </div>
                </div>
              </div>

              {/* Earnings Breakdown */}
              <div className="mb-6">
                <h5 className="text-sm font-medium text-gray-700 mb-3">EARNINGS BREAKDOWN</h5>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Total Earnings:</span>
                    <span className="text-lg font-bold text-green-600">{selectedProvider.totalEarning}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Pending Payout:</span>
                    <span className="text-lg font-bold text-yellow-600">{selectedProvider.pendingPayout}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Wallet Balance:</span>
                    <span className="text-lg font-bold text-blue-600">{selectedProvider.walletBalance}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Join Date:</span>
                    <span className="text-sm text-gray-900">{new Date(selectedProvider.joinDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button className="flex-1 bg-[#0F4D0F] text-white py-2 px-4 rounded-lg hover:bg-[#004036] transition font-medium">
                  View Full History
                </button>
                <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition font-medium">
                  Process Payout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Earning;