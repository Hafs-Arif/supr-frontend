import React, { useEffect, useState } from "react";
import api from "../../../utils/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState(null);
  const [total, setTotal] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [page, limit]);

  const statusBadge = (status) => {
    const s = String(status ?? '').toLowerCase();
    if (s === 'completed' || s === 'delivered' || s === 'done') return 'bg-green-100 text-green-800';
    if (s === 'pending' || s === 'pending_payment') return 'bg-yellow-100 text-yellow-800';
    if (s === 'in_progress' || s === 'in-progress' || s === 'ongoing') return 'bg-blue-100 text-blue-800';
    if (s === 'cancelled' || s === 'canceled') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (v) => {
    if (v == null) return '-';
    const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.-]+/g, ''));
    if (Number.isFinite(n)) return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return String(v);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Normalize order object to ensure `status` and `paymentStatus` are safe strings for rendering
  const normalizeOrder = (order) => {
    if (!order) return null;
    const copy = { ...order };
    const rawStatus = copy.status ?? copy.displayStatus ?? '';
    copy.status = (typeof rawStatus === 'object' && rawStatus !== null)
      ? (rawStatus.displayStatus ?? rawStatus.current ?? JSON.stringify(rawStatus))
      : rawStatus;

    const rawPayment = copy.paymentStatus ?? '';
    copy.paymentStatus = (typeof rawPayment === 'object' && rawPayment !== null)
      ? (rawPayment.displayStatus ?? rawPayment.current ?? JSON.stringify(rawPayment))
      : rawPayment;

    return copy;
  };

  async function fetchOrders() {
    setLoading(true);
    try {
      const params = { page, limit, sortBy: "created_at", sortDesc: true };
      const resp = await api.get(`/admin/homeservices/orders`, { params });
      const body = resp?.data || {};
      
      let items = [];
      if (Array.isArray(body)) items = body;
      else if (Array.isArray(body.data)) items = body.data;
      else if (Array.isArray(body.items)) items = body.items;
      else if (Array.isArray(body.data?.items)) items = body.data.items;

      setOrders(items);

      const totalFromResp = body.pagination?.total || body.meta?.total || body.total || body.data?.total || body.data?.pagination?.totalItems;
      const totalCount = typeof totalFromResp === 'number' ? totalFromResp : (typeof totalFromResp === 'string' && /^\d+$/.test(totalFromResp) ? parseInt(totalFromResp, 10) : items.length);
      
      setTotal(totalCount);
      setTotalPages(Math.ceil(totalCount / limit));
    } catch (err) {
      setMessage(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  async function viewOrderById(id) {
    setLoading(true);
    try {
      const resp = await api.get(`/admin/homeservices/orders/${id}`);
      setSelected(normalizeOrder(resp?.data?.data || resp?.data || null));
    } catch (err) {
      setMessage(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  async function viewOrderByNumber(orderNumber) {
    if (!orderNumber.trim()) {
      setMessage("Please enter an order number");
      return;
    }
    setLoading(true);
    try {
      const resp = await api.get(`/admin/homeservices/orders/number/${orderNumber}`);
      setSelected(normalizeOrder(resp?.data?.data || resp?.data || null));
      setMessage(null);
    } catch (err) {
      setMessage(err?.response?.data?.message || err.message);
      setSelected(null);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status, reason = "") {
    setLoading(true);
    try {
      const body = { status, reason };
      await api.patch(`/admin/homeservices/orders/${id}/status`, body);
      setMessage("Status updated successfully");
      viewOrderById(id);
      fetchOrders();
    } catch (err) {
      setMessage(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = searchTerm 
    ? orders.filter(order => 
        (order.orderNumber || order.order_number || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customerName || order.customer_name || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : orders;

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
        <p className="text-gray-600 mt-1">View and manage all home service orders</p>
      </div>

      {/* Alert Messages */}
      {message && (
        <div className="mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">{message}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setMessage(null)}
                className="text-blue-500 hover:text-blue-700"
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

      {/* Search and Controls */}
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
                placeholder="Search by order number, customer name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="orderNumberInput"
                placeholder="Search by order number..."
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && viewOrderByNumber(e.target.value)}
              />
            </div>
            
            <button
              onClick={() => viewOrderByNumber(document.getElementById("orderNumberInput").value)}
              className="px-4 py-2.5 bg-[#0F4D0F] hover:bg-[#004036] text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Find Order
            </button>
          </div>
          
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders List - 2/3 width on large screens */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Orders</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {total !== null && (
                      <>
                        Showing <span className="font-medium">{(page - 1) * limit + 1}-{Math.min(page * limit, total)}</span> of <span className="font-medium">{total}</span> orders
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => {
                      const rawStatus = order.status ?? order.displayStatus ?? '';
                      const status = (typeof rawStatus === 'object' && rawStatus !== null)
                        ? (rawStatus.displayStatus ?? rawStatus.current ?? JSON.stringify(rawStatus))
                        : rawStatus;
                      const lcStatus = String(status).toLowerCase();
                      const canCancel = !(lcStatus === 'completed' || lcStatus === 'delivered' || lcStatus === 'cancelled' || lcStatus === 'canceled');
                      
                      return (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900">
                                {order.orderNumber || order.order_number || order.order_no || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {formatDate(order.createdAt || order.created_at)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900">
                                {order.customerName || order.customer_name || order.customer?.name || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.customer?.email || 'No email'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {formatCurrency(order.totalPrice || order.total_price || order.pricing?.totalPrice)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusBadge(status)}`}>
                              {status || 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => viewOrderById(order.id)}
                                disabled={loading}
                                className="inline-flex items-center px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                View
                              </button>
                              {canCancel && (
                                <button
                                  onClick={() => updateStatus(order.id, 'cancelled', 'Admin cancelled')}
                                  disabled={loading}
                                  className="inline-flex items-center px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium">No orders found</h3>
                          <p className="mt-1 text-sm">Try adjusting your search or filter</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden p-4 space-y-4">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const rawStatus = order.status ?? order.displayStatus ?? '';
                  const status = (typeof rawStatus === 'object' && rawStatus !== null)
                    ? (rawStatus.displayStatus ?? rawStatus.current ?? JSON.stringify(rawStatus))
                    : rawStatus;
                  const lcStatus = String(status).toLowerCase();
                  const canCancel = !(lcStatus === 'completed' || lcStatus === 'delivered' || lcStatus === 'cancelled' || lcStatus === 'canceled');
                  
                  return (
                    <div key={order.id} className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {order.orderNumber || order.order_number || order.order_no || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {formatDate(order.createdAt || order.created_at)}
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusBadge(status)}`}>
                          {status || 'Unknown'}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm">
                          <span className="text-gray-500 w-24">Customer:</span>
                          <span className="font-medium text-gray-900">
                            {order.customerName || order.customer_name || order.customer?.name || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="text-gray-500 w-24">Amount:</span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(order.totalPrice || order.total_price || order.pricing?.totalPrice)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => viewOrderById(order.id)}
                          disabled={loading}
                          className="flex-1 px-4 py-2 bg-[#0F4D0F] hover:bg-[#004036] text-white rounded-lg font-medium text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          View Details
                        </button>
                        {canCancel && (
                          <button
                            onClick={() => updateStatus(order.id, 'cancelled', 'Admin cancelled')}
                            disabled={loading}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Cancel
                          </button>
                        )}
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
                    <h3 className="mt-2 text-sm font-medium">No orders found</h3>
                    <p className="mt-1 text-sm">Try adjusting your search</p>
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
        </div>

        {/* Order Details Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm h-full flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Order Details</h2>
              <p className="text-sm text-gray-600 mt-1">Selected order information</p>
            </div>
            
            <div className="flex-1 p-6 overflow-auto">
              {selected ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Order Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Order Number:</span>
                        <span className="font-medium text-gray-900">{selected.orderNumber || selected.order_number || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusBadge(selected.status)}`}>
                          {selected.status || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Created:</span>
                        <span className="text-gray-900">{formatDate(selected.createdAt || selected.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Customer Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Name:</span>
                        <span className="font-medium text-gray-900">{selected.customerName || selected.customer_name || selected.customer?.name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Email:</span>
                        <span className="text-gray-900">{selected.customer?.email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Phone:</span>
                        <span className="text-gray-900">{selected.customer?.phone || selected.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Payment Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Amount:</span>
                        <span className="font-medium text-lg text-gray-900">
                          {formatCurrency(selected.totalPrice || selected.total_price || selected.pricing?.totalPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Payment Status:</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          String(selected.paymentStatus ?? '').toLowerCase() === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selected.paymentStatus || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Raw Data</h3>
                    <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded-lg overflow-auto max-h-64">
                      {JSON.stringify(selected, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium">No order selected</h3>
                    <p className="mt-1 text-sm">Click on an order to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}