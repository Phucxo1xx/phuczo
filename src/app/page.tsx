import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import {
  Utensils,
  Star,
  MapPin,
  Dice5,
  Users,
  CalendarHeart,
  ChevronRight,
  ShieldCheck,
  Camera,
  TrendingUp,
} from 'lucide-react';
import { formatVND } from '@/lib/utils';

export const revalidate = 0; // Dynamic

export default async function HomePage() {
  // Fetch approved restaurants
  const restaurants = await prisma.restaurant.findMany({
    where: { status: 'APPROVED' },
    include: {
      dishes: true,
      reviews: {
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      },
    },
    take: 6,
    orderBy: { createdAt: 'desc' },
  });

  // Calculate ratings
  const restaurantsWithRating = restaurants.map((r) => {
    const total = r.reviews.length;
    const avg =
      total > 0
        ? Number((r.reviews.reduce((acc, curr) => acc + curr.rating, 0) / total).toFixed(1))
        : 5.0;
    return {
      ...r,
      avgRating: avg,
      reviewCount: total,
    };
  });

  // Fetch recent reviews with images
  const recentReviews = await prisma.review.findMany({
    where: {
      restaurant: { status: 'APPROVED' },
    },
    include: {
      user: { select: { name: true, avatar: true } },
      restaurant: { select: { id: true, name: true, address: true } },
    },
    take: 3,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-orange-50/30 to-white pt-16 pb-20 border-b border-orange-100/60">
        <div className="absolute inset-0 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.07] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 text-brand-800 text-xs font-bold shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-brand-600 animate-ping" />
              Cộng đồng Đánh giá Ẩm thực Chân thực & Minh bạch
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-zinc-900 tracking-tight leading-[1.15]">
              Tìm Quán Ăn Ngon,{' '}
              <span className="bg-gradient-to-r from-brand-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                Review Chuẩn Vị
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
              Khám phá các quán ăn thực tế với hình ảnh do chính thực khách chụp lại,
              quay roulette chọn món giải cứu bữa trưa và rủ bạn bè cùng thưởng thức!
            </p>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/trua-nay-an-gi"
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-700 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition"
              >
                <Dice5 className="w-5 h-5 animate-spin-slow" />
                <span>Trưa Nay Ăn Gì? (Quay Roulette CS:GO)</span>
              </Link>
              <Link
                href="/restaurants"
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 font-bold text-sm shadow-sm hover:shadow transition"
              >
                <Utensils className="w-4 h-4 text-brand-600" />
                <span>Khám phá Quán Ăn</span>
              </Link>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              {['Bún/Phở', 'Cơm', 'Lẩu & Nướng', 'Đồ ăn vặt', 'Đồ uống/Trà sữa'].map((cat) => (
                <Link
                  key={cat}
                  href={`/restaurants?category=${encodeURIComponent(cat)}`}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white border border-zinc-200 hover:border-brand-500 hover:text-brand-600 transition shadow-2xl"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlight: "Trưa nay ăn gì" Roulette Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white p-8 sm:p-12 shadow-2xl border border-zinc-700">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider">
                <Dice5 className="w-4 h-4" />
                <span>Tính Năng Độc Đáo Lấy Cảm Hứng Từ Truanayangi</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                Không Biết Ăn Gì? Hãy Để <span className="text-brand-500">FoodVibe Mở Hòm!</span>
              </h2>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                Mô phỏng cơ chế cuộn dải roulette mở hòm phong cách CS:GO đầy kịch tính với âm thanh sống động.
                Tự động chọn ngẫu nhiên món ăn từ thực đơn của các quán ăn có thật gần bạn, kèm giá tiền và nút rủ bạn bè đi ăn ngay lập tức!
              </p>
              <div className="pt-2">
                <Link
                  href="/trua-nay-an-gi"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-lg shadow-brand-500/30 transition hover:scale-105"
                >
                  <Dice5 className="w-5 h-5" />
                  <span>Quay Roulette Ngay Bây Giờ</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm p-4 bg-zinc-800/80 rounded-2xl border border-zinc-700 backdrop-blur shadow-2xl space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-700/80 pb-2">
                  <span className="font-bold text-amber-400">🎲 Vòng Quay Ẩm Thực</span>
                  <span className="font-mono">Live Food Roulette</span>
                </div>
                <div className="relative h-28 rounded-xl overflow-hidden bg-zinc-950 flex items-center justify-center border border-zinc-700">
                  <img
                    src="https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=500"
                    alt="Phở bò"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                  <div className="absolute bottom-2 left-3 right-3 text-left">
                    <p className="text-xs font-bold text-white truncate">Phở Tái Lăn Lò Đúc</p>
                    <p className="text-[11px] text-amber-400 font-bold">70.000 ₫ • Phở Thìn Lò Đúc</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                  <span>Trúng thưởng ngay món ăn hôm nay!</span>
                  <span className="text-brand-400 font-bold">Mở Hòm 🎯</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-brand-600 text-xs font-bold uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Địa Điểm Được Yêu Thích</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900">
              Quán Ăn Nổi Bật & Đã Kiểm Duyệt
            </h2>
          </div>
          <Link
            href="/restaurants"
            className="flex items-center gap-1 text-sm font-bold text-brand-600 hover:text-brand-700 group"
          >
            <span>Xem tất cả quán ăn</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurantsWithRating.map((rest) => (
            <Link
              key={rest.id}
              href={`/restaurants/${rest.id}`}
              className="group bg-white rounded-2xl overflow-hidden border border-zinc-200/80 hover:border-brand-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Cover Image */}
              <div className="relative h-48 w-full overflow-hidden bg-zinc-100">
                <img
                  src={rest.coverImage}
                  alt={rest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-zinc-800 flex items-center gap-1 shadow-sm">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{rest.avgRating}</span>
                  <span className="text-zinc-400 font-normal">({rest.reviewCount})</span>
                </div>
                <div className="absolute top-3 right-3 bg-zinc-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-sm">
                  {rest.priceRange || '$$'}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 group-hover:text-brand-600 transition truncate">
                    {rest.name}
                  </h3>
                  <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1 truncate">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                    <span>{rest.address}</span>
                  </p>
                  <p className="text-xs text-zinc-600 line-clamp-2 mt-2 leading-relaxed">
                    {rest.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                  <span className="font-semibold text-zinc-700">
                    {rest.dishes.length} món trong menu
                  </span>
                  <span className="font-bold text-brand-600 group-hover:underline">
                    Xem chi tiết →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Community Real Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-brand-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Camera className="w-4 h-4" />
            <span>Hình Ảnh Thực Tế & Trải Nghiệm</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900">
            Đánh Giá Mới Nhất Từ Thực Khách
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Mọi bài viết đều được tự do đăng tải và minh bạch, kèm hình ảnh chụp thật tại quán.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentReviews.map((rev) => {
            let images: string[] = [];
            try {
              images = JSON.parse(rev.images || '[]');
            } catch {
              images = [];
            }

            return (
              <div
                key={rev.id}
                className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* User info & Stars */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={rev.user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${rev.user.name}`}
                        alt={rev.user.name}
                        className="w-9 h-9 rounded-full object-cover border border-zinc-100"
                      />
                      <div>
                        <p className="text-xs font-bold text-zinc-900">{rev.user.name}</p>
                        <p className="text-[10px] text-zinc-400">Đã ghé thăm</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-zinc-200 text-zinc-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Review Content */}
                  <p className="text-xs text-zinc-600 leading-relaxed italic line-clamp-3">
                    "{rev.content}"
                  </p>

                  {/* Review Photos */}
                  {images.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt="Ảnh thực tế"
                          className="w-20 h-20 rounded-xl object-cover shrink-0 border border-zinc-100 shadow-sm"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Target Restaurant Link */}
                <div className="pt-3 border-t border-zinc-100">
                  <Link
                    href={`/restaurants/${rev.restaurant.id}`}
                    className="text-xs font-bold text-zinc-800 hover:text-brand-600 flex items-center justify-between"
                  >
                    <span className="truncate">{rev.restaurant.name}</span>
                    <span className="text-brand-600 shrink-0">Ghé xem →</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Social & "Rủ nhau đi ăn" Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-3xl p-8 sm:p-12 border border-orange-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-200/60 text-brand-800 text-xs font-bold">
              <CalendarHeart className="w-4 h-4 text-brand-600" />
              <span>Ăn Một Mình Buồn Lắm?</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-zinc-900">
              Kết Bạn & Rủ Nhau Đi Ăn Dễ Dàng
            </h3>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Bạn tìm thấy một món ăn ưng ý nhưng không muốn đi một mình? Hãy bấm nút{' '}
              <strong>"Rủ bạn đi ăn"</strong>, chọn bạn bè, set giờ hẹn và gửi lời mời ngay trên FoodVibe!
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/friends"
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition"
              >
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  Tìm Bạn Bè Ngay
                </span>
              </Link>
              <Link
                href="/invitations"
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 font-bold text-xs border border-zinc-300 transition"
              >
                Xem Hộp Thư Lời Mời Đi Ăn
              </Link>
            </div>
          </div>

          <div className="w-full max-w-sm bg-white p-5 rounded-2xl shadow-xl border border-orange-200 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                🍜
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-900">Lời mời ăn trưa: Phở Thìn</p>
                <p className="text-[11px] text-zinc-400">Hôm nay • 12:00 Trưa</p>
              </div>
            </div>
            <div className="bg-orange-50/70 p-3 rounded-xl text-xs text-zinc-700 italic border border-orange-100">
              "Trưa nay rủ cậu đi ăn bát Phở Tái Lăn nóng hổi nhé, tớ bao đĩa quẩy giòn!"
            </div>
            <div className="flex gap-2 pt-1">
              <button className="flex-1 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-lg">
                Đồng ý 🎉
              </button>
              <button className="flex-1 py-1.5 text-xs font-bold text-zinc-600 bg-zinc-100 rounded-lg">
                Từ chối
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
