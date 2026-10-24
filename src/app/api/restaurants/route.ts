import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const city = searchParams.get('city') || '';
    const price = searchParams.get('price') || '';
    const sort = searchParams.get('sort') || 'rating';
    const ownerOnly = searchParams.get('ownerOnly') === 'true';

    const currentUser = await getCurrentUser();

    // If ownerOnly requested
    if (ownerOnly) {
      if (!currentUser) {
        return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
      }
      const myRestaurants = await prisma.restaurant.findMany({
        where: { ownerId: currentUser.id },
        include: {
          dishes: true,
          reviews: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ restaurants: myRestaurants });
    }

    // Public listing: only APPROVED
    const whereClause: any = {
      status: 'APPROVED',
    };

    if (q) {
      whereClause.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { address: { contains: q } },
        {
          dishes: {
            some: {
              name: { contains: q },
            },
          },
        },
      ];
    }

    if (city) {
      whereClause.city = { contains: city };
    }

    if (price) {
      whereClause.priceRange = price;
    }

    if (category) {
      whereClause.dishes = {
        some: {
          category: { contains: category },
        },
      };
    }

    const restaurants = await prisma.restaurant.findMany({
      where: whereClause,
      include: {
        dishes: true,
        reviews: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        owner: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute average ratings
    const withStats = restaurants.map((r) => {
      const totalReviews = r.reviews.length;
      const avgRating =
        totalReviews > 0
          ? Number((r.reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1))
          : 5.0;
      return {
        ...r,
        avgRating,
        totalReviews,
      };
    });

    if (sort === 'rating') {
      withStats.sort((a, b) => b.avgRating - a.avgRating);
    } else if (sort === 'popular') {
      withStats.sort((a, b) => b.totalReviews - a.totalReviews);
    }

    return NextResponse.json({ restaurants: withStats });
  } catch (error: any) {
    console.error('Lỗi lấy danh sách quán:', error);
    return NextResponse.json({ error: 'Lỗi tải danh sách quán ăn' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập để thực hiện' }, { status: 401 });
    }

    if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Chỉ tài khoản Chủ quán ăn hoặc Admin mới có quyền tạo địa điểm quán' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, description, address, city, district, phone, openingHours, priceRange, coverImage, images } = body;

    if (!name || !description || !address || !coverImage) {
      return NextResponse.json({ error: 'Vui lòng cung cấp đủ tên quán, mô tả, địa chỉ và ảnh đại diện' }, { status: 400 });
    }

    const initialStatus = user.role === 'ADMIN' ? 'APPROVED' : 'PENDING';

    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        description,
        address,
        city: city || 'Hà Nội',
        district: district || null,
        phone: phone || null,
        openingHours: openingHours || '08:00 - 22:00',
        priceRange: priceRange || '$$',
        coverImage,
        images: Array.isArray(images) ? JSON.stringify(images) : JSON.stringify([coverImage]),
        status: initialStatus,
        ownerId: user.id,
      },
    });

    // Notify Admins about new restaurant awaiting approval
    if (initialStatus === 'PENDING') {
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            title: 'Quán ăn mới chờ phê duyệt',
            message: `Chủ quán ${user.name} vừa đăng ký quán "${name}".`,
            type: 'RESTAURANT_STATUS',
            link: '/admin',
          },
        });
      }
    }

    return NextResponse.json({ success: true, restaurant });
  } catch (error: any) {
    console.error('Lỗi tạo quán ăn:', error);
    return NextResponse.json({ error: 'Không thể tạo địa điểm quán' }, { status: 500 });
  }
}
