import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Anomaly, AnomalyStatus, AnomalyType, RectificationRecord } from '../types';
import { getAllSurgeries } from '../data/mockData';

interface AssignParams {
  anomalyId: string;
  assignee: string;
  deadline: string;
  remark?: string;
}

interface RectifyParams {
  anomalyId: string;
  result: string;
  attachmentUrl?: string;
}

interface ReviewParams {
  anomalyId: string;
  opinion: string;
  passed: boolean;
}

interface AnomalyState {
  anomalies: Anomaly[];
  selectedAnomaly: Anomaly | null;
  selectedIds: string[];
  loading: boolean;
  error: string | null;
  typeFilter: AnomalyType | 'all';
  statusFilter: AnomalyStatus | 'all';
  page: number;
  pageSize: number;
  total: number;
  fetchAnomalies: () => Promise<void>;
  fetchAnomalyById: (id: string) => Promise<void>;
  setTypeFilter: (type: AnomalyType | 'all') => void;
  setStatusFilter: (status: AnomalyStatus | 'all') => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  toggleSelect: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  selectAnomaly: (anomaly: Anomaly | null) => void;
  assignAnomaly: (params: AssignParams) => void;
  batchAssign: (ids: string[], assignee: string, deadline: string, remark?: string) => void;
  submitRectification: (params: RectifyParams) => void;
  reviewAnomaly: (params: ReviewParams) => void;
  getTypeStats: () => Record<AnomalyType | 'all', number>;
  getStatusStats: () => Record<AnomalyStatus | 'all', number>;
  getAllAnomalies: () => Anomaly[];
  clearSelectedAnomaly: () => void;
}

const statusNameMap: Record<AnomalyStatus, string> = {
  pending: '待处理',
  assigned: '已分派',
  rectifying: '整改中',
  reviewing: '复核中',
  closed: '已关闭',
  rejected: '已驳回',
};

function getAllAnomalies(): Anomaly[] {
  const surgeries = getAllSurgeries();
  return surgeries.flatMap((s) => s.anomalies);
}

