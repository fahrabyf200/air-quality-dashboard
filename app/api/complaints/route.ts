import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { notifyAdmins } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

// GET - ambil semua complaints (admin) atau punya user sendiri
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const isAdmin = (session as any).role === 'admin';
  const userId = (session as any).id;

  const [rows] = await db.query(
    isAdmin
      ? `SELECT c.*, u.name as user_name FROM complaints c LEFT JOIN users u ON c.user_id = u.id ORDER BY c.created_at DESC`
      : `SELECT * FROM complaints WHERE user_id = ? ORDER BY created_at DESC`,
    isAdmin ? [] : [userId]
  );
  return NextResponse.json({ complaints: rows });
}

// POST - kirim pengaduan baru
export async function POST(req: Request) {
  try {
    const session = await getSession();
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    const userId = session ? (session as any).id : null;

    await db.query(
      `INSERT INTO complaints (user_id, name, email, subject, message) VALUES (?, ?, ?, ?, ?)`,
      [userId, name, email, subject, message]
    );

    // Notify admins about the new complaint
    await notifyAdmins(
      'Pengaduan Baru',
      `Ada pengaduan baru dari ${name} dengan subjek: "${subject}".`,
      'alert'
    );

    return NextResponse.json({ message: 'Pengaduan berhasil dikirim! Kami akan segera menghubungi Anda.' }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: 'Gagal mengirim pengaduan: ' + e.message }, { status: 500 });
  }
}

// PATCH - update status complaint (admin only)
export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session || (session as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id, status } = await req.json();
  if (!id || !status) return NextResponse.json({ error: 'ID dan status diperlukan' }, { status: 400 });

  const validStatuses = ['pending', 'in_progress', 'resolved'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 });
  }

  // Get complaint subject for logging
  const [compRows]: any = await db.query('SELECT subject FROM complaints WHERE id = ?', [id]);
  const compSubj = compRows?.[0]?.subject || 'Pengaduan';

  await db.query('UPDATE complaints SET status = ? WHERE id = ?', [status, id]);

  // Notify admins
  const adminName = (session as any).name || 'Admin';
  await notifyAdmins(
    'Status Pengaduan Diubah',
    `${adminName} mengubah status pengaduan "${compSubj}" menjadi "${status}".`,
    'info'
  );

  return NextResponse.json({ message: 'Status pengaduan diperbarui' });
}

// DELETE - hapus complaint (admin only)
export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || (session as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 });

  // Get complaint details before deleting
  const [compRows]: any = await db.query('SELECT name, subject FROM complaints WHERE id = ?', [id]);
  const compSubj = compRows?.[0]?.subject || 'Pengaduan';
  const compName = compRows?.[0]?.name || '';

  await db.query('DELETE FROM complaints WHERE id = ?', [id]);

  // Notify admins
  const adminName = (session as any).name || 'Admin';
  await notifyAdmins(
    'Pengaduan Dihapus',
    `${adminName} menghapus pengaduan dari "${compName}" dengan subjek: "${compSubj}".`,
    'info'
  );

  return NextResponse.json({ message: 'Pengaduan dihapus' });
}
