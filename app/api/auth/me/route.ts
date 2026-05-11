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
      'SELECT id, name, email, role, device_id, created_at FROM users WHERE id = ?',
      [(session as any).id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user: rows[0] }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
