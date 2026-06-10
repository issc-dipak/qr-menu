import QRCode from 'qrcode';
import { generateSessionId } from '@/lib/sessionManager';

/**
 * Generates a QR Code containing a unique session ID in the URL.
 * Format: {APP_URL}/menu/{shopSlug}?sid={sessionId}
 * 
 * @param shopSlug - The slug of the owner's shop
 * @returns An object containing the base64 QR image data URL and the full URL string
 */
export async function generateQRWithSessionId(shopSlug: string): Promise<{ qrImage: string; url: string }> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const sessionId = generateSessionId();
    const url = `${appUrl}/menu/${shopSlug}?sid=${sessionId}`;

    // Options for the QR code image generation
    const qrImage = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M', // Medium correction
      margin: 2,
      width: 380,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    return { qrImage, url };
  } catch (error) {
    console.error('Failed to generate QR code with Session ID:', error);
    throw new Error('QR code generation failed');
  }
}
