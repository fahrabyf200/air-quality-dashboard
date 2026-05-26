import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || !(session as any).id) {
      return NextResponse.json({ connected: false });
    }

    // Ambil id user_id yang sah untuk user ini (termasuk shared devices)
    const [shares]: any = await db.execute(
      'SELECT owner_id FROM device_shares WHERE member_email = ?',
      [(session as any).email]
    );
    
    const userIds = [(session as any).id];
    if (shares && shares.length > 0) {
      shares.forEach((s: any) => userIds.push(s.owner_id));
    }

    const placeholders = userIds.map(() => '?').join(',');
    
    // Ambil log sensor terakhir untuk user/owner ini
    const [rows]: any = await db.execute(
      `SELECT created_at FROM sensor_data 
       WHERE user_id IN (${placeholders}) OR user_id IS NULL 
       ORDER BY created_at DESC LIMIT 1`,
      userIds
    );

    if (rows.length === 0) {
      // Fallback ke data sensor terakhir global jika belum ada data terikat
      const [fallbackRows]: any = await db.execute(
        'SELECT created_at FROM sensor_data ORDER BY created_at DESC LIMIT 1'
      );
      if (fallbackRows.length === 0) {
        return NextResponse.json({ connected: false, last_seen: null });
      }
      const lastSeen = new Date(fallbackRows[0].created_at).getTime();
      const connected = (Date.now() - lastSeen) < 60000;
      return NextResponse.json({ connected, last_seen: fallbackRows[0].created_at });
    }

    const lastSeen = new Date(rows[0].created_at).getTime();
    const connected = (Date.now() - lastSeen) < 60000;
    return NextResponse.json({ connected, last_seen: rows[0].created_at });
  } catch (error: any) {
    console.error("❌ GET STATUS SENSOR ERROR:", error.message);
    return NextResponse.json({ connected: false, error: error.message }, { status: 500 });
  }
}
