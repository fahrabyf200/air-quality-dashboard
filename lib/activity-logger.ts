import { db } from '@/lib/db';

export async function logActivity({
  user_id,
  user_name,
  user_email,
  action,
  description,
  ip_address,
}: {
  user_id?: number | null;
  user_name?: string | null;
  user_email?: string | null;
  action: string;
  description?: string | null;
  ip_address?: string | null;
}) {
  try {
    // Auto-create activity_logs table if not exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        user_name VARCHAR(100) NULL,
        user_email VARCHAR(150) NULL,
        action VARCHAR(100) NOT NULL,
        description TEXT NULL,
        ip_address VARCHAR(60) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_created_at (created_at),
        INDEX idx_user_id (user_id),
        INDEX idx_action (action)
      )
    `);

    await db.query(
      `INSERT INTO activity_logs (user_id, user_name, user_email, action, description, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id ?? null, user_name ?? null, user_email ?? null, action, description ?? null, ip_address ?? null]
    );
  } catch {
    // Logging errors should not break the main flow
  }
}

export function getIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}
