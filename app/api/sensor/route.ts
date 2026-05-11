import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Fungsi untuk menerima data dari ESP32
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📥 MASUK SENSOR DATA DARI ALAT:", body);
    
    const { co2, nh3, voc, temp, hum, isUnhealthy, dominant, device_id } = body;

    let savedCount = 0;

    // Langkah 1: Coba cari berdasarkan device_id jika dikirim
    if (device_id && device_id.trim() !== '') {
      const [users]: any = await db.execute(
        'SELECT id FROM users WHERE device_id = ?',
        [device_id.trim()]
      );

      if (users && users.length > 0) {
        for (const u of users) {
          await db.execute(
            `INSERT INTO sensor_data 
             (co2, nh3, voc, temp, hum, is_unhealthy, dominant_pollutant, user_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [co2, nh3, voc, temp, hum, isUnhealthy ? 1 : 0, dominant || 'CO2', u.id]
          );
          savedCount++;
        }
      }
    }

    // Langkah 2: Jika alat tidak mengirim device_id (atau ID tidak cocok),
    // kita asumsikan ini adalah "Alat Tunggal Demo". 
    // Kita otomatis masukkan data ini ke SEMUA user terdaftar di database agar semua dashboard terisi!
    if (savedCount === 0) {
      const [allUsers]: any = await db.execute('SELECT id FROM users');
      
      if (allUsers && allUsers.length > 0) {
        for (const u of allUsers) {
          await db.execute(
            `INSERT INTO sensor_data 
             (co2, nh3, voc, temp, hum, is_unhealthy, dominant_pollutant, user_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [co2, nh3, voc, temp, hum, isUnhealthy ? 1 : 0, dominant || 'CO2', u.id]
          );
          savedCount++;
        }
      } else {
        // Fallback jika database benar-benar kosong dari user
        await db.execute(
          `INSERT INTO sensor_data 
           (co2, nh3, voc, temp, hum, is_unhealthy, dominant_pollutant, user_id) 
           VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`,
          [co2, nh3, voc, temp, hum, isUnhealthy ? 1 : 0, dominant || 'CO2']
        );
      }
    }

    console.log(`✅ BERHASIL DISTRIBUSI KE ${savedCount} USER.`);

    return NextResponse.json({ 
      message: "Data berhasil didistribusikan ke semua user", 
      saved_to_accounts_count: savedCount 
    }, { status: 201 });
  } catch (error: any) {
    console.error("❌ API ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Fungsi untuk mengambil data (dipakai oleh Dashboard)
export async function GET() {
  try {
    const session = await getSession();

    // Jika user sedang login, ambil data sensor yang terikat pada user tersebut
    if (session && (session as any).id) {
      const [rows]: any = await db.execute(
        'SELECT * FROM sensor_data WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC LIMIT 20',
        [(session as any).id]
      );

      // Jika user belum punya data terikat, berikan data sensor terakhir sebagai fallback
      if (rows.length === 0) {
        const [fallbackRows] = await db.execute(
          'SELECT * FROM sensor_data ORDER BY created_at DESC LIMIT 20'
        );
        return NextResponse.json(fallbackRows);
      }

      return NextResponse.json(rows);
    }

    // Jika tidak sedang login, kembalikan data global terakhir
    const [rows] = await db.execute('SELECT * FROM sensor_data ORDER BY created_at DESC LIMIT 20');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  }
}