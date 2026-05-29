import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Kirim email undangan kepada pegawai/pengawas
 */
export async function sendInvitationEmail({
  toEmail,
  ownerName,
  ownerEmail,
}: {
  toEmail: string;
  ownerName: string;
  ownerEmail: string;
}) {
  const registerUrl = `${APP_URL}/register?email=${encodeURIComponent(toEmail)}&invited=1`;

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Undangan SkyWatch</title>
</head>
<body style="margin:0;padding:0;background:#070d1a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#070d1a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#0d1425;border-radius:24px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4edea3,#89ceff);padding:32px 40px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="width:56px;height:56px;background:rgba(0,0,0,0.2);border-radius:16px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
                      <span style="font-size:28px;">🌬️</span>
                    </div>
                    <h1 style="margin:0;color:#0a0f1a;font-size:22px;font-weight:900;letter-spacing:-0.5px;">SkyWatch</h1>
                    <p style="margin:4px 0 0;color:#1a2a00;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">Air Quality Dashboard</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 8px;color:#4edea3;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">Undangan Masuk</p>
              <h2 style="margin:0 0 16px;color:#ffffff;font-size:20px;font-weight:900;line-height:1.3;">
                Anda diundang untuk memantau<br/>kualitas udara 🏭
              </h2>
              <p style="margin:0 0 24px;color:#94a3b8;font-size:14px;line-height:1.7;">
                <strong style="color:#e2e8f0;">${ownerName}</strong> (${ownerEmail}) mengundang Anda untuk bergabung dan ikut memantau data sensor kualitas udara secara real-time melalui <strong style="color:#4edea3;">SkyWatch Dashboard</strong>.
              </p>

              <!-- Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(78,222,163,0.08);border:1px solid rgba(78,222,163,0.2);border-radius:16px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;color:#4edea3;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">Yang dapat Anda pantau:</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr><td style="padding:4px 0;color:#cbd5e1;font-size:13px;">📊 &nbsp;Dashboard Real-time CO₂, NH₃, VOC, Suhu</td></tr>
                      <tr><td style="padding:4px 0;color:#cbd5e1;font-size:13px;">📡 &nbsp;Log Histori Data Sensor Lengkap</td></tr>
                      <tr><td style="padding:4px 0;color:#cbd5e1;font-size:13px;">📈 &nbsp;Grafik Tren Kualitas Udara</td></tr>
                      <tr><td style="padding:4px 0;color:#cbd5e1;font-size:13px;">🔔 &nbsp;Notifikasi Peringatan Bahaya</td></tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${registerUrl}" style="display:inline-block;background:#4edea3;color:#0a0f1a;font-size:14px;font-weight:900;text-decoration:none;padding:16px 40px;border-radius:16px;letter-spacing:0.5px;text-transform:uppercase;">
                      Daftar & Mulai Monitoring →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:20px 0 0;text-align:center;color:#475569;font-size:12px;">
                Atau buka link ini di browser Anda:<br/>
                <a href="${registerUrl}" style="color:#4edea3;font-size:11px;word-break:break-all;">${registerUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Note -->
          <tr>
            <td style="padding:0 40px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);border-radius:12px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;color:#64748b;font-size:11px;line-height:1.6;">
                      ⚠️ &nbsp;<strong style="color:#94a3b8;">Penting:</strong> Daftar menggunakan email ini 
                      (<strong style="color:#4edea3;">${toEmail}</strong>) agar akses otomatis terhubung. 
                      Akun pegawai <strong style="color:#94a3b8;">gratis</strong> tanpa perlu berlangganan.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 32px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
              <p style="margin:0;color:#334155;font-size:11px;">SkyWatch Air Quality Monitoring System</p>
              <p style="margin:4px 0 0;color:#1e293b;font-size:10px;">Email ini dikirim secara otomatis, mohon tidak membalas.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `SkyWatch <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `🌬️ ${ownerName} mengundang Anda ke SkyWatch Dashboard`,
    html,
  });
}
