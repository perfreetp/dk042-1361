import type {
  Patient,
  Surgery,
  Anomaly,
  ArchiveItem,
  StatisticData,
  KPIData,
  User,
  Notification,
  ProcedureTemplate,
  RectificationRecord,
} from '../types';

const departments = ['心血管内科', '神经外科', '骨科', '普外科', '泌尿外科', '妇产科', '消化内科', '呼吸内科'];
const procedures = [
  { code: 'PCI001', name: '冠状动脉造影术' },
  { code: 'PCI002', name: '冠状动脉支架植入术' },
  { code: 'NEU001', name: '脑血管造影术' },
  { code: 'NEU002', name: '颅内动脉瘤栓塞术' },
  { code: 'ORT001', name: '椎体成形术' },
  { code: 'ORT002', name: '椎间盘髓核摘除术' },
  { code: 'GEN001', name: 'TACE肝动脉化疗栓塞术' },
  { code: 'URO001', name: '前列腺动脉栓塞术' },
];
const surgeons = ['张伟', '李明', '王芳', '赵强', '刘洋', '陈静', '杨帆', '黄磊'];
const operatingRooms = ['DSA-1', 'DSA-2', 'DSA-3', 'DSA-4', '杂交手术室'];
const equipments = ['飞利浦Azurion 7', '西门子Artis zee', 'GE Innova IGS 5', '东芝Infinix'];

function randomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  date.setHours(randomInt(8, 18), randomInt(0, 59), 0, 0);
  return date.toISOString();
}

function randomId(prefix: string): string {
  return `${prefix}${Date.now()}${randomInt(1000, 9999)}`;
}

const surname = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴'];
const givenName = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '洋', '艳', '勇', '军', '杰', '娟', '涛'];

function generatePatient(): Patient {
  return {
    patientId: randomId('P'),
    name: `${randomFrom(surname)}${randomFrom(givenName)}`,
    gender: randomFrom(['男', '女'] as const),
    age: randomInt(18, 85),
    idCard: `3${randomInt(100000, 999999)}${randomInt(1950, 2005)}${randomInt(101, 1231)}${randomInt(1000, 9999)}`,
    medicalRecordNo: `MR${randomInt(100000, 999999)}`,
  };
}

function generateArchiveItems(surgeryId: string): ArchiveItem[] {
  const items: ArchiveItem[] = [];
  const imageCount = randomInt(5, 15);
  for (let i = 0; i < imageCount; i++) {
    const status = Math.random() > 0.15 ? 'archived' : (Math.random() > 0.5 ? 'missing' : 'mismatch');
    items.push({
      itemId: randomId('IMG'),
      surgeryId,
      itemType: 'image',
      itemName: `术中影像_${i + 1}`,
      thumbnailUrl: status === 'archived' ? `/mock/images/${randomInt(1, 10)}.jpg` : undefined,
      itemUrl: status === 'archived' ? `/mock/files/image_${i + 1}.dcm` : undefined,
      isRequired: i < 3,
      status,
      uploadTime: status === 'archived' ? randomDate(7) : undefined,
    });
  }
  const videoCount = randomInt(1, 3);
  for (let i = 0; i < videoCount; i++) {
    const status = Math.random() > 0.2 ? 'archived' : 'missing';
    items.push({
      itemId: randomId('VID'),
      surgeryId,
      itemType: 'video',
      itemName: `手术视频_${i + 1}`,
      itemUrl: status === 'archived' ? `/mock/files/video_${i + 1}.mp4` : undefined,
      isRequired: true,
      status,
      uploadTime: status === 'archived' ? randomDate(7) : undefined,
    });
  }
  const reportStatus = Math.random() > 0.1 ? 'archived' : 'missing';
  items.push({
    itemId: randomId('RPT'),
    surgeryId,
    itemType: 'report',
    itemName: '手术报告',
    itemUrl: reportStatus === 'archived' ? `/mock/files/report.pdf` : undefined,
    isRequired: true,
    status: reportStatus,
    uploadTime: reportStatus === 'archived' ? randomDate(7) : undefined,
  });
  return items;
}

