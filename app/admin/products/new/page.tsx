import { ProductForm } from "@/components/forms/product-form"

export default function NewProductPage() {
  return (
    <div className="grid gap-4">
      <h2 className="text-2xl font-bold">Add New Product</h2>
      <ProductForm />
    </div>
  )
}