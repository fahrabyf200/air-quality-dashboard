import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';
import { notifyAdmins } from '@/lib/notifications';

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
    const [userRows]: any = await db.query('SELECT name, email, subscription_end_date FROM users WHERE id = ?', [id]);
    if (userRows.length === 0) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    const user = userRows[0];

    // Logika Akumulasi (Stacking) Masa Aktif
    let currentEndDate = user.subscription_end_date ? new Date(user.subscription_end_date) : null;
    const now = new Date();
    
    // Jika langganan sudah kedaluwarsa atau belum ada, mulai dari hari ini
    if (!currentEndDate || currentEndDate < now) {
      currentEndDate = now;
    }

    if (subscription_action === 'activate_1month') {
      // Tambah 30 hari ke sisa masa aktif
      const newEndDate = new Date(currentEndDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      await db.query(
        `UPDATE users SET subscription_status = 'active', subscription_end_date = ? WHERE id = ?`,
        [newEndDate, id]
      );
      
      // Catat transaksi otomatis
      await db.query(
        `INSERT INTO sales_transactions (user_id, user_name, user_email, package_name, amount, payment_method, notes) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, user.name, user.email, 'Langganan 1 Bulan', 349000, 'Manual Admin', 'Diaktifkan & diakumulasi otomatis oleh sistem']
      );

      // Notify admins
      await notifyAdmins(
        'Aktivasi Premium',
        `${(session as any).name || 'Admin'} mengaktifkan paket Premium 1 Bulan untuk user ${user.name} (${user.email}).`,
        'info'
      );

      return NextResponse.json({ message: 'Langganan 1 Bulan berhasil diakumulasi & transaksi dicatat!' });
    }
    if (subscription_action === 'activate_1year') {
      // Tambah 365 hari ke sisa masa aktif
      const newEndDate = new Date(currentEndDate.getTime() + 365 * 24 * 60 * 60 * 1000);
      
      await db.query(
        `UPDATE users SET subscription_status = 'active', subscription_end_date = ? WHERE id = ?`,
        [newEndDate, id]
      );

      // Catat transaksi otomatis
      await db.query(
        `INSERT INTO sales_transactions (user_id, user_name, user_email, package_name, amount, payment_method, notes) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, user.name, user.email, 'Langganan 1 Tahun', 599000, 'Manual Admin', 'Diaktifkan & diakumulasi otomatis oleh sistem']
      );

      // Notify admins
      await notifyAdmins(
        'Aktivasi Premium',
        `${(session as any).name || 'Admin'} mengaktifkan paket Premium 1 Tahun untuk user ${user.name} (${user.email}).`,
        'info'
      );

      return NextResponse.json({ message: 'Langganan 1 Tahun berhasil diakumulasi & transaksi dicatat!' });
    }
    if (subscription_action === 'deactivate') {
      await db.query(
        `UPDATE users SET subscription_status = 'free', subscription_end_date = NULL WHERE id = ?`,
        [id]
      );

      // Notify admins
      await notifyAdmins(
        'Deaktivasi Premium',
        `${(session as any).name || 'Admin'} menonaktifkan paket Premium untuk user ${user.name} (${user.email}).`,
        'info'
      );

      return NextResponse.json({ message: 'Akses premium dinonaktifkan.' });
    }
    return NextResponse.json({ error: 'Aksi subscription tidak valid' }, { status: 400 });
  }

  // --- Update Role Saja ---
  if (role && !name && !email) {
    if (!['admin', 'user'].includes(role)) {
      return NextResponse.json({ error: 'Role tidak valid' }, { status: 400 });
    }
    // Get user details first
    const [uRows]: any = await db.query('SELECT name, email FROM users WHERE id = ?', [id]);
    const uName = uRows?.[0]?.name || '';

    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);

    // Notify admins
    await notifyAdmins(
      'Role Pengguna Diubah',
      `${(session as any).name || 'Admin'} mengubah role pengguna ${uName} menjadi ${role}.`,
      'info'
    );

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

  // Get old user details for logging
  const [oldRows]: any = await db.query('SELECT name, email FROM users WHERE id = ?', [id]);
  const oldUser = oldRows?.[0] || {};

  await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);

  // Notify admins
  await notifyAdmins(
    'Profil Pengguna Diupdate',
    `${(session as any).name || 'Admin'} memperbarui data profil pengguna ${oldUser.name || ''} (${oldUser.email || ''}).`,
    'info'
  );

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

  // Get user details before deleting
  const [delRows]: any = await db.query('SELECT name, email FROM users WHERE id = ?', [id]);
  const delUser = delRows?.[0] || {};

  await db.query('DELETE FROM users WHERE id = ?', [id]);

  // Notify admins
  await notifyAdmins(
    'Pengguna Dihapus',
    `${(session as any).name || 'Admin'} menghapus akun pengguna: ${delUser.name || ''} (${delUser.email || ''}).`,
    'info'
  );

  return NextResponse.json({ message: 'User berhasil dihapus' });
}
