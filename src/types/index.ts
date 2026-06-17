export interface Patient {
  patientId: string;
  name: string;
  gender: '男' | '女';
  age: number;
  idCard: string;
  medicalRecordNo: string;
}

export type ArchiveStatus = 'pending' | 'archived' | 'overdue' | 'anomaly';

export type ItemType = 'image' | 'video' | 'report';

export type ItemStatus = 'archived' | 'missing' | 'mismatch';

export interface ArchiveItem {
  itemId: string;
  surgeryId: string;
  itemType: ItemType;
  itemName: string;
  thumbnailUrl?: string;
  itemUrl?: string;
  isRequired: boolean;
  status: ItemStatus;
  uploadTime?: string;
}

export type AnomalyType = 'overdue' | 'missing_items' | 'patient_mismatch' | 'duplicate';

export type AnomalyStatus = 'pending' | 'assigned' | 'rectifying' | 'reviewing' | 'closed' | 'rejected';

export interface RectificationRecord {
  recordId: string;
  anomalyId: string;
  action: string;
  operator: string;
  operateTime: string;
  remark?: string;
  attachmentUrl?: string;
}

export interface Surgery {
  surgeryId: string;
  patientId: string;
  patient: Patient;
  surgeryName: string;
  procedureCode: string;
  procedureName: string;
  department: string;
  operatingRoom: string;
  equipment: string;
  surgeon: string;
  assistant: string;
  startTime: string;
  endTime: string;
  archiveTime?: string;
  archiveStatus: ArchiveStatus;
  archiveItems: ArchiveItem[];
  anomalies: Anomaly[];
}

export interface Anomaly {
  anomalyId: string;
  surgeryId: string;
  surgery: Surgery;
  anomalyType: AnomalyType;
  anomalyTypeName: string;
  description: string;
  discoverTime: string;
  status: AnomalyStatus;
  statusName: string;
  assignee?: string;
  deadline?: string;
  rectificationResult?: string;
  reviewOpinion?: string;
  reviewer?: string;
  rectificationTimeline: RectificationRecord[];
}

export interface RequiredItem {
  itemId: string;
  itemName: string;
  itemType: ItemType;
  description: string;
  isRequired: boolean;
}

export interface ProcedureTemplate {
  templateId: string;
  procedureCode: string;
  procedureName: string;
  requiredItems: RequiredItem[];
}

export type StatDimension = 'department' | 'operatingRoom' | 'equipment' | 'surgeon';

export interface StatisticData {
  statDate: string;
  dimension: StatDimension;
  dimensionValue: string;
  surgeryCount: number;
  archivedCount: number;
  anomalyCount: number;
  archiveRate: number;
  anomalyRate: number;
}

export interface KPIData {
  totalSurgeries: number;
  archivedSurgeries: number;
  archiveRate: number;
  totalAnomalies: number;
  compareLastPeriod: {
    surgeries: number;
    archiveRate: number;
    anomalies: number;
  };
  anomalyTypeStats: Record<string, number>;
  topDepartments: Array<{ name: string; surgeryCount: number; archiveRate: number }>;
  topOperatingRooms: Array<{ name: string; surgeryCount: number; archiveRate: number }>;
  topEquipments: Array<{ name: string; surgeryCount: number; archiveRate: number }>;
  topSurgeons: Array<{ name: string; surgeryCount: number; archiveRate: number }>;
}

export type TimeRangeType = 'day' | 'week' | 'month' | 'custom';

export interface FilterCondition {
  timeRange: TimeRangeType;
  startDate?: string;
  endDate?: string;
  departments: string[];
  procedureCodes: string[];
}

export interface User {
  userId: string;
  name: string;
  role: 'director' | 'qc_staff' | 'dept_admin';
  roleName: string;
  department?: string;
  avatar?: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface ModalConfig {
  id: string;
  type: string;
  props?: Record<string, unknown>;
}
