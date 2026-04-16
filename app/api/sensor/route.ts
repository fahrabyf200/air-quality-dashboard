import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// Fungsi untuk menerima data dari ESP32
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Ambil semua data termasuk temp dan hum
    const { co2, nh3, voc, temp, hum, isUnhealthy, dominant } = body;

    // Masukkan ke database (Pastikan kolom temp dan hum sudah ada di MySQL)
    await db.execute(
      'INSERT INTO sensor_data (co2, nh3, voc, temp, hum, is_unhealthy, dominant_pollutant) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [co2, nh3, voc, temp, hum, isUnhealthy ? 1 : 0, dominant]
    );

    return NextResponse.json({ message: "Data tersimpan" }, { status: 201 });
  } catch (error: any) {
    console.error("API ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Fungsi untuk mengambil data (dipakai oleh Dashboard)
export async function GET() {
  try {
    const [rows] = await db.execute('SELECT * FROM sensor_data ORDER BY created_at DESC LIMIT 20');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  }
}