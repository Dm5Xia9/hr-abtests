import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface ComboboxItem {
  value: string
  label: string
}

interface ComboboxProps {
  items: ComboboxItem[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  emptyText?: string
  createNew?: (value: string) => void
}

export function Combobox({
  items,
  value,
  onChange,
  placeholder = "Выберите элемент...",
  emptyText = "Элемент не найден.",
  createNew,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() && createNew) {
      e.preventDefault()
      createNew(inputValue.trim())
      setOpen(false)
    }
  }

  const selectedItem = items.find(item => item.value === value)

  const handleCreateNew = () => {
    if (inputValue.trim() && createNew) {
      createNew(inputValue.trim())
      setOpen(false)
    }
  }

  const filteredItems = inputValue 
    ? items.filter(item => 
        item.label.toLowerCase().includes(inputValue.toLowerCase()))
    : items;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {value ? selectedItem?.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <div className="flex flex-col">
          <div className="flex items-center border-b p-2">
            <Input
              placeholder="Поиск или создание..."
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          
          <ScrollArea className="h-[200px]">
            {filteredItems.length > 0 ? (
              <div className="flex flex-col p-1">
                {filteredItems.map((item) => (
                  <div
                    key={item.value}
                    onClick={() => {
                      onChange(item.value)
                      setInputValue("")
                      setOpen(false)
                    }}
                    className={cn(
                      "flex items-center rounded-md px-2 py-2 cursor-pointer text-sm hover:bg-accent hover:text-accent-foreground",
                      value === item.value && "bg-accent text-accent-foreground"
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === item.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {item.label}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-sm">
                {emptyText}
                {createNew && inputValue.trim() && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2"
                    onClick={handleCreateNew}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить "{inputValue}"
                  </Button>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  )
} 