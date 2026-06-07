import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

// Fungsi untuk menerima data dari ESP32
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📥 MASUK SENSOR DATA DARI ALAT:", body);
    
    const { co2, nh3, voc, temp, hum, isUnhealthy, dominant, device_id } = body;

    let savedCount = 0;

    // Ambil threshold global dari database
    const defaultThresholds = { co2: 250, nh3: 30, voc: 70, temp: 32, hum: 80 };
    let T = defaultThresholds;
    try {
      const [settingsRows]: any = await db.query(
        'SELECT setting_value FROM global_settings WHERE setting_key = ?',
        ['thresholds']
      );
      if (settingsRows && settingsRows.length > 0) {
        let parsed = settingsRows[0].setting_value;
        if (typeof parsed === 'string') {
          parsed = JSON.parse(parsed);
        }
        T = parsed;
      }
    } catch (err) {
      console.error("Gagal mengambil threshold:", err);
    }
    const isDanger = !!(isUnhealthy || co2 > T.co2 || nh3 > T.nh3 || voc > T.voc || temp > T.temp);

    // Helper untuk memproses notifikasi
    const handleNotificationForUser = async (uid: number) => {
      if (!uid) return;
      try {
        const [lastReadingRows]: any = await db.execute(
          `SELECT co2, nh3, voc, temp, is_unhealthy FROM sensor_data 
           WHERE user_id = ? 
           ORDER BY created_at DESC LIMIT 1`,
          [uid]
        );

        const wasDangerBefore = lastReadingRows && lastReadingRows.length > 0 && 
          (lastReadingRows[0].is_unhealthy === 1 || 
           lastReadingRows[0].co2 > T.co2 || 
           lastReadingRows[0].nh3 > T.nh3 || 
           lastReadingRows[0].voc > T.voc || 
           lastReadingRows[0].temp > T.temp);

        const [userRows]: any = await db.execute(
          'SELECT phone, name FROM users WHERE id = ?',
          [uid]
        );
        const userPhone = userRows && userRows.length > 0 ? userRows[0].phone : null;
        const userName = userRows && userRows.length > 0 ? userRows[0].name : '';

        if (isDanger && !wasDangerBefore) {
          const dangerLabels: string[] = [];
          if (co2 > T.co2) dangerLabels.push('CO2');
          if (nh3 > T.nh3) dangerLabels.push('NH3');
          if (voc > T.voc) dangerLabels.push('VOC');
          if (temp > T.temp) dangerLabels.push('TEMP');
          if (dangerLabels.length === 0) dangerLabels.push('Kualitas Udara');

          await db.execute(
            `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
            [
              uid,
              '🚨 ALARM BAHAYA: Udara Tidak Sehat!',
              `Mendeteksi level kritis pada: ${dangerLabels.join(', ')}. Kadar parameter melebihi ambang batas aman. Segera lakukan tindakan pengamanan.`,
              'danger'
            ]
          );

          if (userPhone) {
            const waMessage = `🚨 *ALARM BAHAYA SKYWATCH* 🚨\n\nHalo *${userName}*,\n\nSensor mendeteksi level kritis kualitas udara pada dapur/area Anda!\n\n⚠️ *Parameter Kritis:* ${dangerLabels.join(', ')}\n\n*Detail Sensor:*\n🔹 CO₂: ${co2.toFixed(0)} PPM (Batas: ${T.co2} PPM)\n🔹 NH₃: ${nh3.toFixed(2)} PPM (Batas: ${T.nh3} PPM)\n🔹 VOC: ${(voc || 0).toFixed(2)} PPM (Batas: ${T.voc} PPM)\n🔹 Suhu: ${temp?.toFixed(1)}°C (Batas: ${T.temp}°C)\n🔹 Kelembapan: ${hum?.toFixed(0)}%\n\n📢 *Tindakan:* Segera matikan kompor, buka jendela/sirkulasi udara, atau evakuasi area jika diperlukan.`;
            sendWhatsAppMessage(userPhone, waMessage).catch(err => {
              console.error("Gagal mengirim WhatsApp alert:", err);
            });
          }
        } else if (!isDanger && wasDangerBefore) {
          await db.execute(
            `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
            [
              uid,
              '✅ Kondisi Normal: Udara Aman',
              `Kualitas udara di dapur Anda sudah kembali normal di bawah ambang batas bahaya.`,
              'info'
            ]
          );

          if (userPhone) {
            const waMessage = `✅ *KONDISI NORMAL (SKYWATCH)* ✅\n\nHalo *${userName}*,\n\nKabar baik! Kualitas udara di area dapur Anda sudah kembali normal di bawah ambang batas bahaya.\n\n*Kondisi Terkini:*\n🔹 CO₂: ${co2.toFixed(0)} PPM\n🔹 NH₃: ${nh3.toFixed(2)} PPM\n🔹 VOC: ${(voc || 0).toFixed(2)} PPM\n🔹 Suhu: ${temp?.toFixed(1)}°C\n🔹 Kelembapan: ${hum?.toFixed(0)}%\n\nTerima kasih tetap menjaga keamanan sirkulasi udara Anda.`;
            sendWhatsAppMessage(userPhone, waMessage).catch(err => {
              console.error("Gagal mengirim WhatsApp info:", err);
            });
          }
        }
      } catch (err) {
        console.error("Gagal memproses notifikasi:", err);
      }
    };

    // Langkah 1: Coba cari berdasarkan device_id jika dikirim
    if (device_id && device_id.trim() !== '') {
      const cleanId = device_id.trim();

      // Cari di user_devices (Model Multi-Device baru)
      const [devs]: any = await db.execute(
        'SELECT user_id FROM user_devices WHERE device_id = ?',
        [cleanId]
      );

      const targetUserIds: number[] = [];
      if (devs && devs.length > 0) {
        devs.forEach((d: any) => {
          if (!targetUserIds.includes(d.user_id)) {
            targetUserIds.push(d.user_id);
          }
        });
      }

      // Fallback ke users (Model Legacy satu user satu device_id)
      const [legacyUsers]: any = await db.execute(
        'SELECT id FROM users WHERE device_id = ?',
        [cleanId]
      );
      if (legacyUsers && legacyUsers.length > 0) {
        legacyUsers.forEach((u: any) => {
          if (!targetUserIds.includes(u.id)) {
            targetUserIds.push(u.id);
          }
        });
      }

      // Distribusikan data sensor ke semua user_id terkait
      if (targetUserIds.length > 0) {
        for (const uid of targetUserIds) {
          await handleNotificationForUser(uid);
          await db.execute(
            `INSERT INTO sensor_data 
             (co2, nh3, voc, temp, hum, is_unhealthy, dominant_pollutant, user_id, device_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [co2, nh3, voc, temp, hum, isDanger ? 1 : 0, dominant || 'CO2', uid, cleanId]
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
          await handleNotificationForUser(u.id);
          await db.execute(
            `INSERT INTO sensor_data 
             (co2, nh3, voc, temp, hum, is_unhealthy, dominant_pollutant, user_id, device_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [co2, nh3, voc, temp, hum, isDanger ? 1 : 0, dominant || 'CO2', u.id, device_id || null]
          );
          savedCount++;
        }
      } else {
        // Fallback jika database benar-benar kosong dari user
        await db.execute(
          `INSERT INTO sensor_data 
           (co2, nh3, voc, temp, hum, is_unhealthy, dominant_pollutant, user_id, device_id) 
           VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?)`,
          [co2, nh3, voc, temp, hum, isDanger ? 1 : 0, dominant || 'CO2', device_id || null]
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
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filterDeviceId = searchParams.get('device_id');
    const session = await getSession();
    const limitParam = searchParams.get('limit');
    const limitQuery = limitParam === 'all' ? 'LIMIT 10000' : `LIMIT ${parseInt(limitParam as string) || 20}`;

    // Jika user sedang login, ambil data sensor yang terikat pada user tersebut
    if (session && (session as any).id) {
      // 1. Ambil device_id yang dimiliki sendiri
      const [owned]: any = await db.query(
        'SELECT device_id FROM user_devices WHERE user_id = ?',
        [(session as any).id]
      );

      // 2. Ambil device_id yang di-share ke user ini (pegawai)
      const [shares]: any = await db.query(
        'SELECT owner_id, device_id FROM device_shares WHERE member_email = ?',
        [(session as any).email]
      );

      let allowedDeviceIds: string[] = owned.map((d: any) => d.device_id);

      if (shares && shares.length > 0) {
        for (const share of shares) {
          if (share.device_id) {
            allowedDeviceIds.push(share.device_id);
          } else {
            // Jika share legacy (NULL), dapatkan semua device milik owner
            const [ownerDevs]: any = await db.query(
              'SELECT device_id FROM user_devices WHERE user_id = ?',
              [share.owner_id]
            );
            ownerDevs.forEach((d: any) => allowedDeviceIds.push(d.device_id));
          }
        }
      }

      // Filter yang unik dan hilangkan string kosong
      allowedDeviceIds = Array.from(new Set(allowedDeviceIds)).filter(id => id && id.trim() !== '');

      // Jika user belum punya alat sama sekali, berikan data sensor terakhir sebagai fallback/demo onboarding
      if (allowedDeviceIds.length === 0) {
        const [fallbackRows] = await db.execute(
          `SELECT * FROM sensor_data ORDER BY created_at DESC ${limitQuery}`
        );
        return NextResponse.json(fallbackRows);
      }

      let rows: any = [];
      const placeholders = allowedDeviceIds.map(() => '?').join(',');

      if (filterDeviceId && filterDeviceId !== 'all' && filterDeviceId.trim() !== '') {
        const cleanFilterId = filterDeviceId.trim();
        // Pastikan device_id tersebut ada di daftar yang diizinkan
        if (allowedDeviceIds.includes(cleanFilterId)) {
          [rows] = await db.execute(
            `SELECT * FROM sensor_data 
             WHERE device_id = ? 
             ORDER BY created_at DESC ${limitQuery}`,
            [cleanFilterId]
          );
        } else {
          rows = []; // Tidak diizinkan
        }
      } else {
        // Ambil data dari semua sensor yang diizinkan
        [rows] = await db.execute(
          `SELECT * FROM sensor_data 
           WHERE device_id IN (${placeholders}) 
           ORDER BY created_at DESC ${limitQuery}`,
          allowedDeviceIds
        );
      }

      return NextResponse.json(rows);
    }

    // Jika tidak sedang login, kembalikan data global terakhir
    const [rows] = await db.execute(`SELECT * FROM sensor_data ORDER BY created_at DESC ${limitQuery}`);
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("❌ GET SENSOR ERROR:", error.message);
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  }
}