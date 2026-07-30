import { NextRequest, NextResponse } from 'next/server';
import { defaultSettings } from '@/lib/seed-data';

export async function GET() {
  return NextResponse.json(defaultSettings);
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json({ ...defaultSettings, ...body });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.password === defaultSettings.adminPassword) {
      return NextResponse.json({ valid: true, settings: defaultSettings });
    }
    return NextResponse.json({ valid: false }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to verify password' }, { status: 500 });
  }
}
