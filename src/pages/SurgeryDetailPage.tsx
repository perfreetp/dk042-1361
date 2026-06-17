import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Scissors,
  Calendar,
  MapPin,
  Monitor,
  Clock,
  FileImage,
  Video,
  FileText,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  UserCheck,
  Wrench,
  Search,
  Upload,
  Send,
} from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import StatusBadge from '@/components/common/StatusBadge';
import Timeline, { type TimelineItem } from '@/components/common/Timeline';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Tag from '@/components/ui/Tag';
import { useSurgeryStore } from '@/store/useSurgeryStore';
import { useAnomalyStore } from '@/store/useAnomalyStore';
import { useAppStore } from '@/store/useAppStore';
import type { ArchiveItem, ItemType, ItemStatus, Anomaly } from '@/types';
import { formatDateTime } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

const itemTypeConfig: Record<ItemType, { label: string; icon: typeof FileImage; color: string; bgColor: string }> = {
  image: { label: '图像', icon: FileImage, color: 'text-medical-primary', bgColor: 'bg-medical-primary-light' },
  video: { label: '视频', icon: Video, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  report: { label: '报告', icon: FileText, color: 'text-medical-success', bgColor: 'bg-medical-success-light' },
};

const itemStatusConfig: Record<ItemStatus, { label: string; icon: typeof CheckCircle2; color: string }> = {
  archived: { label: '已归档', icon: CheckCircle2, color: 'text-medical-success' },
  missing: { label: '缺失', icon: XCircle, color: 'text-medical-danger' },
  mismatch: { label: '不一致', icon: AlertCircle, color: 'text-medical-warning' },
};

interface ChecklistGroup {
  type: ItemType;
  label: string;
  items: ArchiveItem[];
  completed: number;
  total: number;
}

export default function SurgeryDetailPage() {
  const { surgeryId } = useParams<{ surgeryId: string }>();
  const navigate = useNavigate();
  const { selectedSurgery, fetchSurgeryById, loading, clearSelectedSurgery } = useSurgeryStore();
  const { submitRectification, anomalies } = useAnomalyStore();
  const { addNotification } = useAppStore();
  const [expandedGroups, setExpandedGroups] = useState<Record<ItemType, boolean>>({
    image: true,
    video: true,
    report: true,
  });
  const [rectificationResult, setRectificationResult] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (surgeryId) {
      clearSelectedSurgery();
      fetchSurgeryById(surgeryId);
    }
    return () => {
      clearSelectedSurgery();
    };
  }, [surgeryId, fetchSurgeryById, clearSelectedSurgery]);

  const currentAnomaly = useMemo<Anomaly | undefined>(() => {
    if (selectedSurgery?.anomalies && selectedSurgery.anomalies.length > 0) {
      return selectedSurgery.anomalies[0];
    }
    if (surgeryId) {
      return anomalies.find((a) => a.surgeryId === surgeryId);
    }
    return undefined;
  }, [selectedSurgery, anomalies, surgeryId]);

  const archiveItemsByType = useMemo(() => {
    const result: Record<ItemType, ArchiveItem[]> = {
      image: [],
      video: [],
      report: [],
    };
    selectedSurgery?.archiveItems.forEach((item) => {
      result[item.itemType].push(item);
    });
    return result;
  }, [selectedSurgery]);

  const checklistGroups = useMemo<ChecklistGroup[]>(() => {
    return (['image', 'video', 'report'] as ItemType[]).map((type) => {
      const items = archiveItemsByType[type].filter((item) => item.isRequired);
      const completed = items.filter((item) => item.status === 'archived').length;
      return {
        type,
        label: itemTypeConfig[type].label,
        items,
        completed,
        total: items.length,
      };
    });
  }, [archiveItemsByType]);

  const timelineItems = useMemo<TimelineItem[]>(() => {
    const anomaly = currentAnomaly;
    if (!anomaly?.rectificationTimeline?.length) return [];

    const iconMap: Record<string, { icon: typeof AlertCircle; color: string; bgColor: string }> = {
      '发现': { icon: AlertCircle, color: 'text-medical-danger', bgColor: 'bg-medical-danger-light' },
      '分派': { icon: UserCheck, color: 'text-medical-primary', bgColor: 'bg-medical-primary-light' },
      '整改': { icon: Wrench, color: 'text-medical-warning', bgColor: 'bg-medical-warning-light' },
      '复核': { icon: Search, color: 'text-medical-success', bgColor: 'bg-medical-success-light' },
    };

    return anomaly.rectificationTimeline.map((record) => {
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
  }, [currentAnomaly]);

  const isAnomaly = selectedSurgery?.archiveStatus === 'anomaly' || !!currentAnomaly;
  const anomaly = currentAnomaly;
  const canRectify = isAnomaly && anomaly && ['assigned', 'rectifying'].includes(anomaly.status);

  const toggleGroup = (type: ItemType) => {
    setExpandedGroups((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleSubmitRectification = async () => {
    if (!anomaly || !rectificationResult.trim()) return;
    setShowConfirm(true);
  };

  const confirmSubmitRectification = async () => {
    if (!anomaly || !rectificationResult.trim()) return;
    setShowConfirm(false);
    setSubmitting(true);
    try {
      submitRectification({
        anomalyId: anomaly.anomalyId,
        result: rectificationResult.trim(),
        attachmentUrl: attachmentName || undefined,
      });
      addNotification({
        type: 'success',
        title: '提交成功',
        message: '整改结果已提交，状态已转为复核中',
      });
      setRectificationResult('');
      setAttachmentName('');
      if (surgeryId) {
        fetchSurgeryById(surgeryId);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading && !selectedSurgery) {
    return (
      <PageContainer 
        title="手术抽查详情" 
        breadcrumbs={[{ label: '首页' }, { label: '手术抽查详情' }]}
        actions={
          <Button variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={handleBack}>
            返回
          </Button>
        }
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-medical-primary border-t-transparent rounded-full" />
        </div>
      </PageContainer>
    );
  }

  if (!selectedSurgery) {
    return (
      <PageContainer 
        title="手术抽查详情" 
        breadcrumbs={[{ label: '首页' }, { label: '手术抽查详情' }]}
        actions={
          <Button variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={handleBack}>
            返回
          </Button>
        }
      >
        <div className="flex flex-col items-center justify-center h-64 text-text-tertiary">
          <FileImage className="w-16 h-16 mb-4 text-text-tertiary/50" />
          <div className="text-lg font-medium mb-2">未找到该手术信息</div>
          <div className="text-sm">该手术可能不存在或已被删除</div>
        </div>
      </PageContainer>
    );
  }

  const surgery = selectedSurgery;

  return (
    <PageContainer
      title="手术抽查详情"
      breadcrumbs={[{ label: '首页' }, { label: '手术抽查', href: '#' }, { label: surgery.surgeryId }]}
      actions={
        <Button variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={handleBack}>
          返回
        </Button>
      }
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>手术基本信息</CardTitle>
            <StatusBadge status={surgery.archiveStatus} />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-medical-primary-light flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-medical-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-text-tertiary mb-1">患者信息</div>
                  <div className="text-sm font-medium text-text-primary">
                    {surgery.patient.name}
                    <span className="ml-2 text-text-secondary font-normal">
                      {surgery.patient.gender} · {surgery.patient.age}岁
                    </span>
                  </div>
                  <div className="text-xs text-text-tertiary mt-0.5">
                    病历号：{surgery.patient.medicalRecordNo}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-medical-success-light flex items-center justify-center flex-shrink-0">
                  <Scissors className="w-5 h-5 text-medical-success" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-text-tertiary mb-1">手术名称</div>
                  <div className="text-sm font-medium text-text-primary truncate">{surgery.surgeryName}</div>
                  <div className="text-xs text-text-tertiary mt-0.5">术式：{surgery.procedureName}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-text-tertiary mb-1">术者</div>
                  <div className="text-sm font-medium text-text-primary">{surgery.surgeon}</div>
                  <div className="text-xs text-text-tertiary mt-0.5">科室：{surgery.department}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-medical-warning-light flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-medical-warning" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-text-tertiary mb-1">手术间</div>
                  <div className="text-sm font-medium text-text-primary">{surgery.operatingRoom}</div>
                  <div className="text-xs text-text-tertiary mt-0.5">设备：{surgery.equipment}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Monitor className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-text-tertiary mb-1">设备</div>
                  <div className="text-sm font-medium text-text-primary">{surgery.equipment}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-medical-primary-light flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-medical-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-text-tertiary mb-1">开始时间</div>
                  <div className="text-sm font-medium text-text-primary">{formatDateTime(surgery.startTime)}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-medical-success-light flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-medical-success" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-text-tertiary mb-1">结束时间</div>
                  <div className="text-sm font-medium text-text-primary">{formatDateTime(surgery.endTime)}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-text-secondary" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-text-tertiary mb-1">归档状态</div>
                  <StatusBadge status={surgery.archiveStatus} size="sm" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>归档资料清单</CardTitle>
            <div className="flex items-center gap-2">
              <Tag variant="info">共 {surgery.archiveItems.length} 项</Tag>
              <Tag variant="success">
                已归档 {surgery.archiveItems.filter((i) => i.status === 'archived').length}
              </Tag>
              <Tag variant="danger">
                缺失 {surgery.archiveItems.filter((i) => i.status === 'missing').length}
              </Tag>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {(['image', 'video', 'report'] as ItemType[]).map((type) => {
                const config = itemTypeConfig[type];
                const items = archiveItemsByType[type];
                const Icon = config.icon;
                return (
                  <div key={type} className="border border-border-light rounded-lg overflow-hidden">
                    <div className={cn('px-4 py-3 flex items-center justify-between', config.bgColor)}>
                      <div className="flex items-center gap-2">
                        <Icon className={cn('w-5 h-5', config.color)} />
                        <span className={cn('text-sm font-medium', config.color)}>{config.label}</span>
                      </div>
                      <span className="text-xs text-text-secondary">
                        {items.filter((i) => i.status === 'archived').length} / {items.length}
                      </span>
                    </div>
                    <div className="p-3">
                      {items.length === 0 ? (
                        <div className="text-center py-8 text-text-tertiary text-sm">暂无资料</div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {items.map((item) => {
                            const isMissing = item.status === 'missing';
                            const ItemIcon = itemTypeConfig[item.itemType].icon;
                            const statusCfg = itemStatusConfig[item.status];
                            return (
                              <div
                                key={item.itemId}
                                className={cn(
                                  'relative aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-2 transition-all',
                                  isMissing
                                    ? 'border-medical-danger bg-medical-danger-light/30'
                                    : 'border-border-light bg-gray-50 hover:border-medical-primary hover:bg-medical-primary-light/30'
                                )}
                                title={item.itemName}
                              >
                                <ItemIcon
                                  className={cn(
                                    'w-6 h-6 mb-1',
                                    isMissing ? 'text-medical-danger' : config.color
                                  )}
                                />
                                <span className="text-xs text-text-primary text-center line-clamp-2 leading-tight">
                                  {item.itemName}
                                </span>
                                {statusCfg && (
                                  <div className="absolute top-1 right-1">
                                    <statusCfg.icon className={cn('w-3.5 h-3.5', statusCfg.color)} />
                                  </div>
                                )}
                                {item.isRequired && (
                                  <span className="absolute top-1 left-1 text-[10px] text-medical-danger font-medium">
                                    *
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>必归档项目核对表</CardTitle>
            <div className="text-sm text-text-secondary">
              已完成 {checklistGroups.reduce((sum, g) => sum + g.completed, 0)} /{' '}
              {checklistGroups.reduce((sum, g) => sum + g.total, 0)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checklistGroups.map((group) => {
                const config = itemTypeConfig[group.type];
                const Icon = config.icon;
                const isExpanded = expandedGroups[group.type];
                const allCompleted = group.completed === group.total;
                return (
                  <div key={group.type} className="border border-border-light rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.type)}
                      className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn('w-7 h-7 rounded flex items-center justify-center', config.bgColor)}>
                          <Icon className={cn('w-4 h-4', config.color)} />
                        </div>
                        <span className="text-sm font-medium text-text-primary">{group.label}</span>
                        <Tag variant={allCompleted ? 'success' : 'warning'}>
                          {group.completed}/{group.total}
                        </Tag>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-text-tertiary" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-text-tertiary" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="p-3 space-y-2">
                        {group.items.map((item) => {
                          const isArchived = item.status === 'archived';
                          const StatusIcon = isArchived ? CheckCircle2 : XCircle;
                          return (
                            <div
                              key={item.itemId}
                              className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg border',
                                isArchived
                                  ? 'bg-medical-success-light/30 border-medical-success/20'
                                  : 'bg-medical-danger-light/30 border-medical-danger/20'
                              )}
                            >
                              <StatusIcon
                                className={cn(
                                  'w-5 h-5 flex-shrink-0',
                                  isArchived ? 'text-medical-success' : 'text-medical-danger'
                                )}
                              />
                              <div className="flex-1 min-w-0">
                                <div
                                  className={cn(
                                    'text-sm font-medium',
                                    isArchived ? 'text-text-primary' : 'text-medical-danger'
                                  )}
                                >
                                  {item.itemName}
                                </div>
                                {item.uploadTime && (
                                  <div className="text-xs text-text-tertiary mt-0.5">
                                    上传时间：{formatDateTime(item.uploadTime)}
                                  </div>
                                )}
                              </div>
                              <Tag variant={isArchived ? 'success' : 'danger'}>
                                {isArchived ? '已完成' : '缺失'}
                              </Tag>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {(anomaly || timelineItems.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>整改记录</CardTitle>
              {anomaly && <StatusBadge status={anomaly.status} />}
            </CardHeader>
            <CardContent>
              {timelineItems.length > 0 ? (
                <Timeline items={timelineItems} />
              ) : (
                <div className="text-center py-8 text-text-tertiary text-sm">暂无整改记录</div>
              )}
            </CardContent>
          </Card>
        )}

        {canRectify && (
          <Card>
            <CardHeader>
              <CardTitle>整改操作</CardTitle>
              <Tag variant="warning">整改中</Tag>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">整改结果说明</label>
                  <textarea
                    value={rectificationResult}
                    onChange={(e) => setRectificationResult(e.target.value)}
                    placeholder="请详细描述整改情况，包括补充的资料、修正的内容等..."
                    rows={4}
                    className="w-full rounded-lg border border-border-default px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-medical-primary/30 focus:border-medical-primary resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">上传整改凭证</label>
                  <div className="space-y-2">
                    <div className="border-2 border-dashed border-border-default rounded-lg p-8 text-center hover:border-medical-primary hover:bg-medical-primary-light/30 transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 text-text-tertiary mx-auto mb-2" />
                      <p className="text-sm text-text-secondary">点击或拖拽文件到此处上传</p>
                      <p className="text-xs text-text-tertiary mt-1">支持图片、PDF 等格式，单个文件不超过 20MB</p>
                    </div>
                    <Input
                      placeholder="模拟文件名（如：整改凭证.pdf）"
                      value={attachmentName}
                      onChange={(e) => setAttachmentName(e.target.value)}
                      prefixIcon={<FileImage className="w-4 h-4" />}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button variant="secondary" onClick={() => {
                    setRectificationResult('');
                    setAttachmentName('');
                  }}>
                    重置
                  </Button>
                  <Button
                    variant="primary"
                    leftIcon={<Send className="w-4 h-4" />}
                    onClick={handleSubmitRectification}
                    loading={submitting}
                    disabled={!rectificationResult.trim()}
                  >
                    提交复核
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-border-light">
              <h3 className="text-lg font-semibold text-text-primary">确认提交整改</h3>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-start gap-3 p-4 bg-medical-warning-light/50 rounded-lg border border-medical-warning/20">
                <AlertCircle className="w-5 h-5 text-medical-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-text-primary">提交后状态将转为复核中</p>
                  <p className="text-xs text-text-secondary mt-1">
                    确认已完成所有整改工作，并上传了相关凭证。提交后将无法修改，等待质控人员复核。
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowConfirm(false)} disabled={submitting}>
                取消
              </Button>
              <Button
                variant="primary"
                onClick={confirmSubmitRectification}
                loading={submitting}
              >
                确认提交
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
