import { notFound } from "next/navigation"
import { ProductForm } from "@/components/forms/product-form"

async function getProduct(id: string) {
  try {
    const res = await fetch(
      `https://api.samaabysiblings.com/backend/api/v1/candles/${id}`, 
      { 
        cache: "no-store",
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )
    
    if (!res.ok) {
      console.error(`Failed to fetch product: ${res.status}`)
      return null
    }
    
    const result = await res.json()
    
    // The API returns { success: true, data: {...}, message: "..." }
    if (!result.success || !result.data) {
      console.error('Invalid API response:', result)
      return null
    }
    
    return result.data
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export default async function EditProductPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const product = await getProduct(params.id)
  
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <div className="grid gap-4">
      <h2 className="text-2xl font-bold">Edit Product: {product.name}</h2>
      <ProductForm initial={product} />
    </div>
  )
}