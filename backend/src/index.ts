import 'dotenv/config'

import cors from 'cors'
import express from 'express'

const app = express()
const port = Number(process.env.PORT ?? 3001)
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173'

app.use(cors({ origin: frontendOrigin }))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`)
})
