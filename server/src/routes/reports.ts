import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import db from '../db'
import { requireAuth } from '../middleware/auth'
import { deleteFile } from './storage'

const router = Router()

router.use(requireAuth)

router.get('/', (req: Request, res: Response) => {
  const reports = db
    .prepare('SELECT * FROM lab_reports WHERE user_id = ? ORDER BY report_date DESC, created_at DESC')
    .all(req.auth!.userId)
  res.json(reports)
})

router.post('/', (req: Request, res: Response) => {
  const { report_date, source_filename, raw_text, storage_path, biomarkers } = req.body

  if (!report_date) {
    res.status(400).json({ error: 'report_date is required' })
    return
  }

  const reportId = uuidv4()
  const userId = req.auth!.userId

  const insertReport = db.prepare(`
    INSERT INTO lab_reports (id, user_id, report_date, source_filename, raw_text, storage_path)
    VALUES (?, ?, ?, ?, ?, ?)
    RETURNING *
  `)

  const insertBiomarker = db.prepare(`
    INSERT INTO biomarkers
      (id, report_id, user_id, name, value, value_text, unit, reference_min, reference_max, reference_text, status, category)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  try {
    const transaction = db.transaction(() => {
      const report = insertReport.get(
        reportId, userId, report_date, source_filename ?? null, raw_text ?? null, storage_path ?? null
      )

      if (Array.isArray(biomarkers) && biomarkers.length > 0) {
        for (const b of biomarkers) {
          insertBiomarker.run(
            uuidv4(), reportId, userId,
            b.name, b.value ?? null, b.value_text ?? null, b.unit ?? null,
            b.reference_min ?? null, b.reference_max ?? null, b.reference_text ?? null,
            b.status ?? 'unknown', b.category ?? null
          )
        }
      }

      return report
    })

    const report = transaction()
    res.status(201).json(report)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create report' })
  }
})

router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const userId = req.auth!.userId

  const report = db
    .prepare('SELECT * FROM lab_reports WHERE id = ? AND user_id = ?')
    .get(id, userId) as { storage_path?: string } | undefined

  if (!report) {
    res.status(404).json({ error: 'Report not found' })
    return
  }

  db.prepare('DELETE FROM lab_reports WHERE id = ? AND user_id = ?').run(id, userId)

  if (report.storage_path) {
    deleteFile(report.storage_path).catch(() => {})
  }

  res.json({ success: true })
})

router.get('/:id/biomarkers', (req: Request, res: Response) => {
  const { id } = req.params
  const userId = req.auth!.userId

  const report = db
    .prepare('SELECT id FROM lab_reports WHERE id = ? AND user_id = ?')
    .get(id, userId)

  if (!report) {
    res.status(404).json({ error: 'Report not found' })
    return
  }

  const biomarkers = db
    .prepare('SELECT * FROM biomarkers WHERE report_id = ? ORDER BY name ASC')
    .all(id)

  res.json(biomarkers)
})

export default router
