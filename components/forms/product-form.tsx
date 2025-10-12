"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
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
  stock: z.coerce.number().min(0).optional(),
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
      taglines,
      images,
      notes,
      features,
    },
  })

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
        url = `https://api.samaabysiblings.com/backend/api/api/v1/candles/update/${initial.id}`
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
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid gap-4 glass p-4 rounded-lg"
    >
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
        <Label htmlFor="price">Price <span className="text-red-500">*</span></Label>
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
          placeholder="e.g., soft, bold"
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

      <div className="grid gap-2">
        <Label htmlFor="stock">Stock</Label>
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