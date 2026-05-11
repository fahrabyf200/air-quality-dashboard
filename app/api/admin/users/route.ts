import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET all users
export async function GET() {
  const session = await getSession();
  if (!session || (session as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const [users] = await db.query(
      `SELECT u.id, u.name, u.email, u.role, u.device_id, u.created_at,
        u.subscription_status, u.subscription_end_date,
        COUNT(s.id) as sensor_count,
        owner.name as invited_by_name,
        owner.email as invited_by_email
       FROM users u
       LEFT JOIN sensor_data s ON s.user_id = u.id
       LEFT JOIN device_shares ds ON ds.member_email = u.email
       LEFT JOIN users owner ON ds.owner_id = owner.id
       GROUP BY u.id, ds.id
       ORDER BY u.created_at DESC`
    );
    return NextResponse.json({ users });
  } catch {
    // Fallback jika user_id belum ada di sensor_data
    const [users] = await db.query(
      `SELECT u.id, u.name, u.email, u.role, u.device_id, u.created_at,
        u.subscription_status, u.subscription_end_date,
        owner.name as invited_by_name,
        owner.email as invited_by_email
       FROM users u
       LEFT JOIN device_shares ds ON ds.member_email = u.email
       LEFT JOIN users owner ON ds.owner_id = owner.id
       ORDER BY u.created_at DESC`
    );
    return NextResponse.json({ users });
  }
}

// POST: Create new user
export async function POST(req: Request) {
  const session = await getSession();
  if (!session || (session as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { name, email, password, role } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Nama, email, dan password wajib diisi' }, { status: 400 });
  }

  const [existing]: any = await db.query('SELECT id FROM users WHERE email = ?', [email]);
  if ((existing as any[]).length > 0) {
    return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await db.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hashedPassword, role || 'user']
  );
  return NextResponse.json({ message: 'User berhasil dibuat' }, { status: 201 });
}

// PATCH: Update user (name, email, role, subscription)
export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session || (session as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { id, name, email, role, subscription_action } = body;
  if (!id) return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 });

  // --- Kelola Subscription Premium ---
  if (subscription_action) {
    if (subscription_action === 'activate_1month') {
      await db.query(
        `UPDATE users SET subscription_status = 'active', subscription_end_date = DATE_ADD(NOW(), INTERVAL 30 DAY) WHERE id = ?`,
        [id]
      );
      return NextResponse.json({ message: 'Premium 1 Bulan berhasil diaktifkan!' });
    }
    if (subscription_action === 'activate_1year') {
      await db.query(
        `UPDATE users SET subscription_status = 'active', subscription_end_date = DATE_ADD(NOW(), INTERVAL 365 DAY) WHERE id = ?`,
        [id]
      );
      return NextResponse.json({ message: 'Premium 1 Tahun berhasil diaktifkan!' });
    }
    if (subscription_action === 'deactivate') {
      await db.query(
        `UPDATE users SET subscription_status = 'free', subscription_end_date = NULL WHERE id = ?`,
        [id]
      );
      return NextResponse.json({ message: 'Akses premium berhasil dinonaktifkan.' });
    }
    return NextResponse.json({ error: 'Aksi subscription tidak valid' }, { status: 400 });
  }

  // --- Update Role Saja ---
  if (role && !name && !email) {
    if (!['admin', 'user'].includes(role)) {
      return NextResponse.json({ error: 'Role tidak valid' }, { status: 400 });
    }
    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    return NextResponse.json({ message: 'Role berhasil diupdate' });
  }

  // --- Update Full Profile ---
  if (email) {
    const [existing]: any = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
    if ((existing as any[]).length > 0) {
      return NextResponse.json({ error: 'Email sudah digunakan akun lain' }, { status: 400 });
    }
  }

  const fields: string[] = [];
  const values: any[] = [];
  if (name) { fields.push('name = ?'); values.push(name); }
  if (email) { fields.push('email = ?'); values.push(email); }
  if (role) { fields.push('role = ?'); values.push(role); }

  if (fields.length === 0) {
    return NextResponse.json({ error: 'Tidak ada field yang diubah' }, { status: 400 });
  }

  values.push(id);
  await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
  return NextResponse.json({ message: 'User berhasil diupdate' });
}

// DELETE: Remove user
export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || (session as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 });

  if (id === (session as any).id) {
    return NextResponse.json({ error: 'Tidak bisa menghapus akun sendiri' }, { status: 400 });
  }

  // Set sensor_data user_id ke NULL sebelum hapus user (jika kolom ada)
  try {
    await db.query('UPDATE sensor_data SET user_id = NULL WHERE user_id = ?', [id]);
  } catch { }

  await db.query('DELETE FROM users WHERE id = ?', [id]);
  return NextResponse.json({ message: 'User berhasil dihapus' });
}
