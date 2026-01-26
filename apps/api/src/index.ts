import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { auth } from './lib/auth'

const app = new Hono()

app.use('*', cors())
app.use('*', logger())

app.get('/health', c => c.json({ status: 'ok' }))

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app
