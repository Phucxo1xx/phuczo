import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yêu cầu quyền Quản trị viên' }, { status: 403 });
    }

    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        restaurant: { select: { id: true, name: true } },
        reports: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reviews });
  } catch (error: any) {
    console.error('Lỗi lấy reviews:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
