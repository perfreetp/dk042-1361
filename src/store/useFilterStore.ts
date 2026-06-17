import { create } from 'zustand';
import type { TimeRangeType } from '../types';
import { mockDepartments, mockProcedures } from '../data/mockData';

interface FilterState {
  timeRange: TimeRangeType;
  startDate: string;
  endDate: string;
  departments: string[];
  availableDepartments: string[];
  procedureCodes: string[];
  availableProcedures: Array<{ code: string; name: string }>;
  searchKeyword: string;
  setTimeRange: (range: TimeRangeType) => void;
  setDateRange: (startDate: string, endDate: string) => void;
  toggleDepartment: (dept: string) => void;
  setDepartments: (depts: string[]) => void;
  clearDepartments: () => void;
  toggleProcedure: (code: string) => void;
  setProcedures: (codes: string[]) => void;
  clearProcedures: () => void;
  setSearchKeyword: (keyword: string) => void;
  resetFilters: () => void;
}

function getDefaultDateRange(): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 29);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

const defaultDates = getDefaultDateRange();

export const useFilterStore = create<FilterState>((set, get) => ({
  timeRange: 'month',
  startDate: defaultDates.start,
  endDate: defaultDates.end,
  departments: [],
  availableDepartments: mockDepartments,
  procedureCodes: [],
  availableProcedures: mockProcedures,
  searchKeyword: '',

  setTimeRange: (range) => {
    const now = new Date();
    let start = new Date();
    switch (range) {
      case 'day':
        start = now;
        break;
      case 'week':
        start.setDate(now.getDate() - 6);
        break;
      case 'month':
        start.setDate(now.getDate() - 29);
        break;
      case 'custom':
        break;
    }
    set({
      timeRange: range,
      startDate: range !== 'custom' ? start.toISOString().split('T')[0] : get().startDate,
      endDate: range !== 'custom' ? now.toISOString().split('T')[0] : get().endDate,
    });
  },

  setDateRange: (startDate, endDate) => {
    set({ startDate, endDate, timeRange: 'custom' });
  },

  toggleDepartment: (dept) => {
    const { departments } = get();
    const exists = departments.includes(dept);
    set({
      departments: exists ? departments.filter((d) => d !== dept) : [...departments, dept],
    });
  },

  setDepartments: (depts) => set({ departments: depts }),

  clearDepartments: () => set({ departments: [] }),

  toggleProcedure: (code) => {
    const { procedureCodes } = get();
    const exists = procedureCodes.includes(code);
    set({
      procedureCodes: exists ? procedureCodes.filter((c) => c !== code) : [...procedureCodes, code],
    });
  },

  setProcedures: (codes) => set({ procedureCodes: codes }),

  clearProcedures: () => set({ procedureCodes: [] }),

  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),

  resetFilters: () => {
    const dates = getDefaultDateRange();
    set({
      timeRange: 'month',
      startDate: dates.start,
      endDate: dates.end,
      departments: [],
      procedureCodes: [],
      searchKeyword: '',
    });
  },
}));
