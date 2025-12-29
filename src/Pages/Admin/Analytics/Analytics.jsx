import React, { useEffect, useState } from "react";
import api from "../../../utils/api";

function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

export default function Analytics() {
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return formatDate(d);
  });
  const [toDate, setToDate] = useState(() => formatDate(new Date()));
  const [groupBy, setGroupBy] = useState("day");
  const [overview, setOverview] = useState(null);
  const [providers, setProviders] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchAll() {
    setLoading(true);
    setError(null);
    try {
      const params = { fromDate, toDate, groupBy };

      const [oResp, pResp, rResp] = await Promise.all([
        api.get(`/admin/homeservices/analytics/overview`, { params }),
        api.get(`/admin/homeservices/analytics/providers`, { params: { fromDate, toDate, limit: 20 } }),
        api.get(`/admin/homeservices/analytics/revenue`, { params }),
      ]);

      setOverview(oResp?.data?.data || null);
      setProviders(pResp?.data?.data || null);
      setRevenue(rResp?.data?.data || null);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4">Admin — Homeservices Analytics</h2>

      <div className="flex gap-2 items-end mb-4">
        <label className="flex flex-col text-sm">
          From
          <input value={fromDate} onChange={(e) => setFromDate(e.target.value)} type="date" className="mt-1 p-2 border rounded" />
        </label>
        <label className="flex flex-col text-sm">
          To
          <input value={toDate} onChange={(e) => setToDate(e.target.value)} type="date" className="mt-1 p-2 border rounded" />
        </label>
        <label className="flex flex-col text-sm">
          Group By
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)} className="mt-1 p-2 border rounded">
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </label>
        <button onClick={fetchAll} disabled={loading} className="ml-2 px-3 py-2 bg-indigo-600 text-white rounded">{loading ? 'Loading...' : 'Refetch'}</button>
      </div>

      {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-medium mb-2">Overview</h3>
          {overview ? (
            <pre className="text-xs overflow-auto max-h-80">{JSON.stringify(overview, null, 2)}</pre>
          ) : (
            <div className="text-sm text-gray-500">No overview data</div>
          )}
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-medium mb-2">Providers</h3>
          {providers ? (
            <div>
              <div className="text-sm text-gray-600 mb-2">Total: {providers.total}</div>
              <pre className="text-xs overflow-auto max-h-72">{JSON.stringify(providers.providers || providers, null, 2)}</pre>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No provider analytics</div>
          )}
        </div>

        <div className="bg-white p-4 rounded shadow md:col-span-2">
          <h3 className="font-medium mb-2">Revenue Report</h3>
          {revenue ? (
            <pre className="text-xs overflow-auto max-h-96">{JSON.stringify(revenue, null, 2)}</pre>
          ) : (
            <div className="text-sm text-gray-500">No revenue data</div>
          )}
        </div>
      </div>
    </div>
  );
}
