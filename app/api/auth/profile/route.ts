import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !(session as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { device_id, name } = await req.json();

    // Check if the device_id is already bound to another user
    if (device_id && device_id.trim() !== '') {
      const [existing]: any = await db.execute(
        'SELECT id, name FROM users WHERE device_id = ? AND id != ?',
        [device_id.trim(), (session as any).id]
      );
      if (existing.length > 0) {
        return NextResponse.json({ 
          error: `Perangkat ini sudah digunakan oleh pengguna lain (${existing[0].name})` 
        }, { status: 400 });
      }
    }

    const finalDeviceId = device_id && device_id.trim() !== '' ? device_id.trim() : null;

    if (name && name.trim() !== '') {
      await db.execute(
        'UPDATE users SET name = ?, device_id = ? WHERE id = ?',
        [name.trim(), finalDeviceId, (session as any).id]
      );
    } else {
      await db.execute(
        'UPDATE users SET device_id = ? WHERE id = ?',
        [finalDeviceId, (session as any).id]
      );
    }

    return NextResponse.json({ message: 'Profil dan alat berhasil disimpan!' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
