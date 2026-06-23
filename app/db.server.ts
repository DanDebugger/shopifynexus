import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./drizzle/schema.server";

const poolConnection = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "rootpassword",
  database: "nexuslab_app",
  port: 3307,
});

export const db = drizzle(poolConnection, { schema, mode: "default" });
export default db;
