import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'Z',
  // WAJIB UNTUK CLOUD DATABASE
  ssl: {
    rejectUnauthorized: false 
  }
};

let db: mysql.Pool;

if (process.env.NODE_ENV === 'production') {
  db = mysql.createPool(dbConfig);
} else {
  if (!(global as any).mysqlPool) {
    (global as any).mysqlPool = mysql.createPool(dbConfig);
  }
  db = (global as any).mysqlPool;
}

export { db };