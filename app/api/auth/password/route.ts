import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';
import { logActivity, getIp } from '@/lib/activity-logger';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !(session as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { oldPassword, newPassword } = await req.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: "Password lama dan baru wajib diisi" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password baru minimal 6 karakter" }, { status: 400 });
    }

    const userId = (session as any).id;
    const [rows]: any = await db.execute('SELECT password FROM users WHERE id = ?', [userId]);
    
    if (rows.length === 0) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return NextResponse.json({ error: "Password lama salah" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);

    // Log aktivitas ubah password
    logActivity({
      user_id: userId,
      user_name: (session as any).name,
      user_email: (session as any).email,
      action: 'change_password',
      description: 'Password berhasil diubah',
      ip_address: getIp(req),
    });

    return NextResponse.json({ message: "Password berhasil diubah" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
