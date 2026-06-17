import { cn } from '@/lib/utils'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import Tag from './Tag'

export interface SelectOption {
  label: React.ReactNode
  value: string | number
  disabled?: boolean
}

interface SelectProps {
  options: SelectOption[]
  value?: (string | number) | (string | number)[]
  defaultValue?: (string | number) | (string | number)[]
  onChange?: (
    value: (string | number) | (string | number)[] | undefined
  ) => void
  placeholder?: string
  multiple?: boolean
  searchable?: boolean
  clearable?: boolean
  disabled?: boolean
  className?: string
  dropdownClassName?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-3 text-sm',
  lg: 'h-12 px-4 text-base',
}

export default function Select({
  options,
  value,
  defaultValue,
  onChange,
  placeholder = '请选择',
  multiple = false,
  searchable = false,
  clearable = true,
  disabled = false,
  className,
  dropdownClassName,
  size = 'md',
}: SelectProps) {
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = useState<
    (string | number) | (string | number)[] | undefined
  >(defaultValue)
  const [open, setOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentValue = isControlled ? value : internalValue

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchText) return options
    const lower = searchText.toLowerCase()
    return options.filter((opt) =>
      String(opt.label).toString().toLowerCase().includes(lower)
    )
  }, [options, searchable, searchText])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
        setSearchText('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (open && searchable && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open, searchable])

  const isSelected = (optValue: string | number) => {
    if (multiple) {
      return Array.isArray(currentValue) && currentValue.includes(optValue)
    }
    return currentValue === optValue
  }

  const handleSelect = (opt: SelectOption) => {
    if (opt.disabled) return

    let newValue: (string | number) | (string | number)[] | undefined

    if (multiple) {
      const arr = Array.isArray(currentValue) ? [...currentValue] : []
      const idx = arr.indexOf(opt.value)
      if (idx > -1) {
        arr.splice(idx, 1)
      } else {
        arr.push(opt.value)
      }
      newValue = arr
    } else {
      newValue = opt.value
      setOpen(false)
      setSearchText('')
    }

    if (!isControlled) setInternalValue(newValue)
    onChange?.(newValue)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newValue: (string | number) | (string | number)[] | undefined = multiple ? [] : undefined
    if (!isControlled) setInternalValue(newValue)
    onChange?.(newValue)
    setSearchText('')
  }

  const displayLabel = useMemo(() => {
    if (multiple) {
      const arr = Array.isArray(currentValue) ? currentValue : []
      return options.filter((opt) => arr.includes(opt.value))
    }
    return options.find((opt) => opt.value === currentValue)
  }, [currentValue, multiple, options])

  const hasValue = multiple
    ? Array.isArray(currentValue) && currentValue.length > 0
    : currentValue !== undefined && currentValue !== null && currentValue !== ''

  return (
    <div ref={containerRef} className={cn('relative inline-block w-full', className)}>
      <div
        onClick={() => {
          if (!disabled) setOpen(!open)
        }}
        className={cn(
          'flex items-center gap-2 rounded-lg border bg-white cursor-pointer transition-all',
          'focus-within:ring-2 focus-within:ring-medical-primary/30 focus-within:border-medical-primary',
          sizeMap[size],
          open
            ? 'border-medical-primary ring-2 ring-medical-primary/30'
            : 'border-border-default hover:border-gray-400',
          disabled && 'bg-gray-50 cursor-not-allowed opacity-60'
        )}
      >
        {searchable && open ? (
          <input
            ref={inputRef}
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={hasValue ? '' : placeholder}
            className="flex-1 bg-transparent outline-none text-sm text-text-primary placeholder:text-text-tertiary"
            onClick={(e) => e.stopPropagation()}
            disabled={disabled}
          />
        ) : multiple && Array.isArray(displayLabel) && displayLabel.length > 0 ? (
          <div className="flex-1 flex flex-wrap items-center gap-1">
            {displayLabel.map((opt) => (
              <Tag
                key={opt.value}
                closable
                onClose={() => {
                  const arr = Array.isArray(currentValue)
                    ? currentValue.filter((v) => v !== opt.value)
                    : []
                  if (!isControlled) setInternalValue(arr)
                  onChange?.(arr)
                }}
              >
                {opt.label}
              </Tag>
            ))}
          </div>
        ) : (
          <span
            className={cn(
              'flex-1 truncate text-sm',
              hasValue ? 'text-text-primary' : 'text-text-tertiary'
            )}
          >
            {hasValue && !multiple
              ? (displayLabel as SelectOption | undefined)?.label ?? placeholder
              : placeholder}
          </span>
        )}

        <div className="flex items-center gap-1 shrink-0">
          {clearable && hasValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 rounded text-text-tertiary hover:text-text-secondary hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {searchable ? (
            <Search className="w-4 h-4 text-text-tertiary shrink-0" />
          ) : (
            <ChevronDown
              className={cn(
                'w-4 h-4 text-text-tertiary shrink-0 transition-transform',
                open && 'rotate-180'
              )}
            />
          )}
        </div>
      </div>

      {open && !disabled && (
        <div
          className={cn(
            'absolute z-20 w-full mt-1 bg-white rounded-lg shadow-lg border border-border-light shadow-card-hover overflow-hidden animate-fade-in',
            dropdownClassName
          )}
        >
          <div className="max-h-60 overflow-y-auto scrollbar-thin py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-text-tertiary">
                暂无匹配选项
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 text-sm cursor-pointer transition-colors',
                    isSelected(opt.value)
                      ? 'bg-medical-primary-light text-medical-primary'
                      : 'text-text-primary hover:bg-gray-50',
                    opt.disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent'
                  )}
                >
                  <span className="flex-1 truncate">{opt.label}</span>
                  {isSelected(opt.value) && (
                    <Check className="w-4 h-4 shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
