import { Router, Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { requireAuth } from '../middleware/auth'

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), 'data', 'uploads')

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${uuidv4()}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true)
    else cb(new Error('Only PDF files are allowed'))
  },
})

export async function deleteFile(storagePath: string): Promise<void> {
  const filePath = path.join(UPLOADS_DIR, storagePath)
  try {
    await fs.promises.unlink(filePath)
  } catch {
    // Ignore if file doesn't exist
  }
}

const router = Router()

router.post('/upload', requireAuth, upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' })
    return
  }
  const userId = req.auth!.userId
  const storagePath = `${userId}/${req.file.filename}`

  // Move to user-specific folder
  const userDir = path.join(UPLOADS_DIR, userId)
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true })
  }

  const newPath = path.join(userDir, req.file.filename)
  fs.renameSync(req.file.path, newPath)

  res.json({ path: storagePath })
})

// Accept token from Authorization header OR ?token= query param (for direct browser src= usage)
function flexAuth(req: Request, res: Response, next: () => void) {
  if (!req.headers.authorization && req.query.token) {
    req.headers.authorization = `Bearer ${req.query.token}`
  }
  requireAuth(req, res, next)
}

router.get('/file/*', flexAuth, (req: Request, res: Response) => {
  const filePath = (req.params as any)[0] as string
  const userId = req.auth!.userId

  // Security: ensure the path starts with the user's id
  if (!filePath.startsWith(userId + '/')) {
    res.status(403).json({ error: 'Access denied' })
    return
  }

  const fullPath = path.join(UPLOADS_DIR, filePath)
  if (!fs.existsSync(fullPath)) {
    res.status(404).json({ error: 'File not found' })
    return
  }

  res.sendFile(fullPath)
})

router.delete('/file/*', requireAuth, (req: Request, res: Response) => {
  const filePath = (req.params as any)[0] as string
  const userId = req.auth!.userId

  if (!filePath.startsWith(userId + '/')) {
    res.status(403).json({ error: 'Access denied' })
    return
  }

  const fullPath = path.join(UPLOADS_DIR, filePath)
  try {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath)
    }
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to delete file' })
  }
})

export default router
