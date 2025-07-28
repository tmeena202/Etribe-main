import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
} from "recharts";
import { FiTrendingUp, FiUsers, FiUserCheck, FiUserX, FiClock, FiRefreshCw, FiBarChart2, FiPieChart, FiActivity } from "react-icons/fi";
import api from '../../api/axiosConfig';

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg shadow-xl p-4">
        <p className="text-gray-600 font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium text-gray-700">
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Custom legend component
const CustomLegend = ({ payload }) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded-full shadow-sm" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm font-medium text-gray-700">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsGraph() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('line'); // line, area, bar, pie
  const [selectedMetric, setSelectedMetric] = useState('all'); // all, active, inactive, expired
  const [lastUpdated, setLastUpdated] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    expired: 0
  });
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Fetch analytics with optional loading spinner
  const fetchAnalytics = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid') || '1';
      
      console.log('Fetching analytics data...');
      
      // Fetch all member data
      const [activeRes, inactiveRes, expiredRes] = await Promise.all([
        api.post('/userDetail/active_members', { uid }, { headers: { token, uid } }),
        api.post('/userDetail/not_members', { uid }, { headers: { token, uid } }),
        api.post('/userDetail/membership_expired', { uid }, { headers: { token, uid } }),
      ]);

      // Process data
      const activeMembers = Array.isArray(activeRes.data) ? activeRes.data : activeRes.data.data || [];
      const inactiveMembers = Array.isArray(inactiveRes.data) ? inactiveRes.data : inactiveRes.data.data || [];
      const expiredMembers = Array.isArray(expiredRes.data) ? expiredRes.data : expiredRes.data.data || [];

      // Update stats
      setStats({
        total: activeMembers.length + inactiveMembers.length + expiredMembers.length,
        active: activeMembers.length,
        inactive: inactiveMembers.length,
        expired: expiredMembers.length
      });

      // Group by month using month index for accurate mapping, with debug logging
      const groupByMonth = (members) => {
        const monthMap = {};
        members.forEach(m => {
          const date = m.lct ? new Date(m.lct) : new Date();
          const monthIdx = date.getMonth(); // 0 = Jan, 6 = July
          console.log('Member:', m, 'Parsed date:', date, 'Month index:', monthIdx, 'Month:', months[monthIdx]);
          if (!monthMap[monthIdx]) monthMap[monthIdx] = 0;
          monthMap[monthIdx]++;
        });
        return monthMap;
      };

      const activeByMonth = groupByMonth(activeMembers);
      const inactiveByMonth = groupByMonth(inactiveMembers);
      const expiredByMonth = groupByMonth(expiredMembers);

      // Chart data: all months, no dummy entry
      const chartData = months.map((month, idx) => ({
        month,
        Active: activeByMonth[idx] || 0,
        Inactive: inactiveByMonth[idx] || 0,
        Expired: expiredByMonth[idx] || 0,
      }));
      setData(chartData);
      setLastUpdated(new Date());
      
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Failed to fetch analytics data');
      setData([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(true); // Initial load with spinner
    // Auto-refresh removed
  }, []);

  const handleRefresh = () => {
    fetchAnalytics(true); // Manual refresh with spinner
  };

  const getChartComponent = () => {
    const colors = {
      Active: '#10b981',
      Inactive: '#6366f1', 
      Expired: '#f43f5e'
    };

    const filteredData = selectedMetric === 'all' 
      ? data 
      : data.map(item => ({
          month: item.month,
          [selectedMetric]: item[selectedMetric]
        }));

    switch (chartType) {
      case 'area':
        return (
          <AreaChart data={filteredData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="inactiveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="expiredGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              padding={{ left: 0, right: 0 }}
              ticks={months}
              interval={0}
              allowDataOverflow={false}
            />
            <YAxis 
              allowDecimals={false}
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            {selectedMetric === 'all' && (
              <>
                <Area type="monotone" dataKey="Active" stroke="#10b981" fill="url(#activeGradient)" strokeWidth={3} />
                <Area type="monotone" dataKey="Inactive" stroke="#6366f1" fill="url(#inactiveGradient)" strokeWidth={3} />
                <Area type="monotone" dataKey="Expired" stroke="#f43f5e" fill="url(#expiredGradient)" strokeWidth={3} />
              </>
            )}
            {selectedMetric !== 'all' && (
              <Area 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke={colors[selectedMetric]} 
                fill={`url(#${selectedMetric.toLowerCase()}Gradient)`} 
                strokeWidth={3} 
              />
            )}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart data={filteredData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              padding={{ left: 0, right: 0 }}
              ticks={months}
              interval={0}
              allowDataOverflow={false}
            />
            <YAxis 
              allowDecimals={false}
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            {selectedMetric === 'all' && (
              <>
                <Bar dataKey="Active" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Inactive" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expired" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </>
            )}
            {selectedMetric !== 'all' && (
              <Bar 
                dataKey={selectedMetric} 
                fill={colors[selectedMetric]} 
                radius={[4, 4, 0, 0]} 
              />
            )}
          </BarChart>
        );

      case 'line':
      default:
        return (
          <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              padding={{ left: 0, right: 0 }}
              ticks={months}
              interval={0}
              allowDataOverflow={false}
            />
            <YAxis 
              allowDecimals={false}
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            {selectedMetric === 'all' && (
              <>
                <Line 
                  type="monotone" 
                  dataKey="Active" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 8, fill: '#10b981', strokeWidth: 3, stroke: '#ffffff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Inactive" 
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 8, fill: '#6366f1', strokeWidth: 3, stroke: '#ffffff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Expired" 
                  stroke="#f43f5e" 
                  strokeWidth={3} 
                  dot={{ r: 6, fill: '#f43f5e', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 8, fill: '#f43f5e', strokeWidth: 3, stroke: '#ffffff' }}
                />
              </>
            )}
            {selectedMetric !== 'all' && (
              <Line 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke={colors[selectedMetric]} 
                strokeWidth={3} 
                dot={{ r: 6, fill: colors[selectedMetric], strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 8, fill: colors[selectedMetric], strokeWidth: 3, stroke: '#ffffff' }}
              />
            )}
          </LineChart>
        );
    }
  };

  return (
    <div className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 h-full w-full flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Header with gradient background, improved for layout consistency */}
      <div className="relative rounded-t-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-300 via-blue-200 to-blue-300 dark:from-indigo-900 dark:via-blue-900 dark:to-gray-900" />
        <div className="absolute inset-0 bg-white/30 dark:bg-gray-800/40 backdrop-blur-md border-b border-white/30 dark:border-gray-700" />
        <div className="relative z-10 flex items-center gap-3 px-5 py-3">
          <h2 className="text-xl font-bold text-gray-800 dark:text-indigo-100 tracking-wide flex-1">Member Analytics</h2>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 bg-white/20 dark:bg-gray-800/40 rounded-lg backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-700/40 transition-all duration-200 disabled:opacity-50"
            aria-label="Refresh"
          >
            <FiRefreshCw className={`w-5 h-5 text-indigo-600 dark:text-indigo-300 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex flex-row flex-wrap items-center gap-3">
        {/* Chart Type Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Chart:</span>
          <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
            {[
              { key: 'line', icon: FiActivity, label: 'Line' },
              { key: 'area', icon: FiBarChart2, label: 'Area' },
              { key: 'bar', icon: FiBarChart2, label: 'Bar' }
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setChartType(key)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 border-none outline-none focus:ring-2 focus:ring-indigo-400 ${
                  chartType === key
                    ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'bg-transparent text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                }`}
                aria-label={label}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Metric Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Filter:</span>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Metrics</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
            <option value="Expired">Expired Only</option>
          </select>
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div className="flex-1 min-h-0 h-0 flex items-center justify-center" style={{ outline: 'none', userSelect: 'none' }}>
        <style jsx>{`
          .recharts-surface {
            outline: none !important;
            border: none !important;
          }
          .recharts-wrapper {
            outline: none !important;
            border: none !important;
          }
          svg {
            outline: none !important;
            border: none !important;
          }
          .recharts-surface:focus {
            outline: none !important;
            border: none !important;
          }
        `}</style>
        {loading ? (
          <div className="flex items-center justify-center h-full w-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
              <p className="text-indigo-600 font-medium">Loading analytics...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full w-full">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiActivity className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-2 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full w-full">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiActivity className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No data available</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
              {getChartComponent()}
        </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
} 