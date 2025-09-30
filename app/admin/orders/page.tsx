"use client"

import { useOrders } from "@/lib/api-hooks"
import { DataTable } from "@/components/data-table"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye } from "lucide-react"
import Link from "next/link"

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  createdAt: string
  items: Array<{
    productName: string
    quantity: number
    price: number
  }>
}

const statusColors = {
  pending: "secondary",
  processing: "default",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
} as const

export default function OrdersPage() {
  const { data: orders = [], isLoading, error } = useOrders()

  const columns = [
    {
      key: "orderNumber",
      header: "Order #",
    },
    {
      key: "customerName",
      header: "Customer",
      render: (order: Order) => (
        <div>
          <div className="font-medium">{order.customerName}</div>
          <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
        </div>
      ),
    },
    {
      key: "total",
      header: "Total",
      render: (order: Order) => `$${order.total.toFixed(2)}`,
    },
    {
      key: "status",
      header: "Status",
      render: (order: Order) => (
        <Badge variant={statusColors[order.status]}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      render: (order: Order) => new Date(order.createdAt).toLocaleDateString(),
    },
  ]

  const actions = (order: Order) => (
    <DropdownMenuItem asChild>
      <Link href={`/admin/orders/${order.id}`} className="flex items-center">
        <Eye className="mr-2 h-4 w-4" />
        View Details
      </Link>
    </DropdownMenuItem>
  )

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load orders. Please try again later.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders and fulfillment</p>
        </div>
      </div>

      <DataTable data={orders} columns={columns} searchKey="orderNumber" actions={actions} isLoading={isLoading} />
    </div>
  )
}
