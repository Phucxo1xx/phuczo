import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, bio, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email này đã được đăng ký' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const validRole = role === 'OWNER' ? 'OWNER' : 'USER';

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: validRole,
        bio: bio || null,
        phone: phone || null,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        phone: true,
      },
    });

    const token = signToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    const response = NextResponse.json({ success: true, user: newUser });
    response.cookies.set('foodvibe_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Lỗi đăng ký:', error);
    return NextResponse.json({ error: 'Đã có lỗi xảy ra trong quá trình đăng ký' }, { status: 500 });
  }
}
