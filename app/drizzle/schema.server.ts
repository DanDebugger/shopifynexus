import { mysqlTable, varchar, boolean, datetime, bigint, int, text, decimal, timestamp } from "drizzle-orm/mysql-core";

export const sessionTable = mysqlTable("session", {
  id: varchar("id", { length: 255 }).primaryKey(),
  shop: varchar("shop", { length: 255 }).notNull(),
  state: varchar("state", { length: 255 }).notNull(),
  isOnline: boolean("isOnline").default(false).notNull(),
  scope: varchar("scope", { length: 1024 }),
  expires: datetime("expires"),
  accessToken: varchar("accessToken", { length: 255 }).notNull(),
  userId: bigint("userId", { mode: "number" }),
  firstName: varchar("firstName", { length: 255 }),
  lastName: varchar("lastName", { length: 255 }),
  email: varchar("email", { length: 255 }),
  accountOwner: boolean("accountOwner").default(false).notNull(),
  locale: varchar("locale", { length: 255 }),
  collaborator: boolean("collaborator").default(false),
  emailVerified: boolean("emailVerified").default(false),
});

export const buildTemplateTable = mysqlTable("buildTemplate", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  baseTierScore: int("baseTierScore").default(0),
  createdAt: datetime("createdAt"),
});

export const buildComponentTable = mysqlTable("buildComponent", {
  id: varchar("id", { length: 255 }).primaryKey(),
  templateId: varchar("templateId", { length: 255 }).notNull(),
  productId: varchar("productId", { length: 255 }).notNull(),
  partType: varchar("partType", { length: 50 }).notNull(),
  performanceScore: int("performanceScore").default(0),
});

export const customerBuildTable = mysqlTable("customerBuild", {
  id: varchar("id", { length: 255 }).primaryKey(),
  shop: varchar("shop", { length: 255 }).notNull(),
  customerId: varchar("customerId", { length: 255 }),
  templateId: varchar("templateId", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default('Pending'),
  totalScore: int("totalScore").default(0),
  createdAt: datetime("createdAt"),
  updatedAt: datetime("updatedAt"),
});

export const buildHistoryLogTable = mysqlTable("buildHistoryLog", {
  id: varchar("id", { length: 255 }).primaryKey(),
  buildId: varchar("buildId", { length: 255 }).notNull(),
  oldStatus: varchar("oldStatus", { length: 50 }),
  newStatus: varchar("newStatus", { length: 50 }).notNull(),
  message: text("message"),
  timestamp: datetime("timestamp"),
});

// Synced from Shopify
export const productsTable = mysqlTable('products', {
  id: int('id').autoincrement().primaryKey(),
  shopifyProductId: varchar('shopify_product_id', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  category: varchar('category', { length: 255 }),
  price: decimal('price', { precision: 10, scale: 2 }),
  imageUrl: varchar('image_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Sales data per product
export const salesDataTable = mysqlTable('sales_data', {
  id: int('id').autoincrement().primaryKey(),
  productId: int('product_id').notNull(),   // FK → products
  unitsSold: int('units_sold').default(0),
  revenue: decimal('revenue', { precision: 10, scale: 2 }).default('0'),
  views: int('views').default(0),
  rankScore: decimal('rank_score', { precision: 10, scale: 2 }).default('0'),
  rankPosition: int('rank_position'),        // 1-10
  rankTier: varchar('rank_tier', { length: 10 }), // S, A, B, C
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Promos created by merchant
export const promosTable = mysqlTable('promos', {
  id: int('id').autoincrement().primaryKey(),
  productId: int('product_id').notNull(),   // FK → products
  promoName: varchar('promo_name', { length: 255 }).notNull(),
  discountPercent: int('discount_percent').notNull(),
  status: varchar('status', { length: 50 }).default('active'),
  startsAt: timestamp('starts_at'),
  endsAt: timestamp('ends_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// All activity logged here
export const activityLogsTable = mysqlTable('activity_logs', {
  id: int('id').autoincrement().primaryKey(),
  action: varchar('action', { length: 255 }).notNull(),
  productId: int('product_id'),
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow(),
});
