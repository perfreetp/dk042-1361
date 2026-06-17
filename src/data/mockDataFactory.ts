export type Gender = 'male' | 'female'

export type SurgeryStatus = 'completed' | 'archived' | 'pending' | 'anomaly'

export type AnomalyType = 'timeout' | 'missing' | 'inconsistent' | 'duplicate'

export type AnomalyStatus = 'pending' | 'assigned' | 'rectifying' | 'reviewing' | 'resolved' | 'rejected'

export interface Patient {
  id: string
  name: string
  gender: Gender
  age: number
  patientId: string
  idCard: string
  department: string
  bedNumber: string
}

export interface ArchiveItem {
  id: string
  name: string
  category: 'image' | 'video' | 'report'
  required: boolean
  status: 'completed' | 'missing'
  count?: number
  uploadedAt?: string
}

export interface Surgery {
  id: string
  surgeryNumber: string
  patient: Patient
  procedureCode: string
  procedureName: string
  surgeon: string
  assistant: string
  anesthesiologist: string
  department: string
  operatingRoom: string
  equipment: string
  startTime: string
  endTime: string
  duration: number
  status: SurgeryStatus
  archiveItems: ArchiveItem[]
  archivedAt?: string
  hasAnomaly: boolean
}

export interface RectificationRecord {
  id: string
  operator: string
  action: string
  remark?: string
  timestamp: string
}

export interface AnomalyRecord {
  id: string
  anomalyNumber: string
  surgeryId: string
  surgeryNumber: string
  patientName: string
  procedureName: string
  type: AnomalyType
  typeLabel: string
  description: string
  discoveredAt: string
  discoveredBy: string
  status: AnomalyStatus
  statusLabel: string
  assignee?: string
  deadline?: string
  rectificationRecords: RectificationRecord[]
}

export interface DailyStatistic {
  date: string
  totalSurgeries: number
  archivedCount: number
  archiveRate: number
  anomalyCount: number
  anomalyRate: number
  departments: { name: string; count: number; anomalyCount: number }[]
}

export interface ArchiveRequirement {
  id: string
  name: string
  category: 'image' | 'video' | 'report'
  required: boolean
  description?: string
}

export interface ProcedureTemplate {
  id: string
  code: string
  name: string
  category: string
  description: string
  estimatedDuration: number
  archiveRequirements: ArchiveRequirement[]
}

const firstNames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '何', '高', '林', '罗', '郑', '梁', '谢', '宋', '唐', '许', '韩', '冯', '邓', '曹']
const givenNames = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀英', '霞', '平', '刚', '桂英', '文', '华', '玲', '辉', '鑫', '斌', '波', '宇']

const departments = ['心血管内科', '神经内科', '放射介入科', '肿瘤介入科', '消化内科', '血管外科', '神经外科', '肝胆外科']
const operatingRooms = ['介入手术室1', '介入手术室2', '介入手术室3', '介入手术室4', '复合手术室1', '复合手术室2']
const equipments = ['Philips Azurion 7', 'Siemens Artis zee', 'GE Innova IGS 540', 'Philips Allura Xper FD20', 'Siemens Artis pheno']
const surgeons = ['王建国', '李明辉', '张伟东', '陈志强', '刘海涛', '杨新民', '赵文博', '黄启明', '周立群', '吴德华']
const anesthesiologists = ['麻醉师-刘芳', '麻醉师-陈静', '麻醉师-王丽', '麻醉师-赵雪', '麻醉师-孙丽']
const assistants = ['徐医生', '孙医生', '马医生', '朱医生', '胡医生', '郭医生', '何医生', '高医生']
const qcStaff = ['质控-李娜', '质控-王芳', '质控-张丽', '质控-刘静', '质控-陈明']

const anomalyTypeLabels: Record<AnomalyType, string> = {
  timeout: '超时归档',
  missing: '资料缺项',
  inconsistent: '患者信息不一致',
  duplicate: '重复归档',
}

