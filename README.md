# NexusLab Shopify Ecosystem

Welcome to the **NexusLab** monorepo. This repository contains a deeply integrated Shopify ecosystem designed for a pre-built PC storefront. It includes a custom Shopify Theme, a Shopify Remix App for internal workflow management, and a Theme App Extension for injecting analytics directly into the storefront.

## 🚀 Tech Stack
- **Framework:** [Remix](https://remix.run/) (React 18)
- **Tooling:** Vite, TypeScript
- **Database:** MySQL 8 (Local Docker container for dev)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Shopify Integration:** `@shopify/shopify-app-remix`, App Bridge, Polaris UI
- **Extensions:** Shopify Theme App Extensions (Liquid + JS/CSS)

## 📂 Project Architecture

```text
nexus-lab/
├── app/                           # Core Remix App
│   ├── db.server.ts               # MySQL Connection Pool
│   ├── drizzle/                   # Database Schemas & Migrations
│   │   └── schema.server.ts       # Products, Sales, Builds, Templates
│   ├── routes/                    # API Routes & UI Views (Polaris)
│   │   ├── app.leaderboard.tsx    # Admin Leaderboard Dashboard
│   │   ├── app.products.tsx       # Product Sync & Sale Simulation UI
│   │   └── app.workflows.tsx      # NexusLab Pre-built Assembly Tracker
│   ├── services/                  # Business Logic
│   │   ├── rankingService.server.ts # Leaderboard ranking algorithm
│   │   └── buildScorer.server.ts    # System performance scoring
│   └── shopify.server.ts          # Shopify App Initialization
├── extensions/                    # Theme App Extensions
│   └── nexus-storefront-integration/
│       ├── blocks/                # Liquid UI blocks for storefront
│       └── assets/                # Client-side scripts & styles
├── shopifynexus/                  # Shopify OS2.0 Custom Theme
├── scripts/                       # Dev tools (DB resets, forced syncs)
├── APP_DECISIONS.md               # Engineering & Architecture Decisions
├── drizzle.config.ts              # Drizzle ORM configuration
└── docker-compose.yml             # Local MySQL database container
```

## ⚙️ Core Systems

### 1. Sales Ranker Engine
Tracks sales velocity, revenue, and views to generate a dynamic ranking tier (S, A, B, C) for every product. 
- **Decoupled Data:** Product metadata is stored in `productsTable` while volatile analytics are stored in `salesDataTable` to prevent database locking during high-frequency purchases.
- **Algorithm:** Uses a weighted formula `(Units * 10) + (Revenue / 100) + (Views * 0.1)` to assign scores.

### 2. Pre-Built Assembly Workflow Tracker
Allows store admins to track the assembly and testing of their branded PC bundles (e.g., Gaming, School, Streaming, Editing).
- Uses `buildTemplateTable` to define base configurations for their pre-built product lines.
- Uses `customerBuildTable` to track individual assembly status, testing, and performance scores before shipping to customers.

## 🛠 Local Development Setup

### 1. Start the Database
Ensure Docker is running, then spin up the MySQL container:
```bash
docker-compose up -d
```

### 2. Run Database Migrations
Push the Drizzle schema to your local MySQL instance:
```bash
npm run db:push
```

### 3. Start the Dev Server
Launch the Remix app and sync it with your Shopify Partner Dashboard:
```bash
npm run dev
```

### 4. Sync Products
To populate the database with real store products, you can run the force-sync script:
```bash
npx tsx scripts/force-sync-insert.ts
```

## 📝 Design Decisions
For a deep dive into the architectural decisions, tradeoffs, and future improvements, read [APP_DECISIONS.md](./APP_DECISIONS.md).
