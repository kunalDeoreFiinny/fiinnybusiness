# KrishiDukan — AI Project Specification

> **Read this entire file before writing a single line of code.**
> This is a single Next.js application. Everything — public storefront, retailer dashboard, manufacturer dashboard — runs from one `npm run dev`. There is no separate frontend and backend folder. There are no separate servers to start.

---

## Project Overview

KrishiDukan is an agri-commerce platform that connects farmers (customers) with retailers and manufacturers/dealers of agricultural products. Farmers can browse products and find which offline stores have them in stock — no login needed. Retailers and manufacturers get their own protected dashboards to manage products, staff, orders, and inventory.

### Core Principle

One codebase. One command. Three experiences.

```
npm run dev   →   http://localhost:3000
```

- Farmer visits `localhost:3000` → sees storefront, browses products, finds stores
- Retailer visits `localhost:3000/login` → logs in → lands on `localhost:3000/dashboard/retailer`
- Manufacturer visits `localhost:3000/login` → logs in → lands on `localhost:3000/dashboard/manufacturer`

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14+ (App Router) | File-based routing, server components, API routes, middleware — all in one |
| Auth | NextAuth.js v5 (Auth.js) | Session + role management, works with credentials login |
| Database ORM | Prisma | Type-safe DB access, single schema file shared by all features |
| Database | PostgreSQL (dev: SQLite via `prisma/dev.db`) | Relational — products, stores, users, orders |
| Styling | Tailwind CSS | No CSS conflicts between team members |
| State | Zustand | Lightweight global state (cart, session info) |
| Language | TypeScript (strict mode) | Catch role/type bugs at compile time |
| Package manager | npm | Keep it simple |

---

## Roles

There are exactly three roles in the system. No others.

```ts
type Role = 'customer' | 'retailer' | 'manufacturer'
```

- **customer** — a farmer or buyer. Can browse the site without any account. If they create an account it is always role: customer.
- **retailer** — a shop owner. Must log in. Gets access to `/dashboard/retailer/*` only.
- **manufacturer** — a product maker or dealer. Must log in. Gets access to `/dashboard/manufacturer/*` only.

A user can only have one role. Role is stored in the DB and embedded in the session token.

---

## Folder Structure

Reproduce this structure exactly. Do not rename folders. Do not add extra nesting.