function generateRectificationRecords(anomalyId: string): RectificationRecord[] {
  const records: RectificationRecord[] = [];
  records.push({
    recordId: randomId('REC'),
    anomalyId,
    action: '发现异常',
    operator: '质控系统',
    operateTime: randomDate(7),
  });
  if (Math.random() > 0.4) {
    records.push({
      recordId: randomId('REC'),
      anomalyId,
      action: '分派整改',
      operator: randomFrom(surgeons),
      operateTime: randomDate(5),
      remark: '请在3个工作日内完成整改',
    });
  }
  if (Math.random() > 0.6) {
    records.push({
      recordId: randomId('REC'),
      anomalyId,
      action: '提交整改',
      operator: randomFrom(surgeons),
      operateTime: randomDate(3),
      remark: '已补充缺失资料，请复核',
      attachmentUrl: '/mock/files/rectification.pdf',
    });
  }
  if (Math.random() > 0.7) {
    records.push({
      recordId: randomId('REC'),
      anomalyId,
      action: '复核通过',
      operator: randomFrom(surgeons),
      operateTime: randomDate(2),
      remark: '整改合格，关闭异常',
    });
  }
  return records;
}

const anomalyTypeMap: Record<string, { type: Anomaly['anomalyType']; name: string }> = {
  overdue: { type: 'overdue', name: '超时归档' },
  missing: { type: 'missing_items', name: '资料缺项' },
  mismatch: { type: 'patient_mismatch', name: '患者信息不一致' },
  duplicate: { type: 'duplicate', name: '重复归档' },
};

const anomalyStatusMap: Record<string, { status: Anomaly['status']; name: string }> = {
  pending: { status: 'pending', name: '待处理' },
  assigned: { status: 'assigned', name: '已分派' },
  rectifying: { status: 'rectifying', name: '整改中' },
  reviewing: { status: 'reviewing', name: '复核中' },
  closed: { status: 'closed', name: '已关闭' },
  rejected: { status: 'rejected', name: '已驳回' },
};

function generateAnomalies(surgery: Surgery): Anomaly[] {
  const anomalies: Anomaly[] = [];
  const anomalyCount = surgery.archiveStatus === 'anomaly' ? randomInt(1, 3) : 0;
  for (let i = 0; i < anomalyCount; i++) {
    const typeKey = randomFrom(['overdue', 'missing', 'mismatch', 'duplicate']);
    const anomalyType = anomalyTypeMap[typeKey];
    const statusKeys = ['pending', 'assigned', 'rectifying', 'reviewing', 'closed', 'rejected'];
    const statusKey = randomFrom(statusKeys);
    const anomalyStatus = anomalyStatusMap[statusKey];
    const anomalyId = randomId('AN');
    anomalies.push({
      anomalyId,
      surgeryId: surgery.surgeryId,
      surgery,
      anomalyType: anomalyType.type,
      anomalyTypeName: anomalyType.name,
      description: `${anomalyType.name}：请及时处理`,
      discoverTime: randomDate(7),
      status: anomalyStatus.status,
      statusName: anomalyStatus.name,
      assignee: statusKey !== 'pending' ? randomFrom(surgeons) : undefined,
      deadline: statusKey !== 'pending' && statusKey !== 'closed' ? randomDate(-7) : undefined,
      rectificationResult: ['rectifying', 'reviewing', 'closed'].includes(statusKey) ? '已补充相关归档资料' : undefined,
      reviewOpinion: statusKey === 'closed' ? '整改合格' : statusKey === 'rejected' ? '整改不完整，请重新提交' : undefined,
      reviewer: ['closed', 'rejected'].includes(statusKey) ? randomFrom(surgeons) : undefined,
      rectificationTimeline: generateRectificationRecords(anomalyId),
    });
  }
  return anomalies;
}

export function generateSurgeries(count: number = 50): Surgery[] {
  const surgeries: Surgery[] = [];
  for (let i = 0; i < count; i++) {
    const patient = generatePatient();
    const procedure = randomFrom(procedures);
    const statuses: Surgery['archiveStatus'][] = ['pending', 'archived', 'overdue', 'anomaly'];
    const archiveStatus = randomFrom(statuses);
    const startTime = randomDate(30);
    const endDate = new Date(startTime);
    endDate.setHours(endDate.getHours() + randomInt(1, 4));
    const surgeryId = randomId('S');
    const archiveItems = generateArchiveItems(surgeryId);
    const hasMissing = archiveItems.some(item => item.status !== 'archived');
    const finalStatus: Surgery['archiveStatus'] = hasMissing && archiveStatus === 'archived' ? 'anomaly' : archiveStatus;
    const surgery: Surgery = {
      surgeryId,
      patientId: patient.patientId,
      patient,
      surgeryName: procedure.name,
      procedureCode: procedure.code,
      procedureName: procedure.name,
      department: randomFrom(departments),
      operatingRoom: randomFrom(operatingRooms),
      equipment: randomFrom(equipments),
      surgeon: randomFrom(surgeons),
      assistant: randomFrom(surgeons),
      startTime,
      endTime: endDate.toISOString(),
      archiveTime: finalStatus !== 'pending' ? randomDate(14) : undefined,
      archiveStatus: finalStatus,
      archiveItems,
      anomalies: [],
    };
    surgery.anomalies = generateAnomalies(surgery);
    surgeries.push(surgery);
  }
  return surgeries;
}

