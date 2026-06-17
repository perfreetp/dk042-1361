import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  UserPlus,
  Eye,
  ClipboardCheck,
  CheckCircle2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Upload,
  XCircle,
  FileImage,
  X,
  AlertTriangle,
  Calendar,
  Clock,
  UserCheck,
  FileText,
  Video,
  AlertCircle,
  Wrench,
  Send,
} from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import AnomalyTag from '@/components/common/AnomalyTag';
import StatusBadge from '@/components/common/StatusBadge';
import Timeline, { type TimelineItem } from '@/components/common/Timeline';
import Table, { TableColumn } from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Select, { SelectOption } from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Tag from '@/components/ui/Tag';
import { useAnomalyStore } from '@/store/useAnomalyStore';
import { useAppStore } from '@/store/useAppStore';
import { mockSurgeons } from '@/data/mockData';
import type { Anomaly, AnomalyType, AnomalyStatus } from '@/types';
import { formatDateTime, formatDate } from '@/utils/dateUtils';
import { getAnomalyTypeInfo } from '@/utils/formatUtils';
import { exportAnomalyList } from '@/utils/exportUtils';
import { cn } from '@/lib/utils';

const typeTabs: { key: AnomalyType | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'overdue', label: '超时归档' },
  { key: 'missing_items', label: '资料缺项' },
  { key: 'patient_mismatch', label: '患者信息不一致' },
  { key: 'duplicate', label: '重复归档' },
];

const statusTabs: { key: AnomalyStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待处理' },
  { key: 'assigned', label: '已分派' },
  { key: 'rectifying', label: '整改中' },
  { key: 'reviewing', label: '复核中' },
  { key: 'closed', label: '已关闭' },
  { key: 'rejected', label: '已驳回' },
];

const assigneeOptions: SelectOption[] = mockSurgeons.map((name) => ({ label: name, value: name }));

