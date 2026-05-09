import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import db from '../db'
import { requireAuth } from '../middleware/auth'

const router = Router()

router.use(requireAuth)

router.get('/', (req: Request, res: Response) => {
  const rows = db
    .prepare('SELECT * FROM medicines WHERE user_id = ? ORDER BY start_date DESC')
    .all(req.auth!.userId)

  // SQLite stores booleans as 0/1 — convert for JSON consumers
  const normalized = (rows as any[]).map(r => ({
    ...r,
    prescription_required: r.prescription_required === 1,
  }))

  res.json(normalized)
})

router.get('/:id', (req: Request, res: Response) => {
  const row = db
    .prepare('SELECT * FROM medicines WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.auth!.userId) as any

  if (!row) {
    res.status(404).json({ error: 'Medicine not found' })
    return
  }
  res.json({ ...row, prescription_required: row.prescription_required === 1 })
})

router.post('/', (req: Request, res: Response) => {
  const {
    name, start_date, end_date, pills_per_dose, times_per_day,
    prescription_required, bought_on, pills_bought, schedule, notes,
  } = req.body

  if (!name || !start_date) {
    res.status(400).json({ error: 'name and start_date are required' })
    return
  }

  const row = db
    .prepare(`
      INSERT INTO medicines
        (id, user_id, name, start_date, end_date, pills_per_dose, times_per_day,
         prescription_required, bought_on, pills_bought, schedule, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `)
    .get(
      uuidv4(), req.auth!.userId,
      name, start_date, end_date ?? null,
      pills_per_dose ?? 1, times_per_day ?? 1,
      prescription_required ? 1 : 0,
      bought_on ?? null, pills_bought ?? null, schedule ?? null, notes ?? null
    ) as any

  res.status(201).json({ ...row, prescription_required: row.prescription_required === 1 })
})

router.put('/:id', (req: Request, res: Response) => {
  const {
    name, start_date, end_date, pills_per_dose, times_per_day,
    prescription_required, bought_on, pills_bought, schedule, notes,
  } = req.body

  const existing = db
    .prepare('SELECT id FROM medicines WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.auth!.userId)

  if (!existing) {
    res.status(404).json({ error: 'Medicine not found' })
    return
  }

  const row = db
    .prepare(`
      UPDATE medicines SET
        name = ?, start_date = ?, end_date = ?, pills_per_dose = ?, times_per_day = ?,
        prescription_required = ?, bought_on = ?, pills_bought = ?, schedule = ?, notes = ?
      WHERE id = ? AND user_id = ?
      RETURNING *
    `)
    .get(
      name, start_date, end_date ?? null,
      pills_per_dose ?? 1, times_per_day ?? 1,
      prescription_required ? 1 : 0,
      bought_on ?? null, pills_bought ?? null, schedule ?? null, notes ?? null,
      req.params.id, req.auth!.userId
    ) as any

  res.json({ ...row, prescription_required: row.prescription_required === 1 })
})

router.delete('/:id', (req: Request, res: Response) => {
  const result = db
    .prepare('DELETE FROM medicines WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.auth!.userId)

  if (result.changes === 0) {
    res.status(404).json({ error: 'Medicine not found' })
    return
  }
  res.json({ success: true })
})

export default router
