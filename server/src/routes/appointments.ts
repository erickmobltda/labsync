import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import db from '../db'
import { requireAuth } from '../middleware/auth'

const router = Router()

router.use(requireAuth)

router.get('/', (req: Request, res: Response) => {
  const rows = db
    .prepare(`
      SELECT * FROM appointments
      WHERE user_id = ?
      ORDER BY date DESC, CASE WHEN time IS NULL THEN 1 ELSE 0 END, time DESC
    `)
    .all(req.auth!.userId)
  res.json(rows)
})

router.get('/:id', (req: Request, res: Response) => {
  const row = db
    .prepare('SELECT * FROM appointments WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.auth!.userId)

  if (!row) {
    res.status(404).json({ error: 'Appointment not found' })
    return
  }
  res.json(row)
})

router.post('/', (req: Request, res: Response) => {
  const { type, specialty, date, time, notes } = req.body

  if (!type || !specialty || !date) {
    res.status(400).json({ error: 'type, specialty and date are required' })
    return
  }

  const row = db
    .prepare(`
      INSERT INTO appointments (id, user_id, type, specialty, date, time, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `)
    .get(uuidv4(), req.auth!.userId, type, specialty, date, time ?? null, notes ?? null)

  res.status(201).json(row)
})

router.put('/:id', (req: Request, res: Response) => {
  const { type, specialty, date, time, notes } = req.body

  const existing = db
    .prepare('SELECT id FROM appointments WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.auth!.userId)

  if (!existing) {
    res.status(404).json({ error: 'Appointment not found' })
    return
  }

  const row = db
    .prepare(`
      UPDATE appointments
      SET type = ?, specialty = ?, date = ?, time = ?, notes = ?
      WHERE id = ? AND user_id = ?
      RETURNING *
    `)
    .get(type, specialty, date, time ?? null, notes ?? null, req.params.id, req.auth!.userId)

  res.json(row)
})

router.delete('/:id', (req: Request, res: Response) => {
  const result = db
    .prepare('DELETE FROM appointments WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.auth!.userId)

  if (result.changes === 0) {
    res.status(404).json({ error: 'Appointment not found' })
    return
  }
  res.json({ success: true })
})

export default router
