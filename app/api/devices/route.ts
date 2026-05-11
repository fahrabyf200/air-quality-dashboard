import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Ambil semua perangkat milik user saat ini, ATAU milik owner yang mengundangnya (sharing)
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session as any).id;
  const userEmail = (session as any).email;

  // Cari owner_id dari share
  const [shares]: any = await db.query(
    'SELECT owner_id FROM device_shares WHERE member_email = ?',
    [userEmail]
  );

  const userIds = [userId];
  if (shares && shares.length > 0) {
    shares.forEach((s: any) => {
      if (!userIds.includes(s.owner_id)) {
        userIds.push(s.owner_id);
      }
    });
  }

  const placeholders = userIds.map(() => '?').join(',');
  const [rows] = await db.query(
    `SELECT * FROM user_devices WHERE user_id IN (${placeholders}) ORDER BY created_at DESC`,
    userIds
  );
  return NextResponse.json({ devices: rows });
}

// POST - Daftarkan/Hubungkan alat baru
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = (session as any).id;

    const { device_id, device_name } = await req.json();
    if (!device_id || device_id.trim() === '') {
      return NextResponse.json({ error: 'Device ID wajib diisi' }, { status: 400 });
    }
    if (!device_name || device_name.trim() === '') {
      return NextResponse.json({ error: 'Nama Perangkat wajib diisi' }, { status: 400 });
    }

    const cleanDeviceId = device_id.trim();
    const cleanDeviceName = device_name.trim();

    // Pastikan device_id belum dipakai oleh user lain (opsional, tapi bagus untuk validasi)
    const [existing]: any = await db.query(
      'SELECT ud.*, u.name as user_name FROM user_devices ud JOIN users u ON ud.user_id = u.id WHERE ud.device_id = ? AND ud.user_id != ?',
      [cleanDeviceId, userId]
    );

    if (existing && existing.length > 0) {
      return NextResponse.json({ 
        error: `Sensor ini sudah digunakan oleh pengguna lain (${existing[0].user_name})` 
      }, { status: 400 });
    }

    // Daftarkan alat ke user_devices
    await db.query(
      'INSERT INTO user_devices (user_id, device_id, device_name) VALUES (?, ?, ?)',
      [userId, cleanDeviceId, cleanDeviceName]
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
