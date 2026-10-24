import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập để gửi báo cáo' }, { status: 401 });
    }

    const body = await req.json();
    const { targetType, targetId, reason, note } = body;

    if (!targetType || !targetId || !reason) {
      return NextResponse.json({ error: 'Thiếu thông tin báo cáo' }, { status: 400 });
    }

    let reviewId = null;
    let restaurantId = null;

    if (targetType === 'REVIEW') {
      const review = await prisma.review.findUnique({ where: { id: targetId } });
      if (!review) return NextResponse.json({ error: 'Không tìm thấy đánh giá cần báo xấu' }, { status: 404 });
      reviewId = review.id;
    } else if (targetType === 'RESTAURANT') {
      const rest = await prisma.restaurant.findUnique({ where: { id: targetId } });
      if (!rest) return NextResponse.json({ error: 'Không tìm thấy quán ăn cần báo xấu' }, { status: 404 });
      restaurantId = rest.id;
    } else {
      return NextResponse.json({ error: 'Loại đối tượng không hợp lệ' }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        reporterId: user.id,
        targetType,
        reviewId,
        restaurantId,
        reason,
        note: note || '',
        status: 'PENDING',
      },
    });

    // Notify admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    for (const adm of admins) {
      await prisma.notification.create({
        data: {
          userId: adm.id,
          title: 'Báo cáo vi phạm mới',
          message: `${user.name} vừa gửi báo cáo về một ${targetType === 'REVIEW' ? 'bài đánh giá' : 'quán ăn'}.`,
          type: 'REPORT_STATUS',
          link: '/admin?tab=reports',
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Cảm ơn bạn đã báo cáo. Ban quản trị sẽ sớm xem xét xử lý!' });
  } catch (error: any) {
    console.error('Lỗi gửi báo xấu:', error);
    return NextResponse.json({ error: 'Không thể gửi báo cáo' }, { status: 500 });
  }
}
