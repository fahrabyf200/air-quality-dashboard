import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Ambil semua perangkat milik user saat ini, ATAU yang ditugaskan kepada mereka
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session as any).id;
  const userEmail = (session as any).email;

  // 1. Ambil perangkat yang dimiliki sendiri
  const [ownedDevices]: any = await db.query(
    'SELECT * FROM user_devices WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );

  // 2. Ambil perangkat yang di-share ke user (berdasarkan email)
  const [shares]: any = await db.query(
    'SELECT owner_id, device_id FROM device_shares WHERE member_email = ?',
    [userEmail]
  );

  let sharedDevices: any[] = [];
  if (shares && shares.length > 0) {
    for (const share of shares) {
      if (share.device_id) {
        const [devs]: any = await db.query(
          'SELECT * FROM user_devices WHERE user_id = ? AND device_id = ?',
          [share.owner_id, share.device_id]
        );
        sharedDevices = [...sharedDevices, ...devs];
      } else {
        // Fallback untuk share lama tanpa spesifik device_id (semua device owner)
        const [devs]: any = await db.query(
          'SELECT * FROM user_devices WHERE user_id = ?',
          [share.owner_id]
        );
        sharedDevices = [...sharedDevices, ...devs];
      }
    }
  }

  // Gabungkan dan hilangkan duplikasi berdasarkan device_id
  const combined = [...ownedDevices, ...sharedDevices];
  const uniqueDevices = combined.filter((v, i, a) => a.findIndex(t => t.device_id === v.device_id) === i);

  return NextResponse.json({ devices: uniqueDevices });
}

// POST - Daftarkan/Hubungkan alat baru
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = (session as any).id;

    const { device_id, device_name, device_type } = await req.json();
    if (!device_id || device_id.trim() === '') {
      return NextResponse.json({ error: 'Device ID wajib diisi' }, { status: 400 });
    }
    if (!device_name || device_name.trim() === '') {
      return NextResponse.json({ error: 'Nama Perangkat wajib diisi' }, { status: 400 });
    }

    const cleanDeviceId = device_id.trim();
    const cleanDeviceName = device_name.trim();

    // Pastikan device_id belum dipakai oleh user lain
    const [existing]: any = await db.query(
      'SELECT ud.*, u.name as user_name FROM user_devices ud JOIN users u ON ud.user_id = u.id WHERE ud.device_id = ? AND ud.user_id != ?',
      [cleanDeviceId, userId]
    );

    if (existing && existing.length > 0) {
      return NextResponse.json({ 
        error: `Sensor ini sudah digunakan oleh pengguna lain (${existing[0].user_name})` 
      }, { status: 400 });
    }

    // Hitung jumlah device saat ini untuk user ini
    const [countRows]: any = await db.query(
      'SELECT COUNT(*) as count FROM user_devices WHERE user_id = ?',
      [userId]
    );
    const hasDevices = countRows && countRows[0].count > 0;
    
    // Jika awal menggunakan sensor (device count === 0), otomatis gunakan 'real'.
    // Jika menambah (device count > 0), gunakan device_type yang dipilih ('real' atau 'sim').
    let finalDeviceType = 'real';
    if (hasDevices) {
      if (device_type === 'sim') {
        finalDeviceType = 'sim';
      }
    }

    // Daftarkan alat ke user_devices
    await db.query(
      'INSERT INTO user_devices (user_id, device_id, device_name, device_type) VALUES (?, ?, ?, ?)',
      [userId, cleanDeviceId, cleanDeviceName, finalDeviceType]
    );

    // Update juga kolom device_id di tabel users (untuk backward compatibility)
    await db.query(
      'UPDATE users SET device_id = ? WHERE id = ?',
      [cleanDeviceId, userId]
    );

    return NextResponse.json({ message: 'Sensor baru berhasil dipasangkan!' }, { status: 201 });
  } catch (e: any) {
    if (e.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Sensor dengan ID ini sudah terdaftar di akun Anda.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Gagal memasangkan sensor: ' + e.message }, { status: 500 });
  }
}


// DELETE - Putuskan/hapus hubungan alat
export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = (session as any).id;

    const { id, device_id } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 });

    await db.query(
      'DELETE FROM user_devices WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    // Jika yang dihapus adalah sensor utama, kosongkan device_id di tabel users
    const [remaining]: any = await db.query('SELECT device_id FROM user_devices WHERE user_id = ? LIMIT 1', [userId]);
    const nextDeviceId = remaining && remaining.length > 0 ? remaining[0].device_id : null;
    await db.query('UPDATE users SET device_id = ? WHERE id = ?', [nextDeviceId, userId]);

    return NextResponse.json({ message: 'Hubungan sensor berhasil diputuskan.' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
