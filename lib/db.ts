import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: '127.0.0.1', // Pakai angka ini, jangan tulisan 'localhost'
  user: 'root',
  password: '', 
  database: 'air_quality_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true, // Tambahkan ini agar koneksi tidak putus
  keepAliveInitialDelay: 0
});