import * as XLSX from 'xlsx';
import type { Surgery, Anomaly, StatisticData, ArchiveItem } from '../types';
import { formatDateTime, formatDate } from './dateUtils';
import { getArchiveStatusInfo, getAnomalyStatusInfo, getAnomalyTypeInfo, formatPercent, formatNumber } from './formatUtils';

export interface ExportColumn<T> {
  key: keyof T | string;
  title: string;
  width?: number;
  formatter?: (value: any, row: T) => string | number;
}

export const exportToExcel = <T>(data: T[], columns: ExportColumn<T>[], fileName: string, sheetName: string = 'Sheet1'): void => {
  const worksheetData = data.map((row) => {
    const rowData: Record<string, string | number> = {};
    columns.forEach((col) => {
      const key = col.key as string;
      const value = (row as Record<string, any>)[key];
      rowData[col.title] = col.formatter ? col.formatter(value, row) : value ?? '';
    });
    return rowData;
  });

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);

  if (columns.some((col) => col.width)) {
    worksheet['!cols'] = columns.map((col) => ({ wch: col.width || 15 }));
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportSurgeryList = (surgeries: Surgery[], fileName: string = '手术归档清单'): void => {
  const columns: ExportColumn<Surgery>[] = [
    { key: 'surgeryId', title: '手术ID', width: 15 },
    { key: 'patient', title: '患者姓名', width: 12, formatter: (_, row) => row.patient?.name || '' },
    { key: 'patient', title: '性别', width: 8, formatter: (_, row) => row.patient?.gender || '' },
    { key: 'patient', title: '年龄', width: 8, formatter: (_, row) => row.patient?.age || '' },
    { key: 'surgeryName', title: '手术名称', width: 25 },
    { key: 'procedureName', title: '术式', width: 20 },
    { key: 'department', title: '科室', width: 15 },
    { key: 'operatingRoom', title: '手术间', width: 12 },
    { key: 'surgeon', title: '主刀医生', width: 12 },
    { key: 'startTime', title: '手术开始时间', width: 20, formatter: (v) => formatDateTime(v) },
    { key: 'endTime', title: '手术结束时间', width: 20, formatter: (v) => formatDateTime(v) },
    { key: 'archiveTime', title: '归档时间', width: 20, formatter: (v) => (v ? formatDateTime(v) : '-') },
    { key: 'archiveStatus', title: '归档状态', width: 12, formatter: (v) => getArchiveStatusInfo(v).label },
  ];

  exportToExcel(surgeries, columns, fileName, '手术归档清单');
};

export const exportAnomalyList = (anomalies: Anomaly[], fileName: string = '异常记录清单'): void => {
  const columns: ExportColumn<Anomaly>[] = [
    { key: 'anomalyId', title: '异常ID', width: 15 },
    { key: 'surgery', title: '手术ID', width: 15, formatter: (_, row) => row.surgery?.surgeryId || '' },
    { key: 'surgery', title: '患者姓名', width: 12, formatter: (_, row) => row.surgery?.patient?.name || '' },
    { key: 'surgery', title: '手术名称', width: 25, formatter: (_, row) => row.surgery?.surgeryName || '' },
    { key: 'anomalyType', title: '异常类型', width: 15, formatter: (v) => getAnomalyTypeInfo(v).label },
    { key: 'description', title: '异常描述', width: 30 },
    { key: 'discoverTime', title: '发现时间', width: 20, formatter: (v) => formatDateTime(v) },
    { key: 'status', title: '状态', width: 12, formatter: (v) => getAnomalyStatusInfo(v).label },
    { key: 'assignee', title: '整改负责人', width: 12 },
    { key: 'deadline', title: '整改期限', width: 15, formatter: (v) => (v ? formatDate(v) : '-') },
    { key: 'rectificationResult', title: '整改结果', width: 25 },
    { key: 'reviewer', title: '复核人', width: 12 },
    { key: 'reviewOpinion', title: '复核意见', width: 25 },
  ];

  exportToExcel(anomalies, columns, fileName, '异常记录清单');
};

export const exportStatistics = (statistics: StatisticData[], fileName: string = '统计数据'): void => {
  const columns: ExportColumn<StatisticData>[] = [
    { key: 'statDate', title: '统计日期', width: 12, formatter: (v) => formatDate(v) },
    { key: 'dimension', title: '统计维度', width: 10 },
    { key: 'dimensionValue', title: '维度值', width: 15 },
    { key: 'surgeryCount', title: '手术台次', width: 12, formatter: (v) => formatNumber(v) },
    { key: 'archivedCount', title: '已归档数', width: 12, formatter: (v) => formatNumber(v) },
    { key: 'anomalyCount', title: '异常数', width: 12, formatter: (v) => formatNumber(v) },
    { key: 'archiveRate', title: '归档率', width: 12, formatter: (v) => formatPercent(v) },
    { key: 'anomalyRate', title: '异常率', width: 12, formatter: (v) => formatPercent(v) },
  ];

  exportToExcel(statistics, columns, fileName, '统计数据');
};

export const exportArchiveItems = (items: ArchiveItem[], fileName: string = '归档资料清单'): void => {
  const columns: ExportColumn<ArchiveItem>[] = [
    { key: 'itemId', title: '资料ID', width: 15 },
    { key: 'surgeryId', title: '手术ID', width: 15 },
    { key: 'itemType', title: '资料类型', width: 10 },
    { key: 'itemName', title: '资料名称', width: 25 },
    { key: 'isRequired', title: '是否必归', width: 10, formatter: (v) => (v ? '是' : '否') },
    { key: 'status', title: '归档状态', width: 12 },
    { key: 'uploadTime', title: '上传时间', width: 20, formatter: (v) => (v ? formatDateTime(v) : '-') },
  ];

  exportToExcel(items, columns, fileName, '归档资料清单');
};

export const exportMonthlyReport = (data: {
  period: string;
  kpi: {
    totalSurgeries: number;
    archivedSurgeries: number;
    archiveRate: number;
    totalAnomalies: number;
    compareLastPeriod: {
      surgeries: number;
      archiveRate: number;
      anomalies: number;
    };
    anomalyTypeStats?: Record<string, number>;
    topDepartments?: Array<{ name: string; surgeryCount: number; archiveRate: number }>;
    topOperatingRooms?: Array<{ name: string; surgeryCount: number; archiveRate: number }>;
    topEquipments?: Array<{ name: string; surgeryCount: number; archiveRate: number }>;
    topSurgeons?: Array<{ name: string; surgeryCount: number; archiveRate: number }>;
  };
  surgeries: Surgery[];
  anomalies: Anomaly[];
  statistics: StatisticData[];
}, fileName: string): void => {
  const workbook = XLSX.utils.book_new();

  const summaryData: Array<Record<string, string | number>> = [];
  summaryData.push({ '统计周期': data.period });
  summaryData.push({});
  summaryData.push({ '指标': '手术总台次', '数值': formatNumber(data.kpi.totalSurgeries), '环比': `${data.kpi.compareLastPeriod.surgeries > 0 ? '↑' : data.kpi.compareLastPeriod.surgeries < 0 ? '↓' : '—'} ${Math.abs(data.kpi.compareLastPeriod.surgeries)}%` });
  summaryData.push({ '指标': '已归档数', '数值': formatNumber(data.kpi.archivedSurgeries), '环比': '' });
  summaryData.push({ '指标': '归档完成率', '数值': formatPercent(data.kpi.archiveRate), '环比': `${data.kpi.compareLastPeriod.archiveRate > 0 ? '↑' : data.kpi.compareLastPeriod.archiveRate < 0 ? '↓' : '—'} ${Math.abs(data.kpi.compareLastPeriod.archiveRate)}%` });
  summaryData.push({ '指标': '归档率环比变化', '数值': `${data.kpi.compareLastPeriod.archiveRate > 0 ? '上升' : data.kpi.compareLastPeriod.archiveRate < 0 ? '下降' : '持平'} ${Math.abs(data.kpi.compareLastPeriod.archiveRate)}个百分点`, '环比': '' });
  summaryData.push({ '指标': '异常总数', '数值': formatNumber(data.kpi.totalAnomalies), '环比': `${data.kpi.compareLastPeriod.anomalies > 0 ? '↑' : data.kpi.compareLastPeriod.anomalies < 0 ? '↓' : '—'} ${Math.abs(data.kpi.compareLastPeriod.anomalies)}%` });

  if (data.kpi.anomalyTypeStats) {
    summaryData.push({});
    summaryData.push({ '指标': '—— 各异常类型统计 ——', '数值': '', '环比': '' });
    Object.entries(data.kpi.anomalyTypeStats).forEach(([type, count]) => {
      summaryData.push({ '指标': type, '数值': formatNumber(count), '环比': data.kpi.totalAnomalies > 0 ? formatPercent(count / data.kpi.totalAnomalies) : '0%' });
    });
  }

  const topSections: Array<{ title: string; data: Array<{ name: string; surgeryCount: number; archiveRate: number }> | undefined }> = [
    { title: '科室 TOP3', data: data.kpi.topDepartments },
    { title: '手术间 TOP3', data: data.kpi.topOperatingRooms },
    { title: '设备 TOP3', data: data.kpi.topEquipments },
    { title: '术者 TOP3', data: data.kpi.topSurgeons },
  ];

  topSections.forEach((section) => {
    if (section.data && section.data.length > 0) {
      summaryData.push({});
      summaryData.push({ '指标': `—— ${section.title} ——`, '数值': '手术台次', '环比': '归档率' });
      section.data.forEach((item, idx) => {
        summaryData.push({
          '指标': `${idx + 1}. ${item.name}`,
          '数值': formatNumber(item.surgeryCount),
          '环比': formatPercent(item.archiveRate),
        });
      });
    }
  });

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, '概览');

  if (data.surgeries.length > 0) {
    const surgerySheetData = data.surgeries.map((s) => {
      const imageCount = s.archiveItems.filter((i) => i.itemType === 'image').length;
      const videoCount = s.archiveItems.filter((i) => i.itemType === 'video').length;
      const reportCount = s.archiveItems.filter((i) => i.itemType === 'report').length;
      let archiveDurationHours = '';
      if (s.endTime && s.archiveTime) {
        const end = new Date(s.endTime).getTime();
        const arch = new Date(s.archiveTime).getTime();
        const hours = (arch - end) / (1000 * 60 * 60);
        archiveDurationHours = hours.toFixed(2);
      }
      return {
        '手术ID': s.surgeryId,
        '患者姓名': s.patient?.name || '',
        '性别': s.patient?.gender || '',
        '年龄': s.patient?.age || '',
        '手术名称': s.surgeryName,
        '术式': s.procedureName,
        '科室': s.department,
        '手术间': s.operatingRoom,
        '设备': s.equipment,
        '术者': s.surgeon,
        '助手': s.assistant,
        '手术开始时间': formatDateTime(s.startTime),
        '手术结束时间': formatDateTime(s.endTime),
        '归档时间': s.archiveTime ? formatDateTime(s.archiveTime) : '-',
        '归档耗时(小时)': archiveDurationHours || '-',
        '归档状态': getArchiveStatusInfo(s.archiveStatus).label,
        '归档项总数': s.archiveItems.length,
        '图像数': imageCount,
        '视频数': videoCount,
        '报告数': reportCount,
      };
    });
    const surgerySheet = XLSX.utils.json_to_sheet(surgerySheetData);
    surgerySheet['!cols'] = [
      { wch: 18 }, { wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 25 },
      { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 20 }, { wch: 12 },
      { wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 14 },
      { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
    ];
    XLSX.utils.book_append_sheet(workbook, surgerySheet, '手术清单');
  }

  if (data.anomalies.length > 0) {
    const anomalySheetData = data.anomalies.map((a) => {
      const timelineBrief = a.rectificationTimeline
        .map((r) => `[${formatDate(r.operateTime)}]${r.action}(${r.operator})`)
        .join(' → ');
      return {
        '手术ID': a.surgery?.surgeryId || '',
        '患者姓名': a.surgery?.patient?.name || '',
        '性别': a.surgery?.patient?.gender || '',
        '年龄': a.surgery?.patient?.age || '',
        '手术名称': a.surgery?.surgeryName || '',
        '术式': a.surgery?.procedureName || '',
        '科室': a.surgery?.department || '',
        '手术间': a.surgery?.operatingRoom || '',
        '设备': a.surgery?.equipment || '',
        '术者': a.surgery?.surgeon || '',
        '异常类型': getAnomalyTypeInfo(a.anomalyType).label,
        '异常描述': a.description,
        '发现时间': formatDateTime(a.discoverTime),
        '状态': getAnomalyStatusInfo(a.status).label,
        '整改负责人': a.assignee || '-',
        '整改期限': a.deadline ? formatDate(a.deadline) : '-',
        '整改结果': a.rectificationResult || '-',
        '复核人': a.reviewer || '-',
        '复核意见': a.reviewOpinion || '-',
        '整改时间线简述': timelineBrief || '-',
      };
    });
    const anomalySheet = XLSX.utils.json_to_sheet(anomalySheetData);
    anomalySheet['!cols'] = [
      { wch: 18 }, { wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 25 },
      { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 20 }, { wch: 12 },
      { wch: 15 }, { wch: 35 }, { wch: 20 }, { wch: 12 }, { wch: 12 },
      { wch: 12 }, { wch: 25 }, { wch: 12 }, { wch: 25 }, { wch: 45 },
    ];
    XLSX.utils.book_append_sheet(workbook, anomalySheet, '异常清单');
  }

  if (data.statistics.length > 0) {
    const dimensions: Array<{ key: StatisticData['dimension']; title: string }> = [
      { key: 'department', title: '科室维度统计' },
      { key: 'operatingRoom', title: '手术间维度统计' },
      { key: 'equipment', title: '设备维度统计' },
      { key: 'surgeon', title: '术者维度统计' },
    ];

    const statSheetData: Array<Record<string, string | number>> = [];

    dimensions.forEach((dim) => {
      const dimData = data.statistics.filter((s) => s.dimension === dim.key);
      if (dimData.length === 0) return;

      const aggregated: Record<string, {
        surgeryCount: number;
        archivedCount: number;
        anomalyCount: number;
      }> = {};
      dimData.forEach((item) => {
        if (!aggregated[item.dimensionValue]) {
          aggregated[item.dimensionValue] = { surgeryCount: 0, archivedCount: 0, anomalyCount: 0 };
        }
        aggregated[item.dimensionValue].surgeryCount += item.surgeryCount;
        aggregated[item.dimensionValue].archivedCount += item.archivedCount;
        aggregated[item.dimensionValue].anomalyCount += item.anomalyCount;
      });

      statSheetData.push({ '维度标题': dim.title, '维度值': '', '手术台次': '', '已归档数': '', '异常数': '', '归档率': '', '异常率': '' });
      statSheetData.push({ '维度标题': '维度', '维度值': '维度值', '手术台次': '手术台次', '已归档数': '已归档数', '异常数': '异常数', '归档率': '归档率', '异常率': '异常率' });

      Object.entries(aggregated)
        .sort((a, b) => b[1].surgeryCount - a[1].surgeryCount)
        .forEach(([dimensionValue, data]) => {
          statSheetData.push({
            '维度标题': dim.key,
            '维度值': dimensionValue,
            '手术台次': formatNumber(data.surgeryCount),
            '已归档数': formatNumber(data.archivedCount),
            '异常数': formatNumber(data.anomalyCount),
            '归档率': formatPercent(data.surgeryCount > 0 ? data.archivedCount / data.surgeryCount : 0),
            '异常率': formatPercent(data.surgeryCount > 0 ? data.anomalyCount / data.surgeryCount : 0),
          });
        });

      statSheetData.push({});
    });

    const statSheet = XLSX.utils.json_to_sheet(statSheetData);
    statSheet['!cols'] = [
      { wch: 20 }, { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
    ];
    XLSX.utils.book_append_sheet(workbook, statSheet, '统计数据');
  }

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
