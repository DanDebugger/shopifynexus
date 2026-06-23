import mysql from 'mysql2/promise';

async function main() {
  try {
    const conn = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: 'rootpassword',
      database: 'nexuslab_app',
      port: 3307
    });
    console.log("Connected!");
    const [rows] = await conn.query('SELECT 1');
    console.log(rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
main();