export const useAnomalyStore = create<AnomalyState>()(
  persist(
    (set, get) => ({
      anomalies: [],
      selectedAnomaly: null,
      selectedIds: [],
      loading: false,
      error: null,
      typeFilter: 'all',
      statusFilter: 'all',
      page: 1,
      pageSize: 20,
      total: 0,

      fetchAnomalies: async () => {
        set({ loading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 300));
          const persisted = get().anomalies;
          const all = persisted.length > 0 ? persisted : getAllAnomalies();
          const { typeFilter, statusFilter } = get();
          let filtered = all;
          if (typeFilter !== 'all') {
            filtered = filtered.filter((a) => a.anomalyType === typeFilter);
          }
          if (statusFilter !== 'all') {
            filtered = filtered.filter((a) => a.status === statusFilter);
          }
          const total = filtered.length;
          const { page, pageSize } = get();
          const start = (page - 1) * pageSize;
          const paged = filtered.slice(start, start + pageSize);
          set({ anomalies: all, total, loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '获取异常列表失败', loading: false });
        }
      },

      fetchAnomalyById: async (id) => {
        set({ loading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 200));
          const { anomalies } = get();
          let anomaly = anomalies.find((a) => a.anomalyId === id);
          if (!anomaly) {
            const all = getAllAnomalies();
            anomaly = all.find((a) => a.anomalyId === id) || all[0];
          }
          set({ selectedAnomaly: anomaly || null, loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '获取异常详情失败', loading: false });
        }
      },

      setTypeFilter: (type) => set({ typeFilter: type, page: 1 }),

      setStatusFilter: (status) => set({ statusFilter: status, page: 1 }),

      setPage: (page) => set({ page }),

      setPageSize: (size) => set({ pageSize: size, page: 1 }),

      toggleSelect: (id) => {
        const { selectedIds } = get();
        const exists = selectedIds.includes(id);
        set({
          selectedIds: exists ? selectedIds.filter((i) => i !== id) : [...selectedIds, id],
        });
      },

      selectAll: (ids) => set({ selectedIds: ids }),

      clearSelection: () => set({ selectedIds: [] }),

      selectAnomaly: (anomaly) => set({ selectedAnomaly: anomaly }),

      assignAnomaly: ({ anomalyId, assignee, deadline, remark }) => {
        const now = new Date().toISOString();
        const record: RectificationRecord = {
          recordId: `REC${Date.now()}`,
          anomalyId,
          action: '分派整改',
          operator: '当前用户',
          operateTime: now,
          remark: remark || '请及时完成整改',
        };
        const updater = (a: Anomaly): Anomaly =>
          a.anomalyId === anomalyId
            ? {
                ...a,
                status: 'assigned',
                statusName: statusNameMap.assigned,
                assignee,
                deadline,
                rectificationTimeline: [...a.rectificationTimeline, record],
              }
            : a;
        const { anomalies, selectedAnomaly } = get();
        set({
          anomalies: anomalies.map(updater),
          selectedAnomaly: selectedAnomaly ? updater(selectedAnomaly) : null,
        });
      },

      batchAssign: (ids, assignee, deadline, remark) => {
        const now = new Date().toISOString();
        const updater = (a: Anomaly): Anomaly => {
          if (!ids.includes(a.anomalyId)) return a;
          const record: RectificationRecord = {
            recordId: `REC${Date.now()}${Math.random()}`,
            anomalyId: a.anomalyId,
            action: '分派整改',
            operator: '当前用户',
            operateTime: now,
            remark: remark || '请及时完成整改',
          };
          return {
            ...a,
            status: 'assigned',
            statusName: statusNameMap.assigned,
            assignee,
            deadline,
            rectificationTimeline: [...a.rectificationTimeline, record],
          };
        };
        const { anomalies, selectedAnomaly } = get();
        set({
          anomalies: anomalies.map(updater),
          selectedAnomaly: selectedAnomaly ? updater(selectedAnomaly) : null,
          selectedIds: [],
        });
      },

      submitRectification: ({ anomalyId, result, attachmentUrl }) => {
        const now = new Date().toISOString();
        const record: RectificationRecord = {
          recordId: `REC${Date.now()}`,
          anomalyId,
          action: '提交整改',
          operator: '当前用户',
          operateTime: now,
          remark: result,
          attachmentUrl,
        };
        const updater = (a: Anomaly): Anomaly =>
          a.anomalyId === anomalyId
            ? {
                ...a,
                status: 'reviewing',
                statusName: statusNameMap.reviewing,
                rectificationResult: result,
                rectificationTimeline: [...a.rectificationTimeline, record],
              }
            : a;
        const { anomalies, selectedAnomaly } = get();
        set({
          anomalies: anomalies.map(updater),
          selectedAnomaly: selectedAnomaly ? updater(selectedAnomaly) : null,
        });
      },

      reviewAnomaly: ({ anomalyId, opinion, passed }) => {
        const now = new Date().toISOString();
        const newStatus: AnomalyStatus = passed ? 'closed' : 'rejected';
        const record: RectificationRecord = {
          recordId: `REC${Date.now()}`,
          anomalyId,
          action: passed ? '复核通过' : '复核驳回',
          operator: '当前用户',
          operateTime: now,
          remark: opinion,
        };
        const updater = (a: Anomaly): Anomaly =>
          a.anomalyId === anomalyId
            ? {
                ...a,
                status: newStatus,
                statusName: statusNameMap[newStatus],
                reviewOpinion: opinion,
                reviewer: '当前用户',
                rectificationTimeline: [...a.rectificationTimeline, record],
              }
            : a;
        const { anomalies, selectedAnomaly } = get();
        set({
          anomalies: anomalies.map(updater),
          selectedAnomaly: selectedAnomaly ? updater(selectedAnomaly) : null,
        });
      },

      getTypeStats: () => {
        const { anomalies } = get();
        const all = anomalies.length > 0 ? anomalies : getAllAnomalies();
        const stats: Record<string, number> = { all: all.length };
        const types: AnomalyType[] = ['overdue', 'missing_items', 'patient_mismatch', 'duplicate'];
        types.forEach((t) => {
          stats[t] = all.filter((a) => a.anomalyType === t).length;
        });
        return stats as Record<AnomalyType | 'all', number>;
      },

      getStatusStats: () => {
        const all = getAllAnomalies();
        const stats: Record<string, number> = { all: all.length };
        const statuses: AnomalyStatus[] = ['pending', 'assigned', 'rectifying', 'reviewing', 'closed', 'rejected'];
        statuses.forEach((s) => {
          stats[s] = all.filter((a) => a.status === s).length;
        });
        return stats as Record<AnomalyStatus | 'all', number>;
      },

      getAllAnomalies: () => {
        return getAllAnomalies();
      },

      clearSelectedAnomaly: () => set({ selectedAnomaly: null }),
    }),
    {
      name: 'qc_anomalies',
      partialize: (state) => ({
        anomalies: state.anomalies,
        selectedAnomaly: state.selectedAnomaly,
        selectedIds: state.selectedIds,
      }),
    }
  )
);
