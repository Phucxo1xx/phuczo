import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || '';
    const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!, 10) : null;
    const city = searchParams.get('city') || '';

    const whereDish: any = {
      isAvailable: true,
      restaurant: {
        status: 'APPROVED',
      },
    };

    if (category && category !== 'Tất cả') {
      whereDish.category = { contains: category };
    }

    if (maxPrice) {
      whereDish.price = { lte: maxPrice };
    }

    if (city && city !== 'Tất cả') {
      whereDish.restaurant.city = { contains: city };
    }

    const dishes = await prisma.dish.findMany({
      where: whereDish,
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            coverImage: true,
            reviews: {
              select: { rating: true },
            },
          },
        },
      },
    });

    const formattedDishes = dishes.map((d) => {
      const revs = d.restaurant.reviews;
      const avgRating =
        revs.length > 0
          ? Number((revs.reduce((a, b) => a + b.rating, 0) / revs.length).toFixed(1))
          : 5.0;
      return {
        id: d.id,
        name: d.name,
        description: d.description,
        price: d.price,
        image: d.image || d.restaurant.coverImage,
        category: d.category,
        restaurantId: d.restaurant.id,
        restaurantName: d.restaurant.name,
        restaurantAddress: d.restaurant.address,
        restaurantCity: d.restaurant.city,
        restaurantRating: avgRating,
      };
    });

    return NextResponse.json({ dishes: formattedDishes });
  } catch (error: any) {
    console.error('Lỗi lấy món ăn ngẫu nhiên:', error);
    return NextResponse.json({ error: 'Không thể tải danh sách món ăn' }, { status: 500 });
  }
}
