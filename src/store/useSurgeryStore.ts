import { create } from 'zustand';
import type { Surgery, ArchiveStatus } from '../types';
import { generateSurgeries } from '../data/mockData';

interface SurgeryState {
  surgeries: Surgery[];
  selectedSurgery: Surgery | null;
  loading: boolean;
  error: string | null;
  statusFilter: ArchiveStatus | 'all';
  page: number;
  pageSize: number;
  total: number;
  fetchSurgeries: () => Promise<void>;
  fetchSurgeryById: (id: string) => Promise<void>;
  setStatusFilter: (status: ArchiveStatus | 'all') => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  selectSurgery: (surgery: Surgery | null) => void;
  updateSurgeryArchiveStatus: (id: string, status: ArchiveStatus) => void;
  clearSelectedSurgery: () => void;
}

export const useSurgeryStore = create<SurgeryState>((set, get) => ({
  surgeries: [],
  selectedSurgery: null,
  loading: false,
  error: null,
  statusFilter: 'all',
  page: 1,
  pageSize: 20,
  total: 0,

  fetchSurgeries: async () => {
    set({ loading: true, error: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const data = generateSurgeries(100);
      const { statusFilter, searchKeyword, departments, procedureCodes, startDate, endDate } = {
        ...get(),
        ...{
          searchKeyword: '',
          departments: [] as string[],
          procedureCodes: [] as string[],
          startDate: '',
          endDate: '',
        },
      };
      let filtered = data;
      if (statusFilter !== 'all') {
        filtered = filtered.filter((s) => s.archiveStatus === statusFilter);
      }
      const total = filtered.length;
      const { page, pageSize } = get();
      const start = (page - 1) * pageSize;
      const paged = filtered.slice(start, start + pageSize);
      set({ surgeries: paged, total, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '获取手术列表失败', loading: false });
    }
  },

  fetchSurgeryById: async (id) => {
    set({ loading: true, error: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const { surgeries } = get();
      let surgery = surgeries.find((s) => s.surgeryId === id);
      if (!surgery) {
        const allSurgeries = generateSurgeries(50);
        surgery = allSurgeries.find((s) => s.surgeryId === id) || allSurgeries[0];
      }
      set({ selectedSurgery: surgery || null, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '获取手术详情失败', loading: false });
    }
  },

  setStatusFilter: (status) => {
    set({ statusFilter: status, page: 1 });
  },

  setPage: (page) => set({ page }),

  setPageSize: (size) => set({ pageSize: size, page: 1 }),

  selectSurgery: (surgery) => set({ selectedSurgery: surgery }),

  updateSurgeryArchiveStatus: (id, status) => {
    const { surgeries, selectedSurgery } = get();
    set({
      surgeries: surgeries.map((s) =>
        s.surgeryId === id ? { ...s, archiveStatus: status } : s
      ),
      selectedSurgery:
        selectedSurgery?.surgeryId === id
          ? { ...selectedSurgery, archiveStatus: status }
          : selectedSurgery,
    });
  },

  clearSelectedSurgery: () => set({ selectedSurgery: null }),
}));
