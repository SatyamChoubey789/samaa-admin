"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"

const schema = z.object({
  id: z.number().optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2),
  price: z.coerce.number().min(0),
  image: z.string().url().optional().or(z.literal("")),
  is_bundle: z.boolean().optional(),
  category: z.string().min(1),
  scent: z.string().min(1),
  description: z.string().min(1),
  mood: z.string().min(1),
  stock: z.coerce.number().min(0),
  in_stock: z.boolean(),  // Manual override
  low_stock_threshold: z.coerce.number().min(0).optional(),
  taglines: z.array(z.string().min(1)).optional(),
  images: z.array(z.string().url()).optional(),
  notes: z.array(z.string().min(1)).optional(),
  features: z.array(z.string().min(1)).min(1),
})

type FormValues = z.infer<typeof schema>

export function ProductForm({ initial }: { initial?: Partial<FormValues> }) {
  const { toast } = useToast()
  const router = useRouter()

  const [taglines, setTaglines] = useState<string[]>(initial?.taglines || [""])
  const [images, setImages] = useState<string[]>(initial?.images || [""])
  const [notes, setNotes] = useState<string[]>(initial?.notes || [""])
  const [features, setFeatures] = useState<string[]>(initial?.features || [""])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: initial?.id,
      slug: initial?.slug || "",
      name: initial?.name || "",
      price: initial?.price ?? 0,
      image: initial?.image || "",
      is_bundle: initial?.is_bundle || false,
      category: initial?.category || "",
      scent: initial?.scent || "",
      description: initial?.description || "",
      mood: initial?.mood || "",
      stock: initial?.stock ?? 100,
      in_stock: initial?.in_stock ?? true,
      low_stock_threshold: initial?.low_stock_threshold ?? 10,
      taglines,
      images,
      notes,
      features,
    },
  })

  
  

  // Watch stock value to auto-update in_stock
  const stockValue = form.watch("stock")
  const inStockValue = form.watch("in_stock")


  useEffect(() => {
    if (stockValue === 0) {
      form.setValue("in_stock", false)
    }
  }, [stockValue, form])

  useEffect(() => {
    form.setValue("taglines", taglines.filter(t => t.trim() !== ""))
  }, [taglines, form])
  
  useEffect(() => {
    form.setValue("images", images.filter(i => i.trim() !== ""))
  }, [images, form])
  
  useEffect(() => {
    form.setValue("notes", notes.filter(n => n.trim() !== ""))
  }, [notes, form])
  
  useEffect(() => {
    form.setValue("features", features.filter(f => f.trim() !== ""))
  }, [features, form])

  const onSubmit = async (values: FormValues) => {
    try {
      let url = "https://api.samaabysiblings.com/backend/api/v1/candles/add"
      let method = "POST"
      
      if (initial?.id) {
        url = `https://api.samaabysiblings.com/backend/api/v1/candles/update/${initial.id}`
        method = "PUT"
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        toast({ 
          title: "Error", 
          description: data.message || "Failed to save product",
          variant: "destructive"
        })
        return
      }

      toast({ 
        title: "Success", 
        description: data.message || "Product saved successfully" 
      })
      router.push("/admin/products")
      router.refresh()
    } catch (error) {
      console.error("Error saving product:", error)
      toast({ 
        title: "Error", 
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    }
  }

  const renderArrayInput = (
    label: string,
    values: string[],
    setValues: React.Dispatch<React.SetStateAction<string[]>>,
    placeholder = "",
    required = false
  ) => (
    <div className="grid gap-2">
      <Label>{label} {required && <span className="text-red-500">*</span>}</Label>
      <div className="grid gap-2">
        {values.map((val, idx) => (
          <div key={idx} className="flex gap-2">
            <Input
              placeholder={placeholder}
              value={val}
              onChange={(e) => {
                const next = [...values]
                next[idx] = e.target.value
                setValues(next)
              }}
              className="focus-ring"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (values.length > 1 || !required) {
                  const next = values.filter((_, i) => i !== idx)
                  setValues(next.length === 0 && required ? [""] : next)
                }
              }}
              disabled={values.length === 1 && required}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="secondary"
        onClick={() => setValues([...values, ""])}
      >
        Add {label.toLowerCase().replace(/s$/, "")}
      </Button>
    </div>
  )

  return (
   <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 glass p-4 rounded-lg">
      <div className="grid gap-2">
        <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
        <Input id="name" {...form.register("name")} className="focus-ring" />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="slug">Slug <span className="text-red-500">*</span></Label>
        <Input 
          id="slug" 
          {...form.register("slug")} 
          className="focus-ring"
          placeholder="lowercase-with-dashes"
        />
        {form.formState.errors.slug && (
          <p className="text-sm text-destructive">
            {form.formState.errors.slug.message}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="price">Price (₹) <span className="text-red-500">*</span></Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          {...form.register("price")}
          className="focus-ring"
        />
        {form.formState.errors.price && (
          <p className="text-sm text-destructive">
            {form.formState.errors.price.message}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="image">Main Image URL</Label>
        <Input 
          id="image" 
          {...form.register("image")} 
          className="focus-ring"
          placeholder="https://example.com/image.jpg"
        />
        {form.formState.errors.image && (
          <p className="text-sm text-destructive">
            {form.formState.errors.image.message}
          </p>
        )}
      </div>

      {/* ENHANCED STOCK MANAGEMENT SECTION */}
      <div className="border-t pt-4 mt-4">
        <h3 className="text-lg font-semibold mb-4">Stock Management</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="stock">
              Current Stock <span className="text-red-500">*</span>
            </Label>
            <Input
              id="stock"
              type="number"
              {...form.register("stock")}
              className="focus-ring"
              placeholder="100"
            />
            {form.formState.errors.stock && (
              <p className="text-sm text-destructive">
                {form.formState.errors.stock.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="low_stock_threshold">
              Low Stock Alert Threshold
            </Label>
            <Input
              id="low_stock_threshold"
              type="number"
              {...form.register("low_stock_threshold")}
              className="focus-ring"
              placeholder="10"
            />
          </div>
        </div>

        {/* MANUAL IN_STOCK TOGGLE */}
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="in_stock" className="text-base font-semibold">
                Availability Status
              </Label>
              <p className="text-sm text-gray-500">
                Manual override to hide item even if stock &gt; 0
              </p>
            </div>
            <Switch
              id="in_stock"
              checked={inStockValue}
              onCheckedChange={(checked) => form.setValue("in_stock", checked)}
            />
          </div>

          {/* Current Status Display */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm font-medium">Current Status:</span>
            {inStockValue ? (
              <span className="text-green-600 flex items-center gap-1 text-sm">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                Available to Customers
              </span>
            ) : (
              <span className="text-red-600 flex items-center gap-1 text-sm">
                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                Hidden from Customers
              </span>
            )}
          </div>
        </div>

        {/* QUICK STOCK ACTIONS */}
        <div className="mt-4 p-4 border rounded-lg">
          <h4 className="font-semibold mb-3">Quick Actions</h4>
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.setValue("stock", 0)
                form.setValue("in_stock", false)
              }}
            >
              Mark Out of Stock
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const current = form.getValues("stock")
                form.setValue("stock", current + 50)
                form.setValue("in_stock", true)
              }}
            >
              +50 Units
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.setValue("stock", 100)
                form.setValue("in_stock", true)
              }}
            >
              Reset to 100
            </Button>
          </div>
        </div>

        {/* STATUS ALERTS */}
        {stockValue > 0 && !inStockValue && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
            <p className="text-sm text-orange-800 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Note: Item has stock ({stockValue} units) but is hidden from customers
            </p>
          </div>
        )}

        {stockValue <= (form.watch("low_stock_threshold") || 10) && stockValue > 0 && inStockValue && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Warning: Stock is running low! Only {stockValue} units left.
            </p>
          </div>
        )}

        {stockValue === 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Item is out of stock and hidden from customers
            </p>
          </div>
        )}
      </div>


      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_bundle"
          {...form.register("is_bundle")}
          className="h-4 w-4"
        />
        <Label htmlFor="is_bundle" className="cursor-pointer">Is Bundle?</Label>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
        <Input
          id="category"
          {...form.register("category")}
          className="focus-ring"
          placeholder="e.g., soft, sharp"
        />
        {form.formState.errors.category && (
          <p className="text-sm text-destructive">
            {form.formState.errors.category.message}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="scent">Scent <span className="text-red-500">*</span></Label>
        <Input 
          id="scent" 
          {...form.register("scent")} 
          className="focus-ring"
          placeholder="e.g., mogra, sandalwood"
        />
        {form.formState.errors.scent && (
          <p className="text-sm text-destructive">
            {form.formState.errors.scent.message}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
        <textarea
          id="description"
          {...form.register("description")}
          className="focus-ring rounded-md border bg-background px-3 py-2 min-h-[100px]"
          rows={4}
          placeholder="Detailed product description..."
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="mood">Mood <span className="text-red-500">*</span></Label>
        <Input
          id="mood"
          {...form.register("mood")}
          className="focus-ring"
          placeholder="e.g., A dusky courtyard filled with moonlight"
        />
        {form.formState.errors.mood && (
          <p className="text-sm text-destructive">
            {form.formState.errors.mood.message}
          </p>
        )}
      </div>

      {renderArrayInput("Taglines", taglines, setTaglines, "e.g., 240g Soy Candle")}
      {renderArrayInput("Images (URLs)", images, setImages, "https://example.com/image.jpg")}
      {renderArrayInput("Notes", notes, setNotes, "e.g., Top: Fresh Mogra, Neroli Petals")}
      {renderArrayInput("Features", features, setFeatures, "e.g., Hand-poured with 100% natural soy wax", true)}

      {form.formState.errors.features && (
        <p className="text-sm text-destructive">At least one feature is required</p>
      )}

      <div className="flex items-center gap-2 pt-4">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : "Save Product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}