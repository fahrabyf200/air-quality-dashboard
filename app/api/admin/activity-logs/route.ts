import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Auto-create activity_logs table if not exists
async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NULL,
      user_name VARCHAR(100) NULL,
      user_email VARCHAR(150) NULL,
      action VARCHAR(100) NOT NULL,
      description TEXT NULL,
      ip_address VARCHAR(60) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_created_at (created_at),
      INDEX idx_user_id (user_id),
      INDEX idx_action (action)
    )
  `);
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || (session as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await ensureTable();

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get('limit') || '200'), 500);
    const userId = searchParams.get('user_id');
    const action = searchParams.get('action');

    let query = 'SELECT * FROM activity_logs';
    const params: any[] = [];
    const conditions: string[] = [];

    if (userId) {
      conditions.push('user_id = ?');
      params.push(Number(userId));
    }
    if (action) {
      conditions.push('action = ?');
      params.push(action);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const [rows]: any = await db.query(query, params);

    // Get distinct action types for filtering
    const [actions]: any = await db.query(
      'SELECT DISTINCT action FROM activity_logs ORDER BY action'
    );

    return NextResponse.json({
      logs: rows,
      actions: actions.map((a: any) => a.action),
      total: rows.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // This endpoint can be called internally from other API routes
  // We use a shared secret or just allow it from server-side
  try {
    await ensureTable();
    const body = await req.json();
    const { user_id, user_name, user_email, action, description, ip_address } = body;

    if (!action) {
      return NextResponse.json({ error: 'action is required' }, { status: 400 });
    }

    await db.query(
      `INSERT INTO activity_logs (user_id, user_name, user_email, action, description, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id || null, user_name || null, user_email || null, action, description || null, ip_address || null]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
