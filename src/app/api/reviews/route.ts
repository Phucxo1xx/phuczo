import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập để đăng bài đánh giá' }, { status: 401 });
    }

    const body = await req.json();
    const { restaurantId, rating, content, images } = body;

    if (!restaurantId || !rating || !content) {
      return NextResponse.json({ error: 'Vui lòng chọn số sao đánh giá và nhập nội dung chia sẻ' }, { status: 400 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Quán ăn không tồn tại' }, { status: 404 });
    }

    const review = await prisma.review.create({
      data: {
        restaurantId,
        userId: user.id,
        rating: Math.max(1, Math.min(5, parseInt(rating.toString(), 10))),
        content: content.trim(),
        images: Array.isArray(images) ? JSON.stringify(images) : '[]',
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Notify restaurant owner
    if (restaurant.ownerId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: restaurant.ownerId,
          title: 'Review mới cho quán của bạn',
          message: `${user.name} vừa để lại đánh giá ${rating}⭐ cho quán "${restaurant.name}".`,
          type: 'SYSTEM',
          link: `/restaurants/${restaurant.id}`,
        },
      });
    }

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    console.error('Lỗi đăng review:', error);
    return NextResponse.json({ error: 'Không thể đăng đánh giá' }, { status: 500 });
  }
}
