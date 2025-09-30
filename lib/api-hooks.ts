"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "./api"

// Dashboard Stats
export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await api.get("/api/v1/admin")
      return response.data.data;
    },
  })
}

// Products - Fixed to use consistent query keys and endpoints
export function useProducts() {
  return useQuery({
    queryKey: ["products"], // Changed from "candles" to match other hooks
    queryFn: async () => {
      const response = await api.get("/api/v1/candles") 
      return response.data
    },
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      // Use ID-based endpoint for admin operations
      const response = await api.get(`/api/v1/candles/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

// Product Mutations - Fixed to use correct endpoints and query invalidation
export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post("/api/v1/candles/add", data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/api/v1/candles/update/${id}`, data)
      return response.data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["product", id] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
    },
  })
}


export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/api/v1/candles/delete/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] }) // Fixed query key
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
    },
  })
}


// Orders
export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      
      const response = await api.get("/api/v1/orders/")
      return response.data;
    },
  })
}


export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const response = await api.get(`/admin/orders/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}


// Users
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await api.get("/admin/users")
      return response.data
    },
  })
}


export function useUser(id: string) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const response = await api.get(`/admin/users/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/admin/users/${id}`, data)
      return response.data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["user", id] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/admin/users/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
    },
  })
}

// Stories
export function useStories() {
  return useQuery({
    queryKey: ["stories"],
    queryFn: async () => {
      const response = await api.get("/api/v1/stories")
      return response.data;
    },
  })
}

export function useStory(id: string) {
  return useQuery({
    queryKey: ["story", id],
    queryFn: async () => {
      const response = await api.get(`/api/v1/stories/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateStory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post("/admin/stories", data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
    },
  })
}

export function useUpdateStory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/admin/stories/${id}`, data)
      return response.data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["stories"] })
      queryClient.invalidateQueries({ queryKey: ["story", id] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
    },
  })
}

export function useDeleteStory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/admin/stories/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
    },
  })
}