export const formatNumber = (num: number, decimals: number = 0): string => {
  if (isNaN(num) || num === null || num === undefined) return '0';
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatPercent = (value: number, decimals: number = 2): string => {
  if (isNaN(value) || value === null || value === undefined) return '0%';
  const percent = value * 100;
  return `${percent.toFixed(decimals)}%`;
};

export const formatDecimal = (value: number, decimals: number = 2): string => {
  if (isNaN(value) || value === null || value === undefined) return '0';
  return value.toFixed(decimals);
};

export const formatCurrency = (amount: number, symbol: string = '¥'): string => {
  if (isNaN(amount) || amount === null || amount === undefined) return `${symbol}0`;
  return `${symbol}${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export type ArchiveStatus = 'pending' | 'archived' | 'overdue' | 'anomaly';
export type AnomalyStatus = 'pending' | 'assigned' | 'rectifying' | 'reviewing' | 'closed' | 'rejected';
export type AnomalyType = 'overdue' | 'missing_items' | 'patient_mismatch' | 'duplicate';
export type ItemStatus = 'archived' | 'missing' | 'mismatch';
export type ItemType = 'image' | 'video' | 'report';
export type UserRole = 'director' | 'quality_control' | 'department_admin';
export type StatDimension = 'department' | 'operatingRoom' | 'equipment' | 'surgeon';

export interface StatusMapping {
  label: string;
  color: string;
  bgColor: string;
}

export const archiveStatusMap: Record<ArchiveStatus, StatusMapping> = {
  pending: { label: '待归档', color: '#F59E0B', bgColor: '#FEF3C7' },
  archived: { label: '已归档', color: '#10B981', bgColor: '#D1FAE5' },
  overdue: { label: '超时未归', color: '#EF4444', bgColor: '#FEE2E2' },
  anomaly: { label: '异常', color: '#DC2626', bgColor: '#FECACA' },
};

export const anomalyStatusMap: Record<AnomalyStatus, StatusMapping> = {
  pending: { label: '待分派', color: '#6B7280', bgColor: '#F3F4F6' },
  assigned: { label: '已分派', color: '#3B82F6', bgColor: '#DBEAFE' },
  rectifying: { label: '整改中', color: '#F59E0B', bgColor: '#FEF3C7' },
  reviewing: { label: '待复核', color: '#8B5CF6', bgColor: '#EDE9FE' },
  closed: { label: '已关闭', color: '#10B981', bgColor: '#D1FAE5' },
  rejected: { label: '已退回', color: '#EF4444', bgColor: '#FEE2E2' },
};

export const anomalyTypeMap: Record<AnomalyType, StatusMapping> = {
  overdue: { label: '超时归档', color: '#EF4444', bgColor: '#FEE2E2' },
  missing_items: { label: '资料缺项', color: '#F59E0B', bgColor: '#FEF3C7' },
  patient_mismatch: { label: '患者信息不一致', color: '#8B5CF6', bgColor: '#EDE9FE' },
  duplicate: { label: '重复归档', color: '#3B82F6', bgColor: '#DBEAFE' },
};

export const itemStatusMap: Record<ItemStatus, StatusMapping> = {
  archived: { label: '已归档', color: '#10B981', bgColor: '#D1FAE5' },
  missing: { label: '缺失', color: '#EF4444', bgColor: '#FEE2E2' },
  mismatch: { label: '不一致', color: '#F59E0B', bgColor: '#FEF3C7' },
};

export const itemTypeMap: Record<ItemType, StatusMapping> = {
  image: { label: '图像', color: '#3B82F6', bgColor: '#DBEAFE' },
  video: { label: '视频', color: '#8B5CF6', bgColor: '#EDE9FE' },
  report: { label: '报告', color: '#10B981', bgColor: '#D1FAE5' },
};

export const userRoleMap: Record<UserRole, StatusMapping> = {
  director: { label: '介入中心主任', color: '#1A73E8', bgColor: '#DBEAFE' },
  quality_control: { label: '影像科质控人员', color: '#00897B', bgColor: '#D1FAE5' },
  department_admin: { label: '科室质控管理员', color: '#F59E0B', bgColor: '#FEF3C7' },
};

export const statDimensionMap: Record<StatDimension, string> = {
  department: '科室',
  operatingRoom: '手术间',
  equipment: '设备',
  surgeon: '术者',
};

export const getArchiveStatusInfo = (status: ArchiveStatus): StatusMapping => {
  return archiveStatusMap[status] || { label: status, color: '#6B7280', bgColor: '#F3F4F6' };
};

export const getAnomalyStatusInfo = (status: AnomalyStatus): StatusMapping => {
  return anomalyStatusMap[status] || { label: status, color: '#6B7280', bgColor: '#F3F4F6' };
};

export const getAnomalyTypeInfo = (type: AnomalyType): StatusMapping => {
  return anomalyTypeMap[type] || { label: type, color: '#6B7280', bgColor: '#F3F4F6' };
};

export const getItemStatusInfo = (status: ItemStatus): StatusMapping => {
  return itemStatusMap[status] || { label: status, color: '#6B7280', bgColor: '#F3F4F6' };
};

export const getItemTypeInfo = (type: ItemType): StatusMapping => {
  return itemTypeMap[type] || { label: type, color: '#6B7280', bgColor: '#F3F4F6' };
};

export const getUserRoleInfo = (role: UserRole): StatusMapping => {
  return userRoleMap[role] || { label: role, color: '#6B7280', bgColor: '#F3F4F6' };
};

export const getStatDimensionLabel = (dimension: StatDimension): string => {
  return statDimensionMap[dimension] || dimension;
};

export const formatTrendArrow = (value: number): { text: string; color: string } => {
  if (value > 0) {
    return { text: `↑ ${formatPercent(Math.abs(value), 1)}`, color: '#EF4444' };
  } else if (value < 0) {
    return { text: `↓ ${formatPercent(Math.abs(value), 1)}`, color: '#10B981' };
  }
  return { text: '— 0.0%', color: '#6B7280' };
};

export const formatArchiveRate = (archived: number, total: number, decimals: number = 2): string => {
  if (total === 0) return '0%';
  const rate = archived / total;
  return formatPercent(rate, decimals);
};

export const formatAnomalyRate = (anomalies: number, total: number, decimals: number = 2): string => {
  if (total === 0) return '0%';
  const rate = anomalies / total;
  return formatPercent(rate, decimals);
};

export const padNumber = (num: number, length: number = 2): string => {
  return num.toString().padStart(length, '0');
};

export const truncateText = (text: string, maxLength: number = 20, suffix: string = '...'): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + suffix;
};

export const maskIdCard = (idCard: string): string => {
  if (!idCard || idCard.length < 8) return idCard || '';
  return idCard.substring(0, 4) + '********' + idCard.substring(idCard.length - 4);
};

export const maskPhone = (phone: string): string => {
  if (!phone || phone.length < 11) return phone || '';
  return phone.substring(0, 3) + '****' + phone.substring(phone.length - 4);
};
