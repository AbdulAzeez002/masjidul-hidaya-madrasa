import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { updateAnnouncement, deleteAnnouncement } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const updated = await updateAnnouncement(params.id, body);
    return NextResponse.json({ success: true, announcement: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const success = await deleteAnnouncement(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Announcement deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
