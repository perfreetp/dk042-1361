import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProcedureTemplate, RequiredItem, ItemType } from '../types';
import { generateProcedureTemplates } from '../data/mockData';

interface ProcedureState {
  templates: ProcedureTemplate[];
  selectedTemplateId: string | null;
  loading: boolean;
  error: string | null;
  fetchTemplates: () => Promise<void>;
  selectTemplate: (id: string | null) => void;
  getTemplateById: (id: string) => ProcedureTemplate | undefined;
  addTemplate: (template: ProcedureTemplate) => void;
  updateTemplate: (id: string, updates: Partial<Omit<ProcedureTemplate, 'templateId'>>) => void;
  deleteTemplate: (id: string) => void;
  addItem: (templateId: string, item: RequiredItem) => void;
  addRequiredItem: (templateId: string, item: Omit<RequiredItem, 'itemId'>) => void;
  updateItem: (templateId: string, itemId: string, updates: Partial<Omit<RequiredItem, 'itemId'>>) => void;
  updateRequiredItem: (templateId: string, itemId: string, updates: Partial<Omit<RequiredItem, 'itemId'>>) => void;
  deleteItem: (templateId: string, itemId: string) => void;
  deleteRequiredItem: (templateId: string, itemId: string) => void;
  reorderItems: (templateId: string, type: ItemType, fromIndex: number, toIndex: number) => void;
}

export const useProcedureStore = create<ProcedureState>()(
  persist(
    (set, get) => ({
      templates: [],
      selectedTemplateId: null,
      loading: false,
      error: null,

      fetchTemplates: async () => {
        set({ loading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 200));
          const persisted = get().templates;
          const data = persisted.length > 0 ? persisted : generateProcedureTemplates();
          set({ templates: data, loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '获取术式模板失败', loading: false });
        }
      },

      selectTemplate: (id) => set({ selectedTemplateId: id }),

      getTemplateById: (id) => {
        return get().templates.find((t) => t.templateId === id);
      },

      addTemplate: (template) => {
        set({ templates: [...get().templates, template] });
      },

      updateTemplate: (id, updates) => {
        set({
          templates: get().templates.map((t) =>
            t.templateId === id ? { ...t, ...updates } : t
          ),
        });
      },

      deleteTemplate: (id) => {
        set({
          templates: get().templates.filter((t) => t.templateId !== id),
          selectedTemplateId: get().selectedTemplateId === id ? null : get().selectedTemplateId,
        });
      },

      addItem: (templateId, item) => {
        set({
          templates: get().templates.map((t) =>
            t.templateId === templateId
              ? { ...t, requiredItems: [...t.requiredItems, item] }
              : t
          ),
        });
      },

      addRequiredItem: (templateId, item) => {
        const newItem: RequiredItem = {
          ...item,
          itemId: `REQ${Date.now()}`,
        };
        set({
          templates: get().templates.map((t) =>
            t.templateId === templateId
              ? { ...t, requiredItems: [...t.requiredItems, newItem] }
              : t
          ),
        });
      },

      updateItem: (templateId, itemId, updates) => {
        set({
          templates: get().templates.map((t) =>
            t.templateId === templateId
              ? {
                  ...t,
                  requiredItems: t.requiredItems.map((item) =>
                    item.itemId === itemId ? { ...item, ...updates } : item
                  ),
                }
              : t
          ),
        });
      },

      updateRequiredItem: (templateId, itemId, updates) => {
        set({
          templates: get().templates.map((t) =>
            t.templateId === templateId
              ? {
                  ...t,
                  requiredItems: t.requiredItems.map((item) =>
                    item.itemId === itemId ? { ...item, ...updates } : item
                  ),
                }
              : t
          ),
        });
      },

      deleteItem: (templateId, itemId) => {
        set({
          templates: get().templates.map((t) =>
            t.templateId === templateId
              ? { ...t, requiredItems: t.requiredItems.filter((item) => item.itemId !== itemId) }
              : t
          ),
        });
      },

      deleteRequiredItem: (templateId, itemId) => {
        set({
          templates: get().templates.map((t) =>
            t.templateId === templateId
              ? { ...t, requiredItems: t.requiredItems.filter((item) => item.itemId !== itemId) }
              : t
          ),
        });
      },

      reorderItems: (templateId, type, fromIndex, toIndex) => {
        set({
          templates: get().templates.map((t) => {
            if (t.templateId !== templateId) return t;
            const typedItems = t.requiredItems.filter((item) => item.itemType === type);
            const otherItems = t.requiredItems.filter((item) => item.itemType !== type);
            if (fromIndex < 0 || fromIndex >= typedItems.length) return t;
            if (toIndex < 0 || toIndex >= typedItems.length) return t;
            const [movedItem] = typedItems.splice(fromIndex, 1);
            typedItems.splice(toIndex, 0, movedItem);
            return { ...t, requiredItems: [...typedItems, ...otherItems] };
          }),
        });
      },
    }),
    {
      name: 'qc_procedures',
      partialize: (state) => ({
        templates: state.templates,
        selectedTemplateId: state.selectedTemplateId,
      }),
    }
  )
);
