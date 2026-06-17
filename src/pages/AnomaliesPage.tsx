import { useEffect, useState, useMemo } from 'react';
import { Search, Filter, Download, UserPlus, Eye, ClipboardCheck, CheckCircle2, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import AnomalyTag from '@/components/common/AnomalyTag';
import StatusBadge from '@/components/common/StatusBadge';
import Table, { TableColumn } from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Select, { SelectOption } from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { useAnomalyStore } from '@/store/useAnomalyStore';
import { mockSurgeons } from '@/data/mockData';
import type { Anomaly, AnomalyType, AnomalyStatus } from '@/types';
import { formatDateTime, formatDate } from '@/utils/dateUtils';
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
  const {
    anomalies,
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
    getTypeStats,
    getStatusStats,
  } = useAnomalyStore();

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

  const typeStats = useMemo(() => getTypeStats(), [getTypeStats]);
  const statusStats = useMemo(() => getStatusStats(), [getStatusStats]);

  useEffect(() => {
    fetchAnomalies();
  }, [fetchAnomalies, typeFilter, statusFilter, page, pageSize]);

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
    } else if (currentAssignId) {
      assignAnomaly({
        anomalyId: currentAssignId,
        assignee: assignForm.assignee as string,
        deadline: assignForm.deadline,
        remark: assignForm.remark,
      });
    }
    setAssignModalOpen(false);
  };

  const handleExport = () => {
    const exportData = selectedIds.length > 0
      ? anomalies.filter((a) => selectedIds.includes(a.anomalyId))
      : anomalies;
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
      width: 260,
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Eye className="w-4 h-4" />}
          >
            查看详情
          </Button>
          {record.status === 'pending' && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<UserPlus className="w-4 h-4" />}
              onClick={() => openSingleAssign(record.anomalyId)}
            >
              分派
            </Button>
          )}
          {(record.status === 'assigned' || record.status === 'rejected') && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ClipboardCheck className="w-4 h-4" />}
            >
              整改
            </Button>
          )}
          {record.status === 'rectifying' && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              复核
            </Button>
          )}
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
    </PageContainer>
  );
}
