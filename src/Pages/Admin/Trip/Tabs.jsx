// Tabs.js
import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';

function Tabs() {
  const [tabs, setTabs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    description: '',
    iconUrl: '',
    bannerTitle: '',
    bannerDescription: '', // Changed from bannerDesc to bannerDescription
    bannerImage: '',
    isActive: true,
    sortOrder: 0
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTabs();
    fetchCategories();
  }, []);

  const fetchTabs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/homeservices/tabs');
      const result = res?.data || {};
      const tabsArray = result.data || result || [];
      setTabs(tabsArray);
      setError('');
    } catch (error) {
      console.error('Error fetching tabs:', error);
      setError('Tabs fetch karne mein error aaya');
      setTabs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/homeservices/categories');
      const result = res?.data || {};
      const categoriesArray = result.data || result || [];
      setCategories(Array.isArray(categoriesArray) ? categoriesArray : []);
      setError('');
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Categories fetch karne mein error aaya');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Prepare data according to Go model structure
      const requestData = {
        categoryId: parseInt(formData.categoryId), // Convert to number
        name: formData.name,
        description: formData.description,
        iconUrl: formData.iconUrl || null,
        bannerTitle: formData.bannerTitle || null,
        bannerDescription: formData.bannerDescription || null, // Correct field name
        bannerImage: formData.bannerImage || null,
        isActive: formData.isActive,
        sortOrder: parseInt(formData.sortOrder) || 0
      };

      console.log('Sending tab data:', requestData);

      const res = await api.post('/admin/homeservices/tabs', requestData);
      const result = res?.data || {};
      if (res.status >= 200 && res.status < 300) {
        setShowModal(false);
        setFormData({
          categoryId: '',
          name: '',
          description: '',
          iconUrl: '',
          bannerTitle: '',
          bannerDescription: '',
          bannerImage: '',
          isActive: true,
          sortOrder: 0
        });
        fetchTabs();
        alert('Tab successfully created!');
      } else {
        // Handle different error formats
        const errorMessage = result.message || 
                           result.error || 
                           'Tab create karne mein error aaya';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error creating tab:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              name === 'sortOrder' ? parseInt(value) || 0 : value
    }));
  };

  // Delete tab function
  const deleteTab = async (tabId) => {
    if (window.confirm('Kya aap ye tab delete karna chahte hain?')) {
      try {
        const res = await api.delete(`/admin/homeservices/tabs/${tabId}`);
        if (res.status >= 200 && res.status < 300) {
          fetchTabs(); // Refresh list
          alert('Tab successfully deleted!');
        } else {
          throw new Error('Delete operation failed');
        }
      } catch (error) {
        console.error('Error deleting tab:', error);
        alert('Error: ' + error.message);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Service Tabs</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#0F4D0F] text-white px-4 py-2 rounded-md hover:bg-[#004036]"
        >
          Add Tab
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-4">Loading...</div>
      )}

      {/* Tabs Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {tabs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No tabs found
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sort Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tabs.map((tab) => (
                <tr key={tab.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {tab.iconUrl && (
                        <img 
                          className="h-10 w-10 rounded-full object-cover mr-3" 
                          src={tab.iconUrl} 
                          alt={tab.name}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="text-sm font-medium text-gray-900">{tab.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tab.category?.name || 'No category'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {tab.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tab.sortOrder}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      tab.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {tab.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => deleteTab(tab.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Tab Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add New Tab</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder="Enter tab name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category *</label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Category</option>
                      {Array.isArray(categories) && categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                    <input
                      type="number"
                      name="sortOrder"
                      value={formData.sortOrder}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Icon URL</label>
                    <input
                      type="url"
                      name="iconUrl"
                      value={formData.iconUrl}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/icon.png"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tab description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Banner Title</label>
                    <input
                      type="text"
                      name="bannerTitle"
                      value={formData.bannerTitle}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Banner title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Banner Description</label>
                    <input
                      type="text"
                      name="bannerDescription" // Changed from bannerDesc to bannerDescription
                      value={formData.bannerDescription}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Banner description"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Banner Image URL</label>
                  <input
                    type="url"
                    name="bannerImage"
                    value={formData.bannerImage}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/banner.jpg"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active Tab</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-[#0F4D0F] text-white rounded-md text-sm font-medium hover:bg-[#004036] disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : 'Create Tab'}
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

export default Tabs;