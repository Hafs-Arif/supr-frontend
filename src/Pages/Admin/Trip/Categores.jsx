import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
function Categories() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    iconUrl: '',
    bannerImage: '', 
    isActive: true,
    sortOrder: 0,
    highlights: []
  });
  const [newHighlight, setNewHighlight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Unauthorized — please login first');
        setCategories([]);
        return;
      }
      const res = await api.get(`/admin/homeservices/categories`);
      const result = res.data;
      const categoriesArray = Array.isArray(result) ? result : (result.data || result.categories || []);
      // backend may return []string of slugs — normalize to objects
      if (Array.isArray(categoriesArray) && categoriesArray.length > 0 && typeof categoriesArray[0] === 'string') {
        setCategories(categoriesArray.map(s => ({ slug: s, name: s })));
      } else {
        setCategories(Array.isArray(categoriesArray) ? categoriesArray : []);
      }
      setError('');
    } catch (error) {
      console.error('Error fetching categories:', error);
      const status = error?.response?.status;
      if (status === 401) setError('Unauthorized — invalid or missing token (please login)');
      else if (status === 404) setError('Categories endpoint not found (check API root)');
      else setError('Categories fetch failed: ' + (error.message || 'Unknown error'));
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };



const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Unauthorized — please login first');
      return;
    }
    // Backend supports admin-create at /services/admin/categories — use that for creating/updating
    if (isEditing && editingId) {
      // If we have numeric id use it, otherwise try slug-based update (may not exist)
      const idOrSlug = editingId;
      await api.put(`/services/admin/categories/${idOrSlug}`, formData);
    } else {
      await api.post(`/services/admin/categories`, formData);
    }
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    fetchCategories();
  } catch (error) {
    console.error('Error creating/updating category:', error);
    const status = error?.response?.status;
    if (status === 401) setError('Unauthorized — invalid or missing token (please login)');
    else if (status === 404) setError('Create/Update endpoint not found (check API root)');
    else setError('Create/Update failed: ' + (error.message || 'Unknown error'));
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

  const handleEdit = (category) => {
    setFormData({
      name: category.name || '',
      description: category.description || '',
      iconUrl: category.iconUrl || '',
      bannerImage: category.bannerImage || '',
      isActive: category.isActive ?? true,
      sortOrder: category.sortOrder || 0,
      highlights: category.highlights || []
    });
    setIsEditing(true);
    setEditingId(category.id || category.slug);
    setShowModal(true);
  };

  const handleDelete = async (category) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/admin/homeservices/categories/${category.id || category.slug}`);
      fetchCategories();
    } catch (err) {
      console.error('Failed to delete category', err);
      alert('Failed to delete category');
    }
  };

  const addHighlight = () => {
    if (newHighlight.trim()) {
      setFormData(prev => ({
        ...prev,
        highlights: [...prev.highlights, newHighlight.trim()]
      }));
      setNewHighlight('');
    }
  };

  const removeHighlight = (index) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#0F4D0F] text-white px-4 py-2 rounded-md hover:bg-[#004036]"
        >
          Add Category
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

      {/* Categories Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No categories found
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Icon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sort Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Highlights
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
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {category.iconUrl ? (
                      <img 
                        className="h-10 w-10 rounded-full object-cover" 
                        src={category.iconUrl} 
                        alt={category.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">No Icon</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                    <div className="truncate" title={category.description}>
                      {category.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.sortOrder}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {category.highlights && category.highlights.length > 0 ? (
                        category.highlights.map((highlight, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            {highlight}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs">No highlights</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(category)} className="text-sm px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Edit</button>
                      <button onClick={() => handleDelete(category)} className="text-sm px-2 py-1 bg-red-100 text-red-800 rounded">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add New Category</h3>
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
                      placeholder="Category name"
                    />
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
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Category description"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Highlights</label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={newHighlight}
                      onChange={(e) => setNewHighlight(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addHighlight();
                        }
                      }}
                      placeholder="Enter a highlight"
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={addHighlight}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-8">
                    {formData.highlights.map((highlight, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        {highlight}
                        <button
                          type="button"
                          onClick={() => removeHighlight(index)}
                          className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
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
                    <span className="ml-2 text-sm text-gray-700">Active Category</span>
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
                    {loading ? 'Creating...' : 'Create Category'}
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

export default Categories;