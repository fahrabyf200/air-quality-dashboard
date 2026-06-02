/**
 * Memformat nomor telepon menjadi format WhatsApp internasional.
 * Contoh: '085792524863' -> '6285792524863'
 * Contoh: '+62857-9252-4863' -> '6285792524863'
 */
export function formatWhatsAppNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, ''); // Ambil hanya angka
  
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }
  
  return cleaned;
}

/**
 * Mengirim pesan WhatsApp ke nomor tujuan menggunakan gateway API Fonnte.
 */
export async function sendWhatsAppMessage(target: string, message: string): Promise<boolean> {
  const token = process.env.FONNTE_TOKEN;
  
  if (!token) {
    console.warn("⚠️ [WhatsApp] FONNTE_TOKEN tidak dikonfigurasi di environment variables. Pesan tidak dikirim.");
    return false;
  }

  if (!target || target.trim() === '') {
    console.warn("⚠️ [WhatsApp] Nomor tujuan kosong. Pesan tidak dikirim.");
    return false;
  }

  const formattedTarget = formatWhatsAppNumber(target);

  try {
    console.log(`[WhatsApp] Mengirim pesan ke ${formattedTarget}...`);
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target: formattedTarget,
        message: message
      })
    });

    const data = await response.json();
    if (response.ok && data.status === true) {
      console.log(`✅ [WhatsApp] Pesan berhasil dikirim ke ${formattedTarget}`);
      return true;
    } else {
      console.error(`❌ [WhatsApp] Gagal mengirim ke ${formattedTarget}:`, data.reason || data);
      return false;
    }
  } catch (err: any) {
    console.error(`❌ [WhatsApp] Error pengiriman ke ${formattedTarget}:`, err.message);
    return false;
  }
}
