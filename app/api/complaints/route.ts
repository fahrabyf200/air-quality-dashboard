import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

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

  await db.query('UPDATE complaints SET status = ? WHERE id = ?', [status, id]);
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

  await db.query('DELETE FROM complaints WHERE id = ?', [id]);
  return NextResponse.json({ message: 'Pengaduan dihapus' });
}
