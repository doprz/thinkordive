import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

const app = new Hono()

app.use('*', cors())
app.use('*', logger())

app.get('/health', c => c.json({ status: 'ok' }))

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app
