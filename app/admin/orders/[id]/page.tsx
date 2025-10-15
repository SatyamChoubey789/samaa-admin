import { notFound } from "next/navigation"

async function getOrder(id: string) {
  try {
    const res = await fetch(`https://api.samaabysiblings.com/backend/api/v1/orders/${id}`, {
      cache: "no-store",
    })
    
    if (!res.ok) {
      if (res.status === 404) return null
      throw new Error(`Failed to fetch order: ${res.status}`)
    }
    
    const response = await res.json()
    // Handle both direct order response and wrapped response
    return response.data || response
  } catch (error) {
    console.error('Error fetching order:', error)
    return null
  }
}

export default async function OrderPage({ params }: { params: { id: string } }) {
  const order = await getOrder(params.id)
  if (!order?.id) return notFound()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      refunded: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
      paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      not_shipped: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
    return colors[status?.toLowerCase()] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
  }

  return (
    <div className="max-w-6xl mx-auto p-4 grid gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order #{order.id}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        {order.is_test_order && (
          <span className="px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full text-sm font-medium">
            Test Order
          </span>
        )}
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Order Status</div>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
            {order.status || "Unknown"}
          </span>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Shipping Status</div>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(order.shipping_status)}`}>
            {order.shipping_status?.replace('_', ' ') || "Not Shipped"}
          </span>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Payment Method</div>
          <div className="font-medium capitalize text-gray-900 dark:text-white">{order.payment_method || "N/A"}</div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Customer Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Name</div>
            <div className="font-medium text-gray-900 dark:text-white">{order.name || "N/A"}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Email</div>
            <div className="font-medium text-gray-900 dark:text-white">{order.email || "N/A"}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Phone</div>
            <div className="font-medium text-gray-900 dark:text-white">{order.phone || "N/A"}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Source</div>
            <div className="font-medium capitalize text-gray-900 dark:text-white">{order.source || "N/A"}</div>
          </div>
        </div>
        {order.address && (
          <div className="mt-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Shipping Address</div>
            <div className="font-medium whitespace-pre-line text-gray-900 dark:text-white">{order.address}</div>
          </div>
        )}
        {order.customer_notes && (
          <div className="mt-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Customer Notes</div>
            <div className="font-medium whitespace-pre-line text-gray-900 dark:text-white">{order.customer_notes}</div>
          </div>
        )}
      </div>

      {/* Order Items */}
      {order.items && order.items.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Order Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-2 text-gray-900 dark:text-white">Item</th>
                  <th className="text-center py-3 px-2 text-gray-900 dark:text-white">Quantity</th>
                  <th className="text-right py-3 px-2 text-gray-900 dark:text-white">Price</th>
                  <th className="text-right py-3 px-2 text-gray-900 dark:text-white">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item: any, index: number) => (
                  <tr key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                    <td className="py-3 px-2">
                      <div className="font-medium text-gray-900 dark:text-white">{item.name || item.title}</div>
                      {item.variant && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">{item.variant}</div>
                      )}
                    </td>
                    <td className="text-center py-3 px-2 text-gray-900 dark:text-white">{item.quantity || 1}</td>
                    <td className="text-right py-3 px-2 text-gray-900 dark:text-white">{formatCurrency(item.price || 0)}</td>
                    <td className="text-right py-3 px-2 font-medium text-gray-900 dark:text-white">
                      {formatCurrency((item.price || 0) * (item.quantity || 1))}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold">
                  <td colSpan={3} className="text-right py-3 px-2 text-gray-900 dark:text-white">Total</td>
                  <td className="text-right py-3 px-2 text-gray-900 dark:text-white">{formatCurrency(order.total || 0)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Shipping Information */}
      {(order.courier_company || order.awb_code || order.estimated_delivery) && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Shipping Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {order.courier_company && (
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Courier Company</div>
                <div className="font-medium text-gray-900 dark:text-white">{order.courier_company}</div>
              </div>
            )}
            {order.awb_code && (
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Tracking Number (AWB)</div>
                <div className="font-medium font-mono text-gray-900 dark:text-white">{order.awb_code}</div>
              </div>
            )}
            {order.estimated_delivery && (
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Estimated Delivery</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {new Date(order.estimated_delivery).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>
            )}
            {order.shiprocket_order_id && (
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Shiprocket Order ID</div>
                <div className="font-medium text-gray-900 dark:text-white">{order.shiprocket_order_id}</div>
              </div>
            )}
            {order.shipped_at && (
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Shipped At</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {new Date(order.shipped_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            )}
            {order.delivered_at && (
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Delivered At</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {new Date(order.delivered_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-4">
            {order.invoice_url && (
              <a
                href={order.invoice_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Download Invoice
              </a>
            )}
            {order.manifest_url && (
              <a
                href={order.manifest_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Download Manifest
              </a>
            )}
          </div>
        </div>
      )}

      {/* Payment Information */}
      {order.payment_id && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Payment Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Payment ID</div>
              <div className="font-medium font-mono text-gray-900 dark:text-white">{order.payment_id}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Payment Method</div>
              <div className="font-medium capitalize text-gray-900 dark:text-white">{order.payment_method || "N/A"}</div>
            </div>
            {order.refund_status && order.refund_status !== 'not_refunded' && (
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Refund Status</div>
                <div className="font-medium capitalize text-gray-900 dark:text-white">{order.refund_status.replace('_', ' ')}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancellation Information */}
      {order.cancelled_at && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-red-800 dark:text-red-200">Cancellation Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-red-600 dark:text-red-400">Cancelled At</div>
              <div className="font-medium text-red-900 dark:text-red-100">
                {new Date(order.cancelled_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            {order.cancellation_reason && (
              <div>
                <div className="text-sm text-red-600 dark:text-red-400">Reason</div>
                <div className="font-medium text-red-900 dark:text-red-100">{order.cancellation_reason}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timeline */}
      {order.timeline && order.timeline.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Order Timeline</h2>
          <ol className="relative border-s border-gray-300 dark:border-gray-600 pl-6">
            {order.timeline.map((t: any, index: number) => (
              <li key={t.id || index} className="mb-6 last:mb-0">
                <span className="absolute -start-2 mt-1.5 h-4 w-4 rounded-full bg-blue-600 border-2 border-white dark:border-gray-800" />
                <div className="text-base font-medium text-gray-900 dark:text-white">{t.label}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(t.at).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Admin Notes */}
      {order.admin_notes && order.admin_notes.trim() && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Admin Notes</h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{order.admin_notes}</p>
        </div>
      )}
    </div>
  )
}