import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { logActivity, getIp } from '@/lib/activity-logger';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !(session as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { device_id, name, phone } = await req.json();

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

    const finalDeviceId = device_id !== undefined ? (device_id && device_id.trim() !== '' ? device_id.trim() : null) : undefined;
    const finalPhone = phone !== undefined ? (phone && phone.trim() !== '' ? phone.trim() : null) : undefined;
    const finalName = name !== undefined ? (name && name.trim() !== '' ? name.trim() : null) : undefined;

    let updateFields = [];
    let queryParams = [];

    if (finalName !== undefined && finalName !== null) {
      updateFields.push('name = ?');
      queryParams.push(finalName);
    }
    if (finalPhone !== undefined) {
      updateFields.push('phone = ?');
      queryParams.push(finalPhone);
    }
    if (finalDeviceId !== undefined) {
      updateFields.push('device_id = ?');
      queryParams.push(finalDeviceId);
    }

    if (updateFields.length > 0) {
      queryParams.push((session as any).id);
      await db.execute(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        queryParams
      );
    }

    // Log aktivitas edit profil
    logActivity({
      user_id: (session as any).id,
      user_name: (session as any).name,
      user_email: (session as any).email,
      action: 'edit_profile',
      description: `Profil diperbarui${finalDeviceId !== undefined ? ' (termasuk Device ID)' : ''}`,
      ip_address: getIp(req),
    });

    return NextResponse.json({ message: 'Profil dan alat berhasil disimpan!' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
