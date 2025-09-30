"use client"

import { useProducts, useDeleteProduct } from "@/lib/api-hooks"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  slug: string
  scent?: string
  mood?: string
  is_bundle?: boolean
  image?: string
  taglines?: string[]
  images?: string[]
  notes?: string[]
  features?: string[]
  created_at?: string
  updated_at?: string
}

export default function ProductsPage() {
  const { data: productsResponse, isLoading, error } = useProducts()
  const deleteProduct = useDeleteProduct()

  // Handle the API response structure - your API returns { success, data, message }
  const products = productsResponse?.data || []
  
  // Debug logging - remove this after fixing
  console.log('Raw API Response:', productsResponse)
  console.log('Extracted products:', products)
  console.log('Is products an array?', Array.isArray(products))

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct.mutateAsync(id)
        toast({
          title: "Success",
          description: "Product deleted successfully",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete product",
          variant: "destructive",
        })
      }
    }
  }

  const columns = [
    {
      key: "name",
      header: "Name",
    },
    {
      key: "category",
      header: "Category",
    },
    {
      key: "scent",
      header: "Scent",
      render: (product: Product) => product.scent || "N/A",
    },
    {
      key: "price",
      header: "Price",
      render: (product: Product) => `₹${product.price?.toFixed(2) || '0.00'}`,
    },
    {
      key: "stock",
      header: "Stock",
      render: (product: Product) => (
        <Badge variant={product.stock > 0 ? "default" : "destructive"}>
          {product.stock || 0}
        </Badge>
      ),
    },
    {
      key: "is_bundle",
      header: "Type",
      render: (product: Product) => (
        <Badge variant={product.is_bundle ? "secondary" : "default"}>
          {product.is_bundle ? "Bundle" : "Single"}
        </Badge>
      ),
    },
  ]

  const actions = (product: Product) => (
    <>
      <DropdownMenuItem asChild>
        <Link href={`/admin/products/${product.id}/edit`} className="flex items-center">
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleDelete(product.id)} className="text-destructive focus:text-destructive">
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </DropdownMenuItem>
    </>
  )

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load products. Please try again later.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <DataTable 
        data={products} 
        columns={columns} 
        searchKey="name" 
        actions={actions} 
        isLoading={isLoading} 
      />
    </div>
  )
}