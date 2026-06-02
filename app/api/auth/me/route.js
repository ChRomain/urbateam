import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/supabase';

export async function GET(request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const token = cookieHeader.split('; ').find(row => row.startsWith('admin_session='))?.split('=')[1];

    if (!token) {
      return NextResponse.json({ error: 'No session token' }, { status: 401 });
    }

    const user = await getCurrentUser(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error('[API Auth Me Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
