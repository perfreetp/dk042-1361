import { useEffect, useState, useMemo } from 'react';
import { Download, Activity, FolderCheck, AlertTriangle, Scissors } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import KPICard from '@/components/charts/KPICard';
import TrendChart from '@/components/charts/TrendChart';
import PieChart from '@/components/charts/PieChart';
import StatusBadge from '@/components/common/StatusBadge';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useStatisticStore } from '@/store/useStatisticStore';
import { useSurgeryStore } from '@/store/useSurgeryStore';
import { useAnomalyStore } from '@/store/useAnomalyStore';
import { formatNumber, formatPercent, getAnomalyTypeInfo } from '@/utils/formatUtils';
import { formatDateTime } from '@/utils/dateUtils';
import { exportMonthlyReport } from '@/utils/exportUtils';
import type { ArchiveStatus } from '@/types';

type TrendDimension = 'day' | 'week' | 'month';

interface StatusChangeItem {
  surgeryId: string;
  surgeryName: string;
  patientName: string;
  time: string;
  status: ArchiveStatus;
}

export default function OverviewPage() {
  const { kpiData, refreshAll, getTrendChartData, getAllDimensionStatistics } = useStatisticStore();
  const { surgeries, fetchSurgeries, syncAnomaliesToSurgeries, getAllSurgeries } = useSurgeryStore();
  const { getAllAnomalies } = useAnomalyStore();
  const [trendDim, setTrendDim] = useState<TrendDimension>('day');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    refreshAll();
    fetchSurgeries().then(() => {
      syncAnomaliesToSurgeries();
    });
  }, [refreshAll, fetchSurgeries, syncAnomaliesToSurgeries]);

  const trendChartData = useMemo(() => {
    const rawData = getTrendChartData();
    if (trendDim === 'day') {
      return rawData.slice(-14).map((d) => ({
        date: d.date.slice(5),
        surgeryCount: d.surgeryCount,
        archiveRate: +(d.archiveRate * 100).toFixed(1),
      }));
    } else if (trendDim === 'week') {
      const weekMap = new Map<string, { surgeryCount: number; archiveRateSum: number; count: number }>();
      rawData.forEach((d) => {
        const date = new Date(d.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
        const existing = weekMap.get(weekKey) || { surgeryCount: 0, archiveRateSum: 0, count: 0 };
        weekMap.set(weekKey, {
          surgeryCount: existing.surgeryCount + d.surgeryCount,
          archiveRateSum: existing.archiveRateSum + d.archiveRate,
          count: existing.count + 1,
        });
      });
      return Array.from(weekMap.entries()).slice(-8).map(([date, data]) => ({
        date,
        surgeryCount: data.surgeryCount,
        archiveRate: +((data.archiveRateSum / data.count) * 100).toFixed(1),
      }));
    } else {
      const monthMap = new Map<string, { surgeryCount: number; archiveRateSum: number; count: number }>();
      rawData.forEach((d) => {
        const monthKey = d.date.slice(0, 7);
        const existing = monthMap.get(monthKey) || { surgeryCount: 0, archiveRateSum: 0, count: 0 };
        monthMap.set(monthKey, {
          surgeryCount: existing.surgeryCount + d.surgeryCount,
          archiveRateSum: existing.archiveRateSum + d.archiveRate,
          count: existing.count + 1,
        });
      });
      return Array.from(monthMap.entries()).slice(-6).map(([date, data]) => ({
        date,
        surgeryCount: data.surgeryCount,
        archiveRate: +((data.archiveRateSum / data.count) * 100).toFixed(1),
      }));
    }
  }, [trendDim, getTrendChartData]);

  const allAnomalies = useMemo(() => getAllAnomalies(), [getAllAnomalies, surgeries]);

  const anomalyPieData = useMemo(() => {
    const typeCount: Record<string, number> = {};
    allAnomalies.forEach((a) => {
      const typeName = getAnomalyTypeInfo(a.anomalyType).label;
      typeCount[typeName] = (typeCount[typeName] || 0) + 1;
    });
    const colors = ['#EF4444', '#F59E0B', '#8B5CF6', '#3B82F6'];
    return Object.entries(typeCount).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
    }));
  }, [allAnomalies]);

  const statusChangeList = useMemo((): StatusChangeItem[] => {
    const allChanges: StatusChangeItem[] = surgeries
      .filter((s) => s.archiveTime || s.startTime)
      .map((s) => ({
        surgeryId: s.surgeryId,
        surgeryName: s.surgeryName,
        patientName: s.patient?.name || '',
        time: s.archiveTime || s.startTime,
        status: s.archiveStatus,
      }));
    return allChanges
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10);
  }, [surgeries]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      syncAnomaliesToSurgeries();
      if (kpiData) {
        const now = new Date();
        const period = `${now.getFullYear()}年${now.getMonth() + 1}月`;
        const allAnomalies = getAllAnomalies();
        const allSurgeries = getAllSurgeries();
        const allStatistics = getAllDimensionStatistics();
        exportMonthlyReport(
          {
            period,
            kpi: {
              totalSurgeries: kpiData.totalSurgeries,
              archivedSurgeries: kpiData.archivedSurgeries,
              archiveRate: kpiData.archiveRate,
              totalAnomalies: kpiData.totalAnomalies,
              compareLastPeriod: kpiData.compareLastPeriod,
              anomalyTypeStats: kpiData.anomalyTypeStats,
              topDepartments: kpiData.topDepartments,
              topOperatingRooms: kpiData.topOperatingRooms,
              topEquipments: kpiData.topEquipments,
              topSurgeons: kpiData.topSurgeons,
            },
            surgeries: allSurgeries,
            anomalies: allAnomalies,
            statistics: allStatistics,
          },
          `归档月报_${period}`
        );
      }
    } finally {
      setExporting(false);
    }
  };

  const archivedTrend = useMemo(() => {
    if (!kpiData) return [];
    const base = kpiData.archivedSurgeries;
    return Array.from({ length: 7 }, (_, i) => ({
      value: Math.round(base * (0.85 + Math.random() * 0.3) / 7),
    }));
  }, [kpiData]);

  return (
    <PageContainer
      title="归档总览"
      subtitle="手术归档数据统计与趋势分析"
      actions={
        <Button
          variant="primary"
          leftIcon={<Download className="w-4 h-4" />}
          loading={exporting}
          onClick={handleExport}
        >
          导出月报
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <KPICard
            title="手术总台次"
            value={formatNumber(kpiData?.totalSurgeries || 0)}
            suffix="台"
            trend={kpiData?.compareLastPeriod.surgeries}
            trendLabel="环比"
            icon={Scissors}
            iconColor="text-medical-primary"
            sparklineData={Array.from({ length: 7 }, (_, i) => ({
              value: Math.round((kpiData?.totalSurgeries || 0) * (0.8 + Math.random() * 0.4) / 7),
            }))}
          />
          <KPICard
            title="已归档数"
            value={formatNumber(kpiData?.archivedSurgeries || 0)}
            suffix="台"
            trend={+(
              ((kpiData?.archivedSurgeries || 0) -
                (kpiData?.totalSurgeries || 0) / (1 + (kpiData?.compareLastPeriod.surgeries || 0) / 100) *
                  (1 + (kpiData?.compareLastPeriod.archiveRate || 0) / 100)) /
              Math.max(
                (kpiData?.totalSurgeries || 0) / (1 + (kpiData?.compareLastPeriod.surgeries || 0) / 100) *
                  (1 + (kpiData?.compareLastPeriod.archiveRate || 0) / 100),
                1
              ) *
              100
            ).toFixed(1)}
            trendLabel="环比"
            icon={FolderCheck}
            iconColor="text-medical-success"
            sparklineData={archivedTrend}
          />
          <KPICard
            title="归档完成率"
            value={formatPercent(kpiData?.archiveRate || 0, 1)}
            trend={kpiData?.compareLastPeriod.archiveRate}
            trendLabel="环比"
            icon={Activity}
            iconColor="text-[#7B61FF]"
            sparklineData={Array.from({ length: 7 }, (_, i) => ({
              value: Math.round((kpiData?.archiveRate || 0) * 100 * (0.9 + Math.random() * 0.2)),
            }))}
          />
          <KPICard
            title="异常总数"
            value={formatNumber(kpiData?.totalAnomalies || 0)}
            suffix="例"
            trend={kpiData?.compareLastPeriod.anomalies}
            trendLabel="环比"
            icon={AlertTriangle}
            iconColor="text-medical-danger"
            sparklineData={Array.from({ length: 7 }, (_, i) => ({
              value: Math.round((kpiData?.totalAnomalies || 0) * (0.7 + Math.random() * 0.6) / 7),
            }))}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <Card padding="none" shadow="none" className="bg-transparent">
              <CardContent>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-text-primary">手术台次与归档率趋势</h3>
                    <p className="text-sm text-text-tertiary mt-1">展示手术量变化及归档完成情况</p>
                  </div>
                  <div className="flex items-center gap-1 bg-background-card rounded-lg p-1">
                    {(['day', 'week', 'month'] as TrendDimension[]).map((dim) => (
                      <button
                        key={dim}
                        onClick={() => setTrendDim(dim)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                          trendDim === dim
                            ? 'bg-medical-primary text-white shadow-sm'
                            : 'text-text-secondary hover:text-text-primary hover:bg-background-page'
                        }`}
                      >
                        {dim === 'day' ? '日' : dim === 'week' ? '周' : '月'}
                      </button>
                    ))}
                  </div>
                </div>
                <TrendChart
                  data={trendChartData}
                  height={340}
                  className="shadow-none p-0"
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-5">
            <PieChart
              data={anomalyPieData.length > 0 ? anomalyPieData : [
                { name: '暂无数据', value: 1, color: '#D1D5DB' },
              ]}
              title="异常类型分布"
              subtitle="各类型异常占比统计"
              centerLabel="异常总数"
              height={280}
            />

            <Card>
              <CardHeader>
                <CardTitle className="text-base">归档动态</CardTitle>
                <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-medical-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-medical-success"></span>
                  </span>
                  实时更新
                </div>
              </CardHeader>
              <CardContent className="max-h-[340px] overflow-y-auto -mx-2">
                <div className="space-y-1">
                  {statusChangeList.map((item) => (
                    <div
                      key={item.surgeryId}
                      className="flex items-center justify-between px-2 py-2.5 hover:bg-background-page rounded-lg transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-text-primary truncate">
                          {item.surgeryName}
                        </div>
                        <div className="text-xs text-text-tertiary mt-0.5">
                          {item.patientName} · {formatDateTime(item.time)}
                        </div>
                      </div>
                      <StatusBadge status={item.status} size="sm" className="ml-3 flex-shrink-0" />
                    </div>
                  ))}
                  {statusChangeList.length === 0 && (
                    <div className="py-8 text-center text-sm text-text-tertiary">
                      暂无动态数据
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
