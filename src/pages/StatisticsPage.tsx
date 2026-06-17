import { useEffect, useMemo } from 'react';
import { FileDown, ArrowUp, ArrowDown, Building2, Stethoscope, Scissors, User } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import BarChart from '../components/charts/BarChart';
import TrendChart from '../components/charts/TrendChart';
import KPICard from '../components/charts/KPICard';
import Table, { TableColumn } from '../components/ui/Table';
import Button from '../components/ui/Button';
import { useStatisticStore } from '../store/useStatisticStore';
import type { StatDimension } from '../types';
import { formatNumber, formatPercent, statDimensionMap, formatTrendArrow } from '../utils/formatUtils';
import { exportStatistics } from '../utils/exportUtils';

const DIMENSION_TABS: { key: StatDimension; label: string; icon: typeof Building2 }[] = [
  { key: 'department', label: '科室', icon: Building2 },
  { key: 'operatingRoom', label: '手术间', icon: Stethoscope },
  { key: 'equipment', label: '设备', icon: Scissors },
  { key: 'surgeon', label: '术者', icon: User },
];

export default function StatisticsPage() {
  const {
    dimension,
    setDimension,
    statisticData,
    trendData,
    loading,
    fetchStatisticData,
    fetchTrendData,
    refreshAll,
    getRankingData,
    getTrendChartData,
  } = useStatisticStore();

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    fetchStatisticData();
    fetchTrendData();
  }, [dimension, fetchStatisticData, fetchTrendData]);

  const rankingData = useMemo(() => getRankingData('anomalyRate'), [getRankingData]);
  const trendChartData = useMemo(() => getTrendChartData(), [getTrendChartData]);

  const barChartData = useMemo(() => {
    return rankingData.slice(0, 10).map((item) => ({
      name: item.dimensionValue,
      value: +(item.anomalyRate * 100).toFixed(2),
    }));
  }, [rankingData]);

  const top5Data = useMemo(() => rankingData.slice(0, 5), [rankingData]);

  const tableColumns: TableColumn<(typeof rankingData)[number]>[] = [
    {
      key: 'dimensionValue',
      title: '维度名称',
      dataIndex: 'dimensionValue',
      sortable: true,
      width: 160,
    },
    {
      key: 'surgeryCount',
      title: '手术台次',
      dataIndex: 'surgeryCount',
      sortable: true,
      align: 'right',
      width: 120,
      render: (value) => formatNumber(value as number),
    },
    {
      key: 'archivedCount',
      title: '已归档数',
      dataIndex: 'archivedCount',
      sortable: true,
      align: 'right',
      width: 120,
      render: (value) => formatNumber(value as number),
    },
    {
      key: 'archiveRate',
      title: '归档率',
      dataIndex: 'archiveRate',
      sortable: true,
      align: 'right',
      width: 120,
      render: (value) => formatPercent(value as number),
    },
    {
      key: 'anomalyCount',
      title: '异常数',
      dataIndex: 'anomalyCount',
      sortable: true,
      align: 'right',
      width: 100,
      render: (value) => formatNumber(value as number),
    },
    {
      key: 'anomalyRate',
      title: '异常率',
      dataIndex: 'anomalyRate',
      sortable: true,
      align: 'right',
      width: 120,
      render: (value) => formatPercent(value as number),
    },
    {
      key: 'trend',
      title: '趋势',
      align: 'right',
      width: 100,
      render: () => {
        const randomTrend = (Math.random() - 0.5) * 0.1;
        const trend = formatTrendArrow(randomTrend);
        const isUp = randomTrend > 0;
        return (
          <span
            className="inline-flex items-center gap-1 font-medium"
            style={{ color: trend.color }}
          >
            {isUp ? <ArrowUp className="w-3.5 h-3.5" /> : randomTrend < 0 ? <ArrowDown className="w-3.5 h-3.5" /> : null}
            {trend.text.split(' ')[1]}
          </span>
        );
      },
    },
  ];

  const handleExport = () => {
    exportStatistics(statisticData, `科室统计_${statDimensionMap[dimension]}`);
  };

  return (
    <PageContainer
      title="科室统计"
      actions={
        <Button variant="primary" leftIcon={<FileDown className="w-4 h-4" />} onClick={handleExport}>
          导出Excel
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="bg-background-card rounded-xl p-1.5 shadow-card inline-flex">
          {DIMENSION_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = dimension === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setDimension(tab.key)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-medical-primary text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <BarChart
          data={barChartData}
          title={`${statDimensionMap[dimension]}异常率排名`}
          subtitle="按异常率降序排列 Top10"
          gradientStart="#EF4444"
          gradientEnd="#F59E0B"
          valueFormatter={(value) => `${value}%`}
          height={360}
        />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <TrendChart data={trendChartData} height={360} />
          </div>
          <div className="xl:col-span-1">
            <div className="bg-background-card rounded-xl p-5 shadow-card h-full">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-text-primary">
                  {statDimensionMap[dimension]}TOP5
                </h3>
                <p className="text-sm text-text-tertiary mt-1">按异常率排名前5</p>
              </div>
              <div className="flex flex-col gap-3">
                {top5Data.map((item, index) => (
                  <KPICard
                    key={item.dimensionValue}
                    title={`${index + 1}. ${item.dimensionValue}`}
                    value={formatPercent(item.anomalyRate)}
                    suffix="异常率"
                    trend={+(item.anomalyRate * 100).toFixed(1)}
                    trendLabel="异常率"
                    icon={index < 3 ? undefined : undefined}
                    iconColor={
                      index === 0
                        ? 'text-medical-danger'
                        : index === 1
                        ? 'text-orange-500'
                        : index === 2
                        ? 'text-yellow-500'
                        : 'text-text-tertiary'
                    }
                    valueColor={
                      index === 0
                        ? 'text-medical-danger'
                        : index === 1
                        ? 'text-orange-500'
                        : index === 2
                        ? 'text-yellow-600'
                        : 'text-text-primary'
                    }
                    className="!p-4"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <Table
          columns={tableColumns}
          dataSource={rankingData}
          rowKey="dimensionValue"
          pagination
          pageSize={10}
        />
      </div>
    </PageContainer>
  );
}
