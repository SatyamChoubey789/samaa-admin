"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function downloadExcel(orders: any[], filename = "orders.xlsx") {
  if (orders.length === 0) return;

  const wsData = [
    [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Address",
      "Items",
      "Total",
      "Payment Method",
      "Status",
      "Shipping Status",
      "Courier Company",
      "Created At",
    ],
    ...orders.map((order) => {
      let itemsStr = "-";
      try {
        const items = Array.isArray(order.items)
          ? order.items
          : JSON.parse(order.items || "[]");
        itemsStr = items.map((i: any) => `${i.name} x${i.quantity}`).join("; ");
      } catch {
        itemsStr = "-";
      }

      const address = order.address || order.address_object?.street || "-";

      let payment = order.payment_method || "-";
      try {
        const p =
          typeof order.payment_details === "string"
            ? JSON.parse(order.payment_details)
            : order.payment_details;
        payment = p?.method?.toUpperCase() || payment;
      } catch {}

      return [
        order.id,
        order.name,
        order.email,
        order.phone,
        address,
        itemsStr,
        order.total,
        payment,
        order.status,
        order.shipping_status,
        order.courier_company,
        new Date(order.created_at).toLocaleString(),
      ];
    }),
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Orders");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/octet-stream" });
  saveAs(blob, filename);
}

function convertToCSV(orders: any[]) {
  if (orders.length === 0) return "";

  const headers = [
    "ID",
    "Name",
    "Email",
    "Phone",
    "Address",
    "Items",
    "Total",
    "Payment Method",
    "Status",
    "Shipping Status",
    "Courier Company",
    "Created At",
  ];

  const rows = orders.map((order) => {
    let itemsStr = "-";
    try {
      const items = Array.isArray(order.items)
        ? order.items
        : JSON.parse(order.items || "[]");
      itemsStr = items.map((i: any) => `${i.name} x${i.quantity}`).join("; ");
    } catch {
      itemsStr = "-";
    }

    const address = order.address || order.address_object?.street || "-";

    let payment = order.payment_method || "-";
    try {
      const p =
        typeof order.payment_details === "string"
          ? JSON.parse(order.payment_details)
          : order.payment_details;
      payment = p?.method?.toUpperCase() || payment;
    } catch {}

    return [
      order.id,
      order.name,
      order.email,
      order.phone,
      address,
      itemsStr,
      order.total,
      payment,
      order.status,
      order.shipping_status,
      order.courier_company,
      new Date(order.created_at).toLocaleString(),
    ];
  });

  const csvContent = [
    headers.join(","),
    ...rows.map((r) =>
      r
        .map(String)
        .map((s) => `"${s.replace(/"/g, '""')}"`)
        .join(",")
    ),
  ].join("\n");

  return csvContent;
}

function downloadCSV(csv: string, filename = "orders.csv") {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toLowerCase() || "";
  let bgColor = "bg-gray-300 text-gray-800";

  if (["paid", "delivered", "shipped"].includes(normalized)) {
    bgColor = "bg-green-200 text-green-800";
  } else if (["pending", "processing", "not_shipped"].includes(normalized)) {
    bgColor = "bg-yellow-200 text-yellow-800";
  } else if (["cancelled", "refunded", "failed"].includes(normalized)) {
    bgColor = "bg-red-200 text-red-800";
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${bgColor} whitespace-nowrap`}>
      {status}
    </span>
  );
}

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [searchTerm, setSearchTerm] = useState("");

  const { data, error, isLoading } = useSWR(
    `https://api.samaabysiblings.com/backend/api/v1/orders?page=${page}&limit=${pageSize}&search=${encodeURIComponent(
      searchTerm
    )}`,
    fetcher
  );

  const orders = data?.data?.items || [];
  const pagination = data?.data?.pagination || { page: 1, totalPages: 1 };

  const csvData = useMemo(() => convertToCSV(orders), [orders]);

  return (
    <div className="grid gap-4 p-4">
      <h2 className="text-xl font-semibold">Orders</h2>

      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-600">Failed to load orders.</p>}

      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <input
          type="search"
          placeholder="Search by name, email or ID"
          value={searchTerm}
          onChange={(e) => {
            setPage(1);
            setSearchTerm(e.target.value);
          }}
          className="input input-bordered max-w-xs"
        />

        <Button
          onClick={() => downloadCSV(csvData)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          Export CSV
        </Button>

        <Button
          onClick={() => downloadExcel(orders)}
          className="bg-green-600 hover:bg-green-700 text-white"
          size="sm"
        >
          Export Excel
        </Button>
      </div>

      <div className="glass rounded-lg p-2 overflow-auto max-h-[600px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Shipping</TableHead>
              <TableHead>Courier</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order: any) => {
              const items = Array.isArray(order.items)
                ? order.items
                : (() => {
                    try {
                      return JSON.parse(order.items);
                    } catch {
                      return [];
                    }
                  })();

              const address = order.address || order.address_object?.street || "-";

              const payment = (() => {
                try {
                  const p =
                    typeof order.payment_details === "string"
                      ? JSON.parse(order.payment_details)
                      : order.payment_details;
                  return p?.method?.toUpperCase() || order.payment_method || "-";
                } catch {
                  return order.payment_method || "-";
                }
              })();

              return (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.name}</TableCell>
                  <TableCell>{order.email}</TableCell>
                  <TableCell>{order.phone}</TableCell>
                  <TableCell className="whitespace-pre-wrap max-w-xs">
                    {address}
                  </TableCell>
                  <TableCell className="whitespace-pre-wrap max-w-xs">
                    {items.length > 0
                      ? items.map((item: any, i: number) => (
                          <div key={i}>
                            - {item.name} × {item.quantity} @ ₹{item.price}
                          </div>
                        ))
                      : "-"}
                  </TableCell>
                  <TableCell>
                    ₹{parseFloat(order.total || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>{payment}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.shipping_status} />
                  </TableCell>
                  <TableCell>{order.courier_company || "-"}</TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/orders/${order.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={13} className="text-center text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-center items-center space-x-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
        >
          Previous
        </Button>

        <span>
          Page {page} of {pagination.totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
          disabled={page === pagination.totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
