import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAllAnnouncements, createAnnouncement } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const announcements = await getAllAnnouncements();
    return NextResponse.json({ announcements });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, priority, isPinned, date } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const newAnn = await createAnnouncement({
      title: title.trim(),
      content: content.trim(),
      priority: priority || 'normal',
      isPinned: Boolean(isPinned),
      author: session.name || 'Madrasa Committee',
      date: date || todayStr,
    });

    return NextResponse.json({ success: true, announcement: newAnn }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create announcement' }, { status: 400 });
  }
}
