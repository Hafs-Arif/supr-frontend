import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  Eye, 
  User, 
  AlertCircle, 
  XCircle,
  FileText,
  MessageCircle,
  MoreVertical,
  MapPin,
  Car,
  Download,
  ChevronDown
} from 'lucide-react';

function PendingVerification() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Stats data
  const statsData = [
    { 
      title: 'Pending Review', 
      value: '42', 
      color: 'bg-yellow-500',
      icon: <Clock className="text-white" size={20} />,
      trend: '+8%'
    },
    { 
      title: 'Under Review', 
      value: '18', 
      color: 'bg-blue-500',
      icon: <Eye className="text-white" size={20} />,
      trend: '+12%'
    },
    { 
      title: 'Resubmission Required', 
      value: '15', 
      color: 'bg-orange-500',
      icon: <AlertCircle className="text-white" size={20} />,
      trend: '+5%'
    },
    { 
      title: 'Rejected', 
      value: '9', 
      color: 'bg-red-500',
      icon: <XCircle className="text-white" size={20} />,
      trend: '+3%'
    }
  ];

  // Pending verification data
  const pendingDrivers = [
    {
      id: 'DRV001',
      name: 'John Smith',
      phone: '+1 234 567 8900',
      email: 'john.smith@email.com',
      status: 'pending-review',
      submittedDate: '2024-01-15',
      daysPending: 2,
      documents: {
        license: 'verified',
        insurance: 'pending',
        vehicle: 'verified',
        background: 'pending'
      },
      vehicle: {
        type: 'Car',
        model: 'Toyota Camry',
        year: '2020',
        number: 'AB-1234'
      },
      location: 'New York, NY',
      notes: 'All documents look good, needs insurance proof'
    },
    {
      id: 'DRV002',
      name: 'Sarah Wilson',
      phone: '+1 234 567 8901',
      email: 'sarah.wilson@email.com',
      status: 'under-review',
      submittedDate: '2024-01-14',
      daysPending: 3,
      documents: {
        license: 'verified',
        insurance: 'verified',
        vehicle: 'under-review',
        background: 'verified'
      },
      vehicle: {
        type: 'Bike',
        model: 'Honda CB150',
        year: '2021',
        number: 'CD-5678'
      },
      location: 'Los Angeles, CA',
      notes: 'Vehicle registration needs verification'
    },
    {
      id: 'DRV003',
      name: 'Mike Johnson',
      phone: '+1 234 567 8902',
      email: 'mike.johnson@email.com',
      status: 'resubmission-required',
      submittedDate: '2024-01-10',
      daysPending: 7,
      documents: {
        license: 'rejected',
        insurance: 'verified',
        vehicle: 'verified',
        background: 'verified'
      },
      vehicle: {
        type: 'Car',
        model: 'Honda Civic',
        year: '2019',
        number: 'EF-9012'
      },
      location: 'Chicago, IL',
      notes: 'Driver license photo is blurry, needs resubmission'
    },
    {
      id: 'DRV004',
      name: 'Emma Davis',
      phone: '+1 234 567 8903',
      email: 'emma.davis@email.com',
      status: 'pending-review',
      submittedDate: '2024-01-16',
      daysPending: 1,
      documents: {
        license: 'pending',
        insurance: 'pending',
        vehicle: 'pending',
        background: 'pending'
      },
      vehicle: {
        type: 'SUV',
        model: 'Ford Escape',
        year: '2022',
        number: 'GH-3456'
      },
      location: 'Miami, FL',
      notes: 'New application, all documents pending review'
    },
    {
      id: 'DRV005',
      name: 'Robert Brown',
      phone: '+1 234 567 8904',
      email: 'robert.brown@email.com',
      status: 'rejected',
      submittedDate: '2024-01-08',
      daysPending: 9,
      documents: {
        license: 'rejected',
        insurance: 'rejected',
        vehicle: 'rejected',
        background: 'rejected'
      },
      vehicle: {
        type: 'Car',
        model: 'Toyota Corolla',
        year: '2018',
        number: 'IJ-7890'
      },
      location: 'Houston, TX',
      notes: 'Background check failed, application rejected'
    }
  ];

  const statusFilters = [
    { value: 'all', label: 'All Applications', icon: <Filter size={16} /> },
    { value: 'pending-review', label: 'Pending Review', icon: <Clock size={16} /> },
    { value: 'under-review', label: 'Under Review', icon: <Eye size={16} /> },
    { value: 'resubmission-required', label: 'Resubmission Required', icon: <AlertCircle size={16} /> },
    { value: 'rejected', label: 'Rejected', icon: <XCircle size={16} /> }
  ];

  const filteredDrivers = pendingDrivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.phone.includes(searchTerm) ||
                         driver.vehicle.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || driver.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending-review': return 'bg-yellow-100 text-yellow-800';
      case 'under-review': return 'bg-blue-100 text-blue-800';
      case 'resubmission-required': return 'bg-orange-100 text-orange-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending-review': return <Clock size={14} />;
      case 'under-review': return <Eye size={14} />;
      case 'resubmission-required': return <AlertCircle size={14} />;
      case 'rejected': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const getDocumentStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under-review': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSelectedStatusLabel = () => {
    return statusFilters.find(filter => filter.value === selectedStatus)?.label || 'All Applications';
  };

  const handleExport = () => {
    console.log('Exporting verification data...');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 ">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <FileText className="mr-3 text-blue-600" size={28} />
              Pending Verification
            </h1>
            <p className="text-gray-600 mt-1">Review and manage driver verification applications</p>
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
                placeholder="Search by Driver ID, Name, Phone or Vehicle..."
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
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition shadow-sm min-w-[180px] justify-between"
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
              Verification Applications
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Total: {filteredDrivers.length} applications</span>
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="overflow-x-auto">
          <table className="w-full hidden lg:table">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDrivers.map((driver, index) => (
                <tr key={driver.id} className="hover:bg-gray-50 transition">
                  {/* Driver Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-semibold text-sm">
                          {driver.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                        <div className="text-sm text-gray-500">{driver.phone}</div>
                        <div className="text-xs text-gray-500">{driver.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Vehicle */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Car className="text-blue-600 mr-2" size={16} />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{driver.vehicle.type}</div>
                        <div className="text-sm text-gray-500">{driver.vehicle.model} ({driver.vehicle.year})</div>
                        <div className="text-xs text-gray-500">{driver.vehicle.number}</div>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(driver.status)}`}>
                        {getStatusIcon(driver.status)}
                        <span className="ml-1 capitalize">{driver.status.replace('-', ' ')}</span>
                      </span>
                      <div className="text-xs text-gray-500">
                        {driver.daysPending} days pending
                      </div>
                    </div>
                  </td>

                  {/* Documents */}
                  <td className="px-6 py-4">
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <span className={`inline-flex justify-center px-2 py-1 rounded ${getDocumentStatusColor(driver.documents.license)}`}>
                        License
                      </span>
                      <span className={`inline-flex justify-center px-2 py-1 rounded ${getDocumentStatusColor(driver.documents.insurance)}`}>
                        Insurance
                      </span>
                      <span className={`inline-flex justify-center px-2 py-1 rounded ${getDocumentStatusColor(driver.documents.vehicle)}`}>
                        Vehicle
                      </span>
                      <span className={`inline-flex justify-center px-2 py-1 rounded ${getDocumentStatusColor(driver.documents.background)}`}>
                        Background
                      </span>
                    </div>
                  </td>

                  {/* Submitted */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(driver.submittedDate).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {driver.daysPending} days ago
                    </div>
                  </td>

                  {/* Location */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin size={14} className="mr-1 text-gray-400" />
                      {driver.location}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Review Application">
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
            {filteredDrivers.map((driver, index) => (
              <div key={driver.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-semibold text-sm">
                        {driver.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{driver.name}</div>
                      <div className="text-sm text-gray-500">{driver.id}</div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(driver.status)}`}>
                    {getStatusIcon(driver.status)}
                    <span className="ml-1 capitalize">{driver.status.replace('-', ' ')}</span>
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-600">Vehicle</div>
                      <div className="text-sm font-medium">{driver.vehicle.type} • {driver.vehicle.number}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Submitted</div>
                      <div className="text-sm">{new Date(driver.submittedDate).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-600 mb-1">Documents Status</div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <span className={`inline-flex justify-center px-2 py-1 rounded ${getDocumentStatusColor(driver.documents.license)}`}>
                        License
                      </span>
                      <span className={`inline-flex justify-center px-2 py-1 rounded ${getDocumentStatusColor(driver.documents.insurance)}`}>
                        Insurance
                      </span>
                      <span className={`inline-flex justify-center px-2 py-1 rounded ${getDocumentStatusColor(driver.documents.vehicle)}`}>
                        Vehicle
                      </span>
                      <span className={`inline-flex justify-center px-2 py-1 rounded ${getDocumentStatusColor(driver.documents.background)}`}>
                        Background
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      <MapPin size={10} className="inline mr-1" />
                      {driver.location}
                    </div>
                    <div className="text-xs text-gray-500">
                      {driver.daysPending} days pending
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500 truncate flex-1 mr-2">
                    {driver.notes}
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
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
        {filteredDrivers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PendingVerification;