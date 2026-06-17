import { generateDailyStatistics, generateSurgeries, generateProcedureTemplates } from './mockDataFactory'
import type { DailyStatistic, Surgery, ProcedureTemplate } from './mockDataFactory'

const templates: ProcedureTemplate[] = generateProcedureTemplates(10)
const surgeries: Surgery[] = generateSurgeries(50, templates)
const dailyStatistics: DailyStatistic[] = generateDailyStatistics(30, surgeries)

export default dailyStatistics
