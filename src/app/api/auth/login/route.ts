import { NextRequest, NextResponse } from 'next/server';
import { getMemberByUsername } from '@/lib/db';
import { comparePassword, createSessionToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Please enter both username and password' },
        { status: 400 }
      );
    }

    const member = await getMemberByUsername(username);
    if (!member) {
      return NextResponse.json(
        { error: 'Invalid username or password. Please contact the Madrasa Admin if you need help.' },
        { status: 401 }
      );
    }

    if (member.status === 'inactive') {
      return NextResponse.json(
        { error: 'This member account is currently inactive. Please contact the administrator.' },
        { status: 403 }
      );
    }

    const isValid = await comparePassword(password, member.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid username or password. Please check your credentials.' },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      id: member.id,
      username: member.username,
      name: member.name,
      role: member.role,
      memberCode: member.memberCode,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: member.id,
        username: member.username,
        name: member.name,
        role: member.role,
        memberCode: member.memberCode,
      },
    });

    // Set cookie
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during login' },
      { status: 500 }
    );
  }
}
