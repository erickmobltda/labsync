import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../db'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const JWT_EXPIRES_IN = '30d'

function makeToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

router.post('/register', async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' })
    return
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' })
    return
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists' })
    return
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12)
    const user = db
      .prepare('INSERT INTO users (email, password_hash) VALUES (?, ?) RETURNING id, email, created_at')
      .get(email, passwordHash) as { id: string; email: string; created_at: string }

    const token = makeToken(user.id, user.email)
    res.status(201).json({ token, user: { id: user.id, email: user.email, created_at: user.created_at } })
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create account' })
  }
})

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' })
    return
  }

  const user = db
    .prepare('SELECT id, email, password_hash, created_at FROM users WHERE email = ?')
    .get(email) as { id: string; email: string; password_hash: string; created_at: string } | undefined

  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }

  const token = makeToken(user.id, user.email)
  res.json({ token, user: { id: user.id, email: user.email, created_at: user.created_at } })
})

router.get('/me', (req: Request, res: Response) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Not authenticated' })
    return
  }

  try {
    const token = header.slice(7)
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }
    const user = db
      .prepare('SELECT id, email, created_at FROM users WHERE id = ?')
      .get(payload.userId) as { id: string; email: string; created_at: string } | undefined

    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    res.json({ user })
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
})

export default router
