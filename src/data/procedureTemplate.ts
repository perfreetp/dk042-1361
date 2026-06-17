import { generateProcedureTemplates } from './mockDataFactory'
import type { ProcedureTemplate, RequiredItem, ItemType } from '../types'

const rawTemplates = generateProcedureTemplates(10)

const procedureTemplates: ProcedureTemplate[] = rawTemplates.map((t) => ({
  templateId: t.id,
  procedureCode: t.code,
  procedureName: t.name,
  requiredItems: t.archiveRequirements.map((r) => ({
    itemId: r.id,
    itemName: r.name,
    itemType: r.category as ItemType,
    description: r.description || '',
    isRequired: r.required,
  })) as RequiredItem[],
}))

export default procedureTemplates
