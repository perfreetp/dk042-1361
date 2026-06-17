## 1. 架构设计

```mermaid
graph TD
    subgraph "前端层"
        A["React SPA 应用"]
        A1["路由层 React Router"]
        A2["UI 组件层"]
        A3["状态管理 Context"]
        A4["图表可视化 Recharts"]
        A5["样式层 TailwindCSS"]
    end

    subgraph "数据层"
        B["Mock 数据服务"]
        B1["手术数据模拟"]
        B2["异常记录模拟"]
        B3["科室统计模拟"]
        B4["用户数据模拟"]
    end

    subgraph "工具层"
        C["工具函数"]
        C1["日期处理"]
        C2["数据格式化"]
        C3["导出工具"]
    end

    A1 --> A
    A2 --> A
    A3 --> A
    A4 --> A
    A5 --> A
    A --> B
    A --> C
```

## 2. 技术描述

- **前端框架**: React@18 + TypeScript
- **构建工具**: Vite@5
- **样式方案**: TailwindCSS@3 + PostCSS
- **路由管理**: React Router@6
- **图表可视化**: Recharts@2
- **状态管理**: React Context + useReducer（轻量状态管理，无需 Redux）
- **图标库**: Lucide React（线性简洁图标，符合医疗专业调性）
- **数据层**: 本地 Mock 数据（模拟后端接口），采用工厂模式生成测试数据
- **工具库**: date-fns（日期处理）、xlsx（Excel 导出）

## 3. 路由定义

| 路由路径 | 页面组件 | 功能说明 |
|----------|----------|----------|
| `/` | 重定向到 `/overview` | 首页默认跳转归档总览 |
| `/overview` | OverviewPage | 归档总览：KPI 指标、趋势图、问题分布、实时动态 |
| `/anomalies` | AnomaliesPage | 异常清单：分类筛选、异常列表、整改分派 |
| `/statistics` | StatisticsPage | 科室统计：多维度趋势、排名对比、数据明细 |
| `/surgery/:id` | SurgeryDetailPage | 抽查详情：单台手术归档检查、整改记录 |
| `/procedure-config` | ProcedureConfigPage | 术式配置：设置各术式必归档项目（管理员） |

## 4. 数据模型

### 4.1 ER 关系图

```mermaid
erDiagram
    PATIENT {
        string patientId PK "患者ID"
        string name "姓名"
        string gender "性别"
        int age "年龄"
        string idCard "身份证号"
        string medicalRecordNo "病案号"
    }

    SURGERY {
        string surgeryId PK "手术ID"
        string patientId FK "患者ID"
        string surgeryName "手术名称"
        string procedureCode "术式编码"
        string department "科室"
        string operatingRoom "手术间"
        string equipment "设备"
        string surgeon "主刀医生"
        string assistant "助手"
        datetime startTime "手术开始时间"
        datetime endTime "手术结束时间"
        datetime archiveTime "归档时间"
        string archiveStatus "归档状态"
    }

    ARCHIVE_ITEM {
        string itemId PK "归档项ID"
        string surgeryId FK "手术ID"
        string itemType "项目类型(图像/视频/报告)"
        string itemName "项目名称"
        string itemUrl "资源链接"
        boolean isRequired "是否必归档"
        string status "归档状态"
        datetime uploadTime "上传时间"
    }

    ANOMALY {
        string anomalyId PK "异常ID"
        string surgeryId FK "手术ID"
        string anomalyType "异常类型"
        string description "异常描述"
        datetime discoverTime "发现时间"
        string status "异常状态"
        string assignee "整改负责人"
        datetime deadline "整改期限"
        string rectificationResult "整改结果"
        string reviewOpinion "复核意见"
        string reviewer "复核人"
    }

    PROCEDURE_TEMPLATE {
        string templateId PK "模板ID"
        string procedureCode "术式编码"
        string procedureName "术式名称"
        string requiredItems "必归档项目列表(JSON)"
    }

    STATISTIC_RECORD {
        string recordId PK "统计记录ID"
        date statDate "统计日期"
        string dimension "统计维度(科室/手术间/设备/术者)"
        string dimensionValue "维度值"
        int surgeryCount "手术台次"
        int archivedCount "已归档数"
        int anomalyCount "异常数"
        float archiveRate "归档率"
        float anomalyRate "异常率"
    }

    PATIENT ||--o{ SURGERY : "has"
    SURGERY ||--o{ ARCHIVE_ITEM : "contains"
    SURGERY ||--o{ ANOMALY : "has"
    PROCEDURE_TEMPLATE ||--o{ SURGERY : "applies to"
```

### 4.2 核心数据类型定义 (TypeScript)

