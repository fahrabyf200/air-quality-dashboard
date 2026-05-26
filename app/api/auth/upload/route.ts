import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !(session as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file yang dikirim' }, { status: 400 });
    }

    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipe file tidak didukung. Gunakan JPG, PNG, atau WebP' }, { status: 400 });
    }

    // Validasi ukuran file (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'Ukuran file terlalu besar (maksimal 2MB)' }, { status: 400 });
    }

    const userId = (session as any).id;
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `profile_${userId}.${ext}`;

    // Pastikan folder uploads ada
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch { /* folder mungkin sudah ada */ }

    // Tulis file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    // URL publik
    const publicUrl = `/uploads/${fileName}?t=${Date.now()}`;

    // Update di database (tambah ?t= untuk bust cache)
    const dbUrl = `/uploads/${fileName}`;
    await db.execute(
      'UPDATE users SET profile_pic = ? WHERE id = ?',
      [dbUrl, userId]
    );

    return NextResponse.json({ 
      message: 'Foto profil berhasil diperbarui!', 
      url: publicUrl 
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Gagal mengupload foto: ' + error.message }, { status: 500 });
  }
}