```
krishidukan/
│
├── app/                              ← All Next.js routes live here
│   │
│   ├── page.tsx                      ← Home / landing page (PUBLIC)
│   ├── layout.tsx                    ← Root layout — wraps everything
│   │
│   ├── products/
│   │   ├── page.tsx                  ← Browse all products (PUBLIC)
│   │   └── [slug]/
│   │       └── page.tsx              ← Product detail page (PUBLIC)
│   │
│   ├── stores/
│   │   └── page.tsx                  ← Find stores with stock near you (PUBLIC)
│   │
│   ├── login/
│   │   └── page.tsx                  ← Login page — single page, role-select dropdown
│   │
│   ├── dashboard/                    ← PROTECTED — middleware guards all of this
│   │   │
│   │   ├── retailer/                 ← Only role: retailer can enter
│   │   │   ├── layout.tsx            ← Retailer sidebar/nav layout
│   │   │   ├── page.tsx              ← Retailer overview dashboard
│   │   │   ├── products/
│   │   │   │   ├── page.tsx          ← List retailer's own products/stock
│   │   │   │   └── [id]/page.tsx     ← Edit stock levels for one product
│   │   │   ├── staff/
│   │   │   │   └── page.tsx          ← Manage staff list
│   │   │   └── orders/
│   │   │       └── page.tsx          ← Incoming orders
│   │   │
│   │   └── manufacturer/             ← Only role: manufacturer can enter
│   │       ├── layout.tsx            ← Manufacturer sidebar/nav layout
│   │       ├── page.tsx              ← Manufacturer overview dashboard
│   │       ├── products/
│   │       │   ├── page.tsx          ← Manage product catalog
│   │       │   └── new/page.tsx      ← Add new product
│   │       ├── dealers/
│   │       │   └── page.tsx          ← Manage authorized dealer/retailer list
│   │       └── analytics/
│   │           └── page.tsx          ← Sales and distribution analytics
│   │
│   └── api/                          ← Backend API routes (Next.js Route Handlers)
│       ├── auth/
│       │   └── [...nextauth]/route.ts  ← NextAuth handler — DO NOT rename
│       ├── products/
│       │   └── route.ts              ← GET (public list), POST (manufacturer only)
│       ├── products/[id]/
│       │   └── route.ts              ← GET, PUT, DELETE
│       ├── stores/
│       │   └── route.ts              ← GET stores + stock levels
│       └── orders/
│           └── route.ts              ← GET, POST orders
│
├── components/
│   ├── ui/                           ← Primitive UI: Button, Input, Card, Badge, Modal
│   ├── layouts/
│   │   ├── PublicLayout.tsx          ← Header + footer for public pages
│   │   └── DashboardLayout.tsx       ← Sidebar + topbar for dashboard pages
│   └── shared/                       ← Reusable domain components
│       ├── ProductCard.tsx
│       ├── StoreMap.tsx
│       └── StockBadge.tsx
│
├── lib/
│   ├── auth.ts                       ← NextAuth config (providers, callbacks, role in token)
│   ├── db.ts                         ← Prisma client singleton
│   └── utils.ts                      ← Shared helpers (formatPrice, slugify, etc.)
│
├── types/
│   ├── index.ts                      ← Re-exports everything
│   ├── user.ts                       ← User, Role, Session types
│   └── product.ts                    ← Product, Store, Order types
│
├── hooks/
│   ├── useAuth.ts                    ← Returns session + role, redirects if needed
│   └── useProducts.ts                ← SWR/React Query wrapper for product API
│
├── store/
│   └── index.ts                      ← Zustand store: cart state, UI state
│
├── prisma/
│   ├── schema.prisma                 ← Single source of truth for DB schema
│   └── seed.ts                       ← Seed script for dev data
│
├── public/
│   └── images/                       ← Static images, logo, icons
│
├── styles/
│   └── globals.css                   ← Tailwind base + any global overrides
│
├── middleware.ts                     ← ROOT LEVEL — guards /dashboard/* routes
├── next.config.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── .env.local                        ← Never commit this
└── .env.example                      ← Commit this (no real secrets)
```

---

## The Most Important File — `middleware.ts`

This is what makes role-based routing work without multiple servers.
Place it at the project root (same level as `package.json`), not inside `app/`.

```ts
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const { pathname } = req.nextUrl

  // Any /dashboard/* route requires a valid session
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      // Not logged in — send to login
      return NextResponse.redirect(new URL('/login', req.url))
    }

    const role = token.role as string

    // Retailer trying to access manufacturer area — redirect to their own dashboard
    if (pathname.startsWith('/dashboard/manufacturer') && role !== 'manufacturer') {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url))
    }

    // Manufacturer trying to access retailer area — redirect to their own dashboard
    if (pathname.startsWith('/dashboard/retailer') && role !== 'retailer') {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url))
    }
  }

  return NextResponse.next()
}

// Only run middleware on dashboard routes — not on public pages, API routes, or static files
export const config = {
  matcher: ['/dashboard/:path*'],
}
```

---

## Auth Setup — `lib/auth.ts`

```ts
// lib/auth.ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './db'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user) return null

        const passwordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!passwordValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,   // 'retailer' | 'manufacturer' | 'customer'
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Embed role into JWT on first sign-in
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      // Expose role in session object so client components can read it
      if (token) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',   // Use our custom login page, not NextAuth default
  },
})
```

---

## Database Schema — `prisma/schema.prisma`

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  customer
  retailer
  manufacturer
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(customer)
  phone     String?
  address   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  store     Store?           // Only if role = retailer
  products  Product[]        // Products created by manufacturer
  orders    Order[]          @relation("CustomerOrders")
  staffOf   StoreStaff[]
}

