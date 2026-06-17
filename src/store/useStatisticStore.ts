import { create } from 'zustand';
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
  refreshAll: () => Promise<void>;
}

export const useStatisticStore = create<StatisticState>((set, get) => ({
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
      set({ kpiData: generateKPIData(), loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '获取KPI数据失败', loading: false });
    }
  },

  fetchStatisticData: async () => {
    set({ loading: true, error: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const { dimension } = get();
      const all = generateStatisticData();
      const today = new Date().toISOString().split('T')[0];
      const filtered = all.filter((d) => d.dimension === dimension && d.statDate === today);
      set({ statisticData: filtered, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '获取统计数据失败', loading: false });
    }
  },

  fetchTrendData: async () => {
    set({ loading: true, error: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const { dimension } = get();
      const all = generateStatisticData();
      const filtered = all.filter((d) => d.dimension === dimension);
      set({ trendData: filtered, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '获取趋势数据失败', loading: false });
    }
  },

  setDimension: (dim) => {
    set({ dimension: dim });
  },

  getRankingData: (sortBy = 'surgeryCount') => {
    const { statisticData } = get();
    const aggregated = statisticData.reduce<Record<string, {
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
    const byDate = trendData.reduce<Record<string, {
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

  refreshAll: async () => {
    await Promise.all([
      get().fetchKPIData(),
      get().fetchStatisticData(),
      get().fetchTrendData(),
    ]);
  },
}));
