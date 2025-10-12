"use client"

import useSWR from "swr"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button" // Replace with your button component
import * as XLSX from "xlsx"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// CSV Export
function convertToCSV(items: any[]) {
  if (items.length === 0) return "";

  const headers = Object.keys(items[0]);
  const rows = items.map(item =>
    headers.map(field => JSON.stringify(item[field] ?? "")).join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

function downloadCSV(items: any[]) {
  const csv = convertToCSV(items);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "subscribers.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Excel Export
function downloadExcel(items: any[]) {
  const worksheet = XLSX.utils.json_to_sheet(items);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Subscribers");
  XLSX.writeFile(workbook, "subscribers.xlsx");
}

export default function SubscribersPage() {
  const { data } = useSWR("https://api.samaabysiblings.com/backend/api/v1/subscribe/get", fetcher)
  const items = data?.items ?? []

  return (
    <div className="grid gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Subscribers</h2>
        <div className="flex gap-2">
          <Button onClick={() => downloadCSV(items)}>Export CSV</Button>
          <Button onClick={() => downloadExcel(items)}>Export Excel</Button>
        </div>
      </div>

      <div className="glass rounded-lg p-2 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((s: any) => (
              <TableRow key={s.id}>
                <TableCell>{s.id}</TableCell>
                <TableCell>{s.email}</TableCell>
                <TableCell>{new Date(s.created_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No subscribers
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
