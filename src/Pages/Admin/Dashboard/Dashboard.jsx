import React, { useEffect, useState } from "react";
import {
  Users,
  Truck,
  Home,
  MessageSquare,
  Package,
  RefreshCw,
  DollarSign,
  ShoppingCart,
  Clock,
  TrendingUp,
  MapPin,
  Shield,
  Star,
  Calendar,
  Smartphone,
} from "lucide-react";
import api from "../../../utils/api";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#7c3aed", "#06b6d4", "#f97316", "#ef4444", "#10b981", "#8b5cf6"];

// // Updated mock data for different time periods
// const mockData = {
//   daily: {
//     summary: {
//       users: 3248,
//       riders: 514,
//       providers: 186,
//       complaints: 42,
//       bookings: 2845,
//       revenue: 89230,
//       pendingBookings: 38,
//       completedBookings: 2654,
//       activeServices: 67,
//       avgServiceTime: 45,
//       popularServices: 8,
//       serviceAreas: 18,
//       rating: 4.7,
//       cancelledBookings: 153,
//     },
//     timeseries: [
//       { date: "10-27", users: 2950, riders: 480, providers: 170, bookings: 320, revenue: 8200 },
//       { date: "10-28", users: 3020, riders: 485, providers: 172, bookings: 345, revenue: 8850 },
//       { date: "10-29", users: 3080, riders: 492, providers: 175, bookings: 380, revenue: 9450 },
//       { date: "10-30", users: 3140, riders: 498, providers: 178, bookings: 410, revenue: 10100 },
//       { date: "10-31", users: 3190, riders: 505, providers: 180, bookings: 435, revenue: 10750 },
//       { date: "11-01", users: 3220, riders: 510, providers: 183, bookings: 460, revenue: 11350 },
//       { date: "11-02", users: 3248, riders: 514, providers: 186, bookings: 495, revenue: 12130 },
//     ],
//     bookingStatus: [
//       { name: "Completed", value: 2654, color: "#10b981" },
//       { name: "Pending", value: 38, color: "#f59e0b" },
//       { name: "In Progress", value: 67, color: "#3b82f6" },
//       { name: "Cancelled", value: 153, color: "#ef4444" },
//     ],
//     popularServices: [
//       { name: "Ride Service", bookings: 845 },
//       { name: "Home Cleaning", bookings: 678 },
//       { name: "AC Repair", bookings: 492 },
//       { name: "Plumbing", bookings: 365 },
//       { name: "Electrical", bookings: 342 },
//       { name: "Other Services", bookings: 423 },
//     ]
//   },
//   weekly: {
//     summary: {
//       users: 15842,
//       riders: 514,
//       providers: 186,
//       complaints: 215,
//       bookings: 12845,
//       revenue: 389230,
//       pendingBookings: 125,
//       completedBookings: 12254,
//       activeServices: 67,
//       avgServiceTime: 42,
//       popularServices: 12,
//       serviceAreas: 18,
//       rating: 4.8,
//       cancelledBookings: 466,
//     },
//     timeseries: [
//       { date: "Week 1", users: 12500, riders: 450, providers: 160, bookings: 1800, revenue: 45000 },
//       { date: "Week 2", users: 13500, riders: 470, providers: 168, bookings: 2100, revenue: 52000 },
//       { date: "Week 3", users: 14500, riders: 490, providers: 175, bookings: 2400, revenue: 61000 },
//       { date: "Week 4", users: 15842, riders: 514, providers: 186, bookings: 2850, revenue: 72000 },
//     ],
//     bookingStatus: [
//       { name: "Completed", value: 12254, color: "#10b981" },
//       { name: "Pending", value: 125, color: "#f59e0b" },
//       { name: "In Progress", value: 67, color: "#3b82f6" },
//       { name: "Cancelled", value: 466, color: "#ef4444" },
//     ],
//     popularServices: [
//       { name: "Ride Service", bookings: 3845 },
//       { name: "Home Cleaning", bookings: 2678 },
//       { name: "AC Repair", bookings: 1892 },
//       { name: "Plumbing", bookings: 1365 },
//       { name: "Electrical", bookings: 1342 },
//       { name: "Other Services", bookings: 1723 },
//     ]
//   },
//   monthly: {
//     summary: {
//       users: 45842,
//       riders: 514,
//       providers: 186,
//       complaints: 842,
//       bookings: 35845,
//       revenue: 1289230,
//       pendingBookings: 342,
//       completedBookings: 34254,
//       activeServices: 67,
//       avgServiceTime: 40,
//       popularServices: 15,
//       serviceAreas: 18,
//       rating: 4.9,
//       cancelledBookings: 1253,
//     },
//     timeseries: [
//       { date: "Jan", users: 32000, riders: 420, providers: 150, bookings: 8500, revenue: 285000 },
//       { date: "Feb", users: 35800, riders: 445, providers: 162, bookings: 9200, revenue: 315000 },
//       { date: "Mar", users: 39500, riders: 470, providers: 170, bookings: 10500, revenue: 365000 },
//       { date: "Apr", users: 42800, riders: 490, providers: 178, bookings: 11800, revenue: 425000 },
//       { date: "May", users: 45842, riders: 514, providers: 186, bookings: 12845, revenue: 489000 },
//     ],
//     bookingStatus: [
//       { name: "Completed", value: 34254, color: "#10b981" },
//       { name: "Pending", value: 342, color: "#f59e0b" },
//       { name: "In Progress", value: 67, color: "#3b82f6" },
//       { name: "Cancelled", value: 1253, color: "#ef4444" },
//     ],
//     popularServices: [
//       { name: "Ride Service", bookings: 11845 },
//       { name: "Home Cleaning", bookings: 8678 },
//       { name: "AC Repair", bookings: 5892 },
//       { name: "Plumbing", bookings: 4365 },
//       { name: "Electrical", bookings: 4342 },
//       { name: "Other Services", bookings: 4723 },
//     ]
//   }
// };

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState("daily");
  const [summary, setSummary] = useState(null);
  const [timeseries, setTimeseries] = useState([]);
  const [bookingStatus, setBookingStatus] = useState([]);
  const [popularServices, setPopularServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [analyticsOverview, setAnalyticsOverview] = useState(null);
  const [providersAnalytics, setProvidersAnalytics] = useState([]);
  const [revenueReport, setRevenueReport] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  const API_BASE = process.env.REACT_APP_API_ROOT || undefined;
  const DASHBOARD_API = `/admin/homeservices/dashboard`;
  const ADMIN_STATS_API = `/admin/dashboard/stats`;

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      try {
        // try to fetch real dashboard data
        const token = localStorage.getItem("accessToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // compute date range params required by analytics endpoints
        const getDateRange = (range) => {
          const to = new Date();
          let from = new Date();
          if (range === 'daily') from.setDate(to.getDate() - 6); // last 7 days
          if (range === 'weekly') from.setDate(to.getDate() - 27); // last 28 days
          if (range === 'monthly') from.setMonth(to.getMonth() - 5); // last 6 months
          const fmt = (d) => d.toISOString().slice(0, 10);
          return { fromDate: fmt(from), toDate: fmt(to), groupBy: range === 'monthly' ? 'month' : (range === 'weekly' ? 'week' : 'day') };
        };

        const { fromDate, toDate, groupBy } = getDateRange(timeRange);

        const [hsResp, statsResp, overviewResp, providersResp, revenueResp] = await Promise.allSettled([
          api.get(`/admin/homeservices/dashboard`),
          api.get(`/admin/dashboard/stats`),
          api.get(`/admin/homeservices/analytics/overview`, { params: { fromDate, toDate, groupBy } }),
          api.get(`/admin/homeservices/analytics/providers`, { params: { fromDate, toDate, limit: 20 } }),
          api.get(`/admin/homeservices/analytics/revenue`, { params: { fromDate, toDate, groupBy } }),
        ]);

        const hsData = hsResp.status === "fulfilled" ? hsResp.value?.data?.data : null;
        const statsData = statsResp.status === "fulfilled" ? statsResp.value?.data?.data : null;
        const overviewData = overviewResp.status === 'fulfilled' ? overviewResp.value?.data?.data : null;
        const providersData = providersResp.status === 'fulfilled' ? providersResp.value?.data?.data : null;
        const revenueData = revenueResp.status === 'fulfilled' ? revenueResp.value?.data?.data : null;

        // Prefer homeservices dashboard structure for weekly stats, but use admin stats for top-level totals when present
        const sData = statsData || hsData || overviewData;
        const tData = (hsData && hsData.weeklyStats?.dailyBreakdown) || (overviewData && overviewData.weeklyStats?.dailyBreakdown) || (statsData && statsData.weeklyStats?.dailyBreakdown) || [];
        const bsData = (hsData && hsData.today) || (overviewData && overviewData.today) || (statsData && statsData.today)
          ? [
              { name: "Completed", value: (hsData || statsData)?.today?.completedOrders || 0, color: "#10b981" },
              { name: "Pending", value: (hsData || statsData)?.today?.pendingOrders || 0, color: "#f59e0b" },
              { name: "In Progress", value: (hsData || statsData)?.today?.inProgressOrders || 0, color: "#3b82f6" },
            ]
          : [];

        const psData = (overviewData && overviewData.popularServices) || [];

        // set analytics-specific data
        if (overviewData) setAnalyticsOverview(overviewData);
        if (providersData) setProvidersAnalytics(Array.isArray(providersData.providers) ? providersData.providers : (providersData.providers || []));
        if (revenueData) setRevenueReport(revenueData);

        // Derive a normalized summary used by the UI from available endpoints
        const finalSummary = {
          users: statsData?.totalUsers ?? overviewData?.summary?.totalCustomers ?? hsData?.today?.newCustomers ?? [],
          riders: overviewData?.summary?.riders ?? hsData?.today?.activeRiders ?? [],
          providers: overviewData?.summary?.providers ?? providersData?.total ?? hsData?.today?.activeProviders ?? [],
          complaints: overviewData?.summary?.complaints ?? hsData?.today?.complaints ?? [],
          bookings: overviewData?.summary?.totalOrders ?? hsData?.today?.totalOrders ?? [],
          revenue: overviewData?.summary?.totalRevenue ?? hsData?.today?.revenue ?? [],
          pendingBookings: overviewData?.summary?.pendingOrders ?? hsData?.today?.pendingOrders ?? [],
          completedBookings: overviewData?.summary?.completedOrders ?? hsData?.today?.completedOrders ?? [],
          activeServices: overviewData?.summary?.activeServices ?? hsData?.today?.activeProviders ?? [],
          avgServiceTime: overviewData?.summary?.averageOrderValue ?? hsData?.today?.avgServiceTime ?? [],
          popularServices: overviewData?.popularServices ?? [],
          serviceAreas: overviewData?.summary?.serviceAreas ?? [],
          rating: overviewData?.summary?.averageRating ?? hsData?.weeklyStats?.averageRating ?? [],
          cancelledBookings: overviewData?.summary?.cancelledOrders ?? [],
        };

        if (!cancelled) {
          setSummary(finalSummary);
          setTimeseries(tData);
          setBookingStatus(bsData);
          setPopularServices(psData);
          // recent orders
          const recent = (hsData && hsData.recentOrders) || (overviewData && overviewData.recentOrders) || [];
          setRecentOrders(Array.isArray(recent) ? recent : []);
          setLastUpdated(new Date().toISOString());
        }
      } catch (err) {
        // fallback to mock data
        if (!cancelled) {
          setSummary([]);
          setTimeseries([]);
          setBookingStatus([]);
          setPopularServices([]);
          setLastUpdated(new Date().toISOString());
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [timeRange]);

  const distribution = summary
    ? [
        { name: "Users", value: summary.users },
        { name: "Riders", value: summary.riders },
        { name: "Providers", value: summary.providers },
        { name: "Bookings", value: summary.bookings },
        { name: "Complaints", value: summary.complaints },
      ]
    : [];

  const handleRefresh = async () => {
    setLoading(true);
    try {
      // In a real app, you would refetch data here
      // For now, we'll just simulate a refresh
      setTimeout(() => {
        setLastUpdated(new Date().toISOString());
        setLoading(false);
      }, 1000);
    } catch (error) {
      setLoading(false);
    }
  };

  const TimeRangeButton = ({ range, label, currentRange, onClick }) => (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
        currentRange === range
          ? "bg-indigo-600 text-white shadow-md"
          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-4 lg:p-6 bg-gray-50 min-h-screen overflow-x-hidden">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="lg:hidden">
            <Smartphone size={24} className="text-indigo-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 truncate">
              Supr Service Dashboard
            </h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1 truncate">
              Complete overview of your ride and home service operations
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-normal">
          <div className="text-xs text-gray-500 whitespace-nowrap">
            {lastUpdated ? `Updated: ${new Date(lastUpdated).toLocaleTimeString()}` : ""}
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 rounded-md bg-white border text-sm shadow-sm hover:shadow-md disabled:opacity-50 transition-all whitespace-nowrap"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            <span className="hidden xs:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="bg-white rounded-lg shadow p-3 md:p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="text-base md:text-lg font-medium text-gray-800 whitespace-nowrap">
            Analytics Overview
          </h3>
          <div className="flex flex-wrap gap-2">
            <TimeRangeButton 
              range="daily" 
              label="Daily" 
              currentRange={timeRange}
              onClick={() => setTimeRange("daily")}
            />
            <TimeRangeButton 
              range="weekly" 
              label="Weekly" 
              currentRange={timeRange}
              onClick={() => setTimeRange("weekly")}
            />
            <TimeRangeButton 
              range="monthly" 
              label="Monthly" 
              currentRange={timeRange}
              onClick={() => setTimeRange("monthly")}
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Showing data for {timeRange} period
        </p>
      </div>
 
      {/* Main Stat Cards - Mobile First Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
        {/* Users */}
        <StatCard
          title="Total Users"
          value={summary?.users != null ? summary.users.toLocaleString() : "—"}
          icon={<Users size={isMobile ? 18 : 20} />}
          color="from-indigo-600 to-indigo-400"
          description="Registered customers"
          trend="+4.2%"
          isMobile={isMobile}
        />

        {/* Riders */}
        <StatCard
          title="Active Riders"
          value={summary ? summary.riders : "—"}
          icon={<Truck size={isMobile ? 18 : 20} />}
          color="from-cyan-500 to-teal-400"
          description="Pick & drop service"
          trend="+3.1%"
          isMobile={isMobile}
        />

        {/* Service Providers */}
        <StatCard
          title="Service Providers"
          value={summary ? summary.providers : "—"}
          icon={<Home size={isMobile ? 18 : 20} />}
          color="from-orange-400 to-orange-300"
          description="Home service experts"
          trend="+2.8%"
          isMobile={isMobile}
        />

        {/* Active Services */}
        <StatCard
          title="Active Services"
          value={summary ? summary.activeServices : "—"}
          icon={<Package size={isMobile ? 18 : 20} />}
          color="from-blue-500 to-blue-400"
          description="Ongoing jobs"
          trend="+12%"
          isMobile={isMobile}
        />

        {/* Avg Service Time */}
        <StatCard
          title="Avg. Service Time"
          value={summary ? `${summary.avgServiceTime} min` : "—"}
          icon={<Clock size={isMobile ? 18 : 20} />}
          color="from-green-500 to-green-400"
          description="Booking completion"
          trend="-5%"
          isMobile={isMobile}
        />
      </div>

      {/* Second row of stat cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Bookings */}
        <StatCard
          title="Total Bookings"
          value={summary?.bookings != null ? summary.bookings.toLocaleString() : "—"}
          icon={<ShoppingCart size={isMobile ? 18 : 20} />}
          color="from-purple-600 to-purple-400"
          description="All-time bookings"
          isMobile={isMobile}
        />

        {/* Revenue */}
        <StatCard
          title="Revenue"
          value={summary?.revenue != null ? `$${summary.revenue.toLocaleString()}` : "—"}
          icon={<DollarSign size={isMobile ? 18 : 20} />}
          color="from-emerald-600 to-emerald-400"
          description="All-time earnings"
          isMobile={isMobile}
        />

        {/* Customer Rating */}
        <StatCard
          title="Customer Rating"
          value={summary ? `${summary.rating}/5` : "—"}
          icon={<Star size={isMobile ? 18 : 20} />}
          color="from-amber-500 to-amber-400"
          description="Average rating"
          isMobile={isMobile}
        />

        {/* Service Areas */}
        <StatCard
          title="Service Areas"
          value={summary ? summary.serviceAreas : "—"}
          icon={<MapPin size={isMobile ? 18 : 20} />}
          color="from-rose-500 to-rose-400"
          description="Covered locations"
          isMobile={isMobile}
        />
      </div>

      {/* Charts area - Mobile Responsive */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Area chart: Bookings & Revenue over time */}
        <div className="bg-white rounded-lg shadow p-3 md:p-4 xl:col-span-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
            <h3 className="text-base md:text-lg font-medium text-gray-800 whitespace-nowrap">
              Bookings & Revenue ({timeRange.charAt(0).toUpperCase() + timeRange.slice(1)})
            </h3>
          </div>
          <div className="h-48 sm:h-56 md:h-64 lg:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeseries}>
                <defs>
                  <linearGradient id="gradBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === "revenue") return [`$${value}`, "Revenue"];
                    if (name === "bookings") return [value, "Bookings"];
                    return [value, name];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="bookings" 
                  name="Bookings" 
                  stroke="#8b5cf6" 
                  fill="url(#gradBookings)" 
                />
                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="revenue" 
                  name="Revenue" 
                  stroke="#10b981" 
                  fill="url(#gradRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Status Distribution */}
        <div className="bg-white rounded-lg shadow p-3 md:p-4">
          <h3 className="text-base md:text-lg font-medium text-gray-800 mb-2 whitespace-nowrap">
            Booking Status ({timeRange})
          </h3>
          <div className="h-48 sm:h-56 md:h-64 lg:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bookingStatus}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={isMobile ? 40 : 60}
                  outerRadius={isMobile ? 70 : 100}
                  paddingAngle={2}
                  label={({ name, percent }) => 
                    isMobile ? `${(percent * 100).toFixed(0)}%` : `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={!isMobile}
                >
                  {bookingStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, "Bookings"]} />
                {!isMobile && <Legend wrapperStyle={{ fontSize: 12 }} />}
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Second row of charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Popular Services */}
        <div className="bg-white rounded-lg shadow p-3 md:p-4">
          <h3 className="text-base md:text-lg font-medium text-gray-800 mb-2 whitespace-nowrap">
            Most Popular Services ({timeRange})
          </h3>
          <div className="h-48 sm:h-56 md:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={popularServices}
                layout="vertical"
                margin={{ 
                  top: 5, 
                  right: isMobile ? 10 : 30, 
                  left: isMobile ? 60 : 80, 
                  bottom: 5 
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  type="number" 
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  width={isMobile ? 50 : 70}
                />
                <Tooltip formatter={(value) => [value, "Bookings"]} />
                <Bar 
                  dataKey="bookings" 
                  name="Bookings" 
                  fill="#7c3aed" 
                  radius={[0, 4, 4, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Growth */}
        <div className="bg-white rounded-lg shadow p-3 md:p-4">
          <h3 className="text-base md:text-lg font-medium text-gray-800 mb-2 whitespace-nowrap">
            Platform Growth ({timeRange})
          </h3>
          <div className="h-48 sm:h-56 md:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeseries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                />
                <YAxis 
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  name="Users" 
                  stroke="#7c3aed" 
                  strokeWidth={2}
                  dot={{ r: isMobile ? 2 : 4 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="riders" 
                  name="Riders" 
                  stroke="#06b6d4" 
                  strokeWidth={2}
                  dot={{ r: isMobile ? 2 : 4 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="providers" 
                  name="Providers" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  dot={{ r: isMobile ? 2 : 4 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Orders by Category (from analytics overview) */}
      {analyticsOverview?.ordersByCategory && analyticsOverview.ordersByCategory.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 md:p-6 mt-4">
          <h3 className="text-base md:text-lg font-medium text-gray-800 mb-3">Orders By Category</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-xs text-gray-500">Category</th>
                  <th className="px-4 py-2 text-xs text-gray-500">Orders</th>
                  <th className="px-4 py-2 text-xs text-gray-500">Revenue</th>
                  <th className="px-4 py-2 text-xs text-gray-500">Share</th>
                </tr>
              </thead>
              <tbody>
                {analyticsOverview.ordersByCategory.map((c) => (
                  <tr key={c.categorySlug} className="border-t">
                    <td className="px-4 py-2 text-sm text-gray-700">{c.categoryTitle || c.categorySlug}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{c.orderCount}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{c.revenue != null ? `$${c.revenue}` : '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{c.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Providers Analytics Table */}
      {providersAnalytics && providersAnalytics.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 md:p-6 mt-4">
          <h3 className="text-base md:text-lg font-medium text-gray-800 mb-3">Top Providers</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-xs text-gray-500">Provider</th>
                  <th className="px-4 py-2 text-xs text-gray-500">Completed Orders</th>
                  <th className="px-4 py-2 text-xs text-gray-500">Total Earnings</th>
                  <th className="px-4 py-2 text-xs text-gray-500">Avg Rating</th>
                </tr>
              </thead>
              <tbody>
                {providersAnalytics.map((p) => (
                  <tr key={p.providerId || p.providerName} className="border-t">
                    <td className="px-4 py-2 text-sm text-gray-700">{p.providerName || p.providerId}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{p.completedOrders ?? p.completed_orders ?? 0}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{p.totalEarnings != null ? `$${p.totalEarnings}` : '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{p.averageRating ?? p.avgRating ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* System distribution and performance metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* System Distribution */}
        <div className="bg-white rounded-lg shadow p-3 md:p-4">
          <h3 className="text-base md:text-lg font-medium text-gray-800 mb-3 whitespace-nowrap">
            System Distribution ({timeRange})
          </h3>
          <div className="flex flex-col items-center gap-4">
            {/* Chart Container */}
            <div className="w-full max-w-[280px] h-[200px] sm:h-[250px] md:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={isMobile ? 30 : 40}
                    outerRadius={isMobile ? 60 : 80}
                    paddingAngle={2}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {distribution.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [
                      value != null && typeof value.toLocaleString === 'function' ? value.toLocaleString() : String(value ?? '—'),
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="w-full grid grid-cols-1 xs:grid-cols-2 gap-2">
              {distribution.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200 min-w-0">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <span 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ background: COLORS[i % COLORS.length] }} 
                    />
                    <span className="text-xs md:text-sm text-gray-700 truncate">{d.name}</span>
                  </div>
                  <div className="text-xs md:text-sm font-medium text-gray-900 ml-2 flex-shrink-0">
                    {d.value != null && typeof d.value.toLocaleString === 'function' ? d.value.toLocaleString() : String(d.value ?? '—')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow p-3 md:p-4 lg:col-span-2">
          <h3 className="text-base md:text-lg font-medium text-gray-800 mb-3 md:mb-4 whitespace-nowrap">
            Performance Metrics ({timeRange})
          </h3>
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            <MetricCard 
              title="Booking Completion" 
              value={summary ? `${((summary.completedBookings / summary.bookings) * 100).toFixed(1)}%` : "—"} 
              change="+2.1%" 
              changeType="positive" 
              isMobile={isMobile}
            />
            <MetricCard 
              title="Avg. Service Time" 
              value={summary ? `${summary.avgServiceTime} min` : "—"} 
              change="-3 min" 
              changeType="positive" 
              isMobile={isMobile}
            />
            <MetricCard 
              title="Customer Satisfaction" 
              value={summary ? `${summary.rating}/5` : "—"} 
              change="+0.3" 
              changeType="positive" 
              isMobile={isMobile}
            />
            <MetricCard 
              title="Cancellation Rate" 
              value={summary ? `${((summary.cancelledBookings / summary.bookings) * 100).toFixed(1)}%` : "—"} 
              change="-1.2%" 
              changeType="positive" 
              isMobile={isMobile}
            />
          </div>
          
          <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Activity</h4>
            <div className="space-y-1 md:space-y-2 max-h-96 overflow-y-auto">
              {recentOrders.length > 0 ? (
                recentOrders.map((o) => (
                  <ActivityItem
                    key={o.id || o.orderNumber}
                    time={o.createdAt || o.bookingDate || '—'}
                    text={`${o.orderNumber ? `#${o.orderNumber}` : (o.id || '')} ${o.customerName ? `— ${o.customerName}` : ''} ${o.status ? `(${o.status})` : ''}`}
                    type={o.categoryTitle ? 'service' : 'ride'}
                    isMobile={isMobile}
                  />
                ))
              ) : (
                <>
                  <ActivityItem 
                    time="5 min ago" 
                    text="New ride booking #2847 from John Doe" 
                    type="ride" 
                    isMobile={isMobile}
                  />
                  <ActivityItem 
                    time="22 min ago" 
                    text="Home cleaning service assigned to provider" 
                    type="service" 
                    isMobile={isMobile}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Helper components ---------- */

function StatCard({ title, value, icon, color = "from-indigo-500 to-indigo-400", description, trend, isMobile }) {
  return (
    <div className="bg-white rounded-lg shadow p-3 md:p-4 flex items-center justify-between transition-all hover:shadow-md border border-gray-100 min-w-0">
      <div className="flex items-center space-x-2 md:space-x-3 lg:space-x-4 min-w-0 flex-1">
        <div className={`p-2 md:p-3 rounded-lg bg-gradient-to-br ${color} text-white shadow-sm flex-shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs md:text-sm font-medium text-gray-500 truncate">{title}</div>
          <div className={`font-bold text-gray-800 ${isMobile ? 'text-base' : 'text-lg md:text-xl'} truncate`}>
            {value}
          </div>
          {description && (
            <div className="text-xs text-gray-400 mt-0.5 truncate">{description}</div>
          )}
        </div>
      </div>
      {trend && (
        <div className="flex items-center text-xs font-medium text-green-500 ml-2 flex-shrink-0">
          <TrendingUp size={isMobile ? 12 : 14} className="mr-1" />
          <span className="hidden xs:inline">{trend}</span>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, change, changeType, isMobile }) {
  const changeColor = changeType === "positive" ? "text-green-500" : "text-red-500";
  
  return (
    <div className="bg-gray-50 rounded-lg p-2 md:p-3 text-center border border-gray-200 min-w-0">
      <div className="text-xs md:text-sm text-gray-500 mb-1 truncate">{title}</div>
      <div className={`font-bold text-gray-800 mb-1 ${isMobile ? 'text-sm' : 'text-base md:text-lg'} truncate`}>
        {value}
      </div>
      <div className={`text-xs font-medium ${changeColor} truncate`}>{change}</div>
    </div>
  );
}

function ActivityItem({ time, text, type, isMobile }) {
  const getIcon = () => {
    switch(type) {
      case "ride": return <Truck size={isMobile ? 12 : 14} className="text-blue-500 flex-shrink-0" />;
      case "service": return <Home size={isMobile ? 12 : 14} className="text-green-500 flex-shrink-0" />;
      case "user": return <Users size={isMobile ? 12 : 14} className="text-indigo-500 flex-shrink-0" />;
      case "completed": return <Shield size={isMobile ? 12 : 14} className="text-emerald-500 flex-shrink-0" />;
      case "provider": return <Users size={isMobile ? 12 : 14} className="text-orange-500 flex-shrink-0" />;
      default: return <Clock size={isMobile ? 12 : 14} className="text-gray-500 flex-shrink-0" />;
    }
  };

  return (
    <div className="flex items-start space-x-2 min-w-0">
      <div className="mt-0.5 flex-shrink-0">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs md:text-sm text-gray-700 truncate">{text}</div>
        <div className="text-xs text-gray-400 truncate">{time}</div>
      </div>
    </div>
  );
}