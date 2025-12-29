import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  User, 
  Clock, 
  MapPin, 
  Phone, 
  MessageCircle,
  MoreVertical,
  Star,
  Navigation,
  CheckCircle,
  AlertCircle,
  Bike,
  Car,
  Truck,
  ChevronDown,
  DollarSign,
  ShoppingBag,
  Calendar
} from 'lucide-react';

function ActiveUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Stats data
  const statsData = [
    { 
      title: 'Total Active Users', 
      value: '1,256', 
      color: 'bg-blue-500',
      icon: <User className="text-white" size={20} />,
      trend: '+12%'
    },
    { 
      title: 'Services Today', 
      value: '89', 
      color: 'bg-green-500',
      icon: <ShoppingBag className="text-white" size={20} />,
      trend: '+8%'
    },
    { 
      title: 'Total Revenue', 
      value: '$2,458', 
      color: 'bg-purple-500',
      icon: <DollarSign className="text-white" size={20} />,
      trend: '+15%'
    },
    { 
      title: 'Avg Rating', 
      value: '4.7', 
      color: 'bg-yellow-500',
      icon: <Star className="text-white" size={20} />,
      trend: '+0.2'
    }
  ];

  // Active users data with service history
  const activeUsers = [
    {
      id: 'USR001',
      name: 'John Smith',
      phone: '+1 234 567 8900',
      rating: 4.8,
      totalServices: 24,
      totalSpent: '$1,245.50',
      status: 'active',
      currentService: {
        type: 'Food Delivery',
        provider: 'FoodExpress',
        amount: '$25.50',
        status: 'in-progress'
      },
      serviceHistory: [
        { service: 'Ride Sharing', provider: 'QuickRide', amount: '$15.75', date: '2024-01-15', rating: 5 },
        { service: 'Food Delivery', provider: 'FoodExpress', amount: '$32.40', date: '2024-01-14', rating: 4 },
        { service: 'Grocery Delivery', provider: 'QuickMart', amount: '$45.20', date: '2024-01-13', rating: 5 }
      ],
      favoriteServices: ['Ride Sharing', 'Food Delivery'],
      memberSince: 'Jan 2023',
      lastActive: '5 min ago'
    },
    {
      id: 'USR002',
      name: 'Sarah Wilson',
      phone: '+1 234 567 8901',
      rating: 4.9,
      totalServices: 42,
      totalSpent: '$3,189.75',
      status: 'active',
      currentService: {
        type: 'Ride Sharing',
        provider: 'CityRide',
        amount: '$18.25',
        status: 'completed'
      },
      serviceHistory: [
        { service: 'Ride Sharing', provider: 'CityRide', amount: '$18.25', date: '2024-01-15', rating: 5 },
        { service: 'Package Delivery', provider: 'QuickSend', amount: '$28.50', date: '2024-01-14', rating: 5 },
        { service: 'Food Delivery', provider: 'FoodExpress', amount: '$22.80', date: '2024-01-13', rating: 4 }
      ],
      favoriteServices: ['Ride Sharing', 'Package Delivery'],
      memberSince: 'Mar 2023',
      lastActive: '2 min ago'
    },
    {
      id: 'USR003',
      name: 'Mike Johnson',
      phone: '+1 234 567 8902',
      rating: 4.7,
      totalServices: 18,
      totalSpent: '$856.20',
      status: 'active',
      currentService: {
        type: 'Grocery Delivery',
        provider: 'QuickMart',
        amount: '$67.40',
        status: 'pending'
      },
      serviceHistory: [
        { service: 'Grocery Delivery', provider: 'QuickMart', amount: '$67.40', date: '2024-01-15', rating: 4 },
        { service: 'Ride Sharing', provider: 'QuickRide', amount: '$12.50', date: '2024-01-14', rating: 5 },
        { service: 'Food Delivery', provider: 'FoodExpress', amount: '$19.99', date: '2024-01-12', rating: 4 }
      ],
      favoriteServices: ['Grocery Delivery'],
      memberSince: 'Nov 2023',
      lastActive: '8 min ago'
    },
    {
      id: 'USR004',
      name: 'Emma Davis',
      phone: '+1 234 567 8903',
      rating: 4.6,
      totalServices: 31,
      totalSpent: '$1,478.90',
      status: 'inactive',
      currentService: null,
      serviceHistory: [
        { service: 'Ride Sharing', provider: 'CityRide', amount: '$24.75', date: '2024-01-14', rating: 4 },
        { service: 'Food Delivery', provider: 'FoodExpress', amount: '$31.20', date: '2024-01-13', rating: 4 },
        { service: 'Package Delivery', provider: 'QuickSend', amount: '$15.99', date: '2024-01-12', rating: 5 }
      ],
      favoriteServices: ['Food Delivery', 'Ride Sharing'],
      memberSince: 'Feb 2023',
      lastActive: '2 hours ago'
    },
    {
      id: 'USR005',
      name: 'Robert Brown',
      phone: '+1 234 567 8904',
      rating: 4.5,
      totalServices: 56,
      totalSpent: '$4,312.45',
      status: 'active',
      currentService: {
        type: 'Package Delivery',
        provider: 'QuickSend',
        amount: '$45.80',
        status: 'in-progress'
      },
      serviceHistory: [
        { service: 'Package Delivery', provider: 'QuickSend', amount: '$45.80', date: '2024-01-15', rating: 4 },
        { service: 'Ride Sharing', provider: 'QuickRide', amount: '$28.90', date: '2024-01-14', rating: 4 },
        { service: 'Grocery Delivery', provider: 'QuickMart', amount: '$89.45', date: '2024-01-13', rating: 5 }
      ],
      favoriteServices: ['Package Delivery', 'Grocery Delivery'],
      memberSince: 'Dec 2022',
      lastActive: '1 min ago'
    }
  ];

  const statusFilters = [
    { value: 'all', label: 'All Users', icon: <User size={16} /> },
    { value: 'active', label: 'Active Now', icon: <CheckCircle size={16} /> },
    { value: 'inactive', label: 'Recently Active', icon: <Clock size={16} /> }
  ];

  const filteredUsers = activeUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm);
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    return matchesSearch && matchesStatus;
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
      case 'inactive': return <Clock size={14} />;
      default: return <User size={14} />;
    }
  };

  const getServiceStatusColor = (status) => {
    switch (status) {
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSelectedStatusLabel = () => {
    return statusFilters.find(filter => filter.value === selectedStatus)?.label || 'All Users';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <User className="mr-3 text-blue-600" size={28} />
              Active Users
            </h1>
            <p className="text-gray-600 mt-1">Monitor user activity, service history, and spending patterns</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="flex items-center space-x-1 text-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
              <span>Live Updates</span>
            </div>
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
                placeholder="Search by User ID, Name or Phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap gap-3">
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
              <User className="mr-2 text-blue-600" size={20} />
              Users List
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Total: {filteredUsers.length} users</span>
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="overflow-x-auto">
          <table className="w-full hidden lg:table">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Services & Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spending</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member Since</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  {/* User Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-semibold text-sm">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.phone}</div>
                        <div className="text-xs text-gray-400 mt-1">{user.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Services & Rating */}
                  <td className="px-6 py-4">
                    <div className="flex items-center mb-2">
                      <Star className="text-yellow-500 mr-1" size={14} />
                      <span className="text-sm font-medium text-gray-900">{user.rating}</span>
                      <span className="text-xs text-gray-500 ml-2">({user.totalServices} services)</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {user.favoriteServices.map((service, index) => (
                        <span key={index} className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                          {service}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Current Service */}
                  <td className="px-6 py-4">
                    {user.currentService ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.currentService.type}</div>
                        <div className="text-sm text-gray-500">{user.currentService.provider}</div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getServiceStatusColor(user.currentService.status)}`}>
                          {user.currentService.status}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No active service</span>
                    )}
                  </td>

                  {/* Spending */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">{user.totalSpent}</div>
                    <div className="text-xs text-gray-500">Total spent</div>
                    {user.currentService && (
                      <div className="text-xs text-blue-600 mt-1">+{user.currentService.amount}</div>
                    )}
                  </td>

                  {/* Member Since */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.memberSince}</div>
                    <div className="text-xs text-gray-500">{user.lastActive}</div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {getStatusIcon(user.status)}
                      <span className="ml-1 capitalize">{user.status}</span>
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Call">
                        <Phone size={16} />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="Message">
                        <MessageCircle size={16} />
                      </button>
                      <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition" title="View History">
                        <Calendar size={16} />
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
            {filteredUsers.map((user) => (
              <div key={user.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-semibold text-sm">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.id}</div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                    {getStatusIcon(user.status)}
                    <span className="ml-1 capitalize">{user.status}</span>
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-600">Rating & Services</div>
                      <div className="flex items-center text-sm">
                        <Star className="text-yellow-500 mr-1" size={12} />
                        <span>{user.rating} • {user.totalServices} services</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Total Spent</div>
                      <div className="text-sm font-medium text-green-600">{user.totalSpent}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-600">Current Service</div>
                    {user.currentService ? (
                      <div className="text-sm">
                        <div>{user.currentService.type} - {user.currentService.provider}</div>
                        <div className="text-green-600 font-medium">{user.currentService.amount}</div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No active service</div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-600">Member Since</div>
                      <div className="text-sm">{user.memberSince}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Last Active</div>
                      <div className="text-sm">{user.lastActive}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-600 mb-1">Favorite Services</div>
                    <div className="flex flex-wrap gap-1">
                      {user.favoriteServices.map((service, index) => (
                        <span key={index} className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    {user.phone}
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                      <Phone size={16} />
                    </button>
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition">
                      <MessageCircle size={16} />
                    </button>
                    <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition">
                      <Calendar size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* No Results */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ActiveUsers;