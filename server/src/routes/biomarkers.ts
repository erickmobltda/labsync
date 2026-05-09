import { Router, Request, Response } from 'express'
import db from '../db'
import { requireAuth } from '../middleware/auth'

const router = Router()

router.use(requireAuth)

router.get('/', (req: Request, res: Response) => {
  const { startDate, endDate, category } = req.query
  const userId = req.auth!.userId

  const conditions: string[] = ['b.user_id = ?']
  const params: (string | null)[] = [userId]

  if (startDate) {
    conditions.push('lr.report_date >= ?')
    params.push(startDate as string)
  }
  if (endDate) {
    conditions.push('lr.report_date <= ?')
    params.push(endDate as string)
  }
  if (category && category !== 'All') {
    conditions.push('b.category = ?')
    params.push(category as string)
  }

  const where = conditions.join(' AND ')

  const rows = db
    .prepare(`
      SELECT b.*, lr.report_date
      FROM biomarkers b
      INNER JOIN lab_reports lr ON b.report_id = lr.id
      WHERE ${where}
      ORDER BY b.created_at ASC
    `)
    .all(...params)

  res.json(rows)
})

export default router
