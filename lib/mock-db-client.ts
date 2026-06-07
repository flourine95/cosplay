/* eslint-disable no-console */
import fs from "fs"
import path from "path"
import bcrypt from "bcryptjs"
import { products as catalogProducts } from "./products"

const DB_FILE = path.join(process.cwd(), "prisma", "mock_db.json")

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RecordType = Record<string, any>

interface MockData {
  user: RecordType[]
  session: RecordType[]
  category: RecordType[]
  product: RecordType[]
  productVariant: RecordType[]
  rentalItem: RecordType[]
  measurement: RecordType[]
  review: RecordType[]
  order: RecordType[]
  orderItem: RecordType[]
  payment: RecordType[]
  systemSetting: RecordType[]
  systemFee: RecordType[]
  passwordReset: RecordType[]
  cartItem: RecordType[]
}

const emptyData: MockData = {
  user: [],
  session: [],
  category: [],
  product: [],
  productVariant: [],
  rentalItem: [],
  measurement: [],
  review: [],
  order: [],
  orderItem: [],
  payment: [],
  systemSetting: [],
  systemFee: [],
  passwordReset: [],
  cartItem: [],
}

function readDb(): MockData {
  if (!fs.existsSync(DB_FILE)) {
    writeDb(emptyData)
    return emptyData
  }
  try {
    const content = fs.readFileSync(DB_FILE, "utf-8")
    const parsed = JSON.parse(content)
    return { ...emptyData, ...parsed }
  } catch (e) {
    console.error("Error reading mock DB:", e)
    return emptyData
  }
}

