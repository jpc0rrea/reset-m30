"use client"

import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"

interface PortionInputProps {
  value: number | ""
  onChange: (value: number | "") => void
  className?: string
}

export function PortionInput({ value, onChange, className }: PortionInputProps) {
  const [inputValue, setInputValue] = useState("")

  useEffect(() => {
    setInputValue(value === "" ? "" : String(value).replace(".", ","))
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    if (newValue === "") {
      onChange("")
      return
    }

    const num = Number(newValue.replace(",", "."))
    if (!isNaN(num)) {
      onChange(num)
    }
  }

  return (
    <Input
      type="text"
      inputMode="decimal"
      className={className}
      value={inputValue}
      onChange={handleChange}
    />
  )
} 