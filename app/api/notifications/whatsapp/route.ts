import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { notifyAdmins } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const session = await getSession();
    const userLabel = session ? `${(session as any).name} (${(session as any).email})` : 'Pengunjung Tamu';
    
    await notifyAdmins(
      'Kontak WhatsApp CS',
      `${userLabel} telah mengeklik tombol WhatsApp CS untuk menghubungi admin.`,
      'info'
    );
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