```typescript
// 患者信息
interface Patient {
  patientId: string;
  name: string;
  gender: '男' | '女';
  age: number;
  idCard: string;
  medicalRecordNo: string;
}

// 手术信息
interface Surgery {
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
  archiveStatus: 'pending' | 'archived' | 'overdue' | 'anomaly';
  archiveItems: ArchiveItem[];
  anomalies: Anomaly[];
}

// 归档项
interface ArchiveItem {
  itemId: string;
  surgeryId: string;
  itemType: 'image' | 'video' | 'report';
  itemName: string;
  thumbnailUrl?: string;
  itemUrl?: string;
  isRequired: boolean;
  status: 'archived' | 'missing' | 'mismatch';
  uploadTime?: string;
}

// 异常记录
interface Anomaly {
  anomalyId: string;
  surgeryId: string;
  surgery: Surgery;
  anomalyType: 'overdue' | 'missing_items' | 'patient_mismatch' | 'duplicate';
  anomalyTypeName: string;
  description: string;
  discoverTime: string;
  status: 'pending' | 'assigned' | 'rectifying' | 'reviewing' | 'closed' | 'rejected';
  statusName: string;
  assignee?: string;
  deadline?: string;
  rectificationResult?: string;
  reviewOpinion?: string;
  reviewer?: string;
  rectificationTimeline: RectificationRecord[];
}

// 整改记录
interface RectificationRecord {
  recordId: string;
  anomalyId: string;
  action: string;
  operator: string;
  operateTime: string;
  remark?: string;
  attachmentUrl?: string;
}

// 术式配置模板
interface ProcedureTemplate {
  templateId: string;
  procedureCode: string;
  procedureName: string;
  requiredItems: RequiredItem[];
}

interface RequiredItem {
  itemId: string;
  itemName: string;
  itemType: 'image' | 'video' | 'report';
  description: string;
}

// 统计数据
interface StatisticData {
  statDate: string;
  dimension: 'department' | 'operatingRoom' | 'equipment' | 'surgeon';
  dimensionValue: string;
  surgeryCount: number;
  archivedCount: number;
  anomalyCount: number;
  archiveRate: number;
  anomalyRate: number;
}

// KPI 指标
interface KPIData {
  totalSurgeries: number;
  archivedSurgeries: number;
  archiveRate: number;
  totalAnomalies: number;
  compareLastPeriod: {
    surgeries: number;
    archiveRate: number;
    anomalies: number;
  };
}

// 全局筛选条件
interface FilterCondition {
  timeRange: 'day' | 'week' | 'month' | 'custom';
  startDate?: string;
  endDate?: string;
  departments: string[];
  procedureCodes: string[];
}
```

## 5. 项目目录结构

```
src/
├── assets/                 # 静态资源
│   └── images/
├── components/             # 公共组件
│   ├── layout/            # 布局组件
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── PageContainer.tsx
│   ├── ui/                # UI 基础组件
│   │   ├── Card.tsx
│   │   ├── Button.tsx
│   │   ├── Tag.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   ├── Select.tsx
│   │   ├── DatePicker.tsx
│   │   └── Input.tsx
│   ├── charts/            # 图表组件
│   │   ├── KPICard.tsx
│   │   ├── TrendChart.tsx
│   │   ├── PieChart.tsx
│   │   └── BarChart.tsx
│   └── common/            # 业务组件
│       ├── FilterBar.tsx
│       ├── AnomalyTag.tsx
│       ├── StatusBadge.tsx
│       └── Timeline.tsx
├── pages/                  # 页面组件
│   ├── OverviewPage.tsx
│   ├── AnomaliesPage.tsx
│   ├── StatisticsPage.tsx
│   ├── SurgeryDetailPage.tsx
│   └── ProcedureConfigPage.tsx
├── data/                   # Mock 数据
│   ├── surgeryData.ts
│   ├── anomalyData.ts
│   ├── statisticData.ts
│   └── procedureTemplate.ts
├── context/                # 状态管理
│   ├── AppContext.tsx
│   └── FilterContext.tsx
├── utils/                  # 工具函数
│   ├── dateUtils.ts
│   ├── formatUtils.ts
│   ├── exportUtils.ts
│   └── mockDataFactory.ts
├── types/                  # 类型定义
│   └── index.ts
├── hooks/                  # 自定义 Hooks
│   ├── useKPIData.ts
│   ├── useAnomalyList.ts
│   └── useStatisticData.ts
├── App.tsx
├── main.tsx
└── index.css
```

## 6. 状态管理方案

采用 React Context + useReducer 的轻量级方案，分两个 Context：

1. **AppContext**：全局应用状态（用户信息、通知、弹窗）
2. **FilterContext**：全局筛选条件（时间范围、科室、术式），跨页面共享

各页面内的业务数据使用自定义 Hooks（如 `useKPIData`, `useAnomalyList`）管理，通过 React Query 风格的缓存策略（useMemo/useCallback）优化性能。

## 7. 性能优化策略

- 图表数据使用 `useMemo` 缓存计算结果
- 大表格采用虚拟滚动（如数据量超过 100 条）
- 图片使用懒加载 + WebP 格式
- 路由级代码分割（React.lazy + Suspense）
- TailwindCSS 使用 PurgeCSS 移除未使用样式