export default function AnomaliesPage() {
  const navigate = useNavigate();
  const {
    anomalies,
    allAnomalies,
    selectedIds,
    loading,
    total,
    page,
    pageSize,
    typeFilter,
    statusFilter,
    fetchAnomalies,
    setTypeFilter,
    setStatusFilter,
    setPage,
    setPageSize,
    toggleSelect,
    selectAll,
    clearSelection,
    assignAnomaly,
    batchAssign,
    submitRectification,
    reviewAnomaly,
    getTypeStats,
    getStatusStats,
    getFilteredAnomalies,
  } = useAnomalyStore();
  const { addNotification } = useAppStore();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [currentAssignId, setCurrentAssignId] = useState<string | null>(null);
  const [isBatchAssign, setIsBatchAssign] = useState(false);
  const [assignForm, setAssignForm] = useState({
    assignee: '',
    remark: '',
    deadline: '',
  });

  const [rectifyModalOpen, setRectifyModalOpen] = useState(false);
  const [currentRectifyId, setCurrentRectifyId] = useState<string | null>(null);
  const [rectifyForm, setRectifyForm] = useState({
    result: '',
    attachmentName: '',
  });

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [currentReviewId, setCurrentReviewId] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState({
    opinion: '',
  });

  const [traceDrawerOpen, setTraceDrawerOpen] = useState(false);
  const [traceAnomaly, setTraceAnomaly] = useState<Anomaly | null>(null);

  const { getAnomalyById } = useAnomalyStore();

  const openTrace = (record: Anomaly) => {
    const latest = getAnomalyById(record.anomalyId);
    setTraceAnomaly(latest || record);
    setTraceDrawerOpen(true);
  };

  const closeTrace = () => {
    setTraceDrawerOpen(false);
    setTraceAnomaly(null);
  };

  const traceTimelineItems = useMemo<TimelineItem[]>(() => {
    if (!traceAnomaly?.rectificationTimeline?.length) return [];
    const iconMap: Record<string, { icon: typeof AlertCircle; color: string; bgColor: string }> = {
      '发现': { icon: AlertCircle, color: 'text-medical-danger', bgColor: 'bg-medical-danger-light' },
      '分派': { icon: UserCheck, color: 'text-medical-primary', bgColor: 'bg-medical-primary-light' },
      '整改': { icon: Wrench, color: 'text-medical-warning', bgColor: 'bg-medical-warning-light' },
      '复核': { icon: Search, color: 'text-medical-success', bgColor: 'bg-medical-success-light' },
    };
    return traceAnomaly.rectificationTimeline.map((record) => {
      let matchedKey = '发现';
      for (const key of Object.keys(iconMap)) {
        if (record.action.includes(key)) {
          matchedKey = key;
          break;
        }
      }
      const config = iconMap[matchedKey] || iconMap['发现'];
      return {
        id: record.recordId,
        icon: config.icon,
        iconColor: config.color,
        iconBgColor: config.bgColor,
        title: `${record.action} - ${record.operator}`,
        time: formatDateTime(record.operateTime),
        description: record.remark,
      };
    });
  }, [traceAnomaly]);

  useEffect(() => {
    if (traceDrawerOpen && traceAnomaly) {
      const latest = getAnomalyById(traceAnomaly.anomalyId);
      if (latest) {
        setTraceAnomaly(latest);
      }
    }
  }, [traceDrawerOpen, traceAnomaly?.anomalyId, allAnomalies, getAnomalyById]);

  const typeStats = useMemo(() => getTypeStats(), [getTypeStats, allAnomalies]);
  const statusStats = useMemo(() => getStatusStats(), [getStatusStats, allAnomalies]);

  useEffect(() => {
    fetchAnomalies();
  }, [fetchAnomalies]);

  const filteredAnomalies = useMemo(() => {
    if (!searchKeyword) return anomalies;
    const kw = searchKeyword.toLowerCase();
    return anomalies.filter((a) => {
      const patientName = a.surgery?.patient?.name?.toLowerCase() || '';
      const surgeryName = a.surgery?.surgeryName?.toLowerCase() || '';
      const anomalyId = a.anomalyId.toLowerCase();
      return patientName.includes(kw) || surgeryName.includes(kw) || anomalyId.includes(kw);
    });
  }, [anomalies, searchKeyword]);

  const openSingleAssign = (id: string) => {
    setCurrentAssignId(id);
    setIsBatchAssign(false);
    setAssignForm({ assignee: '', remark: '', deadline: '' });
    setAssignModalOpen(true);
  };

  const openBatchAssign = () => {
    if (selectedIds.length === 0) return;
    setCurrentAssignId(null);
    setIsBatchAssign(true);
    setAssignForm({ assignee: '', remark: '', deadline: '' });
    setAssignModalOpen(true);
  };

  const handleAssign = () => {
    if (!assignForm.assignee || !assignForm.deadline) return;
    if (isBatchAssign) {
      batchAssign(selectedIds, assignForm.assignee as string, assignForm.deadline, assignForm.remark);
      addNotification({
        type: 'success',
        title: '批量分派成功',
        message: `已将 ${selectedIds.length} 条异常分派给 ${assignForm.assignee}`,
      });
    } else if (currentAssignId) {
      assignAnomaly({
        anomalyId: currentAssignId,
        assignee: assignForm.assignee as string,
        deadline: assignForm.deadline,
        remark: assignForm.remark,
      });
      addNotification({
        type: 'success',
        title: '分派成功',
        message: `异常已分派给 ${assignForm.assignee}`,
      });
    }
    setAssignModalOpen(false);
  };

  const openRectify = (id: string) => {
    setCurrentRectifyId(id);
    setRectifyForm({ result: '', attachmentName: '' });
    setRectifyModalOpen(true);
  };

  const handleRectify = () => {
    if (!currentRectifyId || !rectifyForm.result.trim()) return;
    submitRectification({
      anomalyId: currentRectifyId,
      result: rectifyForm.result.trim(),
      attachmentUrl: rectifyForm.attachmentName || undefined,
    });
    addNotification({
      type: 'success',
      title: '整改提交成功',
      message: '整改结果已提交，等待复核',
    });
    setRectifyModalOpen(false);
  };

  const openReview = (id: string) => {
    setCurrentReviewId(id);
    setReviewForm({ opinion: '' });
    setReviewModalOpen(true);
  };

  const handleReview = (passed: boolean) => {
    if (!currentReviewId) return;
    reviewAnomaly({
      anomalyId: currentReviewId,
      opinion: reviewForm.opinion.trim() || (passed ? '复核通过' : '复核驳回'),
      passed,
    });
    addNotification({
      type: passed ? 'success' : 'warning',
      title: passed ? '复核通过' : '复核驳回',
      message: passed ? '异常已关闭' : '请整改后重新提交',
    });
    setReviewModalOpen(false);
  };

  const handleExport = () => {
    const filtered = getFilteredAnomalies();
    const exportData = selectedIds.length > 0
      ? filtered.filter((a) => selectedIds.includes(a.anomalyId))
      : filtered;
    exportAnomalyList(exportData, '异常记录清单');
  };

  const handleSelectChange = (keys: (string | number)[], rows: Anomaly[]) => {
    if (keys.length === anomalies.length && rows.length === anomalies.length) {
      selectAll(anomalies.map((a) => a.anomalyId));
    } else {
      const currentPageIds = anomalies.map((a) => a.anomalyId);
      const newSelected = selectedIds.filter((id) => !currentPageIds.includes(id));
      keys.forEach((k) => {
        if (!newSelected.includes(k as string)) {
          newSelected.push(k as string);
        }
      });
      useAnomalyStore.setState({ selectedIds: newSelected });
    }
  };

  const columns: TableColumn<Anomaly>[] = [
    {
      key: 'anomalyId',
      title: '异常ID',
      dataIndex: 'anomalyId',
      width: 150,
    },
    {
      key: 'surgery',
      title: '关联手术',
      width: 220,
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="text-text-primary font-medium">
            {record.surgery?.patient?.name || '-'}
          </span>
          <span className="text-text-tertiary text-xs mt-0.5">
            {record.surgery?.surgeryName || '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'anomalyType',
      title: '异常类型',
      width: 130,
      render: (_, record) => <AnomalyTag type={record.anomalyType} />,
    },
    {
      key: 'discoverTime',
      title: '发现时间',
      dataIndex: 'discoverTime',
      width: 170,
      render: (value) => formatDateTime(value as string),
    },
    {
      key: 'status',
      title: '状态',
      width: 100,
      render: (_, record) => <StatusBadge status={record.status} />,
    },
    {
      key: 'assignee',
      title: '负责人',
      dataIndex: 'assignee',
      width: 100,
      render: (value) => (value as string) || <span className="text-text-tertiary">-</span>,
    },
    {
      key: 'deadline',
      title: '整改期限',
      dataIndex: 'deadline',
      width: 130,
      render: (value) =>
        value ? formatDate(value as string) : <span className="text-text-tertiary">-</span>,
    },
    {
      key: 'actions',
      title: '操作',
      width: 420,
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Eye className="w-4 h-4" />}
            onClick={() => navigate(`/surgery/${record.surgeryId}`)}
          >
            查看详情
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<FileText className="w-4 h-4" />}
            onClick={() => openTrace(record)}
          >
            追踪
          </Button>
          {record.status === 'pending' ? (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<UserPlus className="w-4 h-4" />}
              onClick={() => openSingleAssign(record.anomalyId)}
            >
              分派整改
            </Button>
          ) : null}
          {(record.status === 'assigned' || record.status === 'rectifying') ? (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ClipboardCheck className="w-4 h-4" />}
              onClick={() => openRectify(record.anomalyId)}
            >
              整改提交
            </Button>
          ) : null}
          {record.status === 'reviewing' ? (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              onClick={() => openReview(record.anomalyId)}
            >
              复核
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <PageContainer
      title="异常清单"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={openBatchAssign}
            disabled={selectedIds.length === 0}
          >
            批量分派 {selectedIds.length > 0 && `(${selectedIds.length})`}
          </Button>
          <Button
            variant="secondary"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExport}
          >
            批量导出
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Card padding="none" shadow="sm">
          <div className="flex items-center border-b border-border-light">
            {typeTabs.map((tab) => {
              const count = tab.key === 'all' ? typeStats.all : typeStats[tab.key as AnomalyType];
              const active = typeFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setTypeFilter(tab.key)}
                  className={cn(
                    'flex-1 px-4 py-3 text-sm font-medium transition-colors relative',
                    active
                      ? 'text-medical-primary bg-medical-primary-light/30'
                      : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
                  )}
                >
                  <span className="flex items-center justify-center gap-2">
                    {tab.label}
                    <span
                      className={cn(
                        'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium',
                        active
                          ? 'bg-medical-primary text-white'
                          : 'bg-gray-100 text-text-secondary'
                      )}
                    >
                      {count}
                    </span>
                  </span>
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-medical-primary" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex items-center px-2 py-2">
            {statusTabs.map((tab) => {
              const count = tab.key === 'all' ? statusStats.all : statusStats[tab.key as AnomalyStatus];
              const active = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-md transition-colors mx-1',
                    active
                      ? 'bg-medical-primary text-white'
                      : 'text-text-secondary hover:text-text-primary hover:bg-gray-100'
                  )}
                >
                  {tab.label}
                  <span
                    className={cn(
                      'ml-1.5 text-xs',
                      active ? 'text-white/80' : 'text-text-tertiary'
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card padding="md" shadow="sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Input
                placeholder="搜索异常ID、患者姓名、手术名称..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                prefixIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Filter className="w-4 h-4" />}
              rightIcon={showAdvancedFilter ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
            >
              高级筛选
            </Button>
            {(searchKeyword || showAdvancedFilter) && (
              <Button
                variant="ghost"
                size="md"
                leftIcon={<RotateCcw className="w-4 h-4" />}
                onClick={() => {
                  setSearchKeyword('');
                  setShowAdvancedFilter(false);
                }}
              >
                重置
              </Button>
            )}
          </div>
          {showAdvancedFilter && (
            <div className="mt-4 pt-4 border-t border-border-light grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">科室</label>
                <Select
                  options={[
                    { label: '全部', value: 'all' },
                    { label: '心血管内科', value: '心血管内科' },
                    { label: '神经外科', value: '神经外科' },
                    { label: '骨科', value: '骨科' },
                    { label: '普外科', value: '普外科' },
                  ]}
                  placeholder="请选择科室"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">发现时间</label>
                <div className="flex items-center gap-2">
                  <Input type="date" size="md" />
                  <span className="text-text-tertiary text-sm">至</span>
                  <Input type="date" size="md" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">整改负责人</label>
                <Select
                  options={[{ label: '全部', value: 'all' }, ...assigneeOptions]}
                  placeholder="请选择负责人"
                />
              </div>
            </div>
          )}
        </Card>

        <Card padding="none" shadow="sm">
          <Table
            columns={columns as TableColumn<any>[]}
            dataSource={filteredAnomalies}
            rowKey="anomalyId"
            selectable
            selectedRowKeys={selectedIds}
            onSelectChange={handleSelectChange}
            pagination={false}
            emptyText={loading ? '加载中...' : '暂无异常数据'}
          />
          {(total > 0) && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border-light">
              <span className="text-sm text-text-secondary">
                共 {total} 条记录，第 {page} / {Math.max(1, Math.ceil(total / pageSize))} 页
              </span>
              <div className="flex items-center gap-2">
                <Select
                  size="sm"
                  value={pageSize}
                  options={[
                    { label: '10 条/页', value: 10 },
                    { label: '20 条/页', value: 20 },
                    { label: '50 条/页', value: 50 },
                  ]}
                  onChange={(v) => setPageSize(v as number)}
                  className="w-32"
                />
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    上一页
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page >= Math.ceil(total / pageSize)}
                    onClick={() => setPage(page + 1)}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Modal
        open={assignModalOpen}
        title={isBatchAssign ? `批量分派 (${selectedIds.length}条)` : '分派异常'}
        width={480}
        onClose={() => setAssignModalOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setAssignModalOpen(false)}>
              取消
            </Button>
            <Button
              variant="primary"
              onClick={handleAssign}
              disabled={!assignForm.assignee || !assignForm.deadline}
            >
              确认分派
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              整改负责人 <span className="text-medical-danger">*</span>
            </label>
            <Select
              options={assigneeOptions}
              placeholder="请选择负责人"
              value={assignForm.assignee || undefined}
              onChange={(v) => setAssignForm({ ...assignForm, assignee: v as string })}
              searchable
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">整改要求</label>
            <textarea
              rows={3}
              placeholder="请输入整改要求..."
              value={assignForm.remark}
              onChange={(e) => setAssignForm({ ...assignForm, remark: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border-default bg-white text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-medical-primary/30 focus:border-medical-primary transition-colors resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              整改期限 <span className="text-medical-danger">*</span>
            </label>
            <Input
              type="date"
              value={assignForm.deadline}
              onChange={(e) => setAssignForm({ ...assignForm, deadline: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={rectifyModalOpen}
        title="提交整改"
        width={480}
        onClose={() => setRectifyModalOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setRectifyModalOpen(false)}>
              取消
            </Button>
            <Button
              variant="primary"
              onClick={handleRectify}
              disabled={!rectifyForm.result.trim()}
            >
              提交整改
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              整改结果 <span className="text-medical-danger">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="请详细描述整改情况，包括补充的资料、修正的内容等..."
              value={rectifyForm.result}
              onChange={(e) => setRectifyForm({ ...rectifyForm, result: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border-default bg-white text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-medical-primary/30 focus:border-medical-primary transition-colors resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">上传整改凭证</label>
            <div className="space-y-2">
              <div className="border-2 border-dashed border-border-default rounded-lg p-6 text-center hover:border-medical-primary hover:bg-medical-primary-light/30 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-text-tertiary mx-auto mb-2" />
                <p className="text-sm text-text-secondary">点击或拖拽文件到此处上传</p>
                <p className="text-xs text-text-tertiary mt-1">支持图片、PDF 等格式</p>
              </div>
              <Input
                placeholder="模拟文件名（如：整改凭证.pdf）"
                value={rectifyForm.attachmentName}
                onChange={(e) => setRectifyForm({ ...rectifyForm, attachmentName: e.target.value })}
                prefixIcon={<FileImage className="w-4 h-4" />}
              />
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={reviewModalOpen}
        title="复核异常"
        width={480}
        onClose={() => setReviewModalOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setReviewModalOpen(false)}>
              取消
            </Button>
            <Button
              variant="danger"
              leftIcon={<XCircle className="w-4 h-4" />}
              onClick={() => handleReview(false)}
            >
              驳回
            </Button>
            <Button
              variant="primary"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              onClick={() => handleReview(true)}
            >
              通过
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">复核意见</label>
            <textarea
              rows={4}
              placeholder="请输入复核意见..."
              value={reviewForm.opinion}
              onChange={(e) => setReviewForm({ ...reviewForm, opinion: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border-default bg-white text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-medical-primary/30 focus:border-medical-primary transition-colors resize-none"
            />
          </div>
        </div>
      </Modal>

      {traceDrawerOpen && traceAnomaly && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={closeTrace}
          />
          <div className="absolute top-0 right-0 h-full w-full max-w-[520px] bg-white shadow-xl overflow-hidden flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-light flex-shrink-0">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">异常处理追踪</h3>
                <p className="text-xs text-text-tertiary mt-0.5">{traceAnomaly.anomalyId}</p>
              </div>
              <button
                type="button"
                onClick={closeTrace}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-text-tertiary hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-5 space-y-5">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-medical-danger-light flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-medical-danger" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <AnomalyTag type={traceAnomaly.anomalyType} />
                      <StatusBadge status={traceAnomaly.status} />
                    </div>
                    <p className="text-sm text-text-primary line-clamp-2">
                      {traceAnomaly.description || getAnomalyTypeInfo(traceAnomaly.anomalyType).label}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <UserCheck className="w-4 h-4 text-medical-primary mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs text-text-tertiary">负责人</div>
                      <div className="text-sm font-medium text-text-primary">
                        {traceAnomaly.assignee || '待分派'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs text-text-tertiary">整改期限</div>
                      <div className="text-sm font-medium text-text-primary">
                        {traceAnomaly.deadline ? formatDate(traceAnomaly.deadline) : '未设置'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-medical-warning mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs text-text-tertiary">发现时间</div>
                      <div className="text-sm font-medium text-text-primary">
                        {formatDateTime(traceAnomaly.discoverTime)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-medical-success mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs text-text-tertiary">整改结果</div>
                      <div className="text-sm font-medium text-text-primary truncate" title={traceAnomaly.rectificationResult}>
                        {traceAnomaly.rectificationResult || '待提交'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border-light pt-4">
                  <div className="text-sm font-medium text-text-primary mb-3">整改时间线</div>
                  {traceTimelineItems.length > 0 ? (
                    <Timeline items={traceTimelineItems} />
                  ) : (
                    <div className="text-center py-6 text-text-tertiary text-sm">暂无整改记录</div>
                  )}
                </div>

                <div className="border-t border-border-light pt-4">
                  <div className="text-sm font-medium text-text-primary mb-3">关联手术资料</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 rounded-lg bg-medical-primary-light/30 text-center">
                      <FileImage className="w-6 h-6 text-medical-primary mx-auto mb-1" />
                      <div className="text-lg font-semibold text-medical-primary">
                        {traceAnomaly.surgery?.archiveItems?.filter((i) => i.itemType === 'image').length || 0}
                      </div>
                      <div className="text-xs text-text-tertiary">图像</div>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-50 text-center">
                      <Video className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                      <div className="text-lg font-semibold text-purple-600">
                        {traceAnomaly.surgery?.archiveItems?.filter((i) => i.itemType === 'video').length || 0}
                      </div>
                      <div className="text-xs text-text-tertiary">视频</div>
                    </div>
                    <div className="p-3 rounded-lg bg-medical-success-light/30 text-center">
                      <FileText className="w-6 h-6 text-medical-success mx-auto mb-1" />
                      <div className="text-lg font-semibold text-medical-success">
                        {traceAnomaly.surgery?.archiveItems?.filter((i) => i.itemType === 'report').length || 0}
                      </div>
                      <div className="text-xs text-text-tertiary">报告</div>
                    </div>
                  </div>
                  {traceAnomaly.surgery && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-text-tertiary mb-1">患者信息</div>
                      <div className="text-sm font-medium text-text-primary">
                        {traceAnomaly.surgery.patient?.name || '-'}
                        <span className="text-text-secondary font-normal ml-2">
                          {traceAnomaly.surgery.patient?.gender} · {traceAnomaly.surgery.patient?.age}岁
                        </span>
                      </div>
                      <div className="text-xs text-text-tertiary mt-1">
                        {traceAnomaly.surgery.surgeryName}
                      </div>
                    </div>
                  )}
                </div>

                {traceAnomaly.reviewOpinion && (
                  <div className={cn(
                    'p-4 rounded-lg border',
                    traceAnomaly.status === 'closed'
                      ? 'bg-medical-success-light/30 border-medical-success/20'
                      : 'bg-medical-danger-light/30 border-medical-danger/20'
                  )}>
                    <div className="text-xs text-text-tertiary mb-1">
                      复核意见（{traceAnomaly.reviewer || '复核人'}）
                    </div>
                    <p className="text-sm text-text-primary">{traceAnomaly.reviewOpinion}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-border-light p-4 flex items-center gap-2 flex-shrink-0 bg-gray-50">
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Eye className="w-4 h-4" />}
                onClick={() => {
                  closeTrace();
                  navigate(`/surgery/${traceAnomaly.surgeryId}`);
                }}
                className="flex-1"
              >
                查看手术详情
              </Button>
              {traceAnomaly.status === 'pending' && (
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<UserPlus className="w-4 h-4" />}
                  onClick={() => {
                    closeTrace();
                    openSingleAssign(traceAnomaly.anomalyId);
                  }}
                  className="flex-1"
                >
                  分派整改
                </Button>
              )}
              {(traceAnomaly.status === 'assigned' || traceAnomaly.status === 'rectifying') && (
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<ClipboardCheck className="w-4 h-4" />}
                  onClick={() => {
                    closeTrace();
                    openRectify(traceAnomaly.anomalyId);
                  }}
                  className="flex-1"
                >
                  整改提交
                </Button>
              )}
              {traceAnomaly.status === 'reviewing' && (
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  onClick={() => {
                    closeTrace();
                    openReview(traceAnomaly.anomalyId);
                  }}
                  className="flex-1"
                >
                  去复核
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
