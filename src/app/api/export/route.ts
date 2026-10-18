import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const dbPath = path.join(process.cwd(), 'data', 'madrasa_data.json');
    if (!fs.existsSync(dbPath)) {
      return NextResponse.json({ error: 'Database file not found' }, { status: 404 });
    }

    const fileContent = fs.readFileSync(dbPath, 'utf-8');
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `nasruthul_islam_backup_${dateStr}.json`;

    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
