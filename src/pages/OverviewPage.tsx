import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Activity, FolderCheck, AlertTriangle, Scissors, Users, Building2 } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import KPICard from '@/components/charts/KPICard';
import TrendChart from '@/components/charts/TrendChart';
import PieChart from '@/components/charts/PieChart';
import StatusBadge from '@/components/common/StatusBadge';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Tag from '@/components/ui/Tag';
import { useStatisticStore } from '@/store/useStatisticStore';
import { useSurgeryStore } from '@/store/useSurgeryStore';
import { useAnomalyStore } from '@/store/useAnomalyStore';
import { formatNumber, formatPercent, getAnomalyTypeInfo } from '@/utils/formatUtils';
import { formatDateTime } from '@/utils/dateUtils';
import { exportMonthlyReport } from '@/utils/exportUtils';
import type { ArchiveStatus, AnomalyStatus } from '@/types';
import { cn } from '@/lib/utils';

type TrendDimension = 'day' | 'week' | 'month';

interface StatusChangeItem {
  surgeryId: string;
  surgeryName: string;
  patientName: string;
  time: string;
  status: ArchiveStatus;
}

export default function OverviewPage() {
  const navigate = useNavigate();
  const { kpiData, refreshAll, getTrendChartData, getAllDimensionStatistics } = useStatisticStore();
  const { surgeries, fetchSurgeries, syncAnomaliesToSurgeries, getAllSurgeries } = useSurgeryStore();
  const { getAllAnomalies, allAnomalies } = useAnomalyStore();
  const [trendDim, setTrendDim] = useState<TrendDimension>('day');
  const [exporting, setExporting] = useState(false);
  const [loopView, setLoopView] = useState<'assignee' | 'department'>('assignee');

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

  const anomalyList = useMemo(() => {
    return allAnomalies.length > 0 ? allAnomalies : getAllAnomalies();
  }, [allAnomalies, getAllAnomalies]);

  const anomalyPieData = useMemo(() => {
    const typeCount: Record<string, number> = {};
    anomalyList.forEach((a) => {
      const typeName = getAnomalyTypeInfo(a.anomalyType).label;
      typeCount[typeName] = (typeCount[typeName] || 0) + 1;
    });
    const colors = ['#EF4444', '#F59E0B', '#8B5CF6', '#3B82F6'];
    return Object.entries(typeCount).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
    }));
  }, [anomalyList]);

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

  const statusColumns: { key: AnomalyStatus | 'total'; label: string; color: string; bgColor: string }[] = [
    { key: 'pending', label: '待分派', color: 'text-gray-600', bgColor: 'bg-gray-100' },
    { key: 'assigned', label: '已分派', color: 'text-medical-primary', bgColor: 'bg-medical-primary-light' },
    { key: 'rectifying', label: '整改中', color: 'text-medical-warning', bgColor: 'bg-medical-warning-light' },
    { key: 'reviewing', label: '待复核', color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { key: 'closed', label: '已关闭', color: 'text-medical-success', bgColor: 'bg-medical-success-light' },
    { key: 'total', label: '总计', color: 'text-text-primary', bgColor: 'bg-gray-50' },
  ];

  const assigneeStats = useMemo<{ name: string; total: number; pending: number; assigned: number; rectifying: number; reviewing: number; closed: number; rejected: number }[]>(() => {
    const map = new Map<string, Record<string, number>>();
    anomalyList.forEach((a) => {
      const assignee = a.assignee || '未分派';
      if (!map.has(assignee)) {
        map.set(assignee, {
          pending: 0, assigned: 0, rectifying: 0, reviewing: 0, closed: 0, rejected: 0, total: 0,
        });
      }
      const stats = map.get(assignee)!;
      stats[a.status] = (stats[a.status] || 0) + 1;
      stats.total++;
    });
    return Array.from(map.entries())
      .map(([name, stats]) => ({
        name,
        pending: stats.pending || 0,
        assigned: stats.assigned || 0,
        rectifying: stats.rectifying || 0,
        reviewing: stats.reviewing || 0,
        closed: stats.closed || 0,
        rejected: stats.rejected || 0,
        total: stats.total || 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [anomalyList]);

  const departmentStats = useMemo<{ name: string; total: number; pending: number; assigned: number; rectifying: number; reviewing: number; closed: number; rejected: number }[]>(() => {
    const map = new Map<string, Record<string, number>>();
    anomalyList.forEach((a) => {
      const dept = a.surgery?.department || '未知科室';
      if (!map.has(dept)) {
        map.set(dept, {
          pending: 0, assigned: 0, rectifying: 0, reviewing: 0, closed: 0, rejected: 0, total: 0,
        });
      }
      const stats = map.get(dept)!;
      stats[a.status] = (stats[a.status] || 0) + 1;
      stats.total++;
    });
    return Array.from(map.entries())
      .map(([name, stats]) => ({
        name,
        pending: stats.pending || 0,
        assigned: stats.assigned || 0,
        rectifying: stats.rectifying || 0,
        reviewing: stats.reviewing || 0,
        closed: stats.closed || 0,
        rejected: stats.rejected || 0,
        total: stats.total || 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [anomalyList]);

  const loopStats = loopView === 'assignee' ? assigneeStats : departmentStats;

  const jumpToAnomalyList = (status?: AnomalyStatus) => {
    const { setStatusFilter, setTypeFilter, setPage } = useAnomalyStore.getState();
    setTypeFilter('all');
    setStatusFilter(status || 'all');
    setPage(1);
    navigate('/anomaly');
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      syncAnomaliesToSurgeries();
      if (kpiData) {
        const now = new Date();
        const period = `${now.getFullYear()}年${now.getMonth() + 1}月`;
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
            anomalies: anomalyList,
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

        <Card padding="none" shadow="sm">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <CardTitle className="text-base">异常闭环看板</CardTitle>
                <p className="text-sm text-text-tertiary mt-0.5">按维度统计各状态异常数量，点击数字可跳转查看明细</p>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setLoopView('assignee')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                    loopView === 'assignee'
                      ? 'bg-white text-medical-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  )}
                >
                  <Users className="w-4 h-4" />
                  按负责人
                </button>
                <button
                  type="button"
                  onClick={() => setLoopView('department')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                    loopView === 'department'
                      ? 'bg-white text-medical-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  )}
                >
                  <Building2 className="w-4 h-4" />
                  按科室
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full border-collapse min-w-[640px]">
                <thead>
                  <tr className="border-b border-border-light">
                    <th className="text-left text-xs font-medium text-text-tertiary py-2.5 px-3 bg-gray-50 sticky left-0 z-10">
                      {loopView === 'assignee' ? '负责人' : '科室'}
                    </th>
                    {statusColumns.map((col) => (
                      <th
                        key={col.key}
                        className="text-center text-xs font-medium text-text-tertiary py-2.5 px-3 bg-gray-50 whitespace-nowrap"
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loopStats.map((row, idx) => (
                    <tr
                      key={row.name}
                      className={cn(
                        'border-b border-border-light hover:bg-gray-50 transition-colors',
                        idx === loopStats.length - 1 && 'border-b-0'
                      )}
                    >
                      <td className="text-left text-sm text-text-primary py-3 px-3 font-medium sticky left-0 z-10 bg-white group-hover:bg-gray-50">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-medical-primary-light flex items-center justify-center flex-shrink-0">
                            {loopView === 'assignee' ? (
                              <Users className="w-3.5 h-3.5 text-medical-primary" />
                            ) : (
                              <Building2 className="w-3.5 h-3.5 text-medical-primary" />
                            )}
                          </div>
                          <span className="truncate">{row.name}</span>
                        </div>
                      </td>
                      {statusColumns.map((col) => {
                        const count = (row as any)[col.key] || 0;
                        const isTotal = col.key === 'total';
                        return (
                          <td
                            key={col.key}
                            className="text-center py-3 px-3"
                          >
                            <button
                              type="button"
                              onClick={() => !isTotal && jumpToAnomalyList(col.key as AnomalyStatus)}
                              className={cn(
                                'inline-flex items-center justify-center min-w-[36px] h-7 px-2 rounded-md text-sm font-medium transition-colors',
                                isTotal
                                  ? 'bg-gray-100 text-text-primary cursor-default'
                                  : count > 0
                                    ? cn(col.bgColor, col.color, 'hover:opacity-80 cursor-pointer')
                                    : 'bg-gray-50 text-text-tertiary cursor-default'
                              )}
                              disabled={isTotal || count === 0}
                            >
                              {count}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {loopStats.length === 0 && (
                    <tr>
                      <td
                        colSpan={statusColumns.length + 1}
                        className="text-center py-8 text-sm text-text-tertiary"
                      >
                        暂无统计数据
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-light">
              <Tag variant="info">共 {loopStats.length} 位{loopView === 'assignee' ? '负责人' : '科室'}</Tag>
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<span className="text-xs">→</span>}
                onClick={() => jumpToAnomalyList()}
              >
                查看完整清单
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
