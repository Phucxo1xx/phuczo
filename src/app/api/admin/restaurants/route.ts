import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yêu cầu quyền Quản trị viên' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'ALL';

    const where: any = {};
    if (status !== 'ALL') {
      where.status = status;
    }

    const restaurants = await prisma.restaurant.findMany({
      where,
      include: {
        owner: {
          select: { id: true, name: true, email: true, phone: true },
        },
        dishes: true,
        _count: {
          select: { reviews: true, reports: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ restaurants });
  } catch (error: any) {
    console.error('Lỗi admin lấy quán:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yêu cầu quyền Quản trị viên' }, { status: 403 });
    }

    const body = await req.json();
    const { id, status, rejectReason } = body;

    if (!id || !['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return NextResponse.json({ error: 'Tham số không hợp lệ' }, { status: 400 });
    }

    const updated = await prisma.restaurant.update({
      where: { id },
      data: {
        status,
        rejectReason: rejectReason || null,
      },
      include: { owner: true },
    });

    // Notify owner
    const statusMsg =
      status === 'APPROVED'
        ? `Quán ăn "${updated.name}" của bạn đã được phê duyệt và hiển thị công khai trên FoodVibe!`
        : `Quán ăn "${updated.name}" chưa được phê duyệt. Lý do: ${rejectReason || 'Thông tin chưa đầy đủ'}`;

    await prisma.notification.create({
      data: {
        userId: updated.ownerId,
        title: status === 'APPROVED' ? 'Quán ăn đã được phê duyệt 🎉' : 'Thông báo về quán ăn của bạn',
        message: statusMsg,
        type: 'RESTAURANT_STATUS',
        link: `/restaurants/${updated.id}`,
      },
    });

    return NextResponse.json({ success: true, restaurant: updated });
  } catch (error: any) {
    console.error('Lỗi duyệt quán:', error);
    return NextResponse.json({ error: 'Không thể cập nhật trạng thái quán' }, { status: 500 });
  }
}
