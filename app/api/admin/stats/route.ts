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
         FROM sales_transactions`
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
         FROM sales_transactions
         GROUP BY DATE_FORMAT(created_at, '%Y-%m'), DATE_FORMAT(created_at, '%b %Y')
         ORDER BY month ASC`
      );
      revenueByMonth = monthlyRevenue;
    } catch { }

    // Package distribution (Classified into 4 user groups)
    let packageDist: any[] = [];
    let subscribers: any[] = [];
    try {
      // Fetch all users (excluding admin) with their latest transaction package and their invitation status
      const [users]: any = await db.query(
        `SELECT u.id, u.name, u.email, u.role, u.subscription_status, u.subscription_end_date, u.created_at,
           (SELECT package_name FROM sales_transactions WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) as latest_package,
           (SELECT COUNT(*) FROM device_shares WHERE member_email = u.email) as is_invited
         FROM users u
         WHERE u.role != 'admin'`
      );

      let count1Month = 0;
      let count1Year = 0;
      let countInvited = 0;
      let countNotSubscribed = 0;

      const sub1Month: any[] = [];
      const sub1Year: any[] = [];
      const subInvited: any[] = [];
      const subNotSubscribed: any[] = [];

      const now = new Date();

      for (const u of users) {
        const isSubActive = u.subscription_status === 'active' && (u.subscription_end_date ? new Date(u.subscription_end_date) >= now : true);
        
        if (u.is_invited > 0) {
          countInvited++;
          subInvited.push({
            user_name: u.name,
            user_email: u.email,
            amount: 0,
            created_at: u.created_at,
          });
        } else if (isSubActive) {
          const pkg = u.latest_package || '';
          if (pkg.includes('Tahun') || pkg.includes('1 Tahun') || pkg.includes('Year')) {
            count1Year++;
            sub1Year.push({
              user_name: u.name,
              user_email: u.email,
              amount: 599000,
              created_at: u.subscription_end_date,
            });
          } else {
            count1Month++;
            sub1Month.push({
              user_name: u.name,
              user_email: u.email,
              amount: 349000,
              created_at: u.subscription_end_date,
            });
          }
        } else {
          countNotSubscribed++;
          subNotSubscribed.push({
            user_name: u.name,
            user_email: u.email,
            amount: 0,
            created_at: u.created_at,
          });
        }
      }

      packageDist = [
        { package_name: 'Langganan 1 Bulan', count: count1Month },
        { package_name: 'Langganan 1 Tahun', count: count1Year },
        { package_name: 'Lewat Undangan', count: countInvited },
        { package_name: 'Belum Langganan / Belum Perpanjang', count: countNotSubscribed }
      ];

      subscribers = [
        ...sub1Month.map(s => ({ ...s, package_name: 'Langganan 1 Bulan' })),
        ...sub1Year.map(s => ({ ...s, package_name: 'Langganan 1 Tahun' })),
        ...subInvited.map(s => ({ ...s, package_name: 'Lewat Undangan' })),
        ...subNotSubscribed.map(s => ({ ...s, package_name: 'Belum Langganan / Belum Perpanjang' }))
      ];
    } catch (e: any) {
      console.error("Gagal klasifikasi:", e.message);
    }

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
         GROUP BY DATE(created_at), DATE_FORMAT(created_at, '%d %b')
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
      subscribers,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