model Product {
  id           String   @id @default(cuid())
  name         String
  slug         String   @unique
  description  String?
  price        Float
  unit         String   // e.g. "per kg", "per bag", "per litre"
  category     String
  imageUrl     String?
  manufacturer User     @relation(fields: [manufacturerId], references: [id])
  manufacturerId String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  storeStock   StoreStock[]
  orderItems   OrderItem[]
}

model Store {
  id        String   @id @default(cuid())
  name      String
  address   String
  city      String
  state     String
  pincode   String
  lat       Float?
  lng       Float?
  phone     String?
  owner     User     @relation(fields: [ownerId], references: [id])
  ownerId   String   @unique
  createdAt DateTime @default(now())

  stock     StoreStock[]
  staff     StoreStaff[]
  orders    Order[]
}

model StoreStock {
  id        String  @id @default(cuid())
  store     Store   @relation(fields: [storeId], references: [id])
  storeId   String
  product   Product @relation(fields: [productId], references: [id])
  productId String
  quantity  Int     @default(0)
  inStock   Boolean @default(false)
  updatedAt DateTime @updatedAt

  @@unique([storeId, productId])
}

model StoreStaff {
  id      String @id @default(cuid())
  store   Store  @relation(fields: [storeId], references: [id])
  storeId String
  user    User   @relation(fields: [userId], references: [id])
  userId  String
  role    String @default("staff") // "staff" | "manager"
  
  @@unique([storeId, userId])
}

model Order {
  id         String      @id @default(cuid())
  customer   User        @relation("CustomerOrders", fields: [customerId], references: [id])
  customerId String
  store      Store       @relation(fields: [storeId], references: [id])
  storeId    String
  status     String      @default("pending") // pending | confirmed | ready | completed
  total      Float
  createdAt  DateTime    @default(now())

  items      OrderItem[]
}

model OrderItem {
  id        String  @id @default(cuid())
  order     Order   @relation(fields: [orderId], references: [id])
  orderId   String
  product   Product @relation(fields: [productId], references: [id])
  productId String
  quantity  Int
  price     Float   // Price at time of order
}
```

---

## Login Page — `app/login/page.tsx`

The login page has a role selector. After successful login, redirect to the correct dashboard based on the role in the session.

```tsx
// app/login/page.tsx
'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }

    // Fetch session to read role, then redirect
    const session = await fetch('/api/auth/session').then(r => r.json())
    const role = session?.user?.role

    if (role === 'retailer') router.push('/dashboard/retailer')
    else if (role === 'manufacturer') router.push('/dashboard/manufacturer')
    else router.push('/') // customer — goes to public home
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">KrishiDukan Login</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-6 text-center">
          Farmers can browse without logging in.
          <a href="/" className="text-green-600 ml-1">Go to store →</a>
        </p>
      </div>
    </div>
  )
}
```

---

## Environment Variables — `.env.local`

```bash
# Database
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/krishidukan"
# For local dev without Postgres, use SQLite:
# DATABASE_URL="file:./dev.db"   (also change provider in schema.prisma to "sqlite")

# NextAuth — generate secret with: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

Create a `.env.example` with the same keys but empty values. Commit only `.env.example`.

---

## Team Member Ownership

Each member owns specific folders. **No one edits another member's dashboard folder without a PR.**

### Member A — Public storefront + API routes
- `app/page.tsx`
- `app/products/`
- `app/stores/`
- `app/login/`
- `app/api/` (all API routes)
- `components/layouts/PublicLayout.tsx`
- `components/shared/ProductCard.tsx`, `StoreMap.tsx`, `StockBadge.tsx`

### Member B — Retailer dashboard
- `app/dashboard/retailer/` (all files inside)
- `components/layouts/DashboardLayout.tsx` (shared with Member C — coordinate on this one file)
- Retailer-specific UI components under `components/shared/`

### Member C — Manufacturer dashboard + database
- `app/dashboard/manufacturer/` (all files inside)
- `prisma/schema.prisma` — single owner, others must request changes via PR
- `prisma/seed.ts`
- `lib/db.ts`

### Everyone shares (always PR before merging)
- `components/ui/` — primitive UI components
- `types/` — TypeScript type definitions
- `lib/auth.ts`, `lib/utils.ts`
- `hooks/`
- `store/`

