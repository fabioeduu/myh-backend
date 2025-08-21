import express, { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import cors from 'cors'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'

// Tipos para produtos e pedidos
interface Product {
  id: number | string
  name: string
  price: number
  [key: string]: any
}

interface Order {
  id: number
  received: any
  createdAt: string
}

type Data = { orders: Order[] }

const app = express()
app.use(cors())
app.use(express.json())

// Carregar produtos com tratamento de erro
let products: Product[] = []
try {
  const productsPath = path.join(process.cwd(), 'products.json')
  const productsData = fs.readFileSync(productsPath, 'utf-8')
  products = JSON.parse(productsData)
} catch (err) {
  console.error('Erro ao carregar products.json:', err)
  products = []
}

// Configuração do lowdb
const dbFile = path.join(process.cwd(), 'db.json')
const adapter = new JSONFile<Data>(dbFile)
const db = new Low<Data>(adapter, { orders: [] })

async function initDb() {
  await db.read()
  db.data ||= { orders: [] }
  await db.write()
}
initDb().catch(err => {
  console.error('Erro ao inicializar o banco:', err)
})

// Rotas
app.get('/api/produtos', (req: Request, res: Response) => {
  res.json(products)
})

app.get('/api/produtos/:id', (req: Request, res: Response) => {
  const p = products.find(x => String(x.id) === String(req.params.id))
  if (!p) return res.status(404).json({ message: 'Produto não encontrado' })
  res.json(p)
})

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios' })
  }
  if (password === 'password') {
    return res.json({
      token: 'fake-jwt-token',
      user: { email, name: email.split('@')[0] }
    })
  }
  return res.status(401).json({ message: 'Credenciais inválidas' })
})

app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    await db.read()
    const id = Math.floor(Math.random() * 1000000)
    const order: Order = {
      id,
      received: req.body,
      createdAt: new Date().toISOString()
    }
    db.data!.orders.push(order)
    await db.write()
    res.status(201).json(order)
  } catch (err) {
    res.status(500).json({ message: 'Erro ao salvar pedido', error: err })
  }
})

// Rota para pedidos (opcional)
app.get('/api/orders', async (req: Request, res: Response) => {
  await db.read()
  res.json(db.data?.orders || [])
})

// Inicialização do servidor
const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log('Backend running on port', PORT))