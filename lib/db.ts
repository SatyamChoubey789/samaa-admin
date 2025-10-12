export type User = {
  id: string
  name: string
  email: string
  passwordHash: string
  role: "admin" | "editor" | "support"
}

export type Product = {
  id: string
  name: string
  slug: string
  price: number
  mood: "calm" | "bold" | "neutral"
  features: string[]
  createdAt: string
  updatedAt: string
}

export type Story = {
  id: string
  title: string
  content: any // TipTap JSON
  updatedAt: string
}

export type Order = {
  id: string
  number: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  timeline: { id: string; label: string; at: string }[]
  total: number
  customerEmail: string
  createdAt: string
  updatedAt: string
}

export type Subscriber = {
  id: string
  email: string
  createdAt: string
}

export const db = {
  users: [
    {
      id: "u_admin",
      name: "SAMAA Admin",
      email: "admin@samaa.co",
      passwordHash: "admin@1975", // plaintext for demo only
      role: "admin",
    },
  ] as User[],
  products: [] as Product[],
  stories: [] as Story[],
  orders: [
    {
      id: "ord_1",
      number: "SO-1001",
      status: "processing",
      timeline: [
        { id: "t1", label: "Order placed", at: new Date().toISOString() },
        { id: "t2", label: "Payment captured", at: new Date().toISOString() },
      ],
      total: 199.0,
      customerEmail: "jane@example.com",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ] as Order[],
  subscribers: [] as Subscriber[],
}
