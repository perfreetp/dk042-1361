import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  FileImage,
  Video,
  FileText,
  GripVertical,
  Edit2,
  Trash2,
  X,
  Check,
  Star,
  StarOff,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Tag from '@/components/ui/Tag';
import Modal from '@/components/ui/Modal';
import { useAppStore } from '@/store/useAppStore';
import { useProcedureStore } from '@/store/useProcedureStore';
import type { ProcedureTemplate, RequiredItem, ItemType } from '@/types';
import { cn } from '@/lib/utils';

const itemTypeConfig: Record<ItemType, { label: string; icon: typeof FileImage; color: string; bgColor: string }> = {
  image: { label: '图像', icon: FileImage, color: 'text-medical-primary', bgColor: 'bg-medical-primary-light' },
  video: { label: '视频', icon: Video, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  report: { label: '报告', icon: FileText, color: 'text-medical-success', bgColor: 'bg-medical-success-light' },
};

export default function ProcedureConfigPage() {
  const { addNotification } = useAppStore();
  const {
    templates,
    fetchTemplates,
    addTemplate,
    addItem,
    updateItem,
    deleteItem,
    reorderItems,
  } = useProcedureStore();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<ItemType, boolean>>({
    image: true,
    video: true,
    report: true,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RequiredItem | null>(null);
  const [editingGroupType, setEditingGroupType] = useState<ItemType>('image');
  const [draggedItem, setDraggedItem] = useState<{ type: ItemType; index: number } | null>(null);
  const [dragOverItem, setDragOverItem] = useState<{ type: ItemType; index: number } | null>(null);

  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    isRequired: true,
  });

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    if (templates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(templates[0].templateId);
    }
  }, [templates, selectedTemplateId]);

  const filteredTemplates = useMemo(() => {
    if (!searchKeyword.trim()) return templates;
    const keyword = searchKeyword.trim().toLowerCase();
    return templates.filter(
      (t) =>
        t.procedureName.toLowerCase().includes(keyword) ||
        t.procedureCode.toLowerCase().includes(keyword)
    );
  }, [templates, searchKeyword]);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.templateId === selectedTemplateId) || null,
    [templates, selectedTemplateId]
  );

  const groupedItems = useMemo(() => {
    const result: Record<ItemType, RequiredItem[]> = {
      image: [],
      video: [],
      report: [],
    };
    selectedTemplate?.requiredItems.forEach((item) => {
      result[item.itemType].push(item);
    });
    return result;
  }, [selectedTemplate]);

  const toggleGroup = (type: ItemType) => {
    setExpandedGroups((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleAddItem = (type: ItemType) => {
    setEditingGroupType(type);
    setEditingItem(null);
    setFormData({
      itemName: '',
      description: '',
      isRequired: true,
    });
    setIsModalOpen(true);
  };

  const handleEditItem = (item: RequiredItem, type: ItemType) => {
    setEditingGroupType(type);
    setEditingItem(item);
    setFormData({
      itemName: item.itemName,
      description: item.description || '',
      isRequired: item.isRequired,
    });
    setIsModalOpen(true);
  };

  const handleDeleteItem = (itemId: string) => {
    if (!selectedTemplate) return;
    deleteItem(selectedTemplate.templateId, itemId);
    addNotification({
      type: 'success',
      title: '删除成功',
      message: '归档项目已删除',
    });
  };

  const handleSaveItem = () => {
    if (!selectedTemplate || !formData.itemName.trim()) return;

    if (editingItem) {
      updateItem(selectedTemplate.templateId, editingItem.itemId, {
        itemName: formData.itemName.trim(),
        description: formData.description.trim(),
        itemType: editingGroupType,
        isRequired: formData.isRequired,
      });
      addNotification({
        type: 'success',
        title: '保存成功',
        message: '归档项目已更新',
      });
    } else {
      const newItem: RequiredItem = {
        itemId: `RI${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
        itemName: formData.itemName.trim(),
        itemType: editingGroupType,
        description: formData.description.trim(),
        isRequired: formData.isRequired,
      };
      addItem(selectedTemplate.templateId, newItem);
      addNotification({
        type: 'success',
        title: '添加成功',
        message: '归档项目已添加',
      });
    }

    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDragStart = (type: ItemType, index: number) => {
    setDraggedItem({ type, index });
  };

  const handleDragOver = (e: React.DragEvent, type: ItemType, index: number) => {
    e.preventDefault();
    if (draggedItem && draggedItem.type === type && draggedItem.index !== index) {
      setDragOverItem({ type, index });
    }
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (type: ItemType, targetIndex: number) => {
    if (!draggedItem || !selectedTemplate || draggedItem.type !== type || draggedItem.index === targetIndex) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }
    reorderItems(selectedTemplate.templateId, type, draggedItem.index, targetIndex);
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleAddTemplate = () => {
    const newTemplate: ProcedureTemplate = {
      templateId: `PT${Date.now()}`,
      procedureCode: `NEW${templates.length + 1}`,
      procedureName: '新建术式配置',
      requiredItems: [
        { itemId: `RI${Date.now()}1`, itemName: '术前造影图像', itemType: 'image', description: '术前血管造影评估图像', isRequired: true },
        { itemId: `RI${Date.now()}2`, itemName: '术中造影图像', itemType: 'image', description: '术中关键步骤造影图像', isRequired: true },
        { itemId: `RI${Date.now()}3`, itemName: '术后造影图像', itemType: 'image', description: '术后效果评估造影图像', isRequired: true },
        { itemId: `RI${Date.now()}4`, itemName: '手术全程录像', itemType: 'video', description: '完整手术过程录像', isRequired: true },
        { itemId: `RI${Date.now()}5`, itemName: '手术记录单', itemType: 'report', description: '详细手术过程记录', isRequired: true },
        { itemId: `RI${Date.now()}6`, itemName: '麻醉记录单', itemType: 'report', description: '麻醉过程及用药记录', isRequired: true },
      ],
    };
    addTemplate(newTemplate);
    setSelectedTemplateId(newTemplate.templateId);
    addNotification({
      type: 'success',
      title: '创建成功',
      message: '已创建新的术式归档配置',
    });
  };

  const typeOptions = [
    { label: '图像', value: 'image' },
    { label: '视频', value: 'video' },
    { label: '报告', value: 'report' },
  ];

  return (
    <PageContainer
      title="术式归档配置"
      breadcrumbs={[{ label: '首页' }, { label: '系统配置' }, { label: '术式归档配置' }]}
      actions={
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={handleAddTemplate}>
          新增配置
        </Button>
      }
    >
      <div className="h-full flex gap-6">
        <div className="w-80 flex-shrink-0 flex flex-col bg-background-card rounded-lg border border-border-light shadow-card overflow-hidden">
          <div className="p-4 border-b border-border-light">
            <Input
              placeholder="搜索术式名称或编码"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              prefixIcon={<Search className="w-4 h-4" />}
              size="md"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredTemplates.length === 0 ? (
              <div className="p-8 text-center text-text-tertiary text-sm">暂无匹配的术式</div>
            ) : (
              filteredTemplates.map((template) => {
                const isSelected = template.templateId === selectedTemplateId;
                const requiredCount = template.requiredItems.length;
                return (
                  <button
                    key={template.templateId}
                    type="button"
                    onClick={() => setSelectedTemplateId(template.templateId)}
                    className={cn(
                      'w-full text-left px-4 py-3 border-b border-border-light transition-colors',
                      isSelected
                        ? 'bg-medical-primary-light border-l-4 border-l-medical-primary'
                        : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div
                          className={cn(
                            'text-sm font-medium truncate',
                            isSelected ? 'text-medical-primary' : 'text-text-primary'
                          )}
                        >
                          {template.procedureName}
                        </div>
                        <div className="text-xs text-text-tertiary mt-1">
                          编码：{template.procedureCode}
                        </div>
                      </div>
                      <Tag variant="info">
                        {requiredCount}项
                      </Tag>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {!selectedTemplate ? (
            <Card>
              <CardContent>
                <div className="py-20 text-center text-text-tertiary">请选择左侧术式查看配置</div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>术式信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <div className="text-xs text-text-tertiary mb-1">术式名称</div>
                      <div className="text-sm font-medium text-text-primary">
                        {selectedTemplate.procedureName}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-text-tertiary mb-1">术式编码</div>
                      <div className="text-sm font-medium text-text-primary">
                        {selectedTemplate.procedureCode}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-text-tertiary mb-1">必归档项目数</div>
                      <div className="text-sm font-medium text-text-primary">
                        {selectedTemplate.requiredItems.filter((i) => i.isRequired).length} 项
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {(['image', 'video', 'report'] as ItemType[]).map((type) => {
                const config = itemTypeConfig[type];
                const items = groupedItems[type];
                const Icon = config.icon;
                const isExpanded = expandedGroups[type];
                return (
                  <Card key={type}>
                    <CardHeader>
                      <button
                        type="button"
                        onClick={() => toggleGroup(type)}
                        className="flex items-center justify-between w-full"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', config.bgColor)}>
                            <Icon className={cn('w-4 h-4', config.color)} />
                          </div>
                          <div className="text-left">
                            <CardTitle className="text-base">{config.label}资料</CardTitle>
                            <div className="text-xs text-text-tertiary mt-0.5">共 {items.length} 项</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<Plus className="w-3.5 h-3.5" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddItem(type);
                            }}
                          >
                            新增{config.label}
                          </Button>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-text-tertiary" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-text-tertiary" />
                          )}
                        </div>
                      </button>
                    </CardHeader>
                    {isExpanded && (
                      <CardContent>
                        {items.length === 0 ? (
                          <div className="py-8 text-center text-text-tertiary text-sm">
                            暂无{config.label}资料配置，点击上方按钮添加
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {items.map((item, index) => (
                              <div
                                key={item.itemId}
                                draggable
                                onDragStart={() => handleDragStart(type, index)}
                                onDragOver={(e) => handleDragOver(e, type, index)}
                                onDragLeave={handleDragLeave}
                                onDrop={() => handleDrop(type, index)}
                                className={cn(
                                  'flex items-center gap-3 px-4 py-3 rounded-lg border transition-all',
                                  'hover:bg-gray-50 cursor-move',
                                  dragOverItem?.type === type && dragOverItem?.index === index
                                    ? 'border-medical-primary bg-medical-primary-light/30'
                                    : 'border-border-light',
                                  draggedItem?.type === type && draggedItem?.index === index
                                    ? 'opacity-50'
                                    : ''
                                )}
                              >
                                <div className="text-text-tertiary hover:text-text-secondary transition-colors">
                                  <GripVertical className="w-5 h-5" />
                                </div>
                                <div className={cn('w-7 h-7 rounded flex items-center justify-center flex-shrink-0', config.bgColor)}>
                                  <Icon className={cn('w-4 h-4', config.color)} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-text-primary">{item.itemName}</span>
                                    {item.isRequired ? (
                                      <Tag variant="danger">
                                        <Star className="w-3 h-3 mr-0.5 fill-current" />
                                        必归
                                      </Tag>
                                    ) : (
                                      <Tag variant="default">
                                        <StarOff className="w-3 h-3 mr-0.5" />
                                        可选
                                      </Tag>
                                    )}
                                  </div>
                                  {item.description && (
                                    <div className="text-xs text-text-tertiary mt-1">{item.description}</div>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleEditItem(item, type)}
                                    className="p-2 rounded-lg text-text-tertiary hover:text-medical-primary hover:bg-medical-primary-light/50 transition-colors"
                                    title="编辑"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteItem(item.itemId)}
                                    className="p-2 rounded-lg text-text-tertiary hover:text-medical-danger hover:bg-medical-danger-light/50 transition-colors"
                                    title="删除"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? '编辑归档项目' : '新增归档项目'}
        width={480}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setIsModalOpen(false);
                setEditingItem(null);
              }}
            >
              取消
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveItem}
              leftIcon={<Check className="w-4 h-4" />}
              disabled={!formData.itemName.trim()}
            >
              保存
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">项目类型</label>
            <Select
              options={typeOptions}
              value={editingGroupType}
              onChange={(v) => setEditingGroupType(v as ItemType)}
              size="md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">项目名称</label>
            <Input
              placeholder="请输入归档项目名称"
              value={formData.itemName}
              onChange={(e) => setFormData((prev) => ({ ...prev, itemName: e.target.value }))}
              size="md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">项目描述</label>
            <textarea
              placeholder="请输入归档项目的说明描述（选填）"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-lg border border-border-default px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-medical-primary/30 focus:border-medical-primary resize-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, isRequired: !prev.isRequired }))}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all',
                formData.isRequired
                  ? 'border-medical-danger bg-medical-danger-light/30 text-medical-danger'
                  : 'border-border-default bg-background-card text-text-secondary hover:border-gray-400'
              )}
            >
              {formData.isRequired ? (
                <Star className="w-4 h-4 fill-current" />
              ) : (
                <StarOff className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {formData.isRequired ? '必归项目' : '可选项目'}
              </span>
            </button>
            <span className="text-xs text-text-tertiary">
              {formData.isRequired ? '归档时必须上传此资料' : '归档时可选择性上传'}
            </span>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
