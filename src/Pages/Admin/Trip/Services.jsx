import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../utils/api';

const slugify = (s) =>
  (s || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

function Services() {
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    serviceSlug: '',
    title: '',
    longTitle: '',
    categorySlug: '',
    description: '',
    longDescription: '',
    bannerImage: '',
    thumbnail: '',
    basePrice: '',
    duration: '',
    highlights: '',
    whatsIncludedText: '',
    termsText: '',
    isFrequent: false,
    frequency: '',
    sortOrder: 0,
    isActive: true,
    isAvailable: true
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit, sortBy: "created_at", sortDesc: true };
      const res = await api.get(`/admin/homeservices/services`, { params });
      const data = res.data;
      
      let list = [];
      if (Array.isArray(data)) list = data;
      else if (data.data && Array.isArray(data.data)) list = data.data;
      else if (data.services && Array.isArray(data.services)) list = data.services;
      else if (data.items && Array.isArray(data.items)) list = data.items;
      else if (data.data && data.data.items && Array.isArray(data.data.items)) list = data.data.items;
      
      setServices(Array.isArray(list) ? list : []);

      const totalFromResp = data.pagination?.total || data.meta?.total || data.total || data.data?.total || data.data?.pagination?.totalItems;
      const totalCount = typeof totalFromResp === 'number' ? totalFromResp : (typeof totalFromResp === 'string' && /^\d+$/.test(totalFromResp) ? parseInt(totalFromResp, 10) : list.length);
      
      setTotal(totalCount);
      setTotalPages(Math.ceil(totalCount / limit));
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to load services');
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get(`/admin/homeservices/categories`);
      const data = res.data;
      let list = [];
      if (Array.isArray(data)) list = data;
      else if (data.data && Array.isArray(data.data)) list = data.data;
      else if (data.categories && Array.isArray(data.categories)) list = data.categories;
      else list = [];
      
      if (Array.isArray(list) && list.length > 0 && typeof list[0] === 'string') {
        setCategories(list.map(s => ({ slug: s, name: s })));
      } else {
        setCategories(Array.isArray(list) ? list : []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, [fetchServices, fetchCategories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);

      if (!formData.title || formData.title.trim().length < 3) {
        setError('Title must be at least 3 characters');
        return;
      }
      if (!formData.categorySlug || formData.categorySlug.trim().length < 2) {
        setError('Category slug is required');
        return;
      }

      let finalSlug = formData.serviceSlug ? slugify(formData.serviceSlug) : slugify(formData.title);
      if (finalSlug.length < 3) finalSlug = `${finalSlug}-service`;

      const payload = {
        title: formData.title,
        longTitle: formData.longTitle || undefined,
        serviceSlug: finalSlug,
        categorySlug: slugify(formData.categorySlug),
        description: formData.description,
        longDescription: formData.longDescription || undefined,
        highlights: formData.highlights || formData.title,
        whatsIncluded: formData.whatsIncludedText
          ? formData.whatsIncludedText.split('\n').map(s => s.trim()).filter(Boolean)
          : [formData.title || 'Standard service'],
        termsAndConditions: formData.termsText
          ? formData.termsText.split('\n').map(s => s.trim()).filter(Boolean)
          : [],
        bannerImage: formData.bannerImage || formData.thumbnail,
        thumbnail: formData.thumbnail || formData.bannerImage,
        duration: formData.duration ? parseInt(formData.duration, 10) : undefined,
        isFrequent: !!formData.isFrequent,
        frequency: formData.frequency,
        sortOrder: formData.sortOrder ? parseInt(formData.sortOrder, 10) : 0,
        isActive: typeof formData.isActive === 'boolean' ? formData.isActive : true,
        isAvailable: typeof formData.isAvailable === 'boolean' ? formData.isAvailable : true,
        basePrice: formData.basePrice ? parseFloat(formData.basePrice) : undefined
      };

      if (isEditing && editingId) {
        await api.put(`/admin/homeservices/services/${editingId}`, payload);
      } else {
        await api.post(`/admin/homeservices/services`, payload);
      }

      setShowModal(false);
      setIsEditing(false);
      setEditingId(null);
      resetForm();
      fetchServices();
    } catch (error) {
      console.error('Error creating service:', error);
      let msg = 'Failed to create service';
      if (error && error.response && error.response.data && error.response.data.message) {
        msg = error.response.data.message;
      } else if (error && error.message) {
        msg = error.message;
      }
      setError(msg);
    }
  };

  const handleEdit = async (service) => {
    setError(null);
    const slug = service.serviceSlug || service.slug || service.id;
    let full = service;
    
    if (!service.description || !service.longDescription) {
      try {
        const res = await api.get(`/admin/homeservices/services/${slug}`);
        const d = res && res.data ? res.data : null;
        full = d && d.data ? d.data : (d || service);
      } catch (err) {
        console.error('Failed to fetch service details:', err);
        full = service;
      }
    }

    setFormData({
      serviceSlug: full.serviceSlug || full.slug || '',
      title: full.title || full.name || '',
      longTitle: full.longTitle || '',
      categorySlug: full.categorySlug || (full.category && full.category.slug) || '',
      description: full.description || '',
      longDescription: full.longDescription || '',
      bannerImage: full.bannerImage || full.thumbnail || '',
      thumbnail: full.thumbnail || full.bannerImage || '',
      basePrice: full.basePrice || '',
      duration: full.duration || '',
      highlights: full.highlights || '',
      whatsIncludedText: Array.isArray(full.whatsIncluded) ? full.whatsIncluded.join('\n') : '',
      termsText: Array.isArray(full.termsAndConditions) ? full.termsAndConditions.join('\n') : '',
      isFrequent: full.isFrequent || false,
      frequency: full.frequency || '',
      sortOrder: full.sortOrder || 0,
      isActive: full.isActive ?? true,
      isAvailable: full.isAvailable ?? true
    });
    setIsEditing(true);
    setEditingId(slug);
    setShowModal(true);
  };

  const handleDelete = async (service) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      const slug = service.serviceSlug || service.slug || service.id;
      await api.delete(`/admin/homeservices/services/${slug}`);
      fetchServices();
    } catch (err) {
      console.error('Failed to delete service', err);
      setError('Failed to delete service');
    }
  };

  const toggleServiceStatus = async (service) => {
    try {
      const slug = service.serviceSlug || service.slug || service.id;
      const newState = !service.isActive;
      await api.patch(`/admin/homeservices/services/${slug}/status`, { isActive: newState });
      fetchServices();
    } catch (err) {
      console.error('Failed to toggle service status', err);
      setError('Failed to update service status');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      serviceSlug: '',
      title: '',
      longTitle: '',
      categorySlug: '',
      description: '',
      longDescription: '',
      bannerImage: '',
      thumbnail: '',
      basePrice: '',
      duration: '',
      highlights: '',
      whatsIncludedText: '',
      termsText: '',
      isFrequent: false,
      frequency: '',
      sortOrder: 0,
      isActive: true,
      isAvailable: true
    });
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = searchTerm === '' || 
      (service.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.categorySlug || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && service.isActive) ||
      (statusFilter === 'inactive' && !service.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '-';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Services Management</h1>
        <p className="text-gray-600 mt-1">Manage all home service offerings</p>
      </div>

      {/* Alert Messages */}
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
                onClick={() => setError(null)}
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

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search services by name, description, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={fetchServices}
              disabled={loading}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>

            <button
              onClick={() => { setError(null); resetForm(); setIsEditing(false); setEditingId(null); setShowModal(true); }}
              className="px-4 py-2.5 bg-[#0F4D0F] hover:bg-[#004036] text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Service
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Services</h2>
              <p className="text-sm text-gray-600 mt-1">
                {total > 0 && (
                  <>
                    Showing <span className="font-medium">{(page - 1) * limit + 1}-{Math.min(page * limit, filteredServices.length)}</span> of <span className="font-medium">{filteredServices.length}</span> services
                  </>
                )}
              </p>
            </div>
            <div className="text-sm text-gray-600">
              {loading && (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                  Loading...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        {(service.thumbnail || service.bannerImage) ? (
                          <img 
                            className="h-10 w-10 rounded-lg object-cover" 
                            src={service.thumbnail || service.bannerImage} 
                            alt={service.title}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{service.title}</div>
                          <div className="text-sm text-gray-500 truncate">{service.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {service.categorySlug || service.category?.slug || service.category?.name || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{formatCurrency(service.basePrice)}</div>
                      {service.strikethroughPrice && service.strikethroughPrice > service.basePrice && (
                        <div className="text-xs text-red-500 line-through">{formatCurrency(service.strikethroughPrice)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {service.duration ? `${service.duration} min` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          service.isAvailable ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {service.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => toggleServiceStatus(service)}
                          className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            service.isActive 
                              ? 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700' 
                              : 'bg-green-50 hover:bg-green-100 text-green-700'
                          }`}
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {service.isActive ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            )}
                          </svg>
                          {service.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(service)}
                          className="inline-flex items-center px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium">No services found</h3>
                      <p className="mt-1 text-sm">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden p-4 space-y-4">
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <div key={service.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start space-x-3 mb-3">
                  {(service.thumbnail || service.bannerImage) ? (
                    <img 
                      className="h-12 w-12 rounded-lg object-cover" 
                      src={service.thumbnail || service.bannerImage} 
                      alt={service.title}
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{service.title}</div>
                    <div className="text-sm text-gray-500 line-clamp-2">{service.description}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="text-sm">
                    <div className="text-gray-500">Category</div>
                    <div className="font-medium text-gray-900">{service.categorySlug || service.category?.slug || '-'}</div>
                  </div>
                  <div className="text-sm">
                    <div className="text-gray-500">Price</div>
                    <div className="font-medium text-gray-900">{formatCurrency(service.basePrice)}</div>
                  </div>
                  <div className="text-sm">
                    <div className="text-gray-500">Duration</div>
                    <div className="font-medium text-gray-900">{service.duration ? `${service.duration} min` : '-'}</div>
                  </div>
                  <div className="text-sm">
                    <div className="text-gray-500">Status</div>
                    <div className="flex items-center gap-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="flex-1 px-4 py-2 bg-[#0F4D0F] hover:bg-[#004036] text-white rounded-lg font-medium text-sm transition-colors duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleServiceStatus(service)}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 ${
                      service.isActive 
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {service.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(service)}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors duration-200"
                  >
                    Delete
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
                <h3 className="mt-2 text-sm font-medium">No services found</h3>
                <p className="mt-1 text-sm">Try adjusting your search or filters</p>
              </div>
            </div>
          )}
        </div>

        {/* Professional Pagination */}
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
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
                First
              </button>
              
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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
                      className={`min-w-[40px] px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                        page === pageNum
                          ? 'bg-[#0F4D0F] text-white'
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
                      className="min-w-[40px] px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
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
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Next
                <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages || loading}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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

      {/* Add/Edit Service Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-3">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">{isEditing ? 'Edit Service' : 'Add New Service'}</h3>
                <button
                  onClick={() => { setShowModal(false); resetForm(); setIsEditing(false); setEditingId(null); setError(null); }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Service title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Slug</label>
                    <input
                      type="text"
                      name="serviceSlug"
                      value={formData.serviceSlug}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional - auto-generated from title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      name="categorySlug"
                      value={formData.categorySlug}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.slug || cat.id || cat.name || cat} value={cat.slug || cat.id || cat.name || cat}>
                          {cat.name || cat.slug || cat.id || cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="basePrice"
                      value={formData.basePrice}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
                    <input
                      type="url"
                      name="thumbnail"
                      value={formData.thumbnail}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image URL</label>
                    <input
                      type="url"
                      name="bannerImage"
                      value={formData.bannerImage}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/banner.jpg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Long Title</label>
                    <input
                      type="text"
                      name="longTitle"
                      value={formData.longTitle}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional longer title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 60"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                    <input
                      type="number"
                      name="sortOrder"
                      value={formData.sortOrder}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of the service"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Long Description</label>
                  <textarea
                    name="longDescription"
                    value={formData.longDescription}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Detailed description of the service"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">What's Included (one per line)</label>
                    <textarea
                      name="whatsIncludedText"
                      value={formData.whatsIncludedText}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Cleaner\nTools\nMaterials\nTransportation"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions (one per line)</label>
                    <textarea
                      name="termsText"
                      value={formData.termsText}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Cancellation policy\nRefund terms\nOther conditions"
                    />
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex flex-wrap gap-4 items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isFrequent"
                        checked={formData.isFrequent}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Frequent service</span>
                    </label>
                    
                    {formData.isFrequent && (
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                        <input
                          type="text"
                          name="frequency"
                          value={formData.frequency}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., weekly, monthly, quarterly"
                        />
                      </div>
                    )}
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isAvailable"
                        checked={formData.isAvailable}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Available</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); setIsEditing(false); setEditingId(null); setError(null); }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0F4D0F] text-white rounded-lg text-sm font-medium hover:bg-[#004036] transition-colors duration-200 flex items-center gap-2"
                  >
                    {isEditing ? (
                      <>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Update Service
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Service
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Services;