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

    // Total revenue from sales table
    let totalRevenue = 0;
    let thisMonthRevenue = 0;
    try {
      const [[revenueStats]]: any = await db.query(
        `SELECT 
          COALESCE(SUM(amount), 0) as totalRevenue,
          COALESCE(SUM(CASE WHEN MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE()) THEN amount ELSE 0 END), 0) as thisMonthRevenue
         FROM sales`
      );
      totalRevenue = Number(revenueStats.totalRevenue) || 0;
      thisMonthRevenue = Number(revenueStats.thisMonthRevenue) || 0;
    } catch { }

    // Total complaints
    let totalComplaints = 0;
    let openComplaints = 0;
    try {
      const [[complaintStats]]: any = await db.query(
        `SELECT 
          COUNT(*) as totalComplaints,
          SUM(CASE WHEN status = 'open' OR status IS NULL THEN 1 ELSE 0 END) as openComplaints
         FROM complaints`
      );
      totalComplaints = Number(complaintStats.totalComplaints) || 0;
      openComplaints = Number(complaintStats.openComplaints) || 0;
    } catch { }

    // Revenue per month (all-time) for chart
    let revenueByMonth: any[] = [];
    try {
      const [monthlyRevenue]: any = await db.query(
        `SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          DATE_FORMAT(created_at, '%b %Y') as label,
          COALESCE(SUM(amount), 0) as revenue,
          COUNT(*) as transactions
         FROM sales
         GROUP BY DATE_FORMAT(created_at, '%Y-%m')
         ORDER BY month ASC`
      );
      revenueByMonth = monthlyRevenue;
    } catch { }

    // Package distribution
    let packageDist: any[] = [];
    try {
      const [pkgData]: any = await db.query(
        `SELECT package_name, COUNT(*) as count, COALESCE(SUM(amount), 0) as total
         FROM sales GROUP BY package_name`
      );
      packageDist = pkgData;
    } catch { }

    // Complaints by status
    let complaintsByStatus: any[] = [];
    try {
      const [statusData]: any = await db.query(
        `SELECT COALESCE(status, 'open') as status, COUNT(*) as count
         FROM complaints GROUP BY COALESCE(status, 'open')`
      );
      complaintsByStatus = statusData;
    } catch { }

    // Danger events per day (all-time)
    let dangerTrend: any[] = [];
    try {
      const [trendData]: any = await db.query(
        `SELECT 
          DATE(created_at) as date,
          DATE_FORMAT(created_at, '%d %b') as label,
          COUNT(*) as total_events
         FROM sensor_data
         WHERE (co2 > 250 OR nh3 > 30 OR voc > 70 OR temp > 32)
         GROUP BY DATE(created_at)
         ORDER BY date ASC`
      );
      dangerTrend = trendData;
    } catch { }

    return NextResponse.json({
      totalUsers: Number(userStats.totalUsers) || 0,
      adminCount: Number(userStats.adminCount) || 0,
      userCount: Number(userStats.userCount) || 0,
      totalSensor,
      todaySensor,
      totalRevenue,
      thisMonthRevenue,
      totalComplaints,
      openComplaints,
      revenueByMonth,
      packageDist,
      complaintsByStatus,
      dangerTrend,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
