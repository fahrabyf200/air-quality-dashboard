import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET sensor data for a specific user
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || (session as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const page = parseInt(url.searchParams.get('page') || '1');
  const offset = (page - 1) * limit;

  try {
    // Get user info
    const [userRows]: any = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]
    );
    if (!(userRows as any[]).length) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }
    const user = (userRows as any[])[0];

    // Get sensor data for this user
    const [sensorRows]: any = await db.query(
      `SELECT * FROM sensor_data WHERE user_id = ?
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [id, limit, offset]
    );

    // Get total count
    const [[countRow]]: any = await db.query(
      'SELECT COUNT(*) as total FROM sensor_data WHERE user_id = ?', [id]
    );

    // Get summary stats
    const [[stats]]: any = await db.query(
      `SELECT
        COUNT(*) as total,
        AVG(co2) as avg_co2, MAX(co2) as max_co2,
        AVG(nh3) as avg_nh3, MAX(nh3) as max_nh3,
        AVG(voc) as avg_voc, MAX(voc) as max_voc,
        AVG(temp) as avg_temp, MAX(temp) as max_temp,
        AVG(hum) as avg_hum,
        SUM(is_unhealthy) as danger_count,
        MIN(created_at) as first_record,
        MAX(created_at) as last_record
       FROM sensor_data WHERE user_id = ?`,
      [id]
    );

    return NextResponse.json({
      user,
      sensor: sensorRows,
      total: (countRow as any).total,
      stats,
      page,
      limit,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
