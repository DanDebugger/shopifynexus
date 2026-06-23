# Shopify Nexus: Architecture & Decisions

## 1. Store Concept
**NexusLab** is a specialized Shopify storefront focused on pre-built PC bundles designed for gaming, school, streaming, video editing, and everyday work. Inspired by brands like NZXT, NexusLab builds and sells its own branded, ready-to-go systems rather than offering a granular "pick-your-own-parts" custom builder. The brand focuses on delivering high-performance, plug-and-play hardware with a premium, data-driven shopping experience.

## 2. App Idea
The **NexusLab Shopify App** serves two major functions:
1. **Pre-Built Inventory & Workflow Tracker:** A workflow management system for staff to track the assembly, testing, and QA status of NexusLab's own branded PC bundles before they ship to customers.
2. **Sales Ranker & Leaderboard:** A dynamic analytics engine that tracks product performance (units sold, revenue, views) and automatically ranks products into tiers (S, A, B, C). This leaderboard is injected directly into the Shopify Admin Dashboard and can be exposed on the Storefront via Theme App Extensions to drive customer FOMO and highlight trending products.

## 3. Key Architecture & Schema Decisions
- **Stack:** Built on **Remix + React + Vite** using the official `@shopify/shopify-app-remix` package. This provides seamless SSR, highly optimized routing, and deep integration with Shopify Admin UI (Polaris).
- **Database:** **Drizzle ORM** with **MySQL2**. Drizzle was chosen over Prisma for its zero-overhead, SQL-like query builder and superior type inference.
- **Data Model:**
  - `productsTable` stores core Shopify data (`shopifyProductId`, `title`, `price`).
  - `salesDataTable` isolates rapidly changing metrics (`unitsSold`, `revenue`, `rankScore`). Separating these prevents locking the main product table during high-frequency metric updates.
  - `customerBuildTable` & `buildTemplateTable` handle the custom PC workflow.
- **Scoring System:** The `rankScore` is calculated using a weighted formula: `(Units * 10) + (Revenue / 100) + (Views * 0.1)`. This normalizes cheap high-volume items against expensive low-volume items (like GPUs).
- **Batch Processing:** Instead of recalculating the leaderboard on every page load, `calculateRankings()` is designed to run periodically or after a simulated batch update.

## 4. Tradeoffs
- **Simulation vs. Real-Time Webhooks:** Implementing the `orders/create` webhook requires strict "Protected Customer Data" scopes from Shopify. To maintain development velocity, we built a "Simulate Sale" UI tool. This trades immediate real-world tracking for a frictionless development experience until the app clears Shopify's compliance checks.
- **Local SQLite vs Hosted MySQL:** We configured Drizzle for a local MySQL container (`nexuslab_app`) to replicate a production database environment rather than relying on a flat SQLite file. This adds slight setup overhead but guarantees data integrity and connection pooling under load.
- **Admin GraphQL vs Storefront API:** We used the Admin GraphQL API to sync products because it bypasses channel availability constraints. However, it requires offline access tokens, making the initial sync slightly heavier than a public Storefront query.

## 5. What I'd Improve With More Time
1. **Live Webhook Integration:** Once Shopify grants the Customer Data scopes, I would fully implement the `orders/create` and `checkouts/create` webhooks to process sales metrics passively in the background.
2. **Time-Decayed Scoring (Trending Algorithm):** The current algorithm ranks all-time sales. I would implement a time-decay factor (e.g., heavily weighting sales from the last 7 days) to create a true "Trending Now" leaderboard rather than a static "All Time Bestsellers" list.
3. **Redis Caching:** For the Theme App Extension (Storefront), hitting the MySQL database on every customer page load isn't scalable. I would implement Redis to cache the top 10 leaderboard and invalidate it only when rankings actually shift.
4. **Automated Promos:** If an "S-Tier" product drops to "B-Tier", the app should automatically trigger a Shopify Discount Code and notify the admin to run a promotion..
