import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// ============================================================
// GET /api/health
// Health check endpoint untuk High Availability monitoring.
// Digunakan oleh:
//   - GitHub Actions CD pipeline (post-deploy smoke test)
//   - Uptime monitor eksternal (UptimeRobot, BetterStack, dll)
//   - Load balancer Vercel (untuk mendeteksi instance tidak sehat)
// ============================================================
export async function GET() {
  const startTime = Date.now();

  const status = {
    status: 'ok' as 'ok' | 'degraded' | 'down',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    region: process.env.VERCEL_REGION || process.env.AWS_REGION || 'local',
    environment: process.env.NODE_ENV || 'development',
    uptime_seconds: Math.floor(process.uptime()),
    components: {
      api: { status: 'ok' as 'ok' | 'error', latency_ms: 0 },
      database: { status: 'ok' as 'ok' | 'error', latency_ms: 0, message: '' },
    },
  };

  // --- Cek koneksi Database ---
  const dbStart = Date.now();
  try {
    // Query ringan: hanya ping koneksi tanpa membebani tabel besar
    await db.execute('SELECT 1');
    status.components.database.status = 'ok';
    status.components.database.latency_ms = Date.now() - dbStart;
    status.components.database.message = 'Connected';
  } catch (err: any) {
    // DB tidak bisa dihubungi — status degraded, bukan down total
    // karena API itself masih jalan
    status.status = 'degraded';
    status.components.database.status = 'error';
    status.components.database.latency_ms = Date.now() - dbStart;
    status.components.database.message = `Connection failed: ${err.message}`;
    console.error('❌ [HEALTH CHECK] Database connection failed:', err.message);
  }

  // --- Hitung total latency API ---
  status.components.api.latency_ms = Date.now() - startTime;

  // HTTP 200 = sistem bisa menerima traffic (meski DB degraded)
  // HTTP 503 = sistem tidak bisa melayani sama sekali
  const httpStatus = status.status === 'down' ? 503 : 200;

  return NextResponse.json(status, {
    status: httpStatus,
    headers: {
      // Jangan cache response health check
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Health-Check': 'skywatch-air-quality',
    },
  });
}
