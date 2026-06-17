import { generateSurgeries, generateProcedureTemplates } from './mockDataFactory'
import type { Surgery, ProcedureTemplate } from './mockDataFactory'

const templates: ProcedureTemplate[] = generateProcedureTemplates(10)
const surgeries: Surgery[] = generateSurgeries(50, templates)

export default surgeries
export { templates }
