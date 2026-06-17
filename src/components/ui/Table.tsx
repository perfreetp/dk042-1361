import { cn } from '@/lib/utils'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import Button from './Button'

export interface TableColumn<T> {
  key: string
  title: React.ReactNode
  dataIndex?: keyof T
  sortable?: boolean
  width?: string | number
  align?: 'left' | 'center' | 'right'
  render?: (value: T[keyof T] | undefined, record: T, index: number) => React.ReactNode
}

type SortOrder = 'asc' | 'desc' | null

interface TableProps<T> {
  columns: TableColumn<T>[]
  dataSource: T[]
  rowKey?: keyof T | ((record: T) => string)
  striped?: boolean
  selectable?: boolean
  selectedRowKeys?: (string | number)[]
  onSelectChange?: (selectedRowKeys: (string | number)[], selectedRows: T[]) => void
  pagination?: boolean
  pageSize?: number
  height?: string | number
  className?: string
  tableClassName?: string
  emptyText?: React.ReactNode
}

function Pagination({
  current,
  total,
  pageSize,
  onChange,
}: {
  current: number
  total: number
  pageSize: number
  onChange: (page: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const getPages = () => {
    const pages: (number | '...')[] = []
    const delta = 1
    const range: number[] = []
    const rangeWithDots: (number | '...')[] = []

    for (
      let i = Math.max(2, current - delta);
      i <= Math.min(totalPages - 1, current + delta);
      i++
    ) {
      range.push(i)
    }

    if (current > 2) {
      rangeWithDots.push('...')
    }

    for (const i of range) {
      rangeWithDots.push(i)
    }

    if (current < totalPages - 1) {
      rangeWithDots.push('...')
    }

    pages.push(1, ...rangeWithDots)
    if (totalPages > 1) pages.push(totalPages)

    return pages
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border-light">
      <span className="text-sm text-text-secondary">
        共 {total} 条记录，第 {current} / {totalPages} 页
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={current <= 1}
          onClick={() => onChange(current - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        {getPages().map((page, idx) =>
          page === '...' ? (
            <span key={`dots-${idx}`} className="px-2 text-sm text-text-tertiary">
              ...
            </span>
          ) : (
            <Button
              key={page}
              size="sm"
              variant={page === current ? 'primary' : 'ghost'}
              onClick={() => onChange(page as number)}
            >
              {page}
            </Button>
          )
        )}
        <Button
          variant="ghost"
          size="sm"
          disabled={current >= totalPages}
          onClick={() => onChange(current + 1)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

export default function Table<T extends Record<string, unknown>>({
  columns,
  dataSource,
  rowKey = 'id' as keyof T,
  striped = true,
  selectable = false,
  selectedRowKeys,
  onSelectChange,
  pagination = true,
  pageSize = 10,
  height,
  className,
  tableClassName,
  emptyText = '暂无数据',
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<(string | number)[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  const isControlledSelection = selectedRowKeys !== undefined
  const currentSelectedKeys = isControlledSelection
    ? selectedRowKeys
    : internalSelectedKeys

  const getRowKey = (record: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(record)
    }
    return (record[rowKey] as string | number) ?? index
  }

  const sortedData = useMemo(() => {
    if (!sortKey || !sortOrder) return dataSource

    return [...dataSource].sort((a, b) => {
      const column = columns.find((c) => c.key === sortKey)
      if (!column || !column.dataIndex) return 0

      const aVal = a[column.dataIndex]
      const bVal = b[column.dataIndex]

      if (aVal === bVal) return 0
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      let cmp = 0
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        cmp = aVal - bVal
      } else {
        cmp = String(aVal).localeCompare(String(bVal))
      }

      return sortOrder === 'asc' ? cmp : -cmp
    })
  }, [dataSource, sortKey, sortOrder, columns])

  const handleSort = (column: TableColumn<T>) => {
    if (!column.sortable) return

    if (sortKey !== column.key) {
      setSortKey(column.key)
      setSortOrder('asc')
    } else if (sortOrder === 'asc') {
      setSortOrder('desc')
    } else if (sortOrder === 'desc') {
      setSortKey(null)
      setSortOrder(null)
    } else {
      setSortOrder('asc')
    }
  }

  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData
    const start = (currentPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, pagination, currentPage, pageSize])

  const allSelected =
    selectable &&
    paginatedData.length > 0 &&
    paginatedData.every((row, idx) =>
      currentSelectedKeys.includes(getRowKey(row, idx))
    )

  const someSelected =
    selectable &&
    paginatedData.some((row, idx) =>
      currentSelectedKeys.includes(getRowKey(row, idx))
    ) && !allSelected

  const toggleAll = () => {
    if (allSelected) {
      const newKeys = currentSelectedKeys.filter(
        (key) =>
          !paginatedData.some((row, idx) => getRowKey(row, idx) === key)
      )
      if (!isControlledSelection) setInternalSelectedKeys(newKeys)
      onSelectChange?.(
        newKeys,
        dataSource.filter((row, idx) => newKeys.includes(getRowKey(row, idx)))
      )
    } else {
      const newKeys = Array.from(
        new Set([
          ...currentSelectedKeys,
          ...paginatedData.map((row, idx) => getRowKey(row, idx)),
        ])
      )
      if (!isControlledSelection) setInternalSelectedKeys(newKeys)
      onSelectChange?.(
        newKeys,
        dataSource.filter((row, idx) => newKeys.includes(getRowKey(row, idx)))
      )
    }
  }

  const toggleRow = (record: T, index: number) => {
    const key = getRowKey(record, index)
    const isSelected = currentSelectedKeys.includes(key)

    let newKeys: (string | number)[]
    if (isSelected) {
      newKeys = currentSelectedKeys.filter((k) => k !== key)
    } else {
      newKeys = [...currentSelectedKeys, key]
    }

    if (!isControlledSelection) setInternalSelectedKeys(newKeys)
    onSelectChange?.(
      newKeys,
      dataSource.filter((row, idx) => newKeys.includes(getRowKey(row, idx)))
    )
  }

  return (
    <div
      className={cn(
        'bg-background-card rounded-lg border border-border-light overflow-hidden',
        className
      )}
    >
      <div
        className="overflow-auto scrollbar-thin"
        style={height ? { maxHeight: typeof height === 'number' ? `${height}px` : height } : undefined}
      >
        <table className={cn('w-full text-sm', tableClassName)}>
          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr className="border-b border-border-default">
              {selectable && (
                <th className="px-4 py-3 text-left font-medium text-text-secondary w-10">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-medical-primary focus:ring-medical-primary/30"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected
                    }}
                    onChange={toggleAll}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{
                    width:
                      typeof column.width === 'number'
                        ? `${column.width}px`
                        : column.width,
                    textAlign: column.align ?? 'left',
                  }}
                  className={cn(
                    'px-4 py-3 font-medium text-text-secondary whitespace-nowrap',
                    column.sortable && 'cursor-pointer select-none'
                  )}
                  onClick={() => handleSort(column)}
                >
                  <span className="inline-flex items-center gap-1">
                    {column.title}
                    {column.sortable && (
                      <span className="inline-flex flex-col -space-y-1 ml-0.5">
                        <ChevronUp
                          className={cn(
                            'w-3 h-3 transition-colors',
                            sortKey === column.key && sortOrder === 'asc'
                              ? 'text-medical-primary'
                              : 'text-text-tertiary'
                          )}
                        />
                        <ChevronDown
                          className={cn(
                            'w-3 h-3 -mt-1 transition-colors',
                            sortKey === column.key && sortOrder === 'desc'
                              ? 'text-medical-primary'
                              : 'text-text-tertiary'
                          )}
                        />
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-12 text-center text-text-tertiary"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              paginatedData.map((record, index) => {
                const rowKeyVal = getRowKey(record, index)
                const isSelected = currentSelectedKeys.includes(rowKeyVal)
                return (
                  <tr
                    key={rowKeyVal}
                    className={cn(
                      'border-b border-border-light transition-colors',
                      striped && index % 2 === 1 && 'bg-gray-50/50',
                      isSelected && 'bg-medical-primary-light/50',
                      'hover:bg-gray-50'
                    )}
                  >
                    {selectable && (
                      <td className="px-4 py-3 w-10">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-medical-primary focus:ring-medical-primary/30"
                          checked={isSelected}
                          onChange={() => toggleRow(record, index)}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        style={{ textAlign: column.align ?? 'left' }}
                        className="px-4 py-3 text-text-primary"
                      >
                        {column.render
                          ? column.render(
                              column.dataIndex
                                ? (record[column.dataIndex] as T[keyof T])
                                : undefined,
                              record,
                              index
                            )
                          : column.dataIndex
                          ? (record[column.dataIndex] as React.ReactNode)
                          : null}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      {pagination && dataSource.length > 0 && (
        <Pagination
          current={currentPage}
          total={dataSource.length}
          pageSize={pageSize}
          onChange={setCurrentPage}
        />
      )}
    </div>
  )
}
