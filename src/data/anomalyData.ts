import { generateAnomalies, generateSurgeries, generateProcedureTemplates } from './mockDataFactory'
import type { AnomalyRecord, Surgery, ProcedureTemplate } from './mockDataFactory'

const templates: ProcedureTemplate[] = generateProcedureTemplates(10)
const surgeries: Surgery[] = generateSurgeries(50, templates)
const anomalies: AnomalyRecord[] = generateAnomalies(30, surgeries)

export default anomalies