function writeDb(data: MockData) {
  try {
    const dir = path.dirname(DB_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8")
  } catch (e) {
    console.error("Error writing mock DB:", e)
  }
}

// Check and seed mock database
export async function seedMockDb() {
  const data = readDb()
  let modified = false

  if (data.user.length === 0) {
    console.log("Seeding mock database...")
    const adminHash = await bcrypt.hash("Admin@123456", 12)
    const sellerHash = await bcrypt.hash("Seller@123456", 12)
    const customerHash = await bcrypt.hash("Customer@123456", 12)

    data.user = [
      {
        id: 1,
        email: "admin@cosplay.vn",
        password: adminHash,
        name: "Admin",
        phone: "0901234567",
        role: "ADMIN",
        status: "ACTIVE",
        emailVerified: true,
        savedAddresses: "[]",
      },
      {
        id: 2,
        email: "seller@cosplay.vn",
        password: sellerHash,
        name: "Cosplay Shop Premium",
        phone: "0912345678",
        role: "SELLER",
        status: "ACTIVE",
        emailVerified: true,
        savedAddresses: "[]",
      },
      {
        id: 3,
        email: "customer@cosplay.vn",
        password: customerHash,
        name: "Nguyễn Văn B",
        phone: "0923456789",
        role: "CUSTOMER",
        status: "ACTIVE",
        emailVerified: true,
        savedAddresses: JSON.stringify([
          {
            id: "addr_1",
            name: "Nhà riêng",
            phone: "0923456789",
            address: "123 Nguyễn Huệ",
            city: "Hồ Chí Minh",
            district: "Quận 1",
            ward: "Phường Bến Nghé",
            isDefault: true,
          },
        ]),
      },
    ]

    data.category = [
      { id: 1, name: "Anime & Manga", slug: "anime-manga", order: 1 },
      { id: 2, name: "Game", slug: "game", order: 2 },
      { id: 3, name: "Movie & TV", slug: "movie-tv", order: 3 },
      {
        id: 4,
        name: "Original Character",
        slug: "original-character",
        order: 4,
      },
      { id: 5, name: "Phụ kiện", slug: "phu-kien", order: 5 },
    ]

    // Map all products from the catalog
    data.product = catalogProducts.map((p, idx) => ({
      id: idx + 10,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      comparePrice: p.originalPrice,
      categoryId:
        p.category === "Anime"
          ? 1
          : p.category === "Game"
            ? 2
            : p.category === "Phim & Series"
              ? 3
              : p.category === "Fantasy & Original"
                ? 4
                : 5,
      sellerId: 2, // All default to the main Cosplay Shop Premium
      status: "ACTIVE",
      rating: p.rating,
      reviewCount: p.reviewCount,
    }))

    // Generate variants for each product based on their sizes
    const variants: RecordType[] = []
    let variantId = 20
    catalogProducts.forEach((p, idx) => {
      const productId = idx + 10
      p.sizes.forEach((size, sizeIdx) => {
        variants.push({
          id: variantId++,
          productId,
          name: `Size ${size}`,
          sku: `COS-${p.slug.toUpperCase()}-${size}`,
          price: p.price,
          stock: 15,
          attributes: { size },
          isDefault: sizeIdx === 0,
        })
      })
    })
    data.productVariant = variants

    modified = true
  }

  if (modified) {
    writeDb(data)
    console.log("Mock database seeded successfully.")
  }
}

// Query helper functions
function filterItems(
  items: RecordType[],
  where: RecordType | undefined
): RecordType[] {
  if (!where) return items
  return items.filter((item) => {
    for (const key in where) {
      const condition = where[key]
      if (condition === undefined) continue

      if (condition !== null && typeof condition === "object") {
        // Complex filters
        if ("in" in condition && Array.isArray(condition.in)) {
          const itemValStr = String(item[key])
          const inListStr = condition.in.map(String)
          if (!inListStr.includes(itemValStr)) return false
        } else if ("equals" in condition) {
          let itemVal = item[key]
          let condVal = condition.equals
          if (typeof itemVal === "number" && typeof condVal === "string") {
            const parsed = Number(condVal)
            if (!isNaN(parsed)) condVal = parsed
          } else if (
            typeof itemVal === "string" &&
            typeof condVal === "number"
          ) {
            const parsed = Number(itemVal)
            if (!isNaN(parsed)) itemVal = parsed
          }
          if (itemVal !== condVal) return false
        } else if ("not" in condition) {
          let itemVal = item[key]
          let condVal = condition.not
          if (typeof itemVal === "number" && typeof condVal === "string") {
            const parsed = Number(condVal)
            if (!isNaN(parsed)) condVal = parsed
          } else if (
            typeof itemVal === "string" &&
            typeof condVal === "number"
          ) {
            const parsed = Number(itemVal)
            if (!isNaN(parsed)) itemVal = parsed
          }
          if (itemVal === condVal) return false
        } else if ("contains" in condition) {
          if (
            !String(item[key])
              .toLowerCase()
              .includes(String(condition.contains).toLowerCase())
          )
            return false
        } else {
          // Nested object matches (e.g. relations or complex conditions)
          if (JSON.stringify(item[key]) !== JSON.stringify(condition))
            return false
        }
      } else {
        // Direct matches
        let itemVal = item[key]
        let condVal = condition
        if (typeof itemVal === "number" && typeof condVal === "string") {
          const parsed = Number(condVal)
          if (!isNaN(parsed)) condVal = parsed
        } else if (typeof itemVal === "string" && typeof condVal === "number") {
          const parsed = Number(itemVal)
          if (!isNaN(parsed)) itemVal = parsed
        }
        if (itemVal !== condVal) return false
      }
    }
    return true
  })
}

function parseDates(item: RecordType): RecordType {
  const result = { ...item }
  for (const key in result) {
    if (key.endsWith("At") && typeof result[key] === "string") {
      result[key] = new Date(result[key])
    }
  }
  return result
}

function handleIncludes(
  item: RecordType,
  include: RecordType | undefined,
  db: MockData
): RecordType {
  if (!include) return parseDates(item)
  const result = { ...item }

  for (const key in include) {
    if (!include[key]) continue

    if (key === "user" && item.userId !== undefined) {
      result.user = db.user.find((u) => u.id === item.userId)
    }
    if (key === "seller" && item.sellerId !== undefined) {
      result.seller = db.user.find((u) => u.id === item.sellerId)
    }
    if (key === "product" && item.productId !== undefined) {
      result.product = db.product.find((p) => p.id === item.productId)
    }
    if (key === "variant" && item.variantId !== undefined) {
      result.variant = db.productVariant.find((v) => v.id === item.variantId)
    }
    if (key === "items" && item.id !== undefined) {
      result.items = db.orderItem.filter((oi) => oi.orderId === item.id)
    }
    if (key === "payments" && item.id !== undefined) {
      result.payments = db.payment.filter((p) => p.orderId === item.id)
    }
  }

  return parseDates(result)
}

// Mock implementation of prisma collections
class MockCollection {
  private tableName: keyof MockData

  constructor(tableName: keyof MockData) {
    this.tableName = tableName
  }

  async findUnique(args: { where: RecordType; include?: RecordType }) {
    const db = readDb()
    const list = db[this.tableName]
    const filtered = filterItems(list, args.where)
    const [item] = filtered
    return item ? handleIncludes(item, args.include, db) : null
  }

  async findFirst(args: { where?: RecordType; include?: RecordType }) {
    const db = readDb()
    const list = db[this.tableName]
    const filtered = filterItems(list, args?.where)
    const [item] = filtered
    return item ? handleIncludes(item, args?.include, db) : null
  }

  async findMany(args?: {
    where?: RecordType
    include?: RecordType
    take?: number
    orderBy?: Record<string, unknown>
  }) {
    const db = readDb()
    let list = [...db[this.tableName]]
    if (args?.where) {
      list = filterItems(list, args.where)
    }

    // Sort logic (very basic, default desc by id / createdAt)
    if (args?.orderBy) {
      const orderKeys = Object.keys(args.orderBy)
      if (orderKeys.length > 0) {
        const key = orderKeys[0]!
        const direction = args.orderBy[key]
        list.sort((a, b) => {
          if (a[key] < b[key]) return direction === "asc" ? -1 : 1
          if (a[key] > b[key]) return direction === "asc" ? 1 : -1
          return 0
        })
      }
    }

    if (args?.take !== undefined) {
      list = list.slice(0, args.take)
    }

    return list.map((item) => handleIncludes(item, args?.include, db))
  }

  async count(args?: { where?: RecordType }) {
    const db = readDb()
    const list = db[this.tableName]
    return filterItems(list, args?.where).length
  }

  async create(args: { data: RecordType; include?: RecordType }) {
    const db = readDb()
    const list = db[this.tableName]

    const newRecord = { ...args.data }

    if (newRecord.id === undefined) {
      const maxId = list.reduce(
        (max, item) =>
          typeof item.id === "number" && item.id > max ? item.id : max,
        0
      )
      newRecord.id =
        typeof maxId === "number" ? maxId + 1 : Date.now().toString()
    }

    newRecord.createdAt = new Date().toISOString()
    newRecord.updatedAt = new Date().toISOString()

    list.push(newRecord)
    writeDb(db)

    return handleIncludes(newRecord, args.include, db)
  }

  async createMany(args: { data: RecordType[] }) {
    const db = readDb()
    const list = db[this.tableName]

    let count = 0
    for (const item of args.data) {
      const newRecord = { ...item }
      if (newRecord.id === undefined) {
        const maxId = list.reduce(
          (max, item) =>
            typeof item.id === "number" && item.id > max ? item.id : max,
          0
        )
        newRecord.id =
          typeof maxId === "number" ? maxId + 1 : Date.now().toString()
      }
      newRecord.createdAt = new Date().toISOString()
      newRecord.updatedAt = new Date().toISOString()
      list.push(newRecord)
      count++
    }

    writeDb(db)
    return { count }
  }

  async update(args: {
    where: RecordType
    data: RecordType
    include?: RecordType
  }) {
    const db = readDb()
    const list = db[this.tableName]
    const index = list.findIndex((item) => {
      for (const key in args.where) {
        if (item[key] !== args.where[key]) return false
      }
      return true
    })

    if (index === -1) {
      throw new Error(`Record to update not found in table ${this.tableName}`)
    }

    const updated = {
      ...list[index],
      ...args.data,
      updatedAt: new Date().toISOString(),
    }
    list[index] = updated
    writeDb(db)

    return handleIncludes(updated, args.include, db)
  }

  async updateMany(args: { where?: RecordType; data: RecordType }) {
    const db = readDb()
    const list = db[this.tableName]
    let count = 0

    list.forEach((item, index) => {
      let matches = true
      if (args.where) {
        for (const key in args.where) {
          if (item[key] !== args.where[key]) {
            matches = false
            break
          }
        }
      }
      if (matches) {
        list[index] = {
          ...item,
          ...args.data,
          updatedAt: new Date().toISOString(),
        }
        count++
      }
    })

    writeDb(db)
    return { count }
  }

  async delete(args: { where: RecordType }) {
    const db = readDb()
    const list = db[this.tableName]
    const index = list.findIndex((item) => {
      for (const key in args.where) {
        if (item[key] !== args.where[key]) return false
      }
      return true
    })

    if (index === -1) {
      throw new Error(`Record to delete not found in table ${this.tableName}`)
    }

    const deleted = list.splice(index, 1)[0]!
    writeDb(db)
    return deleted
  }

  async deleteMany(args?: { where?: RecordType }) {
    const db = readDb()
    const list = db[this.tableName]
    const initialLen = list.length

    if (args?.where) {
      db[this.tableName] = list.filter((item) => {
        for (const key in args.where) {
          if (item[key] === args.where[key]) return false
        }
        return true
      })
    } else {
      db[this.tableName] = []
    }

    writeDb(db)
    return { count: initialLen - db[this.tableName].length }
  }

  async upsert(args: {
    where: RecordType
    update: RecordType
    create: RecordType
  }) {
    try {
      const record = await this.findUnique({ where: args.where })
      if (record) {
        return await this.update({ where: args.where, data: args.update })
      } else {
        return await this.create({ data: args.create })
      }
    } catch {
      return await this.create({ data: args.create })
    }
  }
}

const collections: Record<string, MockCollection> = {}
const tableNames: (keyof MockData)[] = [
  "user",
  "session",
  "category",
  "product",
  "productVariant",
  "rentalItem",
  "measurement",
  "review",
  "order",
  "orderItem",
  "payment",
  "systemSetting",
  "systemFee",
  "passwordReset",
  "cartItem",
]

tableNames.forEach((name) => {
  collections[name] = new MockCollection(name)
})

export const mockPrisma = new Proxy(
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $transaction: async (arg: any) => {
      if (Array.isArray(arg)) {
        const results = []
        for (const promise of arg) {
          results.push(await promise)
        }
        return results
      } else if (typeof arg === "function") {
        return await arg(mockPrisma)
      }
    },
    $disconnect: async () => {},
  },
  {
    get(target, prop) {
      if (prop in target) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (target as any)[prop]
      }
      const propStr = prop as string
      if (tableNames.includes(propStr as keyof MockData)) {
        return collections[propStr]
      }
      return undefined
    },
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) as any
