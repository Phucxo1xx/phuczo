'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Filter,
  Star,
  MapPin,
  Utensils,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';

function RestaurantsContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';

  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);
  const [city, setCity] = useState('');
  const [price, setPrice] = useState('');
  const [sort, setSort] = useState('rating');

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (category) params.append('category', category);
      if (city) params.append('city', city);
      if (price) params.append('price', price);
      if (sort) params.append('sort', sort);

      const res = await fetch(`/api/restaurants?${params.toString()}`);
      const data = await res.json();
      setRestaurants(data.restaurants || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [category, city, price, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRestaurants();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
          Khám Phá Quán Ăn & Ẩm Thực
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Hàng trăm quán ăn uy tín đã qua kiểm duyệt với review chân thực từ cộng đồng.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm space-y-4">
        {/* Search input form */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo tên quán ăn, tên món (phở, bún đậu, nem...), địa chỉ..."
              className="w-full pl-11 pr-4 py-2.5 text-sm bg-zinc-50 rounded-xl border border-zinc-200 focus:bg-white focus:border-brand-500 focus:outline-none transition"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl transition shadow-sm"
          >
            Tìm kiếm
          </button>
        </form>

        {/* Filters Grid */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-100 text-xs">
          {/* Category */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-zinc-400 uppercase tracking-wider">Danh mục:</span>
            {['Tất cả', 'Bún/Phở', 'Cơm', 'Lẩu & Nướng', 'Đồ ăn vặt', 'Đồ uống/Trà sữa'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c === 'Tất cả' ? '' : c)}
                className={`px-3 py-1 rounded-full font-semibold transition ${
                  (c === 'Tất cả' && !category) || category === c
                    ? 'bg-brand-600 text-white'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* City & Price & Sort */}
          <div className="flex items-center gap-3 ml-auto flex-wrap">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-zinc-100 border border-zinc-200 font-semibold focus:outline-none"
            >
              <option value="">Tất cả tỉnh thành</option>
              <option value="Hà Nội">Hà Nội</option>
              <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
              <option value="Đà Nẵng">Đà Nẵng</option>
            </select>

            <select
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-zinc-100 border border-zinc-200 font-semibold focus:outline-none"
            >
              <option value="">Mọi mức giá</option>
              <option value="$">Bình dân ($)</option>
              <option value="$$">Vừa phải ($$)</option>
              <option value="$$$">Cao cấp ($$$)</option>
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-zinc-100 border border-zinc-200 font-semibold focus:outline-none"
            >
              <option value="rating">Đánh giá cao nhất</option>
              <option value="popular">Nhiều review nhất</option>
              <option value="newest">Mới nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Listing */}
      {loading ? (
        <div className="text-center py-20 text-zinc-400 font-medium">
          Đang tải danh sách quán ăn...
        </div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-zinc-200 p-8 space-y-3">
          <Utensils className="w-12 h-12 text-zinc-300 mx-auto" />
          <h3 className="text-base font-bold text-zinc-800">Không tìm thấy quán ăn phù hợp</h3>
          <p className="text-xs text-zinc-500">
            Hãy thử tìm kiếm với từ khoá khác hoặc bỏ các bộ lọc đã chọn.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((rest) => (
            <Link
              key={rest.id}
              href={`/restaurants/${rest.id}`}
              className="group bg-white rounded-2xl overflow-hidden border border-zinc-200/80 hover:border-brand-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
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
                    <span className="text-zinc-400 font-normal">({rest.totalReviews})</span>
                  </div>
                  <div className="absolute top-3 right-3 bg-zinc-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-sm">
                    {rest.priceRange || '$$'}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-2">
                  <h3 className="text-lg font-bold text-zinc-900 group-hover:text-brand-600 transition truncate">
                    {rest.name}
                  </h3>
                  <p className="text-xs text-zinc-500 flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                    <span>{rest.address}</span>
                  </p>
                  <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                    {rest.description}
                  </p>
                </div>
              </div>

              {/* Bottom footer */}
              <div className="px-5 py-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                <span className="font-semibold text-zinc-700">
                  {rest.dishes?.length || 0} món trong thực đơn
                </span>
                <span className="font-bold text-brand-600 group-hover:translate-x-0.5 transition flex items-center gap-0.5">
                  Xem quán <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RestaurantsDirectoryPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-zinc-400">Đang tải trang khám phá quán...</div>}>
      <RestaurantsContent />
    </Suspense>
  );
}
