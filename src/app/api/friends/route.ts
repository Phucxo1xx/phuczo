import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';

    // Search people if query provided
    let searchResults: any[] = [];
    if (q) {
      searchResults = await prisma.user.findMany({
        where: {
          id: { not: user.id },
          OR: [
            { name: { contains: q } },
            { email: { contains: q } },
          ],
        },
        select: { id: true, name: true, email: true, avatar: true, bio: true },
        take: 10,
      });
    }

    // Friendships where user is requester or receiver
    const sent = await prisma.friendship.findMany({
      where: { requesterId: user.id },
      include: {
        receiver: {
          select: { id: true, name: true, email: true, avatar: true, bio: true },
        },
      },
    });

    const received = await prisma.friendship.findMany({
      where: { receiverId: user.id },
      include: {
        requester: {
          select: { id: true, name: true, email: true, avatar: true, bio: true },
        },
      },
    });

    const friends = [
      ...sent.filter((f) => f.status === 'ACCEPTED').map((f) => ({
        friendshipId: f.id,
        user: f.receiver,
        since: f.updatedAt,
      })),
      ...received.filter((f) => f.status === 'ACCEPTED').map((f) => ({
        friendshipId: f.id,
        user: f.requester,
        since: f.updatedAt,
      })),
    ];

    const pendingReceived = received.filter((f) => f.status === 'PENDING').map((f) => ({
      friendshipId: f.id,
      user: f.requester,
      sentAt: f.createdAt,
    }));

    const pendingSent = sent.filter((f) => f.status === 'PENDING').map((f) => ({
      friendshipId: f.id,
      user: f.receiver,
      sentAt: f.createdAt,
    }));

    return NextResponse.json({
      friends,
      pendingReceived,
      pendingSent,
      searchResults,
    });
  } catch (error: any) {
    console.error('Lỗi lấy danh sách bạn bè:', error);
    return NextResponse.json({ error: 'Lỗi tải danh sách bạn bè' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { receiverId } = await req.json();
    if (!receiverId || receiverId === user.id) {
      return NextResponse.json({ error: 'Người nhận không hợp lệ' }, { status: 400 });
    }

    // Check if relationship already exists
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: user.id, receiverId },
          { requesterId: receiverId, receiverId: user.id },
        ],
      },
    });

    if (existing) {
      if (existing.status === 'ACCEPTED') {
        return NextResponse.json({ error: 'Hai bạn đã là bạn bè của nhau' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Lời mời kết bạn đã tồn tại hoặc đang chờ xử lý' }, { status: 400 });
    }

    const friendship = await prisma.friendship.create({
      data: {
        requesterId: user.id,
        receiverId,
        status: 'PENDING',
      },
    });

    // Notify receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        title: 'Lời mời kết bạn mới',
        message: `${user.name} đã gửi lời mời kết bạn đến bạn.`,
        type: 'FRIEND_REQUEST',
        link: '/friends',
      },
    });

    return NextResponse.json({ success: true, friendship });
  } catch (error: any) {
    console.error('Lỗi gửi kết bạn:', error);
    return NextResponse.json({ error: 'Không thể gửi kết bạn' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { friendshipId, action } = await req.json();
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
      include: { requester: true, receiver: true },
    });

    if (!friendship || friendship.receiverId !== user.id) {
      return NextResponse.json({ error: 'Lời mời không hợp lệ' }, { status: 404 });
    }

    if (action === 'ACCEPT') {
      await prisma.friendship.update({
        where: { id: friendshipId },
        data: { status: 'ACCEPTED' },
      });

      // Notify requester
      await prisma.notification.create({
        data: {
          userId: friendship.requesterId,
          title: 'Đã chấp nhận kết bạn 🎉',
          message: `${user.name} đã đồng ý lời mời kết bạn của bạn! Giờ hãy rủ nhau đi ăn thôi!`,
          type: 'FRIEND_ACCEPTED',
          link: '/friends',
        },
      });

      return NextResponse.json({ success: true, message: 'Đã chấp nhận lời mời kết bạn!' });
    } else {
      await prisma.friendship.delete({
        where: { id: friendshipId },
      });
      return NextResponse.json({ success: true, message: 'Đã từ chối lời mời kết bạn' });
    }
  } catch (error: any) {
    console.error('Lỗi xử lý kết bạn:', error);
    return NextResponse.json({ error: 'Không thể xử lý' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const friendshipId = searchParams.get('id');

    if (!friendshipId) return NextResponse.json({ error: 'Thiếu id bạn bè' }, { status: 400 });

    const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });
    if (!friendship || (friendship.requesterId !== user.id && friendship.receiverId !== user.id)) {
      return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
    }

    await prisma.friendship.delete({ where: { id: friendshipId } });
    return NextResponse.json({ success: true, message: 'Đã huỷ kết bạn' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
