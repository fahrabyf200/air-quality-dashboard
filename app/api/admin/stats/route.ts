import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session || (session as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Count users
    const [[userStats]]: any = await db.query(
      `SELECT 
        COUNT(*) as totalUsers,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as adminCount,
        SUM(CASE WHEN role != 'admin' THEN 1 ELSE 0 END) as userCount
       FROM users`
    );

    // Count sensor data
    let totalSensor = 0;
    let todaySensor = 0;
    try {
      const [[sensorStats]]: any = await db.query(
        `SELECT 
          COUNT(*) as totalSensor,
          SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as todaySensor
         FROM sensor_data`
      );
      totalSensor = Number(sensorStats.totalSensor) || 0;
      todaySensor = Number(sensorStats.todaySensor) || 0;
    } catch { }

    return NextResponse.json({
      totalUsers: Number(userStats.totalUsers) || 0,
      adminCount: Number(userStats.adminCount) || 0,
      userCount: Number(userStats.userCount) || 0,
      totalSensor,
      todaySensor,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
