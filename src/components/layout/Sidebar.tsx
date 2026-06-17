import { useState } from 'react';
import {
  Calendar,
  Building2,
  Stethoscope,
  Search,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import type { TimeRangeType } from '@/types';
import { cn } from '@/lib/utils';
import { useFilterStore } from '@/store/useFilterStore';

const timeRangeOptions: Array<{ value: TimeRangeType; label: string }> = [
  { value: 'day', label: '日' },
  { value: 'week', label: '周' },
  { value: 'month', label: '月' },
  { value: 'custom', label: '自定义' },
];

export default function Sidebar() {
  const {
    timeRange,
    startDate,
    endDate,
    departments,
    availableDepartments,
    procedureCodes,
    availableProcedures,
    searchKeyword,
    setTimeRange,
    setDateRange,
    toggleDepartment,
    clearDepartments,
    toggleProcedure,
    clearProcedures,
    setSearchKeyword,
    resetFilters,
  } = useFilterStore();

  const [deptExpanded, setDeptExpanded] = useState(true);
  const [procExpanded, setProcExpanded] = useState(true);
  const [deptSearch, setDeptSearch] = useState('');
  const [procSearch, setProcSearch] = useState('');

  const filteredDepartments = availableDepartments.filter((dept) =>
    dept.includes(deptSearch)
  );
  const filteredProcedures = availableProcedures.filter(
    (proc) => proc.name.includes(procSearch) || proc.code.includes(procSearch)
  );

  const handleApply = () => {};

  return (
    <aside className="w-72 bg-white border-r border-border-default flex flex-col h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-4 border-b border-border-light">
        <h2 className="text-sm font-semibold text-text-primary">筛选条件</h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-medical-primary" />
            <span className="text-sm font-medium text-text-primary">时间范围</span>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {timeRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={cn(
                  'py-2 text-sm rounded-lg font-medium transition-all duration-200',
                  timeRange === option.value
                    ? 'bg-medical-primary text-white shadow-sm'
                    : 'bg-gray-50 text-text-secondary hover:bg-gray-100'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          {timeRange === 'custom' && (
            <div className="space-y-2 animate-fade-in">
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">开始日期</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setDateRange(e.target.value, endDate)}
                  className="w-full px-3 py-2 text-sm border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">结束日期</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setDateRange(startDate, e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary transition-all"
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => setDeptExpanded(!deptExpanded)}
            className="flex items-center justify-between w-full mb-3"
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-medical-primary" />
              <span className="text-sm font-medium text-text-primary">科室</span>
              {departments.length > 0 && (
                <span className="px-1.5 py-0.5 text-xs rounded-full bg-medical-primary-light text-medical-primary font-medium">
                  {departments.length}
                </span>
              )}
            </div>
            {deptExpanded ? (
              <ChevronUp className="w-4 h-4 text-text-tertiary" />
            ) : (
              <ChevronDown className="w-4 h-4 text-text-tertiary" />
            )}
          </button>
          {deptExpanded && (
            <div className="space-y-2 animate-fade-in">
              <div className="relative">
                <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={deptSearch}
                  onChange={(e) => setDeptSearch(e.target.value)}
                  placeholder="搜索科室"
                  className="w-full pl-9 pr-8 py-2 text-sm border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary transition-all"
                />
                {deptSearch && (
                  <button
                    onClick={() => setDeptSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-3.5 h-3.5 text-text-tertiary" />
                  </button>
                )}
              </div>
              {departments.length > 0 && (
                <button
                  onClick={clearDepartments}
                  className="text-xs text-medical-primary hover:text-medical-primary-dark transition-colors"
                >
                  清空选择
                </button>
              )}
              <div className="max-h-48 overflow-y-auto scrollbar-thin space-y-1">
                {filteredDepartments.length === 0 ? (
                  <div className="py-4 text-center text-sm text-text-tertiary">
                    暂无匹配科室
                  </div>
                ) : (
                  filteredDepartments.map((dept) => {
                    const isSelected = departments.includes(dept);
                    return (
                      <button
                        key={dept}
                        onClick={() => toggleDepartment(dept)}
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all duration-200',
                          isSelected
                            ? 'bg-medical-primary-light text-medical-primary font-medium'
                            : 'hover:bg-gray-50 text-text-secondary'
                        )}
                      >
                        <span className="truncate">{dept}</span>
                        {isSelected && <Check className="w-4 h-4 flex-shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => setProcExpanded(!procExpanded)}
            className="flex items-center justify-between w-full mb-3"
          >
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-medical-primary" />
              <span className="text-sm font-medium text-text-primary">术式</span>
              {procedureCodes.length > 0 && (
                <span className="px-1.5 py-0.5 text-xs rounded-full bg-medical-primary-light text-medical-primary font-medium">
                  {procedureCodes.length}
                </span>
              )}
            </div>
            {procExpanded ? (
              <ChevronUp className="w-4 h-4 text-text-tertiary" />
            ) : (
              <ChevronDown className="w-4 h-4 text-text-tertiary" />
            )}
          </button>
          {procExpanded && (
            <div className="space-y-2 animate-fade-in">
              <div className="relative">
                <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={procSearch}
                  onChange={(e) => setProcSearch(e.target.value)}
                  placeholder="搜索术式"
                  className="w-full pl-9 pr-8 py-2 text-sm border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary transition-all"
                />
                {procSearch && (
                  <button
                    onClick={() => setProcSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-3.5 h-3.5 text-text-tertiary" />
                  </button>
                )}
              </div>
              {procedureCodes.length > 0 && (
                <button
                  onClick={clearProcedures}
                  className="text-xs text-medical-primary hover:text-medical-primary-dark transition-colors"
                >
                  清空选择
                </button>
              )}
              <div className="max-h-48 overflow-y-auto scrollbar-thin space-y-1">
                {filteredProcedures.length === 0 ? (
                  <div className="py-4 text-center text-sm text-text-tertiary">
                    暂无匹配术式
                  </div>
                ) : (
                  filteredProcedures.map((proc) => {
                    const isSelected = procedureCodes.includes(proc.code);
                    return (
                      <button
                        key={proc.code}
                        onClick={() => toggleProcedure(proc.code)}
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all duration-200',
                          isSelected
                            ? 'bg-medical-primary-light text-medical-primary font-medium'
                            : 'hover:bg-gray-50 text-text-secondary'
                        )}
                      >
                        <div className="flex-1 min-w-0 text-left">
                          <p className="truncate">{proc.name}</p>
                          <p className="text-xs text-text-tertiary truncate">{proc.code}</p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 flex-shrink-0 ml-2" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-medical-primary" />
            <span className="text-sm font-medium text-text-primary">关键词搜索</span>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索患者姓名、手术ID..."
              className="w-full pl-9 pr-8 py-2 text-sm border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary transition-all"
            />
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-3.5 h-3.5 text-text-tertiary" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-border-light space-y-2">
        <button
          onClick={resetFilters}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-text-secondary border border-border-default rounded-lg hover:bg-gray-50 hover:text-text-primary transition-all duration-200"
        >
          <RotateCcw className="w-4 h-4" />
          重置
        </button>
        <button
          onClick={handleApply}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-medical-primary rounded-lg hover:bg-medical-primary-dark transition-all duration-200 shadow-sm"
        >
          <Check className="w-4 h-4" />
          应用筛选
        </button>
      </div>
    </aside>
  );
}
