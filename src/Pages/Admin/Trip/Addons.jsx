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

function Addons() {
  const [addons, setAddons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const emptyForm = {
    addonSlug: '',
    title: '',
    categorySlug: '',
    description: '',
    whatsIncludedText: '',
    notesText: '',
    image: '',
    price: '',
    strikethroughPrice: '',
    isActive: true,
    isAvailable: true,
    sortOrder: 0,
  };

  const [formData, setFormData] = useState(emptyForm);

  const fetchAddons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = { page, limit, sortBy: "created_at", sortDesc: true };
      const res = await api.get('/admin/homeservices/addons', { params });
      const data = res.data;
      
      let list = [];
      
      // Handle different response formats
      if (Array.isArray(data)) {
        list = data;
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.data)) {
          list = data.data;
        } else if (Array.isArray(data.addons)) {
          list = data.addons;
        } else if (Array.isArray(data.items)) {
          list = data.items;
        } else if (Array.isArray(data.list)) {
          list = data.list;
        } else if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
          list = Object.values(data.data);
        }
      }
      
      setAddons(Array.isArray(list) ? list : []);
      
      const totalFromResp = data.pagination?.total || data.meta?.total || data.total || data.data?.total || data.data?.pagination?.totalItems;
      const totalCount = typeof totalFromResp === 'number' ? totalFromResp : (typeof totalFromResp === 'string' && /^\d+$/.test(totalFromResp) ? parseInt(totalFromResp, 10) : list.length);
      
      setTotal(totalCount);
      setTotalPages(Math.ceil(totalCount / limit));
      
    } catch (e) {
      console.error('Error fetching addons:', e);
      setError('Failed to load addons: ' + (e.response?.data?.message || e.message));
      setAddons([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, limit]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/admin/homeservices/categories');
      const data = res.data;
      let list = [];
      if (Array.isArray(data)) list = data;
      else if (data.data && Array.isArray(data.data)) list = data.data;
      else if (data.categories && Array.isArray(data.categories)) list = data.categories;

      if (Array.isArray(list) && list.length > 0 && typeof list[0] === 'string') {
        setCategories(list.map((s) => ({ slug: s, name: s })));
      } else {
        setCategories(Array.isArray(list) ? list : []);
      }
    } catch (e) {
      console.error(e);
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchAddons();
    fetchCategories();
  }, [fetchAddons, fetchCategories]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);

      if (!formData.title || formData.title.trim().length < 3) {
        setError('Title must be at least 3 characters');
        return;
      }
      if (!formData.categorySlug) {
        setError('Category is required');
        return;
      }
      
      const price = parseFloat(formData.price);
      if (!price || price <= 0) {
        setError('Price must be greater than 0');
        return;
      }
      
      let strikethroughPriceValue = null;
      if (formData.strikethroughPrice && formData.strikethroughPrice.trim() !== '') {
        strikethroughPriceValue = parseFloat(formData.strikethroughPrice);
        if (strikethroughPriceValue <= price) {
          setError('Original price (strikethrough) must be greater than current price');
          return;
        }
      }

      let finalAddonSlug = formData.addonSlug ? slugify(formData.addonSlug) : slugify(formData.title);
      if (finalAddonSlug.length < 3) {
        const suffix = Date.now().toString().slice(-4);
        finalAddonSlug = `${finalAddonSlug || 'addon'}-${suffix}`;
      }

      const payload = {
        title: formData.title.trim(),
        addonSlug: finalAddonSlug,
        categorySlug: slugify(formData.categorySlug),
        description: formData.description ? formData.description.trim() : '',
        whatsIncluded: formData.whatsIncludedText 
          ? formData.whatsIncludedText.split('\n').map((s) => s.trim()).filter(Boolean)
          : [],
        notes: formData.notesText 
          ? formData.notesText.split('\n').map((s) => s.trim()).filter(Boolean)
          : [],
        image: formData.image ? formData.image.trim() : '',
        price: price,
        isActive: Boolean(formData.isActive),
        isAvailable: Boolean(formData.isAvailable),
        sortOrder: formData.sortOrder ? parseInt(formData.sortOrder, 10) : 0,
      };

      if (strikethroughPriceValue && strikethroughPriceValue > price) {
        payload.strikethroughPrice = strikethroughPriceValue;
      }

      if (isEditing && editingId) {
        await api.put(`/admin/homeservices/addons/${editingId}`, payload);
      } else {
        await api.post('/admin/homeservices/addons', payload);
      }

      setShowModal(false);
      setIsEditing(false);
      setEditingId(null);
      setFormData(emptyForm);
      
      setRefreshing(true);
      await fetchAddons();
      
    } catch (e) {
      console.error('Error saving addon:', e);
      
      let msg = 'Failed to save addon';
      if (e.response) {
        if (e.response.data) {
          const d = e.response.data;
          if (d.message) {
            msg = d.message;
          }
        }
        
        if (e.response.status === 409) {
          msg = 'Addon with this slug already exists. Please use a different title or slug.';
        } else if (e.response.status === 400) {
          msg = 'Invalid data. Please check all required fields.';
        }
      } else if (e.message) {
        msg = e.message;
      }
      
      setError(msg);
    }
  };

  const handleEdit = (addon) => {
    const slug = addon.addonSlug || addon.slug || addon.id;
    
    const populateForm = async () => {
      let full = addon;
      
      if (!addon.description || (!addon.whatsIncluded && !addon.notes)) {
        try {
          const res = await api.get(`/admin/homeservices/addons/${slug}`);
          const d = res && res.data ? res.data : null;
          full = d && d.data ? d.data : (d || addon);
        } catch (err) {
          console.error('Failed to fetch addon details:', err);
          full = addon;
        }
      }

      setFormData({
        addonSlug: full.addonSlug || full.slug || '',
        title: full.title || '',
        categorySlug: full.categorySlug || (full.category && (full.category.slug || full.category.name)) || '',
        description: full.description || '',
        whatsIncludedText: Array.isArray(full.whatsIncluded) ? full.whatsIncluded.join('\n') : '',
        notesText: Array.isArray(full.notes) ? full.notes.join('\n') : '',
        image: full.image || full.imageUrl || '',
        price: full.price || '',
        strikethroughPrice: full.strikethroughPrice || '',
        isActive: full.isActive ?? true,
        isAvailable: full.isAvailable ?? true,
        sortOrder: full.sortOrder || 0,
      });
      
      setIsEditing(true);
      setEditingId(slug);
      setError(null);
      setShowModal(true);
    };

    populateForm();
  };

  const handleDelete = async (addon) => {
    if (!window.confirm('Are you sure you want to delete this addon?')) return;
    try {
      const slug = addon.addonSlug || addon.slug || addon.id;
      await api.delete(`/admin/homeservices/addons/${slug}`);
      setRefreshing(true);
      await fetchAddons();
    } catch (e) {
      console.error(e);
      setError('Failed to delete addon: ' + (e.response?.data?.message || e.message));
    }
  };

  const toggleAddonStatus = async (addon) => {
    try {
      const slug = addon.addonSlug || addon.slug || addon.id;
      const newState = !addon.isActive;
      await api.patch(`/admin/homeservices/addons/${slug}/status`, { isActive: newState });
      setRefreshing(true);
      await fetchAddons();
    } catch (e) {
      console.error('Failed to toggle addon status', e);
      setError('Failed to update addon status: ' + (e.response?.data?.message || e.message));
    }
  };

  const openAdd = () => {
    setError(null);
    setFormData(emptyForm);
    setIsEditing(false);
    setEditingId(null);
    setShowModal(true);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAddons();
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '-';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const calculateDiscount = (price, strikethroughPrice) => {
    if (!strikethroughPrice || strikethroughPrice <= price) return 0;
    return Math.round(((strikethroughPrice - price) / strikethroughPrice) * 100);
  };

  const filteredAddons = addons.filter(addon => {
    const matchesSearch = searchTerm === '' || 
      (addon.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (addon.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (addon.categorySlug || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && addon.isActive) ||
      (statusFilter === 'inactive' && !addon.isActive);
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Addons Management</h1>
        <p className="text-gray-600 mt-1">Manage additional services and extras</p>
      </div>

      {/* Alert Messages */}
      {error && !showModal && (
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
                placeholder="Search addons by title, description, or category..."
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
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <svg className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            
            <button
              onClick={openAdd}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Addon
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
              <h2 className="text-lg font-semibold text-gray-800">Addons</h2>
              <p className="text-sm text-gray-600 mt-1">
                {total > 0 && (
                  <>
                    Showing <span className="font-medium">{(page - 1) * limit + 1}-{Math.min(page * limit, filteredAddons.length)}</span> of <span className="font-medium">{filteredAddons.length}</span> addons
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Addon Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sort Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAddons.length > 0 ? (
                filteredAddons.map((addon) => {
                  const discount = calculateDiscount(addon.price, addon.strikethroughPrice);
                  
                  return (
                    <tr key={addon.id || addon.addonSlug || addon.slug} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-3">
                          {(addon.image || addon.imageUrl) ? (
                            <img 
                              className="h-10 w-10 rounded-lg object-cover" 
                              src={addon.image || addon.imageUrl} 
                              alt={addon.title}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900">{addon.title}</div>
                            <div className="text-sm text-gray-500 truncate">{addon.description || 'No description'}</div>
                            <div className="text-xs text-gray-400 mt-1">{addon.addonSlug || addon.slug || 'No slug'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {addon.categorySlug || (addon.category && (addon.category.slug || addon.category.name)) || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">
                            {formatCurrency(addon.price)}
                          </div>
                          {addon.strikethroughPrice && addon.strikethroughPrice > addon.price && (
                            <>
                              <div className="text-sm text-red-500 line-through">
                                {formatCurrency(addon.strikethroughPrice)}
                              </div>
                              <div className="text-xs font-medium text-green-600">
                                {discount}% off
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {addon.sortOrder || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            addon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {addon.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            addon.isAvailable ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {addon.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(addon)}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors duration-200"
                          >
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => toggleAddonStatus(addon)}
                            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                              addon.isActive 
                                ? 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700' 
                                : 'bg-green-50 hover:bg-green-100 text-green-700'
                            }`}
                          >
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              {addon.isActive ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              )}
                            </svg>
                            {addon.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDelete(addon)}
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
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium">No addons found</h3>
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
          {filteredAddons.length > 0 ? (
            filteredAddons.map((addon) => {
              
              return (
                <div key={addon.id || addon.addonSlug || addon.slug} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start space-x-3 mb-3">
                    {(addon.image || addon.imageUrl) ? (
                      <img 
                        className="h-12 w-12 rounded-lg object-cover" 
                        src={addon.image || addon.imageUrl} 
                        alt={addon.title}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{addon.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-2">{addon.description || 'No description'}</div>
                      <div className="text-xs text-gray-400 mt-1">{addon.addonSlug || addon.slug || 'No slug'}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="text-sm">
                      <div className="text-gray-500">Category</div>
                      <div className="font-medium text-gray-900">
                        {addon.categorySlug || (addon.category && (addon.category.slug || addon.category.name)) || '-'}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-gray-500">Price</div>
                      <div className="font-medium text-gray-900">
                        {formatCurrency(addon.price)}
                        {addon.strikethroughPrice && addon.strikethroughPrice > addon.price && (
                          <div className="text-xs text-red-500 line-through">{formatCurrency(addon.strikethroughPrice)}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-gray-500">Sort Order</div>
                      <div className="font-medium text-gray-900">{addon.sortOrder || 0}</div>
                    </div>
                    <div className="text-sm">
                      <div className="text-gray-500">Status</div>
                      <div className="flex items-center gap-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          addon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {addon.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(addon)}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleAddonStatus(addon)}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 ${
                        addon.isActive 
                          ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {addon.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(addon)}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium">No addons found</h3>
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-3">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">{isEditing ? 'Edit Addon' : 'Add New Addon'}</h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setFormData(emptyForm);
                    setIsEditing(false);
                    setEditingId(null);
                    setError(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
              {error && (
                <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              
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
                      required 
                      minLength="3"
                      placeholder="Addon title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Custom Slug (optional)</label>
                    <input 
                      type="text" 
                      name="addonSlug" 
                      value={formData.addonSlug} 
                      onChange={handleChange} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Auto-generated from title"
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
                        <option key={cat.slug || cat.id || cat.name} value={cat.slug || cat.id || cat.name}>
                          {cat.name || cat.slug || cat.id}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0.01" 
                      name="price" 
                      value={formData.price} 
                      onChange={handleChange} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required 
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (for discount)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      name="strikethroughPrice" 
                      value={formData.strikethroughPrice} 
                      onChange={handleChange} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Leave empty for no discount"
                    />
                    <p className="text-xs text-gray-500 mt-1">Must be greater than price to show discount</p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    rows="3" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of the addon"
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
                      placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes (one per line)</label>
                    <textarea 
                      name="notesText" 
                      value={formData.notesText} 
                      onChange={handleChange} 
                      rows="4" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Note 1&#10;Note 2"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input 
                    type="url" 
                    name="image" 
                    value={formData.image} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex flex-wrap gap-4 items-center">
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
                    onClick={() => {
                      setShowModal(false);
                      setFormData(emptyForm);
                      setIsEditing(false);
                      setEditingId(null);
                      setError(null);
                    }} 
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                  >
                    {isEditing ? (
                      <>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Update Addon
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Addon
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

export default Addons;