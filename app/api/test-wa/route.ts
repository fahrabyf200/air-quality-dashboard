import { NextResponse } from 'next/server';
import { formatWhatsAppNumber } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    
    const token = process.env.FONNTE_TOKEN;
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: "FONNTE_TOKEN is NOT set in Vercel environment variables."
      }, { status: 400 });
    }

    const obfuscatedToken = token.substring(0, 3) + '...' + token.substring(token.length - 3);
    
    if (!phone) {
      return NextResponse.json({
        success: false,
        error: "Phone parameter is missing. Use: /api/test-wa?phone=0857xxxxxxx",
        token_info: {
          exists: true,
          length: token.length,
          preview: obfuscatedToken
        }
      }, { status: 400 });
    }

    const formattedTarget = formatWhatsAppNumber(phone);
    const message = "🔔 *DIAGNOSIS SKYWATCH* \n\nIni adalah pesan uji diagnosis dari server Vercel Anda. Koneksi WhatsApp Anda aktif!";
    
    console.log(`[Test-WA] Sending test to ${formattedTarget}...`);
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
    
    return NextResponse.json({
      success: response.ok && data.status === true,
      http_status: response.status,
      fonnte_response: data,
      token_info: {
        exists: true,
        length: token.length,
        preview: obfuscatedToken
      }
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
