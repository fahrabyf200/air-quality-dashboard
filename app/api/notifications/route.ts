import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - ambil notifikasi milik user
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session as any).id;

  const [rows] = await db.query(
    `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30`,
    [userId]
  );

  const [unread]: any = await db.query(
    `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0`,
    [userId]
  );

  return NextResponse.json({ notifications: rows, unread_count: unread[0]?.count ?? 0 });
}

// PATCH - tandai semua notifikasi sebagai dibaca
export async function PATCH() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session as any).id;

  await db.query(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`, [userId]);
  return NextResponse.json({ message: 'Semua notifikasi ditandai dibaca' });
}
