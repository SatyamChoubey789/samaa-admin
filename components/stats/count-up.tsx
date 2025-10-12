"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function CountUp({
  label,
  value,
  prefix,
  suffix,
}: {
  label: string
  value: number
  prefix?: string
  suffix?: string
}) {
  const [n, setN] = useState(0)
  useEffect(() => {
    let raf: number
    const start = performance.now()
    const duration = 800
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      setN(Math.floor(value * p))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="text-3xl font-semibold">
        {prefix}
        {n.toLocaleString()}
        {suffix}
      </CardContent>
    </Card>
  )
}
