import QRCode from 'qrcode';
import { nanoid } from 'nanoid';
import { createClient } from './supabase/server';

export async function generatePollQRCode(pollId: string, baseUrl: string) {
  const shortCode = nanoid(8); // 8 character unique code
  const pollUrl = `${baseUrl}/p/${shortCode}`;
  
  try {
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(pollUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });

    // Store in database
    const supabase = await createClient();
    const { error } = await supabase
      .from('poll_qr_codes')
      .insert({
        poll_id: pollId,
        short_code: shortCode,
        qr_code_data: qrCodeDataUrl
      });

    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.error('Error storing QR code:', error);
      }
      throw new Error('Failed to store QR code');
    }

    return {
      shortCode,
      qrCodeDataUrl,
      pollUrl
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error('Error generating QR code:', error);
    }
    throw new Error('Failed to generate QR code');
  }
}

export async function getPollByShortCode(shortCode: string) {
  const supabase = await createClient();
  
  // First get the poll ID from the QR code
  const { data: qrCode, error: qrError } = await supabase
    .from('poll_qr_codes')
    .select('poll_id')
    .eq('short_code', shortCode)
    .single();

  if (qrError) {
    if (qrError.code === 'PGRST116') {
      return null; // QR code not found
    }
    if (process.env.NODE_ENV === "development") {
      console.error('Error fetching QR code:', qrError);
    }
    throw new Error('Failed to fetch QR code');
  }

  if (!qrCode?.poll_id) {
    return null;
  }

    // Then get the poll details
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .select(`
      *,
      poll_options (
        *
      ),
      profiles (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('id', qrCode.poll_id)
    .single();

  if (pollError) {
    if (process.env.NODE_ENV === "development") {
      console.error('Error fetching poll:', pollError);
    }
    throw new Error('Failed to fetch poll');
  }

  return poll;
}

export async function getPollQRCode(pollId: string) {
  const supabase = await createClient();
  
  const { data: qrCode, error } = await supabase
    .from('poll_qr_codes')
    .select('*')
    .eq('poll_id', pollId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // QR code not found
    }
    if (process.env.NODE_ENV === "development") {
      console.error('Error fetching QR code:', error);
    }
    throw new Error('Failed to fetch QR code');
  }

  return qrCode;
}

export async function deletePollQRCode(pollId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('poll_qr_codes')
    .delete()
    .eq('poll_id', pollId);

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error('Error deleting QR code:', error);
    }
    throw new Error('Failed to delete QR code');
  }
}

// Generate QR code for download
export async function generateDownloadableQRCode(pollUrl: string, filename: string = 'poll-qr-code.png') {
  try {
    const qrCodeBuffer = await QRCode.toBuffer(pollUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });

    return {
      buffer: qrCodeBuffer,
      filename,
      mimeType: 'image/png'
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error('Error generating downloadable QR code:', error);
    }
    throw new Error('Failed to generate downloadable QR code');
  }
}

// Generate QR code with custom styling
export async function generateStyledQRCode(
  pollUrl: string, 
  options: {
    width?: number;
    margin?: number;
    darkColor?: string;
    lightColor?: string;
    logo?: string;
  } = {}
) {
  const {
    width = 300,
    margin = 2,
    darkColor = '#000000',
    lightColor = '#FFFFFF',
    logo
  } = options;

  try {
    const qrCodeDataUrl = await QRCode.toDataURL(pollUrl, {
      width,
      margin,
      color: {
        dark: darkColor,
        light: lightColor
      },
      errorCorrectionLevel: 'H' // Higher error correction for logo overlay
    });

    return qrCodeDataUrl;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error('Error generating styled QR code:', error);
    }
    throw new Error('Failed to generate styled QR code');
  }
}