---

## Getting Started (Run Once)

```bash
# 1. Clone and install
git clone <repo-url>
cd krishidukan
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL and NEXTAUTH_SECRET

# 3. Set up database
npx prisma generate
npx prisma db push          # Creates tables
npx prisma db seed          # Loads test data (retailer + manufacturer accounts)

# 4. Run
npm run dev
```

Open `http://localhost:3000` — done. No other terminals needed.

---

## Seed Data (Test Accounts)

After `npx prisma db seed`, the following accounts exist:

| Role | Email | Password |
|---|---|---|
| Retailer | retailer@test.com | test1234 |
| Manufacturer | manufacturer@test.com | test1234 |
| Customer | customer@test.com | test1234 |

---

## API Route Conventions

All API routes live under `app/api/`. They use Next.js Route Handlers.

```
GET    /api/products          → list products (public)
POST   /api/products          → create product (manufacturer only)
GET    /api/products/[id]     → single product (public)
PUT    /api/products/[id]     → update product (manufacturer only)
DELETE /api/products/[id]     → delete product (manufacturer only)

GET    /api/stores             → list stores + stock (public)
GET    /api/stores/[id]        → single store detail (public)

GET    /api/orders             → list orders (role-filtered in handler)
POST   /api/orders             → create order (customer)
PUT    /api/orders/[id]        → update status (retailer)
```

API routes must check the session and role internally. Do not trust the frontend to enforce access.

```ts
// Example: POST /api/products — manufacturer only
import { auth } from '@/lib/auth'

export async function POST(req: Request) {
  const session = await auth()

  if (!session || session.user.role !== 'manufacturer') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  // ... handle request
}
```

---

## What Farmers See (No Login)

The public-facing storefront must work with zero authentication. A farmer should be able to:

1. Land on `localhost:3000` and see featured products
2. Browse all products at `/products`
3. Click a product and see details, price, unit, and manufacturer info
4. See which stores near them have the product in stock at `/stores`
5. Get the store address, phone number, and directions

This is the primary user journey. Build it first.

---

## Common Mistakes to Avoid

- **Do not create a separate `backend/` or `server/` folder.** All backend logic goes in `app/api/`.
- **Do not run `npm run dev` from inside a subfolder.** Always run from the project root.
- **Do not hardcode roles as strings in 10 places.** Define `type Role = 'customer' | 'retailer' | 'manufacturer'` in `types/user.ts` and import it everywhere.
- **Do not skip role checks in API routes.** Middleware protects pages, not API routes. API routes must check `session.user.role` themselves.
- **Do not put secrets in `.env.example` or commit `.env.local`.**
- **Do not create a separate login page for retailers and manufacturers.** There is one login page at `/login` with a single form. The redirect after login is what separates them.
- **Do not store the role in localStorage or a cookie you set yourself.** NextAuth handles the session. Read the role from `session.user.role`.

---

## Quick Reference — Role to Route Mapping

| Who visits | URL | Login required | What they see |
|---|---|---|---|
| Farmer / customer | `/` | No | Home / landing |
| Farmer / customer | `/products` | No | Browse catalog |
| Farmer / customer | `/products/[slug]` | No | Product detail |
| Farmer / customer | `/stores` | No | Find nearby stock |
| Anyone | `/login` | No | Login form |
| Retailer | `/dashboard/retailer` | Yes (role: retailer) | Retailer overview |
| Retailer | `/dashboard/retailer/products` | Yes | Manage stock |
| Retailer | `/dashboard/retailer/staff` | Yes | Manage staff |
| Retailer | `/dashboard/retailer/orders` | Yes | Incoming orders |
| Manufacturer | `/dashboard/manufacturer` | Yes (role: manufacturer) | Manufacturer overview |
| Manufacturer | `/dashboard/manufacturer/products` | Yes | Manage catalog |
| Manufacturer | `/dashboard/manufacturer/dealers` | Yes | Manage dealers |
| Manufacturer | `/dashboard/manufacturer/analytics` | Yes | Analytics |

---

*Last updated: May 2026 — KrishiDukan v1*
