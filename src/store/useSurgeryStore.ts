import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Surgery, ArchiveStatus, Anomaly } from '../types';
import { generateSurgeries } from '../data/mockData';
import { useAnomalyStore } from './useAnomalyStore';

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
  getAllSurgeries: () => Surgery[];
  syncAnomaliesToSurgeries: () => void;
}

function generateAllSurgeries(): Surgery[] {
  return generateSurgeries(100);
}

export const useSurgeryStore = create<SurgeryState>()(
  persist(
    (set, get) => ({
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
      const persisted = get().surgeries;
      const allData = persisted.length > 0 ? persisted : generateAllSurgeries();
      const { statusFilter } = get();
      let filtered = allData;
      if (statusFilter !== 'all') {
        filtered = filtered.filter((s) => s.archiveStatus === statusFilter);
      }
      const total = filtered.length;
      const { page, pageSize } = get();
      const start = (page - 1) * pageSize;
      const paged = filtered.slice(start, start + pageSize);
      set({ surgeries: allData, total, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '获取手术列表失败', loading: false });
    }
  },

  fetchSurgeryById: async (id) => {
    set({ loading: true, error: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const { surgeries, syncAnomaliesToSurgeries } = get();
      let surgery = surgeries.find((s) => s.surgeryId === id);
      if (!surgery) {
        const allSurgeries = generateAllSurgeries();
        surgery = allSurgeries.find((s) => s.surgeryId === id) || null;
      }
      if (surgery) {
        syncAnomaliesToSurgeries();
        const updated = get().surgeries.find((s) => s.surgeryId === id);
        surgery = updated || surgery;
      }
      set({ selectedSurgery: surgery, loading: false });
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

  getAllSurgeries: () => {
    return get().surgeries.length > 0 ? get().surgeries : generateAllSurgeries();
  },

  syncAnomaliesToSurgeries: () => {
    const anomalyStore = useAnomalyStore.getState();
    const allAnomalies = anomalyStore.anomalies.length > 0
      ? anomalyStore.anomalies
      : (() => {
          const s = generateAllSurgeries();
          return s.flatMap((x) => x.anomalies);
        })();
    const anomaliesBySurgery: Record<string, Anomaly[]> = {};
    allAnomalies.forEach((a: Anomaly) => {
      if (!anomaliesBySurgery[a.surgeryId]) {
        anomaliesBySurgery[a.surgeryId] = [];
      }
      anomaliesBySurgery[a.surgeryId].push(a);
    });
    const { surgeries, selectedSurgery } = get();
    const updatedSurgeries = surgeries.map((s) => {
      if (anomaliesBySurgery[s.surgeryId]) {
        return { ...s, anomalies: anomaliesBySurgery[s.surgeryId] };
      }
      return s;
    });
    const updatedSelected = selectedSurgery && anomaliesBySurgery[selectedSurgery.surgeryId]
      ? { ...selectedSurgery, anomalies: anomaliesBySurgery[selectedSurgery.surgeryId] }
      : selectedSurgery;
    set({ surgeries: updatedSurgeries, selectedSurgery: updatedSelected });
  },
}),
{
  name: 'qc_surgeries',
  partialize: (state) => ({
    surgeries: state.surgeries,
    selectedSurgery: state.selectedSurgery,
  }),
}
));
