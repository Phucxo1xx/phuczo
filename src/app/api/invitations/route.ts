import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const received = await prisma.eatInvitation.findMany({
      where: { receiverId: user.id },
      include: {
        sender: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        restaurant: {
          select: { id: true, name: true, address: true, coverImage: true, phone: true },
        },
        dish: {
          select: { id: true, name: true, price: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const sent = await prisma.eatInvitation.findMany({
      where: { senderId: user.id },
      include: {
        receiver: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        restaurant: {
          select: { id: true, name: true, address: true, coverImage: true, phone: true },
        },
        dish: {
          select: { id: true, name: true, price: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ received, sent });
  } catch (error: any) {
    console.error('Lỗi lấy lời mời đi ăn:', error);
    return NextResponse.json({ error: 'Lỗi tải danh sách lời mời' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập để gửi lời mời' }, { status: 401 });
    }

    const body = await req.json();
    const { receiverId, restaurantId, dishId, proposedTime, note } = body;

    if (!receiverId || !restaurantId || !proposedTime) {
      return NextResponse.json({ error: 'Vui lòng chọn bạn bè, quán ăn và thời gian hẹn' }, { status: 400 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Không tìm thấy quán ăn' }, { status: 404 });
    }

    const invitation = await prisma.eatInvitation.create({
      data: {
        senderId: user.id,
        receiverId,
        restaurantId,
        dishId: dishId || null,
        proposedTime: new Date(proposedTime),
        note: note || '',
        status: 'PENDING',
      },
      include: {
        sender: { select: { name: true } },
        restaurant: { select: { name: true } },
        dish: { select: { name: true } },
      },
    });

    // Notify receiver
    const dishPart = invitation.dish?.name ? ` ăn món "${invitation.dish.name}" tại` : ' đi ăn tại';
    await prisma.notification.create({
      data: {
        userId: receiverId,
        title: 'Kèo ăn mới! 🍜',
        message: `${user.name} vừa rủ bạn${dishPart} quán "${restaurant.name}"!`,
        type: 'INVITATION',
        link: '/invitations',
      },
    });

    return NextResponse.json({ success: true, invitation });
  } catch (error: any) {
    console.error('Lỗi tạo lời mời:', error);
    return NextResponse.json({ error: 'Không thể tạo lời mời' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const body = await req.json();
    const { invitationId, status } = body;

    if (!invitationId || !['ACCEPTED', 'DECLINED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ error: 'Trạng thái không hợp lệ' }, { status: 400 });
    }

    const invitation = await prisma.eatInvitation.findUnique({
      where: { id: invitationId },
      include: {
        sender: true,
        receiver: true,
        restaurant: true,
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Không tìm thấy lời mời' }, { status: 404 });
    }

    // If receiver responding
    if (invitation.receiverId === user.id) {
      const updated = await prisma.eatInvitation.update({
        where: { id: invitationId },
        data: { status },
      });

      // Notify sender
      const statusText = status === 'ACCEPTED' ? 'đã ĐỒNG Ý đi ăn cùng bạn 🎉' : 'đã từ chối lời mời đi ăn';
      await prisma.notification.create({
        data: {
          userId: invitation.senderId,
          title: status === 'ACCEPTED' ? 'Kèo đi ăn thành công! 🎉' : 'Phản hồi lời mời đi ăn',
          message: `${user.name} ${statusText} tại "${invitation.restaurant.name}".`,
          type: 'INVITATION_STATUS',
          link: '/invitations',
        },
      });

      return NextResponse.json({ success: true, invitation: updated });
    }

    // If sender canceling
    if (invitation.senderId === user.id && status === 'CANCELLED') {
      const updated = await prisma.eatInvitation.update({
        where: { id: invitationId },
        data: { status: 'CANCELLED' },
      });
      return NextResponse.json({ success: true, invitation: updated });
    }

    return NextResponse.json({ error: 'Không có quyền thao tác' }, { status: 403 });
  } catch (error: any) {
    console.error('Lỗi phản hồi lời mời:', error);
    return NextResponse.json({ error: 'Không thể cập nhật trạng thái' }, { status: 500 });
  }
}