export function generateStatisticData(): StatisticData[] {
  const data: StatisticData[] = [];
  const dimensions: Array<{ key: StatisticData['dimension']; values: string[] }> = [
    { key: 'department', values: departments },
    { key: 'operatingRoom', values: operatingRooms },
    { key: 'equipment', values: equipments },
    { key: 'surgeon', values: surgeons },
  ];
  const today = new Date();
  for (let d = 29; d >= 0; d--) {
    const statDate = new Date(today);
    statDate.setDate(statDate.getDate() - d);
    const dateStr = statDate.toISOString().split('T')[0];
    for (const dim of dimensions) {
      for (const value of dim.values) {
        const surgeryCount = randomInt(0, 15);
        const archivedCount = randomInt(0, surgeryCount);
        const anomalyCount = randomInt(0, Math.floor(surgeryCount * 0.3));
        data.push({
          statDate: dateStr,
          dimension: dim.key,
          dimensionValue: value,
          surgeryCount,
          archivedCount,
          anomalyCount,
          archiveRate: surgeryCount > 0 ? +(archivedCount / surgeryCount).toFixed(4) : 0,
          anomalyRate: surgeryCount > 0 ? +(anomalyCount / surgeryCount).toFixed(4) : 0,
        });
      }
    }
  }
  return data;
}

export function generateKPIData(): KPIData {
  const totalSurgeries = randomInt(200, 500);
  const archivedSurgeries = Math.floor(totalSurgeries * (0.75 + Math.random() * 0.2));
  return {
    totalSurgeries,
    archivedSurgeries,
    archiveRate: +(archivedSurgeries / totalSurgeries).toFixed(4),
    totalAnomalies: randomInt(10, 60),
    compareLastPeriod: {
      surgeries: +((Math.random() - 0.5) * 20).toFixed(1),
      archiveRate: +((Math.random() - 0.5) * 10).toFixed(2),
      anomalies: +((Math.random() - 0.5) * 30).toFixed(1),
    },
  };
}

export const mockUser: User = {
  userId: 'U001',
  name: '张伟',
  role: 'director',
  roleName: '介入中心主任',
  department: '心血管内科',
};

export function generateNotifications(): Notification[] {
  return [
    {
      id: randomId('N'),
      type: 'warning',
      title: '超时归档提醒',
      message: '有5台手术已超过24小时未完成归档',
      timestamp: randomDate(1),
      read: false,
    },
    {
      id: randomId('N'),
      type: 'error',
      title: '异常告警',
      message: '发现3例资料缺项异常，请及时处理',
      timestamp: randomDate(1),
      read: false,
    },
    {
      id: randomId('N'),
      type: 'success',
      title: '整改完成',
      message: '手术S20240115001已完成整改复核',
      timestamp: randomDate(2),
      read: true,
    },
    {
      id: randomId('N'),
      type: 'info',
      title: '系统通知',
      message: '月度质控报表已生成，请查收',
      timestamp: randomDate(3),
      read: true,
    },
  ];
}

export function generateProcedureTemplates(): ProcedureTemplate[] {
  return procedures.map(proc => ({
    templateId: randomId('TPL'),
    procedureCode: proc.code,
    procedureName: proc.name,
    requiredItems: [
      { itemId: randomId('REQ'), itemName: '术前定位影像', itemType: 'image', description: '术前标准体位定位影像' },
      { itemId: randomId('REQ'), itemName: '术中关键步骤影像', itemType: 'image', description: '至少5张术中关键步骤图片' },
      { itemId: randomId('REQ'), itemName: '手术全程视频', itemType: 'video', description: '完整手术操作视频' },
      { itemId: randomId('REQ'), itemName: '手术报告', itemType: 'report', description: '经医师签字的手术报告' },
    ],
  }));
}

export const mockDepartments = departments;
export const mockProcedures = procedures;
export const mockSurgeons = surgeons;
