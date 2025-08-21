import express from 'express'
import fs from 'fs'
import path from 'path'
import cors from 'cors'
import { Low, JSONFile } from 'lowdb'

const app = express()
app.use(cors())
app.use(express.json())

const products = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'products.json'), 'utf-8'))

type Data = { orders: any[] }
const file = path.join(process.cwd(), 'db.json')
const adapter = new JSONFile<Data>(file)
const db = new Low(adapter)

async function initDb(){
  await db.read()
  db.data ||= { orders: [] }
  await db.write()
}
initDb()

app.get('/api/produtos', (req, res) => res.json(products))
app.get('/api/produtos/:id', (req, res) => { const p = products.find((x:any)=>String(x.id)===String(req.params.id)); if(!p) return res.status(404).json({message:'Produto não encontrado'}); res.json(p) })

app.post('/api/auth/login', (req, res) => { const { email, password } = req.body; if(password==='password') return res.json({ token:'fake-jwt-token', user:{ email, name: email.split('@')[0] } }); return res.status(401).json({ message: 'Credenciais inválidas' }) })

app.post('/api/orders', async (req, res) => { await db.read(); const id = Math.floor(Math.random()*1000000); const order = { id, received: req.body, createdAt: new Date().toISOString() }; db.data!.orders.push(order); await db.write(); res.json(order) })

const PORT = process.env.PORT || 3001
app.listen(PORT, ()=> console.log('Backend running on port', PORT))
