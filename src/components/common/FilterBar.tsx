import { Search, Calendar, X, RotateCcw, Building2, Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TimeRangeType } from '@/types';

const timeRangeOptions: { value: TimeRangeType; label: string }[] = [
  { value: 'day', label: '今日' },
  { value: 'week', label: '近7天' },
  { value: 'month', label: '近30天' },
];

export interface FilterBarProps {
  timeRange: TimeRangeType;
  startDate: string;
  endDate: string;
  departments: string[];
  availableDepartments: string[];
  procedureCodes: string[];
  availableProcedures: Array<{ code: string; name: string }>;
  searchKeyword: string;
  onTimeRangeChange: (range: TimeRangeType) => void;
  onDateRangeChange: (startDate: string, endDate: string) => void;
  onDepartmentToggle: (dept: string) => void;
  onProcedureToggle: (code: string) => void;
  onSearchChange: (keyword: string) => void;
  onReset: () => void;
  className?: string;
}

export default function FilterBar({
  timeRange,
  startDate,
  endDate,
  departments,
  availableDepartments,
  procedureCodes,
  availableProcedures,
  searchKeyword,
  onTimeRangeChange,
  onDateRangeChange,
  onDepartmentToggle,
  onProcedureToggle,
  onSearchChange,
  onReset,
  className,
}: FilterBarProps) {
  const hasActiveFilters =
    departments.length > 0 ||
    procedureCodes.length > 0 ||
    timeRange === 'custom' ||
    searchKeyword !== '';

  return (
    <div
      className={cn(
        'bg-background-card rounded-xl p-4 shadow-card space-y-4',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="搜索患者姓名、手术名称..."
            value={searchKeyword}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background-page rounded-lg border border-border-default text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 bg-background-page rounded-lg p-1">
          {timeRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onTimeRangeChange(option.value)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                timeRange === option.value
                  ? 'bg-medical-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white'
              )}
            >
              {option.label}
            </button>
          ))}
          <div className="w-px h-5 bg-border-default mx-1" />
          <div className="flex items-center gap-1.5 px-2">
            <Calendar className="w-4 h-4 text-text-tertiary" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => onDateRangeChange(e.target.value, endDate)}
              className="bg-transparent text-sm text-text-secondary focus:outline-none cursor-pointer w-[110px]"
            />
            <span className="text-text-tertiary text-sm">至</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onDateRangeChange(startDate, e.target.value)}
              className="bg-transparent text-sm text-text-secondary focus:outline-none cursor-pointer w-[110px]"
            />
          </div>
        </div>

        <div className="relative group">
          <button
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors',
              departments.length > 0
                ? 'bg-medical-primary-light border-medical-primary/20 text-medical-primary'
                : 'bg-background-page border-border-default text-text-secondary hover:text-text-primary hover:border-text-tertiary'
            )}
          >
            <Building2 className="w-4 h-4" />
            <span>科室</span>
            {departments.length > 0 && (
              <span className="bg-medical-primary text-white text-xs px-1.5 py-0.5 rounded-full">
                {departments.length}
              </span>
            )}
          </button>
          <div className="absolute top-full left-0 mt-2 w-56 bg-background-card rounded-lg shadow-card-hover border border-border-default p-2 hidden group-hover:block z-20 max-h-64 overflow-y-auto">
            {availableDepartments.map((dept) => (
              <label
                key={dept}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-background-page cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={departments.includes(dept)}
                  onChange={() => onDepartmentToggle(dept)}
                  className="w-4 h-4 rounded border-border-default text-medical-primary focus:ring-medical-primary"
                />
                <span className="text-sm text-text-primary">{dept}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="relative group">
          <button
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors',
              procedureCodes.length > 0
                ? 'bg-medical-primary-light border-medical-primary/20 text-medical-primary'
                : 'bg-background-page border-border-default text-text-secondary hover:text-text-primary hover:border-text-tertiary'
            )}
          >
            <Stethoscope className="w-4 h-4" />
            <span>手术方式</span>
            {procedureCodes.length > 0 && (
              <span className="bg-medical-primary text-white text-xs px-1.5 py-0.5 rounded-full">
                {procedureCodes.length}
              </span>
            )}
          </button>
          <div className="absolute top-full left-0 mt-2 w-64 bg-background-card rounded-lg shadow-card-hover border border-border-default p-2 hidden group-hover:block z-20 max-h-64 overflow-y-auto">
            {availableProcedures.map((proc) => (
              <label
                key={proc.code}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-background-page cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={procedureCodes.includes(proc.code)}
                  onChange={() => onProcedureToggle(proc.code)}
                  className="w-4 h-4 rounded border-border-default text-medical-primary focus:ring-medical-primary"
                />
                <span className="text-sm text-text-primary">{proc.name}</span>
              </label>
            ))}
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-text-tertiary hover:text-medical-danger hover:bg-medical-danger-light transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>重置</span>
          </button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border-light">
          {departments.map((dept) => (
            <span
              key={dept}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-medical-primary-light text-medical-primary text-sm rounded-full"
            >
              {dept}
              <button
                onClick={() => onDepartmentToggle(dept)}
                className="hover:bg-medical-primary/10 rounded p-0.5 -mr-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {procedureCodes.map((code) => {
            const proc = availableProcedures.find((p) => p.code === code);
            return (
              <span
                key={code}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-medical-primary-light text-medical-primary text-sm rounded-full"
              >
                {proc?.name || code}
                <button
                  onClick={() => onProcedureToggle(code)}
                  className="hover:bg-medical-primary/10 rounded p-0.5 -mr-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
