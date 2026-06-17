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
  kpi: { totalSurgeries: number; archivedSurgeries: number; archiveRate: number; totalAnomalies: number };
  surgeries: Surgery[];
  anomalies: Anomaly[];
  statistics: StatisticData[];
}, fileName: string): void => {
  const workbook = XLSX.utils.book_new();

  const summaryData = [
    { '统计周期': data.period },
    {},
    { '指标': '手术总台次', '数值': formatNumber(data.kpi.totalSurgeries) },
    { '指标': '已归档数', '数值': formatNumber(data.kpi.archivedSurgeries) },
    { '指标': '归档完成率', '数值': formatPercent(data.kpi.archiveRate) },
    { '指标': '异常总数', '数值': formatNumber(data.kpi.totalAnomalies) },
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 20 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, '概览');

  if (data.surgeries.length > 0) {
    const surgerySheetData = data.surgeries.map((s) => ({
      '手术ID': s.surgeryId,
      '患者姓名': s.patient?.name || '',
      '手术名称': s.surgeryName,
      '科室': s.department,
      '主刀医生': s.surgeon,
      '手术时间': formatDateTime(s.startTime),
      '归档状态': getArchiveStatusInfo(s.archiveStatus).label,
    }));
    const surgerySheet = XLSX.utils.json_to_sheet(surgerySheetData);
    surgerySheet['!cols'] = [{ wch: 15 }, { wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 20 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(workbook, surgerySheet, '手术清单');
  }

  if (data.anomalies.length > 0) {
    const anomalySheetData = data.anomalies.map((a) => ({
      '异常ID': a.anomalyId,
      '患者姓名': a.surgery?.patient?.name || '',
      '手术名称': a.surgery?.surgeryName || '',
      '异常类型': getAnomalyTypeInfo(a.anomalyType).label,
      '异常描述': a.description,
      '发现时间': formatDateTime(a.discoverTime),
      '状态': getAnomalyStatusInfo(a.status).label,
      '整改负责人': a.assignee || '-',
    }));
    const anomalySheet = XLSX.utils.json_to_sheet(anomalySheetData);
    anomalySheet['!cols'] = [{ wch: 15 }, { wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 12 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(workbook, anomalySheet, '异常清单');
  }

  if (data.statistics.length > 0) {
    const statSheetData = data.statistics.map((s) => ({
      '统计日期': formatDate(s.statDate),
      '维度': s.dimension,
      '维度值': s.dimensionValue,
      '手术台次': formatNumber(s.surgeryCount),
      '已归档数': formatNumber(s.archivedCount),
      '异常数': formatNumber(s.anomalyCount),
      '归档率': formatPercent(s.archiveRate),
      '异常率': formatPercent(s.anomalyRate),
    }));
    const statSheet = XLSX.utils.json_to_sheet(statSheetData);
    statSheet['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(workbook, statSheet, '统计数据');
  }

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
