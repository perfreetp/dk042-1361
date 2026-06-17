import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StatisticData, KPIData, StatDimension } from '../types';
import { generateStatisticData, generateKPIData } from '../data/mockData';

interface StatisticState {
  kpiData: KPIData | null;
  statisticData: StatisticData[];
  trendData: StatisticData[];
  loading: boolean;
  error: string | null;
  dimension: StatDimension;
  fetchKPIData: () => Promise<void>;
  fetchStatisticData: () => Promise<void>;
  fetchTrendData: () => Promise<void>;
  setDimension: (dim: StatDimension) => void;
  getRankingData: (sortBy?: 'surgeryCount' | 'archiveRate' | 'anomalyCount' | 'anomalyRate') => Array<{
    dimensionValue: string;
    surgeryCount: number;
    archivedCount: number;
    anomalyCount: number;
    archiveRate: number;
    anomalyRate: number;
  }>;
  getTrendChartData: () => Array<{
    date: string;
    surgeryCount: number;
    archiveRate: number;
    anomalyRate: number;
  }>;
  getAllDimensionStatistics: () => StatisticData[];
  refreshAll: () => Promise<void>;
}

export const useStatisticStore = create<StatisticState>()(
  persist(
    (set, get) => ({
      kpiData: null,
      statisticData: [],
      trendData: [],
      loading: false,
      error: null,
      dimension: 'department',

      fetchKPIData: async () => {
        set({ loading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 200));
          const persisted = get().kpiData;
          const data = persisted || generateKPIData();
          set({ kpiData: data, loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '获取KPI数据失败', loading: false });
        }
      },

      fetchStatisticData: async () => {
        set({ loading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 300));
          const { dimension } = get();
          const persisted = get().statisticData;
          const all = persisted.length > 0 ? persisted : generateStatisticData();
          const today = new Date(2026, 5, 17).toISOString().split('T')[0];
          const filtered = all.filter((d) => d.dimension === dimension && d.statDate === today);
          set({ statisticData: all, trendData: persisted.length > 0 ? get().trendData : all, loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '获取统计数据失败', loading: false });
        }
      },

      fetchTrendData: async () => {
        set({ loading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 300));
          const { dimension } = get();
          const persisted = get().trendData;
          const all = persisted.length > 0 ? persisted : generateStatisticData();
          const filtered = all.filter((d) => d.dimension === dimension);
          set({ trendData: persisted.length > 0 ? all.filter((d) => d.dimension === dimension) : all, loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '获取趋势数据失败', loading: false });
        }
      },

      setDimension: (dim) => {
        set({ dimension: dim });
      },

      getRankingData: (sortBy = 'surgeryCount') => {
        const { statisticData, dimension } = get();
        const all = statisticData.length > 0 ? statisticData : generateStatisticData();
        const today = new Date(2026, 5, 17).toISOString().split('T')[0];
        const todayData = all.filter((d) => d.dimension === dimension && d.statDate === today);
        const aggregated = todayData.reduce<Record<string, {
          surgeryCount: number;
          archivedCount: number;
          anomalyCount: number;
        }>>((acc, item) => {
          if (!acc[item.dimensionValue]) {
            acc[item.dimensionValue] = {
              surgeryCount: 0,
              archivedCount: 0,
              anomalyCount: 0,
            };
          }
          acc[item.dimensionValue].surgeryCount += item.surgeryCount;
          acc[item.dimensionValue].archivedCount += item.archivedCount;
          acc[item.dimensionValue].anomalyCount += item.anomalyCount;
          return acc;
        }, {});
        const result = Object.entries(aggregated).map(([dimensionValue, data]) => ({
          dimensionValue,
          surgeryCount: data.surgeryCount,
          archivedCount: data.archivedCount,
          anomalyCount: data.anomalyCount,
          archiveRate: data.surgeryCount > 0 ? +(data.archivedCount / data.surgeryCount).toFixed(4) : 0,
          anomalyRate: data.surgeryCount > 0 ? +(data.anomalyCount / data.surgeryCount).toFixed(4) : 0,
        }));
        result.sort((a, b) => {
          if (sortBy === 'archiveRate' || sortBy === 'anomalyRate') {
            return b[sortBy] - a[sortBy];
          }
          return b[sortBy] - a[sortBy];
        });
        return result;
      },

      getTrendChartData: () => {
        const { trendData } = get();
        const all = trendData.length > 0 ? trendData : generateStatisticData();
        const byDate = all.reduce<Record<string, {
          surgeryCount: number;
          archivedCount: number;
          anomalyCount: number;
        }>>((acc, item) => {
          if (!acc[item.statDate]) {
            acc[item.statDate] = {
              surgeryCount: 0,
              archivedCount: 0,
              anomalyCount: 0,
            };
          }
          acc[item.statDate].surgeryCount += item.surgeryCount;
          acc[item.statDate].archivedCount += item.archivedCount;
          acc[item.statDate].anomalyCount += item.anomalyCount;
          return acc;
        }, {});
        return Object.entries(byDate)
          .map(([date, data]) => ({
            date,
            surgeryCount: data.surgeryCount,
            archiveRate: data.surgeryCount > 0 ? +(data.archivedCount / data.surgeryCount).toFixed(4) : 0,
            anomalyRate: data.surgeryCount > 0 ? +(data.anomalyCount / data.surgeryCount).toFixed(4) : 0,
          }))
          .sort((a, b) => a.date.localeCompare(b.date));
      },

      getAllDimensionStatistics: () => {
        const allData = generateStatisticData();
        const dimensions: StatDimension[] = ['department', 'operatingRoom', 'equipment', 'surgeon'];
        return allData.filter((d) => dimensions.includes(d.dimension));
      },

      refreshAll: async () => {
        await Promise.all([
          get().fetchKPIData(),
          get().fetchStatisticData(),
          get().fetchTrendData(),
        ]);
      },
    }),
    {
      name: 'qc_statistics',
      partialize: (state) => ({
        kpiData: state.kpiData,
        statisticData: state.statisticData,
        trendData: state.trendData,
        dimension: state.dimension,
      }),
    }
  )
);