const anomalyStatusLabels: Record<AnomalyStatus, string> = {
  pending: '待分派',
  assigned: '已分派',
  rectifying: '整改中',
  reviewing: '复核中',
  resolved: '已完成',
  rejected: '已驳回',
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function padZero(num: number, length: number = 2): string {
  return String(num).padStart(length, '0')
}

function generateId(prefix: string): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

function generateDate(daysAgo: number, hoursOffset?: number): string {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  if (hoursOffset !== undefined) {
    date.setHours(hoursOffset, randomInt(0, 59), randomInt(0, 59), 0)
  }
  return date.toISOString()
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${padZero(d.getMonth() + 1)}-${padZero(d.getDate())}`
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr)
  return `${formatDate(dateStr)} ${padZero(d.getHours())}:${padZero(d.getMinutes())}`
}

function generatePatient(): Patient {
  const gender: Gender = Math.random() > 0.5 ? 'male' : 'female'
  const lastName = randomFrom(firstNames)
  const givenName = randomFrom(givenNames)
  const birthYear = new Date().getFullYear() - randomInt(18, 85)
  return {
    id: generateId('P'),
    name: lastName + givenName,
    gender,
    age: new Date().getFullYear() - birthYear,
    patientId: `H${randomInt(100000, 999999)}`,
    idCard: `${randomInt(100000, 999999)}${birthYear}${padZero(randomInt(1, 12))}${padZero(randomInt(1, 28))}${randomInt(1000, 9999)}`,
    department: randomFrom(departments),
    bedNumber: `${randomInt(1, 20)}${String.fromCharCode(65 + randomInt(0, 3))}${randomInt(1, 3)}`,
  }
}

function generateArchiveItems(procedureTemplate?: ProcedureTemplate): ArchiveItem[] {
  const defaultItems: Pick<ArchiveItem, 'name' | 'category' | 'required'>[] = [
    { name: '术前造影图像', category: 'image', required: true },
    { name: '术中造影图像', category: 'image', required: true },
    { name: '术后造影图像', category: 'image', required: true },
    { name: '手术关键步骤截图', category: 'image', required: true },
    { name: '手术全程录像', category: 'video', required: true },
    { name: '关键操作片段', category: 'video', required: false },
    { name: '手术记录单', category: 'report', required: true },
    { name: '麻醉记录单', category: 'report', required: true },
    { name: '护理记录单', category: 'report', required: true },
    { name: '耗材使用记录', category: 'report', required: false },
    { name: '患者知情同意书', category: 'report', required: true },
  ]

  const items = procedureTemplate?.archiveRequirements || defaultItems

  return items.map((item) => {
    const isCompleted = item.required ? Math.random() > 0.15 : Math.random() > 0.35
    const status: ArchiveItem['status'] = isCompleted ? 'completed' : 'missing'
    return {
      id: generateId('AI'),
      name: item.name,
      category: item.category,
      required: item.required,
      status,
      count: isCompleted && item.category === 'image' ? randomInt(5, 50) : undefined,
      uploadedAt: isCompleted ? generateDate(randomInt(0, 2), randomInt(8, 20)) : undefined,
    }
  })
}

function generateSurgery(index: number, templates: ProcedureTemplate[]): Surgery {
  const template = randomFrom(templates)
  const daysAgo = randomInt(0, 29)
  const startHour = randomInt(8, 17)
  const startTime = generateDate(daysAgo, startHour)
  const duration = template.estimatedDuration + randomInt(-15, 30)
  const endTime = new Date(new Date(startTime).getTime() + duration * 60000).toISOString()

  const archiveItems = generateArchiveItems(template)
  const hasMissing = archiveItems.some((item) => item.required && item.status === 'missing')
  const archiveDelay = randomInt(0, 48)
  const isArchived = daysAgo > 0 || archiveDelay < 24
  const isTimeout = isArchived && archiveDelay > 24

  let status: SurgeryStatus = 'completed'
  if (hasMissing || isTimeout) {
    status = 'anomaly'
  } else if (isArchived) {
    status = 'archived'
  } else if (daysAgo === 0 && startHour > new Date().getHours()) {
    status = 'pending'
  }

  const date = new Date(startTime)
  const surgeryNumber = `OP${date.getFullYear()}${padZero(date.getMonth() + 1)}${padZero(date.getDate())}${padZero(index % 100, 3)}`

  return {
    id: generateId('S'),
    surgeryNumber,
    patient: generatePatient(),
    procedureCode: template.code,
    procedureName: template.name,
    surgeon: randomFrom(surgeons),
    assistant: randomFrom(assistants),
    anesthesiologist: randomFrom(anesthesiologists),
    department: randomFrom(departments),
    operatingRoom: randomFrom(operatingRooms),
    equipment: randomFrom(equipments),
    startTime,
    endTime,
    duration,
    status,
    archiveItems,
    archivedAt: isArchived ? new Date(new Date(endTime).getTime() + archiveDelay * 3600000).toISOString() : undefined,
    hasAnomaly: status === 'anomaly',
  }
}

function generateAnomaly(surgeries: Surgery[], index: number): AnomalyRecord {
  const anomalySurgeries = surgeries.filter((s) => s.hasAnomaly)
  const surgery = anomalySurgeries[index % anomalySurgeries.length] || surgeries[index % surgeries.length]
  const types: AnomalyType[] = ['timeout', 'missing', 'inconsistent', 'duplicate']
  const weights = [0.35, 0.4, 0.15, 0.1]
  const rand = Math.random()
  let cumulative = 0
  let type: AnomalyType = 'missing'
  for (let i = 0; i < types.length; i++) {
    cumulative += weights[i]
    if (rand < cumulative) {
      type = types[i]
      break
    }
  }

  const statuses: AnomalyStatus[] = ['pending', 'assigned', 'rectifying', 'reviewing', 'resolved', 'rejected']
  const statusWeights = [0.1, 0.15, 0.25, 0.15, 0.3, 0.05]
  const statusRand = Math.random()
  let cumulativeStatus = 0
  let status: AnomalyStatus = 'pending'
  for (let i = 0; i < statuses.length; i++) {
    cumulativeStatus += statusWeights[i]
    if (statusRand < cumulativeStatus) {
      status = statuses[i]
      break
    }
  }

  const descriptions: Record<AnomalyType, string[]> = {
    timeout: ['手术结束后超过24小时未完成归档', '关键影像资料延迟上传超过48小时', '手术记录单提交超时'],
    missing: ['缺少术中造影图像', '缺少手术全程录像', '缺少患者知情同意书', '缺少麻醉记录单', '缺少术后造影图像'],
    inconsistent: ['患者姓名与手术申请单不一致', '患者ID号与登记信息不符', '手术部位记录不一致'],
    duplicate: ['同一手术存在多份归档记录', '影像资料重复上传', '手术记录单重复提交'],
  }

  const records: RectificationRecord[] = []
  if (status !== 'pending') {
    records.push({
      id: generateId('RR'),
      operator: randomFrom(qcStaff),
      action: '发现异常',
      remark: randomFrom(descriptions[type]),
      timestamp: generateDate(randomInt(1, 15), randomInt(9, 18)),
    })
  }
  if (['assigned', 'rectifying', 'reviewing', 'resolved', 'rejected'].includes(status)) {
    records.push({
      id: generateId('RR'),
      operator: randomFrom(qcStaff),
      action: '分派整改',
      remark: `分派给${randomFrom(surgeons)}负责整改，限期3天内完成`,
      timestamp: generateDate(randomInt(1, 10), randomInt(9, 18)),
    })
  }
  if (['rectifying', 'reviewing', 'resolved', 'rejected'].includes(status)) {
    records.push({
      id: generateId('RR'),
      operator: randomFrom(surgeons),
      action: '提交整改',
      remark: '已补充缺失资料，请审核',
      timestamp: generateDate(randomInt(0, 5), randomInt(9, 18)),
    })
  }
  if (['resolved', 'rejected'].includes(status)) {
    records.push({
      id: generateId('RR'),
      operator: randomFrom(qcStaff),
      action: status === 'resolved' ? '复核通过' : '复核驳回',
      remark: status === 'resolved' ? '资料补充完整，符合归档要求' : '整改资料不完整，请重新补充',
      timestamp: generateDate(randomInt(0, 3), randomInt(9, 18)),
    })
  }

  const anomalyNumber = `AN${new Date().getFullYear()}${padZero(Math.floor(index / 100) + 1)}${padZero((index % 100) + 1)}`

  return {
    id: generateId('A'),
    anomalyNumber,
    surgeryId: surgery.id,
    surgeryNumber: surgery.surgeryNumber,
    patientName: surgery.patient.name,
    procedureName: surgery.procedureName,
    type,
    typeLabel: anomalyTypeLabels[type],
    description: randomFrom(descriptions[type]),
    discoveredAt: generateDate(randomInt(0, 20), randomInt(8, 20)),
    discoveredBy: randomFrom(qcStaff),
    status,
    statusLabel: anomalyStatusLabels[status],
    assignee: status !== 'pending' ? randomFrom(surgeons) : undefined,
    deadline: ['assigned', 'rectifying', 'reviewing'].includes(status) ? formatDate(generateDate(-3, 12)) : undefined,
    rectificationRecords: records,
  }
}

function generateDailyStatistic(daysAgo: number, surgeries: Surgery[]): DailyStatistic {
  const dateStr = formatDate(generateDate(daysAgo))
  const daySurgeries = surgeries.filter((s) => formatDate(s.startTime) === dateStr)
  const totalSurgeries = daySurgeries.length > 0 ? daySurgeries.length : randomInt(1, 6)
  const archivedCount = Math.floor(totalSurgeries * (0.7 + Math.random() * 0.25))
  const anomalyCount = Math.floor(totalSurgeries * (0.1 + Math.random() * 0.2))

  const deptCounts: Record<string, { count: number; anomalyCount: number }> = {}
  for (let i = 0; i < totalSurgeries; i++) {
    const dept = randomFrom(departments)
    if (!deptCounts[dept]) {
      deptCounts[dept] = { count: 0, anomalyCount: 0 }
    }
    deptCounts[dept].count++
    if (i < anomalyCount) {
      deptCounts[dept].anomalyCount++
    }
  }

  return {
    date: dateStr,
    totalSurgeries,
    archivedCount,
    archiveRate: totalSurgeries > 0 ? Math.round((archivedCount / totalSurgeries) * 100) / 100 : 0,
    anomalyCount,
    anomalyRate: totalSurgeries > 0 ? Math.round((anomalyCount / totalSurgeries) * 10000) / 100 : 0,
    departments: Object.entries(deptCounts).map(([name, data]) => ({
      name,
      count: data.count,
      anomalyCount: data.anomalyCount,
    })),
  }
}

function generateProcedureTemplate(index: number): ProcedureTemplate {
  const procedures = [
    { code: 'PCI', name: '冠状动脉造影及支架植入术', category: '心血管介入', duration: 90 },
    { code: 'CAG', name: '冠状动脉造影术', category: '心血管介入', duration: 45 },
    { code: 'TACE', name: '肝动脉化疗栓塞术', category: '肿瘤介入', duration: 120 },
    { code: 'PTA', name: '下肢动脉球囊扩张成形术', category: '血管介入', duration: 100 },
    { code: 'CAS', name: '颈动脉支架植入术', category: '神经介入', duration: 110 },
    { code: 'TIPS', name: '经颈静脉肝内门体分流术', category: '消化介入', duration: 150 },
    { code: 'PTCD', name: '经皮经肝胆管引流术', category: '消化介入', duration: 80 },
    { code: 'RFA', name: '肿瘤射频消融术', category: '肿瘤介入', duration: 90 },
    { code: 'UAE', name: '子宫动脉栓塞术', category: '血管介入', duration: 75 },
    { code: 'EVAR', name: '腹主动脉瘤腔内修复术', category: '血管介入', duration: 180 },
  ]

  const proc = procedures[index % procedures.length]

  const requirements: ArchiveRequirement[] = [
    { id: generateId('AR'), name: '术前造影图像', category: 'image', required: true, description: '术前血管造影评估图像' },
    { id: generateId('AR'), name: '术中造影图像', category: 'image', required: true, description: '术中关键步骤造影图像' },
    { id: generateId('AR'), name: '术后造影图像', category: 'image', required: true, description: '术后效果评估造影图像' },
    { id: generateId('AR'), name: '手术关键步骤截图', category: 'image', required: true, description: '至少5张关键操作截图' },
    { id: generateId('AR'), name: '手术全程录像', category: 'video', required: true, description: '完整手术过程录像' },
    { id: generateId('AR'), name: '关键操作片段', category: 'video', required: false, description: '支架释放、球囊扩张等关键片段' },
    { id: generateId('AR'), name: '手术记录单', category: 'report', required: true, description: '详细手术过程记录' },
    { id: generateId('AR'), name: '麻醉记录单', category: 'report', required: true, description: '麻醉过程及用药记录' },
    { id: generateId('AR'), name: '护理记录单', category: 'report', required: true, description: '术中护理记录' },
    { id: generateId('AR'), name: '耗材使用记录', category: 'report', required: false, description: '介入耗材型号及序列号' },
    { id: generateId('AR'), name: '患者知情同意书', category: 'report', required: true, description: '手术知情同意书扫描件' },
    { id: generateId('AR'), name: '术前讨论记录', category: 'report', required: false, description: '术前病例讨论记录' },
  ]

  return {
    id: generateId('PT'),
    code: `${proc.code}${padZero(index + 1)}`,
    name: proc.name,
    category: proc.category,
    description: `${proc.name}标准操作流程，${proc.duration}分钟`,
    estimatedDuration: proc.duration,
    archiveRequirements: requirements,
  }
}

export function generatePatients(count: number): Patient[] {
  return Array.from({ length: count }, () => generatePatient())
}

export function generateSurgeries(count: number, templates: ProcedureTemplate[]): Surgery[] {
  return Array.from({ length: count }, (_, i) => generateSurgery(i, templates))
}

export function generateAnomalies(count: number, surgeries: Surgery[]): AnomalyRecord[] {
  return Array.from({ length: count }, (_, i) => generateAnomaly(surgeries, i))
}

export function generateDailyStatistics(days: number, surgeries: Surgery[]): DailyStatistic[] {
  return Array.from({ length: days }, (_, i) => generateDailyStatistic(days - 1 - i, surgeries)).reverse()
}

export function generateProcedureTemplates(count: number): ProcedureTemplate[] {
  return Array.from({ length: count }, (_, i) => generateProcedureTemplate(i))
}

export {
  formatDate,
  formatDateTime,
  departments,
  operatingRooms,
  equipments,
  surgeons,
  qcStaff,
  anomalyTypeLabels,
  anomalyStatusLabels,
}
