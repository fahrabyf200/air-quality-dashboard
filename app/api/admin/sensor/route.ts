import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET all sensor data with optional user_id filter
export async function GET(req: Request) {
  const session = await getSession();
  if (!session || (session as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const url = new URL(req.url);
  const userId = url.searchParams.get('user_id');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const page = parseInt(url.searchParams.get('page') || '1');
  const offset = (page - 1) * limit;

  try {
    // Check if user_id column exists in sensor_data
    let hasUserIdCol = false;
    try {
      await db.query('SELECT user_id FROM sensor_data LIMIT 1');
      hasUserIdCol = true;
    } catch { }

    let rows: any, countRow: any, statsRow: any;

    if (hasUserIdCol && userId) {
      // Filter by specific user
      [rows] = await db.query(
        `SELECT s.*, u.name as user_name, u.email as user_email
         FROM sensor_data s
         LEFT JOIN users u ON u.id = s.user_id
         WHERE s.user_id = ?
         ORDER BY s.created_at DESC LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      ) as any;
      [[countRow]] = await db.query(
        'SELECT COUNT(*) as total FROM sensor_data WHERE user_id = ?', [userId]
      ) as any;
      [[statsRow]] = await db.query(
        `SELECT COUNT(*) as total, AVG(co2) as avg_co2, MAX(co2) as max_co2,
         AVG(nh3) as avg_nh3, MAX(nh3) as max_nh3, AVG(voc) as avg_voc, MAX(voc) as max_voc,
         AVG(temp) as avg_temp, MAX(temp) as max_temp, AVG(hum) as avg_hum,
         SUM(is_unhealthy) as danger_count
         FROM sensor_data WHERE user_id = ?`,
        [userId]
      ) as any;
    } else if (hasUserIdCol) {
      // All data with user info
      [rows] = await db.query(
        `SELECT s.*, u.name as user_name, u.email as user_email
         FROM sensor_data s
         LEFT JOIN users u ON u.id = s.user_id
         ORDER BY s.created_at DESC LIMIT ? OFFSET ?`,
        [limit, offset]
      ) as any;
      [[countRow]] = await db.query('SELECT COUNT(*) as total FROM sensor_data') as any;
      [[statsRow]] = await db.query(
        `SELECT COUNT(*) as total, AVG(co2) as avg_co2, MAX(co2) as max_co2,
         AVG(nh3) as avg_nh3, MAX(nh3) as max_nh3, AVG(voc) as avg_voc, MAX(voc) as max_voc,
         AVG(temp) as avg_temp, MAX(temp) as max_temp, AVG(hum) as avg_hum,
         SUM(is_unhealthy) as danger_count FROM sensor_data`
      ) as any;
    } else {
      // Fallback: no user_id column
      [rows] = await db.query(
        'SELECT * FROM sensor_data ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset]
      ) as any;
      [[countRow]] = await db.query('SELECT COUNT(*) as total FROM sensor_data') as any;
      [[statsRow]] = await db.query(
        `SELECT COUNT(*) as total, AVG(co2) as avg_co2, MAX(co2) as max_co2,
         AVG(nh3) as avg_nh3, MAX(nh3) as max_nh3, AVG(voc) as avg_voc, MAX(voc) as max_voc,
         AVG(temp) as avg_temp, MAX(temp) as max_temp, AVG(hum) as avg_hum,
         SUM(is_unhealthy) as danger_count FROM sensor_data`
      ) as any;
    }

    // Get user list for filter dropdown
    const [users] = await db.query(
      'SELECT id, name, email, role FROM users ORDER BY name ASC'
    );

    return NextResponse.json({
      rows,
      total: (countRow as any).total,
      stats: statsRow,
      users,
      page,
      limit,
      hasUserIdCol,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
