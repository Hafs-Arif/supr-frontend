import React, { useState, useEffect } from "react";
import { UserCog, Edit, Trash2, Plus, RefreshCw } from "lucide-react";
import api from '../../../utils/api';
import { useNavigate } from "react-router-dom";

function ManageAdmin() {
  const navigation = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/users', { params: { role: 'admin', page: 1, limit: 50 } });
      const body = res?.data || {};
      const list = Array.isArray(body.data?.users) ? body.data.users : (Array.isArray(body.users) ? body.users : (Array.isArray(body.data) ? body.data : []));
      setAdmins(list);
    } catch (err) {
      console.error('Failed to fetch admins', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load admins');
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const addAdmin = () => {
    navigation('/admin/add-admin');
  };
  return (
    <div className="p-6 min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold flex items-center space-x-2 text-gray-800 mb-3 sm:mb-0">
          <UserCog className="text-indigo-600" size={24} />
          <span>Manage Admins</span>
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAdmins}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button onClick={addAdmin} className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow transition">
            <Plus size={18} />
            Add New Admin
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Role
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {admins.length === 0 && !loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No admins found</td>
              </tr>
            ) : (
              admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium">{admin.name || admin.fullName || admin.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{admin.email}</td>
                  <td className="px-6 py-4 text-sm text-indigo-600 font-medium">{admin.role || admin.userRole || 'admin'}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button className="p-2 rounded-md bg-indigo-100 hover:bg-indigo-200 text-indigo-700 transition">
                      <Edit size={16} />
                    </button>
                    <button className="p-2 rounded-md bg-red-100 hover:bg-red-200 text-red-600 transition">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageAdmin;
