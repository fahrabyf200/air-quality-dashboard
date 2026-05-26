import { db } from './db';

export async function notifyAdmins(title: string, message: string, type: string = 'alert') {
  try {
    const [admins]: any = await db.query("SELECT id FROM users WHERE role = 'admin'");
    if (Array.isArray(admins) && admins.length > 0) {
      const insertPromises = admins.map((admin: any) => 
        db.query(
          `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
          [admin.id, title, message, type]
        )
      );
      await Promise.all(insertPromises);
    }
  } catch (err) {
    console.error("Gagal mengirim notifikasi admin:", err);
  }
}
