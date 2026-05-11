import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - ambil semua transaksi penjualan
export async function GET() {
  const session = await getSession();
  if (!session || (session as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [rows] = await db.query(
    `SELECT * FROM sales_transactions ORDER BY created_at DESC`
  );

  // Summary stats
  const [statsRows]: any = await db.query(
    `SELECT 
      COUNT(*) as total_transactions,
      SUM(amount) as total_revenue,
      SUM(CASE WHEN MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW()) THEN amount ELSE 0 END) as this_month_revenue
     FROM sales_transactions`
  );

  return NextResponse.json({
    transactions: rows,
    stats: statsRows[0]
  });
}

// POST - catat transaksi baru
export async function POST(req: Request) {
  const session = await getSession();
  if (!session || (session as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { user_id, user_name, user_email, package_name, amount, payment_method, notes } = body;

  if (!user_id || !package_name || !amount || !payment_method) {
    return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
  }

  await db.query(
    `INSERT INTO sales_transactions (user_id, user_name, user_email, package_name, amount, payment_method, notes) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [user_id, user_name || null, user_email || null, package_name, amount, payment_method, notes || null]
  );

  return NextResponse.json({ message: 'Transaksi berhasil dicatat!' }, { status: 201 });
}

// DELETE - hapus transaksi
export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || (session as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 });

  await db.query('DELETE FROM sales_transactions WHERE id = ?', [id]);
  return NextResponse.json({ message: 'Transaksi dihapus' });
}
