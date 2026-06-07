import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { sendInvitationEmail } from '../../../lib/mailer';

export const dynamic = 'force-dynamic';

// GET - Ambil semua orang yang diundang oleh user saat ini beserta detail sensornya
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session as any).id;

  const [rows] = await db.query(
    `SELECT ds.id, ds.member_email, ds.device_id, ds.created_at, u.name as member_name, ud.device_name 
     FROM device_shares ds 
     LEFT JOIN users u ON ds.member_email = u.email 
     LEFT JOIN user_devices ud ON ds.device_id = ud.device_id AND ud.user_id = ds.owner_id
     WHERE ds.owner_id = ? 
     ORDER BY ds.created_at DESC`,
    [userId]
  );

  return NextResponse.json({ shares: rows });
}

// POST - Undang orang baru berdasarkan email dan pilih sensor
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = (session as any).id;

    // Pastikan user adalah admin atau premium active
    const [userRows]: any = await db.query(
      'SELECT role, subscription_status, subscription_end_date FROM users WHERE id = ?',
      [userId]
    );
    const user = userRows[0];
    const isPremium = user && (
      user.role === 'admin' || 
      (user.subscription_status === 'active' && (!user.subscription_end_date || new Date(user.subscription_end_date) > new Date()))
    );

    if (!isPremium) {
      return NextResponse.json({ error: 'Hanya pengguna Premium Active yang dapat mengundang/membagi akses alat' }, { status: 403 });
    }

    const { email, device_id } = await req.json();
    if (!email || email.trim() === '') {
      return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 });
    }
    if (!device_id || device_id.trim() === '') {
      return NextResponse.json({ error: 'Harap pilih sensor untuk pegawai ini' }, { status: 400 });
    }

    const targetEmail = email.trim().toLowerCase();
    const targetDeviceId = device_id.trim();

    if (targetEmail === (session as any).email.toLowerCase()) {
      return NextResponse.json({ error: 'Anda tidak bisa mengundang email Anda sendiri' }, { status: 400 });
    }

    // Insert ke device_shares
    await db.query(
      'INSERT INTO device_shares (owner_id, member_email, device_id) VALUES (?, ?, ?)',
      [userId, targetEmail, targetDeviceId]
    );

    // Kirim notifikasi ke user target jika dia sudah terdaftar
    const [targetUser]: any = await db.query('SELECT id FROM users WHERE email = ?', [targetEmail]);
    if (targetUser && targetUser.length > 0) {
      await db.query(
        `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
        [
          targetUser[0].id,
          'Undangan Akses Alat',
          `Anda telah diundang oleh ${ (session as any).name || 'Pemilik Alat' } untuk memantau kualitas udara dari perangkat mereka.`,
          'info'
        ]
      );
    }

    // Kirim email undangan
    try {
      await sendInvitationEmail({
        toEmail: targetEmail,
        ownerName: (session as any).name || 'Pemilik Alat',
        ownerEmail: (session as any).email,
      });
    } catch (emailErr) {
      // Gagal kirim email tidak membatalkan undangan — hanya log warning
      console.warn('[SkyWatch] Gagal kirim email undangan:', emailErr);
    }

    return NextResponse.json({ message: 'Undangan berhasil dikirim! Email telah dikirim ke ' + targetEmail }, { status: 201 });
  } catch (e: any) {
    if (e.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Pegawai dengan email ini sudah ditugaskan ke sensor tersebut' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Gagal mengirim undangan: ' + e.message }, { status: 500 });
  }
}

// DELETE - Revoke/hapus undangan
export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = (session as any).id;

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 });

    await db.query(
      'DELETE FROM device_shares WHERE id = ? AND owner_id = ?',
      [id, userId]
    );

    return NextResponse.json({ message: 'Undangan/Akses berhasil dicabut.' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
