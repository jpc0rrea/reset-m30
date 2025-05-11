"use client"

import { Input } from "@/components/ui/input"

interface PortionInputProps {
  value: number | ""
  onChange: (value: number | "") => void
  className?: string
}

export function PortionInput({ value, onChange, className }: PortionInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value

    // Allow empty input
    if (input === "") {
      onChange("")
      return
    }

    // Only allow numbers and one decimal point
    if (!/^\d*\.?\d*$/.test(input)) {
      return
    }

    // Convert to number if it's a valid number
    const num = Number(input)
    if (!isNaN(num)) {
      onChange(num)
    }
  }

  return (
    <Input
      type="text"
      inputMode="decimal"
      className={className}
      value={value}
      onChange={handleChange}
    />
  )
} 