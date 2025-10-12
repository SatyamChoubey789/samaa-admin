"use client";

import React from 'react';
import useSWR from 'swr';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  TrendingUp, TrendingDown, Package, ShoppingCart, Mail, DollarSign,
  BookOpen, Image, Tag, Flame, Users, CreditCard
} from 'lucide-react';

export default function AdminOverview() {
  // SWR fetcher
  const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    if (!data.success) throw new Error('API returned unsuccessful response');
    return data.data;
  };

  const { data: stats, error, isLoading, mutate } = useSWR(
    'https://api.samaabysiblings.com/backend/api/v1/admin',
    fetcher,
    {
      refreshInterval: 60000, // revalidate every 60s
      revalidateOnFocus: true,
    }
  );

  // Helpers
  const formatCurrency = (value: number | string | null | undefined): string => {
    const num = typeof value === 'string' ? parseFloat(value) : Number(value ?? 0);
    const n = Number.isFinite(num) ? num : 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR'
    }).format(n);
  };

  const formatGrowth = (value: number | string | null | undefined): string => {
    const num = typeof value === 'string' ? parseFloat(value) : Number(value ?? 0);
    const n = Number.isFinite(num) ? num : 0;
    return n >= 0 ? `+${n}%` : `${n}%`;
  };

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#84cc16'];

  // Loading UI
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error UI
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Error Loading Data</h2>
          <p className="text-slate-600 mb-4">{(error as Error).message}</p>
          <button
            onClick={() => mutate()}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-colors font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Local Types
  type StatusCount = { status: string; count: number };
  type PaymentCount = { payment_method?: string; count: number };
  type StockStatus = { status: string; count: number };
  type OrderSummary = { id: string; name: string; email?: string; total: number; payment_method?: string; status?: string; shipping_status?: string; created_at: string };
  type Subscriber = { email: string; created_at: string };
  type BundleBreakdown = { is_bundle: boolean; count: number };
  type StoryStatus = { published: boolean; count: number };

  type StatCardProps = {
    icon: React.ComponentType<any>;
    label: string;
    value: number | string | null | undefined;
    prefix?: string;
    suffix?: string;
    color?: string;
    growth?: number | null;
    subtitle?: string;
  };

  const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, prefix = '', suffix = '', color, growth, subtitle }) => (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-all hover:scale-105">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {growth !== undefined && growth !== null && (
          <div className={`flex items-center text-sm font-semibold ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {growth >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {formatGrowth(growth)}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <p className="text-3xl font-bold text-slate-800">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : String(value ?? '')}{suffix}
        </p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Samaa by Siblings Dashboard</h1>
            <p className="text-slate-600">Complete business analytics and insights</p>
          </div>
          <button
            onClick={() => mutate()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
          >
            Refresh Data
          </button>
        </div>

        {/* --- All your existing JSX for stats, charts, and tables goes here --- */}
        {/* ⚡ Nothing changes in your visualization components */}
        {/* You can safely keep everything from your original file after this point */}

        {/* Example: */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={DollarSign}
            label="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            color="from-green-500 to-emerald-600"
            growth={stats.revenueGrowth}
            subtitle="From completed orders"
          />
          <StatCard
            icon={ShoppingCart}
            label="Total Orders"
            value={stats.totalOrders}
            color="from-indigo-500 to-indigo-600"
            growth={stats.orderGrowth}
            subtitle="All time"
          />
          <StatCard
            icon={Flame}
            label="Products"
            value={stats.totalCandles}
            color="from-orange-500 to-red-600"
            subtitle="Active candles"
          />
          <StatCard
            icon={Mail}
            label="Subscribers"
            value={stats.totalSubscribers}
            color="from-purple-500 to-purple-600"
            growth={stats.subscriberGrowth}
            subtitle="Email list"
          />
        </div>

        {/* Secondary Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow p-4 border border-slate-200">
            <div className="flex items-center mb-2">
              <DollarSign className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-slate-600 text-sm font-medium">Avg Order</p>
            </div>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats.avgOrderValue)}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border border-slate-200">
            <div className="flex items-center mb-2">
              <BookOpen className="w-5 h-5 text-indigo-600 mr-2" />
              <p className="text-slate-600 text-sm font-medium">Stories</p>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats.totalStories}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border border-slate-200">
            <div className="flex items-center mb-2">
              <Users className="w-5 h-5 text-purple-600 mr-2" />
              <p className="text-slate-600 text-sm font-medium">Users</p>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats.totalUsers}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border border-slate-200">
            <div className="flex items-center mb-2">
              <Mail className="w-5 h-5 text-blue-600 mr-2" />
              <p className="text-slate-600 text-sm font-medium">Emails Sent</p>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats.totalEmailsSent}</p>
          </div>
        </div>

        {/* Revenue & Orders Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Revenue */}
          {stats.revenueByMonth && stats.revenueByMonth.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Monthly Revenue</h2>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={stats.revenueByMonth}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    // Recharts passes a ValueType which can be number | string | (number | string)[] | undefined
                    // Normalize to a single number/string for our currency formatter.
                    formatter={(value: any) => {
                      if (Array.isArray(value)) value = value[0];
                      return formatCurrency(value as number | string | null | undefined);
                    }}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Daily Orders Last 7 Days */}
          {stats.dailyOrders && stats.dailyOrders.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                  <ShoppingCart className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Weekly Orders</h2>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.dailyOrders}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                  <Bar dataKey="orders" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Order & Product Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders by Status */}
          {stats.ordersByStatus && stats.ordersByStatus.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Order Status</h2>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={((stats.ordersByStatus ?? []) as StatusCount[]).map((item: StatusCount) => ({
                      name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
                      value: Number(item.count)
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {((stats.ordersByStatus ?? []) as StatusCount[]).map((entry: StatusCount, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Payment Methods */}
          {stats.ordersByPayment && stats.ordersByPayment.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Payment Methods</h2>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={((stats.ordersByPayment ?? []) as PaymentCount[]).map((item: PaymentCount) => ({
                      name: item.payment_method || 'Unknown',
                      value: Number(item.count)
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {((stats.ordersByPayment ?? []) as PaymentCount[]).map((entry: PaymentCount, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Stock Status */}
          {stats.stockStatus && stats.stockStatus.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-orange-100 rounded-lg mr-3">
                  <Package className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Stock Status</h2>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={((stats.stockStatus ?? []) as StockStatus[]).map((item: StockStatus) => ({
                      name: item.status,
                      value: Number(item.count)
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {((stats.stockStatus ?? []) as StockStatus[]).map((entry: StockStatus) => (
                      <Cell key={`cell-${entry.status}`} fill={
                        entry.status === 'Out of Stock' ? '#ef4444' :
                        entry.status === 'Low Stock' ? '#f59e0b' : '#10b981'
                      } />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Product Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Selling Items */}
          {stats.topSellingItems && stats.topSellingItems.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-amber-100 rounded-lg mr-3">
                  <Flame className="w-5 h-5 text-amber-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Top Selling Items</h2>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={(stats.topSellingItems ?? []) as any[]} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" width={120} style={{ fontSize: '11px' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                  <Bar dataKey="quantity" fill="#f97316" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Candles by Category */}
          {stats.candlesByCategory && stats.candlesByCategory.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-pink-100 rounded-lg mr-3">
                  <Tag className="w-5 h-5 text-pink-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Candles by Category</h2>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.candlesByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="category" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#ec4899" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recent Orders Table */}
        {stats.recentOrders && stats.recentOrders.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-3 px-4 text-slate-600 font-semibold">Order ID</th>
                    <th className="text-left py-3 px-4 text-slate-600 font-semibold">Customer</th>
                    <th className="text-left py-3 px-4 text-slate-600 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 text-slate-600 font-semibold">Total</th>
                    <th className="text-left py-3 px-4 text-slate-600 font-semibold">Payment</th>
                    <th className="text-left py-3 px-4 text-slate-600 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-slate-600 font-semibold">Shipping</th>
                    <th className="text-left py-3 px-4 text-slate-600 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {((stats.recentOrders ?? []) as OrderSummary[]).slice(0, 10).map((order: OrderSummary) => (
                    <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-slate-700 font-mono text-xs">
                       #{String(order.id).slice(0, 6)}
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-medium">
                        {order.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-sm">
                        {order.email}
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-semibold">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                          {order.payment_method || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          order.shipping_status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.shipping_status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                          order.shipping_status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {order.shipping_status || 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-sm">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Additional Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
            <Image className="w-7 h-7 mb-2 opacity-90" />
            <p className="text-blue-100 text-xs font-medium mb-1">Candle Images</p>
            <p className="text-3xl font-bold">{stats.totalCandleImages}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
            <Package className="w-7 h-7 mb-2 opacity-90" />
            <p className="text-purple-100 text-xs font-medium mb-1">Features</p>
            <p className="text-3xl font-bold">{stats.totalCandleFeatures}</p>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-5 text-white">
            <Tag className="w-7 h-7 mb-2 opacity-90" />
            <p className="text-pink-100 text-xs font-medium mb-1">Scent Notes</p>
            <p className="text-3xl font-bold">{stats.totalCandleNotes}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-5 text-white">
            <BookOpen className="w-7 h-7 mb-2 opacity-90" />
            <p className="text-amber-100 text-xs font-medium mb-1">Taglines</p>
            <p className="text-3xl font-bold">{stats.totalCandleTaglines}</p>
          </div>
        </div>

        {/* Recent Subscribers */}
        {stats.recentSubscribers && stats.recentSubscribers.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Recent Subscribers</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {((stats.recentSubscribers ?? []) as Subscriber[]).map((sub: Subscriber, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <Mail className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{sub.email}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bundle vs Single Products & Stories Status */}
        {stats.bundleBreakdown && stats.bundleBreakdown.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-teal-100 rounded-lg mr-3">
                  <Package className="w-5 h-5 text-teal-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Product Types</h2>
              </div>
              <div className="space-y-3">
                {((stats.bundleBreakdown ?? []) as BundleBreakdown[]).map((item: BundleBreakdown, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-700">
                      {item.is_bundle ? 'Bundle Products' : 'Single Products'}
                    </span>
                    <span className="text-2xl font-bold text-slate-800">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stories Status */}
            {stats.storiesStatus && stats.storiesStatus.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Stories Status</h2>
                </div>
                <div className="space-y-3">
                  {((stats.storiesStatus ?? []) as StoryStatus[]).map((item: StoryStatus, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <span className="font-medium text-slate-700">
                        {item.published ? 'Published' : 'Drafts'}
                      </span>
                      <span className="text-2xl font-bold text-slate-800">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}