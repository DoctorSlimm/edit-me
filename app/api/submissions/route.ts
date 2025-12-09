import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, prompt } = body;

    // Validate input
    if (!email || !prompt) {
      return NextResponse.json(
        { error: 'Email and prompt are required' },
        { status: 400 }
      );
    }

    // Get IP address from request headers (try multiple sources)
    const isLocalhost = (ip: string) => {
      return (
        ip === '127.0.0.1' ||
        ip === '::1' ||
        ip === 'localhost' ||
        ip === '::ffff:127.0.0.1' ||
        ip.startsWith('192.168.') ||
        ip.startsWith('10.') ||
        ip.startsWith('172.16.') ||
        ip.startsWith('172.17.') ||
        ip.startsWith('172.18.') ||
        ip.startsWith('172.19.') ||
        ip.startsWith('172.2') ||
        ip.startsWith('172.30.') ||
        ip.startsWith('172.31.')
      );
    };

    const getClientIp = () => {
      // Try x-forwarded-for first (most common)
      const forwarded = request.headers.get('x-forwarded-for');
      if (forwarded) {
        const ips = forwarded.split(',').map(ip => ip.trim());
        // Return the first non-localhost IP
        const realIp = ips.find(ip => !isLocalhost(ip));
        if (realIp) return realIp;
        // If only localhost IPs, return the first one
        if (ips.length > 0) return ips[0];
      }

      // Try other common headers
      const realIp = request.headers.get('x-real-ip');
      if (realIp) return realIp;

      const cfConnectingIp = request.headers.get('cf-connecting-ip');
      if (cfConnectingIp) return cfConnectingIp;

      const trueClientIp = request.headers.get('true-client-ip');
      if (trueClientIp) return trueClientIp;

      // Fallback to any forwarded IP or null
      return forwarded?.split(',')[0].trim() || null;
    };

    const ip = getClientIp();

    // Save to Supabase
    const { data, error } = await supabase
      .from('user_edits')
      .insert([
        {
          email,
          prompt,
          ip_address: ip,
        },
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save submission' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Error processing submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
