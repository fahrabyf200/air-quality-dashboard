import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
    }

    const [rows]: any = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    // Buat JWT token
    const token = await signToken({ 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      role: user.role || 'user' 
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    });

    return NextResponse.json({ message: "Login berhasil", user: { name: user.name, email: user.email, role: user.role || 'user' } }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
