import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  X,
  Image as ImageIcon,
  Upload,
  Save,
  Megaphone,
  Gift,
  MoreVertical
} from 'lucide-react';

const BannersAndOffers = () => {
  const [activeTab, setActiveTab] = useState('banners');
  const [banners, setBanners] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    image: null,
    startDate: '',
    endDate: '',
    status: 'active',
    position: 'home_top'
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(null);

  // Mock data - Banners
  const mockBanners = [
    {
      id: 1,
      title: 'Summer Special',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=300&fit=crop',
      status: 'active',
      startDate: '2024-11-01',
      endDate: '2024-11-30',
      position: 'home_top',
      type: 'banner',
      timeLeft: '29 days left',
      createdAt: '2024-10-25'
    },
    {
      id: 2,
      title: 'New User Offer',
      image: 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=600&h=300&fit=crop',
      status: 'active',
      startDate: '2024-11-01',
      endDate: '2024-11-15',
      position: 'home_middle',
      type: 'banner',
      timeLeft: '14 days left',
      createdAt: '2024-10-28'
    }
  ];

  // Mock data - Offers
  const mockOffers = [
    {
      id: 101,
      title: '50% Off on Cleaning',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=300&fit=crop',
      status: 'active',
      startDate: '2024-11-01',
      endDate: '2024-11-07',
      type: 'offer',
      timeLeft: '6 days left',
      createdAt: '2024-10-30'
    },
    {
      id: 102,
      title: 'Free Delivery',
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&h=300&fit=crop',
      status: 'active',
      startDate: '2024-11-01',
      endDate: '2024-11-30',
      type: 'offer',
      timeLeft: '29 days left',
      createdAt: '2024-10-28'
    }
  ];

  // Banner positions
  const bannerPositions = [
    { value: 'home_top', label: 'Home Page - Top' },
    { value: 'home_middle', label: 'Home Page - Middle' },
    { value: 'home_bottom', label: 'Home Page - Bottom' },
    { value: 'category_top', label: 'Category Page - Top' },
    { value: 'service_top', label: 'Service Page - Top' }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setBanners(mockBanners);
      setOffers(mockOffers);
      setLoading(false);
    }, 1000);
  }, []);

  // Calculate time left
  const calculateTimeLeft = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end - now;
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} days ${hours} hrs left`;
    return `${hours} hours left`;
  };

  // Update time left every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setBanners(prev => prev.map(banner => ({
        ...banner,
        timeLeft: calculateTimeLeft(banner.endDate)
      })));
      setOffers(prev => prev.map(offer => ({
        ...offer,
        timeLeft: calculateTimeLeft(offer.endDate)
      })));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Filter items based on search
  const filteredBanners = banners.filter(banner =>
    banner.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOffers = offers.filter(offer =>
    offer.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      image: null,
      startDate: '',
      endDate: '',
      status: 'active',
      position: 'home_top'
    });
    setImagePreview(null);
    setSelectedItem(null);
  };

  // Open modal for adding new item
  const handleAddItem = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Open modal for editing item
  const handleEditItem = (item) => {
    setFormData({
      title: item.title,
      image: null,
      startDate: item.startDate,
      endDate: item.endDate,
      status: item.status,
      position: item.position || 'home_top'
    });
    setImagePreview(item.image);
    setSelectedItem(item);
    setIsModalOpen(true);
    setMobileMenuOpen(null);
  };

  // Open delete confirmation modal
  const handleDeleteItem = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
    setMobileMenuOpen(null);
  };

  // Toggle item status
  const handleToggleStatus = (item) => {
    const updatedItem = { 
      ...item, 
      status: item.status === 'active' ? 'inactive' : 'active' 
    };
    
    if (item.type === 'banner') {
      setBanners(banners.map(b => b.id === item.id ? updatedItem : b));
    } else {
      setOffers(offers.map(o => o.id === item.id ? updatedItem : o));
    }
    setMobileMenuOpen(null);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newItem = {
      id: selectedItem ? selectedItem.id : (activeTab === 'banners' ? banners.length + 1 : offers.length + 101),
      ...formData,
      image: imagePreview,
      type: activeTab === 'banners' ? 'banner' : 'offer',
      timeLeft: calculateTimeLeft(formData.endDate),
      createdAt: selectedItem ? selectedItem.createdAt : new Date().toISOString().split('T')[0]
    };

    if (selectedItem) {
      // Update existing item
      if (activeTab === 'banners') {
        setBanners(banners.map(b => b.id === selectedItem.id ? newItem : b));
      } else {
        setOffers(offers.map(o => o.id === selectedItem.id ? newItem : o));
      }
    } else {
      // Add new item
      if (activeTab === 'banners') {
        setBanners([...banners, newItem]);
      } else {
        setOffers([...offers, newItem]);
      }
    }
    
    setIsModalOpen(false);
    resetForm();
  };

  // Handle item deletion
  const handleConfirmDelete = () => {
    if (selectedItem) {
      if (selectedItem.type === 'banner') {
        setBanners(banners.filter(b => b.id !== selectedItem.id));
      } else {
        setOffers(offers.filter(o => o.id !== selectedItem.id));
      }
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
    }
  };

  // Get status badge color
  const getStatusColor = (status, endDate) => {
    if (new Date(endDate) < new Date()) {
      return 'bg-red-100 text-red-800';
    }
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  // Get status text
  const getStatusText = (status, endDate) => {
    if (new Date(endDate) < new Date()) {
      return 'Expired';
    }
    return status === 'active' ? 'Active' : 'Inactive';
  };

  // Format date for mobile
  const formatDateForMobile = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Banners & Offers</h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Manage promotional banners and special offers</p>
            </div>
            <button
              onClick={handleAddItem}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm sm:text-base w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Add {activeTab === 'banners' ? 'Banner' : 'Offer'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-4 sm:mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('banners')}
                className={`flex-1 py-3 sm:py-4 px-3 sm:px-6 text-center border-b-2 font-medium text-xs sm:text-sm ${
                  activeTab === 'banners'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Megaphone className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                Banners ({banners.length})
              </button>
              <button
                onClick={() => setActiveTab('offers')}
                className={`flex-1 py-3 sm:py-4 px-3 sm:px-6 text-center border-b-2 font-medium text-xs sm:text-sm ${
                  activeTab === 'offers'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Gift className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                Offers ({offers.length})
              </button>
            </nav>
          </div>

          {/* Controls Bar */}
          <div className="p-3 sm:p-4 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-start lg:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab} by title...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                />
              </div>
            </div>
          </div>

          {/* Banners Table - Desktop */}
          {activeTab === 'banners' && (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Banner
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time Left
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBanners.map((banner) => (
                      <tr key={banner.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 h-12 w-16 sm:h-16 sm:w-24 bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={banner.image}
                                alt={banner.title}
                                className="h-12 w-16 sm:h-16 sm:w-24 object-cover"
                              />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {banner.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(banner.startDate).toLocaleDateString()} - {new Date(banner.endDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {bannerPositions.find(p => p.value === banner.position)?.label}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(banner.status, banner.endDate)}`}>
                            {getStatusText(banner.status, banner.endDate)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">
                          {banner.timeLeft}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditItem(banner)}
                              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
                            >
                              <Edit className="w-3 h-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleStatus(banner)}
                              className={`flex items-center gap-1 px-3 py-1 rounded-md transition text-sm ${
                                banner.status === 'active' && new Date(banner.endDate) >= new Date()
                                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              {banner.status === 'active' && new Date(banner.endDate) >= new Date() ? (
                                <>
                                  <Pause className="w-3 h-3" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <Play className="w-3 h-3" />
                                  Activate
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteItem(banner)}
                              className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards for Banners */}
              <div className="lg:hidden">
                {filteredBanners.map((banner) => (
                  <div key={banner.id} className="border-b border-gray-200 last:border-b-0">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="flex-shrink-0 h-16 w-20 bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={banner.image}
                              alt={banner.title}
                              className="h-16 w-20 object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {banner.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDateForMobile(banner.startDate)} - {formatDateForMobile(banner.endDate)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {bannerPositions.find(p => p.value === banner.position)?.label}
                            </p>
                          </div>
                        </div>
                        <div className="relative">
                          <button
                            onClick={() => setMobileMenuOpen(mobileMenuOpen === banner.id ? null : banner.id)}
                            className="p-1 rounded-lg hover:bg-gray-100 transition"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                          </button>
                          
                          {mobileMenuOpen === banner.id && (
                            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-32">
                              <button
                                onClick={() => handleEditItem(banner)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                              >
                                <Edit className="w-3 h-3" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleToggleStatus(banner)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                {banner.status === 'active' && new Date(banner.endDate) >= new Date() ? (
                                  <>
                                    <Pause className="w-3 h-3" />
                                    Pause
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-3 h-3" />
                                    Activate
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteItem(banner)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(banner.status, banner.endDate)}`}>
                          {getStatusText(banner.status, banner.endDate)}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {banner.timeLeft}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredBanners.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <Megaphone className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No banners found</h3>
                  <p className="mt-1 text-sm text-gray-500 px-4">
                    {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by creating your first banner.'}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={handleAddItem}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Banner
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* Offers Table - Desktop */}
          {activeTab === 'offers' && (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Offer
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time Left
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOffers.map((offer) => (
                      <tr key={offer.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 h-12 w-16 sm:h-16 sm:w-24 bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={offer.image}
                                alt={offer.title}
                                className="h-12 w-16 sm:h-16 sm:w-24 object-cover"
                              />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {offer.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(offer.startDate).toLocaleDateString()} - {new Date(offer.endDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(offer.status, offer.endDate)}`}>
                            {getStatusText(offer.status, offer.endDate)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">
                          {offer.timeLeft}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditItem(offer)}
                              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
                            >
                              <Edit className="w-3 h-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleStatus(offer)}
                              className={`flex items-center gap-1 px-3 py-1 rounded-md transition text-sm ${
                                offer.status === 'active' && new Date(offer.endDate) >= new Date()
                                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              {offer.status === 'active' && new Date(offer.endDate) >= new Date() ? (
                                <>
                                  <Pause className="w-3 h-3" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <Play className="w-3 h-3" />
                                  Activate
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteItem(offer)}
                              className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards for Offers */}
              <div className="lg:hidden">
                {filteredOffers.map((offer) => (
                  <div key={offer.id} className="border-b border-gray-200 last:border-b-0">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="flex-shrink-0 h-16 w-20 bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={offer.image}
                              alt={offer.title}
                              className="h-16 w-20 object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {offer.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDateForMobile(offer.startDate)} - {formatDateForMobile(offer.endDate)}
                            </p>
                          </div>
                        </div>
                        <div className="relative">
                          <button
                            onClick={() => setMobileMenuOpen(mobileMenuOpen === offer.id ? null : offer.id)}
                            className="p-1 rounded-lg hover:bg-gray-100 transition"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                          </button>
                          
                          {mobileMenuOpen === offer.id && (
                            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-32">
                              <button
                                onClick={() => handleEditItem(offer)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                              >
                                <Edit className="w-3 h-3" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleToggleStatus(offer)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                {offer.status === 'active' && new Date(offer.endDate) >= new Date() ? (
                                  <>
                                    <Pause className="w-3 h-3" />
                                    Pause
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-3 h-3" />
                                    Activate
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteItem(offer)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(offer.status, offer.endDate)}`}>
                          {getStatusText(offer.status, offer.endDate)}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {offer.timeLeft}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredOffers.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <Gift className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No offers found</h3>
                  <p className="mt-1 text-sm text-gray-500 px-4">
                    {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by creating your first offer.'}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={handleAddItem}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Offer
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                {selectedItem ? 'Edit' : 'Add New'} {activeTab === 'banners' ? 'Banner' : 'Offer'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {activeTab === 'banners' ? 'Banner' : 'Offer'} Image *
                  </label>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
                    <div className="flex-shrink-0 h-24 w-32 sm:h-32 sm:w-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 mx-auto sm:mx-0">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-24 w-32 sm:h-32 sm:w-48 object-cover"
                        />
                      ) : (
                        <div className="h-24 w-32 sm:h-32 sm:w-48 flex items-center justify-center text-gray-400">
                          <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                      )}
                    </div>
                    <div className="text-center sm:text-left">
                      <label className="cursor-pointer inline-block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          required={!selectedItem}
                        />
                        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm">
                          <Upload className="w-4 h-4" />
                          Upload Image
                        </div>
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        Recommended: 600x300px, JPG, PNG
                      </p>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                    placeholder={`Enter ${activeTab === 'banners' ? 'banner' : 'offer'} title`}
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="datetime-local"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="datetime-local"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Banner Position */}
                {activeTab === 'banners' && (
                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                      Banner Position *
                    </label>
                    <select
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                    >
                      {bannerPositions.map(position => (
                        <option key={position.value} value={position.value}>
                          {position.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-sm sm:text-base order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm sm:text-base order-1 sm:order-2"
                >
                  <Save className="w-4 h-4" />
                  {selectedItem ? 'Update' : 'Create'} {activeTab === 'banners' ? 'Banner' : 'Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                Delete {selectedItem.type === 'banner' ? 'Banner' : 'Offer'}
              </h2>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-shrink-0 h-12 w-16 sm:h-16 sm:w-24 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.title}
                    className="h-12 w-16 sm:h-16 sm:w-24 object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">{selectedItem.title}</h3>
                </div>
              </div>

              <p className="text-gray-700 text-sm sm:text-base mb-4">
                Are you sure you want to delete this {selectedItem.type}? This action cannot be undone.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 p-4 sm:p-6 border-t border-gray-200">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-sm sm:text-base order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm sm:text-base order-1 sm:order-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete {selectedItem.type === 'banner' ? 'Banner' : 'Offer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannersAndOffers;