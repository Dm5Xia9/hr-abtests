import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DatePickerProps {
  date?: Date
  onSelect?: (date: Date | undefined) => void
}

export function DatePicker({ date, onSelect }: DatePickerProps) {
  const dateString = date ? date.toISOString().split('T')[0] : ''
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value) {
      const newDate = new Date(value)
      if (!isNaN(newDate.getTime())) {
        onSelect?.(newDate)
      }
    } else {
      onSelect?.(undefined)
    }
  }

  return (
    <div className="grid gap-2">
      <Input
        type="date"
        value={dateString}
        onChange={handleChange}
      />
    </div>
  )
} 