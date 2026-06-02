import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !(session as any).id) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Query user data dynamically from DB to get fresh values (role, device_id, etc.)
    const [rows]: any = await db.execute(
      'SELECT id, name, email, role, device_id, created_at, subscription_status, subscription_end_date, profile_pic, phone FROM users WHERE id = ?',
      [(session as any).id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = rows[0];

    // Cek apakah user diundang oleh owner premium active
    const [invitedRows]: any = await db.query(
      `SELECT u.name as owner_name, u.email as owner_email
       FROM device_shares ds
       JOIN users u ON ds.owner_id = u.id
       WHERE ds.member_email = ? 
         AND (
           u.role = 'admin' 
           OR (u.subscription_status = 'active' AND (u.subscription_end_date IS NULL OR u.subscription_end_date > NOW()))
         )
       LIMIT 1`,
      [user.email]
    );

    const isInvitedPremium = invitedRows && invitedRows.length > 0;

    if (isInvitedPremium) {
      const owner = invitedRows[0];
      user.subscription_status = 'active';
      user.subscription_end_date = null; // Bypass expiration
      user.is_invited = true;
      user.invited_by_name = owner.owner_name;
      user.invited_by_email = owner.owner_email;
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
