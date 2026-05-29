import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { notifyAdmins } from '@/lib/notifications';

export const dynamic = 'force-dynamic';
const defaultThresholds = { co2: 250, nh3: 30, voc: 70, temp: 32, hum: 80 };

// Ambil data threshold
export async function GET() {
  try {
    const [rows]: any = await db.query('SELECT setting_value FROM global_settings WHERE setting_key = ?', ['thresholds']);
    
    if (rows && rows.length > 0) {
      // Jika tipe kolom di mysql berupa JSON, mysql2 sering mengembalikan langsung object/JSON.
      let parsed = rows[0].setting_value;
      if (typeof parsed === 'string') {
         parsed = JSON.parse(parsed);
      }
      return NextResponse.json(parsed);
    }

    return NextResponse.json(defaultThresholds);
  } catch (error: any) {
    console.error("Gagal get thresholds:", error);
    return NextResponse.json(defaultThresholds);
  }
}

// Update data threshold (hanya admin)
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await req.json();
    
    // Pastikan valuenya valid JSON
    const thresholdsString = JSON.stringify(data);

    // Update atau Insert ke database
    await db.query(
      `INSERT INTO global_settings (setting_key, setting_value) VALUES ('thresholds', ?)
       ON DUPLICATE KEY UPDATE setting_value = ?`,
      [thresholdsString, thresholdsString]
    );

    // Notify admins
    const adminName = (session as any).name || 'Admin';
    await notifyAdmins(
      'Threshold Diperbarui',
      `${adminName} memperbarui pengaturan ambang batas sensor global: CO2: ${data.co2} PPM, NH3: ${data.nh3} PPM, VOC: ${data.voc} PPM, Temp: ${data.temp}°C, Hum: ${data.hum}%.`,
      'info'
    );

    return NextResponse.json({ message: 'Thresholds berhasil disimpan', thresholds: data });
  } catch (error: any) {
    console.error("Gagal update thresholds:", error);
    return NextResponse.json({ error: 'Gagal update thresholds' }, { status: 500 });
  }
}
