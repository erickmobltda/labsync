import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { initDb } from './db'
import authRouter from './routes/auth'
import reportsRouter from './routes/reports'
import biomarkersRouter from './routes/biomarkers'
import appointmentsRouter from './routes/appointments'
import medicinesRouter from './routes/medicines'
import storageRouter from './routes/storage'
import extractRouter from './routes/extract'

const app = express()
const PORT = parseInt(process.env.PORT || '3001', 10)

// CORS — allow the frontend origin
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map(o => o.trim())

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`))
    }
  },
  credentials: true,
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/auth', authRouter)
app.use('/api/reports', reportsRouter)
app.use('/api/biomarkers', biomarkersRouter)
app.use('/api/appointments', appointmentsRouter)
app.use('/api/medicines', medicinesRouter)
app.use('/api/storage', storageRouter)
app.use('/api/functions', extractRouter)

// Init database and start
initDb()
app.listen(PORT, '0.0.0.0', () => {
  console.log(`LabSync API server running on http://0.0.0.0:${PORT}`)
})
