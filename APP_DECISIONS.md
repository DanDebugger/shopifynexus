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
- **Build Queue & Workflow UI:** 
  - **Kanban Board:** The workflow tracker was built as a horizontal Kanban board using Polaris `Card` components within a custom flex layout for a premium, Trello-like experience.
  - **Automated Webhooks:** `orders/paid` webhooks are caught to automatically inject new orders into the queue, but this is filtered via an `appSettingsTable` to ensure only specific "trigger" products create a build job.
  - **Manual Fallback:** A manual order lookup search bar was added to the UI using the Admin GraphQL API. To maintain velocity and avoid requiring `read_customers` scopes from Shopify, the customer lookup was intentionally omitted from this search query since `customerId` is an optional field in our local database.
- **Scoring System:** The `rankScore` is calculated using a weighted formula: `(Units * 10) + (Revenue / 100) + (Views * 0.1)`. This normalizes cheap high-volume items against expensive low-volume items (like GPUs).
- **Real-Time Recalculation:** Leaderboard rankings are automatically updated in real-time within the webhook flow whenever a new paid order triggers the `webhooks.orders.paid` endpoint.

## 4. Tradeoffs
- **Real-Time Webhooks:** Implementing the `orders/paid` webhook enables real-time sales tracking, build job triggers, and automatic ranking recalculations, ensuring accurate, live data without relying on a simulation tool.
- **Embedded Shopify App vs. Standalone Admin Portal:** The application is built as an embedded Shopify App, relying on Shopify Admin credentials for staff/owner access. While this provides a native dashboard experience, it means the merchant cannot delegate app management (like the Kanban build queue) to clients or external operators without granting them access to their Shopify Admin. A standalone administration panel with independent authentication was traded off for development speed.
- **Local SQLite vs Hosted MySQL:** We configured Drizzle for a local MySQL container (`nexuslab_app`) to replicate a production database environment rather than relying on a flat SQLite file. This adds slight setup overhead but guarantees data integrity and connection pooling under load.
- **Admin GraphQL vs Storefront API:** We used the Admin GraphQL API to sync products because it bypasses channel availability constraints. However, it requires offline access tokens, making the initial sync slightly heavier than a public Storefront query.

## 5. What I'd Improve With More Time
1. **Standalone Admin Dashboard with Custom Auth:** Build an external web portal/admin panel with custom login (e.g., JWT-based or email/password authentication) for clients, staff, and owners. This would allow them to manage the PC build queue and view leaderboards without requiring direct access to the Shopify Admin dashboard.
2. **Checkout Webhook Integration:** We could integrate `checkouts/create` webhooks to track abandoned checkouts or conversion rates for each PC bundle.
3. **Time-Decayed Scoring (Trending Algorithm):** The current algorithm ranks all-time sales. I would implement a time-decay factor (e.g., heavily weighting sales from the last 7 days) to create a true "Trending Now" leaderboard rather than a static "All Time Bestsellers" list.
4. **Redis Caching:** For the Theme App Extension (Storefront), hitting the MySQL database on every customer page load isn't scalable. I would implement Redis to cache the top 10 leaderboard and invalidate it only when rankings actually shift.
5. **Automated Promos:** If an "S-Tier" product drops to "B-Tier", the app should automatically trigger a Shopify Discount Code and notify the admin to run a promotion.
