"use client"

import { useDashboardStats } from "@/lib/api-hooks"
import { StatsCard } from "@/components/stats-card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Package, ShoppingCart, Users, FileText, TrendingUp, DollarSign } from "lucide-react"

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load dashboard statistics. Please try again later.</AlertDescription>
      </Alert>
    )
  }

  // Default stats if backend doesn't return data
  const defaultStats = {
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalStories: 0,
    totalRevenue: 0,
    recentOrders: [],
    ...stats,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your business today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Products"
          value={defaultStats.totalProducts}
          description="Active products in catalog"
          icon={Package}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Total Orders"
          value={defaultStats.totalOrders}
          description="Orders this month"
          icon={ShoppingCart}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Total Users"
          value={defaultStats.totalUsers}
          description="Registered users"
          icon={Users}
          trend={{ value: 15, isPositive: true }}
        />
        <StatsCard
          title="Blog Stories"
          value={defaultStats.totalStories}
          description="Published articles"
          icon={FileText}
          trend={{ value: 3, isPositive: true }}
        />
      </div>

      {/* Revenue and Growth */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Overview
            </CardTitle>
            <CardDescription>Total revenue and growth metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{defaultStats.totalRevenue?.toLocaleString() || "0"}</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600 font-medium">+20.1% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest orders and user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {defaultStats.recentOrders?.length > 0 ? (
                defaultStats.recentOrders.slice(0, 3).map((order: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Order #{order.id}</p>
                      <p className="text-xs text-muted-foreground">{order.customer}</p>
                    </div>
                    <div className="text-sm font-medium">₹{order.total}</div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No recent orders to display</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex flex-col items-center p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
              <Package className="h-8 w-8 mb-2 text-primary" />
              <span className="text-sm font-medium">Add Product</span>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
              <ShoppingCart className="h-8 w-8 mb-2 text-primary" />
              <span className="text-sm font-medium">View Orders</span>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
              <Users className="h-8 w-8 mb-2 text-primary" />
              <span className="text-sm font-medium">Manage Users</span>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
              <FileText className="h-8 w-8 mb-2 text-primary" />
              <span className="text-sm font-medium">Write Story</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
