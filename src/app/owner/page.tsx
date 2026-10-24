'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Store,
  PlusCircle,
  Utensils,
  Upload,
  Clock,
  Phone,
  MapPin,
  CheckCircle,
  Clock3,
  XCircle,
  Trash2,
  Edit,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { formatVND } from '@/lib/utils';
import Link from 'next/link';

export default function OwnerPortalPage() {
  const { user, isLoading } = useAuth();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for creating restaurant
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCity, setFormCity] = useState('Hà Nội');
  const [formPhone, setFormPhone] = useState('');
  const [formHours, setFormHours] = useState('08:00 - 22:00');
  const [formPriceRange, setFormPriceRange] = useState('$$');
  const [formCoverImage, setFormCoverImage] = useState('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [createMsg, setCreateMsg] = useState<{ isError?: boolean; text: string } | null>(null);

  // Dish management state for selected restaurant
  const [activeRestId, setActiveRestId] = useState<string | null>(null);
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [dishName, setDishName] = useState('');
  const [dishDesc, setDishDesc] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [dishCategory, setDishCategory] = useState('Cơm');
  const [dishImage, setDishImage] = useState('');
  const [dishMsg, setDishMsg] = useState<{ isError?: boolean; text: string } | null>(null);

  const fetchMyRestaurants = async () => {
    try {
      const res = await fetch('/api/restaurants?ownerOnly=true');
      const data = await res.json();
      if (res.ok) {
        setRestaurants(data.restaurants || []);
        if (data.restaurants?.length > 0 && !activeRestId) {
          setActiveRestId(data.restaurants[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyRestaurants();
    }
  }, [user]);

  // Upload photo handler
  const handleFileUpload = async (file: File, type: 'cover' | 'gallery' | 'dish') => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        if (type === 'cover') setFormCoverImage(data.url);
        else if (type === 'gallery') setFormImages((prev) => [...prev, data.url]);
        else if (type === 'dish') setDishImage(data.url);
      }
    } catch (e) {
      console.error('Lỗi tải ảnh:', e);
    } finally {
      setUploadingImage(false);
    }
  };

  // Submit Create Restaurant
  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateMsg(null);

    const cover = formCoverImage || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800';

    try {
      const res = await fetch('/api/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          description: formDesc,
          address: formAddress,
          city: formCity,
          phone: formPhone,
          openingHours: formHours,
          priceRange: formPriceRange,
          coverImage: cover,
          images: formImages.length > 0 ? formImages : [cover],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCreateMsg({ isError: true, text: data.error || 'Có lỗi xảy ra' });
      } else {
        setCreateMsg({ isError: false, text: 'Tạo quán thành công! Quán đang được gửi đến Admin để phê duyệt.' });
        setShowCreateModal(false);
        // Reset form
        setFormName('');
        setFormDesc('');
        setFormAddress('');
        setFormPhone('');
        fetchMyRestaurants();
      }
    } catch {
      setCreateMsg({ isError: true, text: 'Lỗi kết nối máy chủ' });
    }
  };

  // Submit Add Dish
  const handleAddDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRestId) return;

    setDishMsg(null);
    try {
      const res = await fetch(`/api/restaurants/${activeRestId}/dishes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: dishName,
          description: dishDesc,
          price: parseInt(dishPrice, 10),
          category: dishCategory,
          image: dishImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setDishMsg({ isError: true, text: data.error || 'Không thể thêm món' });
      } else {
        setShowAddDishModal(false);
        setDishName('');
        setDishDesc('');
        setDishPrice('');
        setDishImage('');
        fetchMyRestaurants();
      }
    } catch {
      setDishMsg({ isError: true, text: 'Lỗi máy chủ' });
    }
  };

  // Delete Dish
  const handleDeleteDish = async (dishId: string) => {
    if (!confirm('Bạn có chắc muốn xoá món ăn này khỏi menu?')) return;
    try {
      const res = await fetch(`/api/dishes/${dishId}`, { method: 'DELETE' });
      if (res.ok) fetchMyRestaurants();
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return <div className="text-center py-20 text-zinc-400">Đang tải thông tin...</div>;
  }

  if (!user || (user.role !== 'OWNER' && user.role !== 'ADMIN')) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-zinc-200 text-center space-y-4 shadow-sm">
        <Store className="w-12 h-12 text-zinc-400 mx-auto" />
        <h2 className="text-xl font-bold text-zinc-900">Khu Vực Dành Cho Chủ Quán Ăn</h2>
        <p className="text-xs text-zinc-500">
          Tài khoản của bạn cần được đăng ký với vai trò Chủ Quán để có quyền tạo và quản lý quán ăn & thực đơn.
        </p>
        <Link
          href="/register?role=OWNER"
          className="inline-block px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs"
        >
          Đăng ký tài khoản Chủ Quán
        </Link>
      </div>
    );
  }

  const activeRestaurant = restaurants.find((r) => r.id === activeRestId) || restaurants[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 flex items-center gap-2.5">
            <Store className="w-8 h-8 text-brand-600" />
            <span>Khu Vực Quản Lý Quán Ăn</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Tạo địa điểm quán, cập nhật hình ảnh, thông tin địa chỉ và quản lý thực đơn món ăn.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-700 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-brand-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tạo Quán Ăn Mới</span>
        </button>
      </div>

      {createMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            createMsg.isError
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{createMsg.text}</span>
        </div>
      )}

      {/* Main Grid: List of Owned Eateries & Menu Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Owned restaurants list */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
            Danh sách quán của bạn ({restaurants.length})
          </h3>

          {loading ? (
            <div className="text-xs text-zinc-400 py-8">Đang tải...</div>
          ) : restaurants.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 text-center space-y-3">
              <p className="text-xs text-zinc-500">Bạn chưa tạo quán ăn nào.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-xs font-bold text-brand-600 hover:underline"
              >
                + Bấm vào đây để tạo quán đầu tiên
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {restaurants.map((rest) => {
                const isSelected = activeRestId === rest.id;
                return (
                  <button
                    key={rest.id}
                    onClick={() => setActiveRestId(rest.id)}
                    className={`w-full p-4 rounded-2xl border text-left transition flex gap-3.5 items-center ${
                      isSelected
                        ? 'bg-brand-50/70 border-brand-500 ring-2 ring-brand-500/20'
                        : 'bg-white border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <img
                      src={rest.coverImage}
                      alt={rest.name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-sm font-bold text-zinc-900 truncate">{rest.name}</h4>
                        {/* Status Badge */}
                        {rest.status === 'APPROVED' ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 shrink-0">
                            <CheckCircle className="w-3 h-3" /> Đã duyệt
                          </span>
                        ) : rest.status === 'PENDING' ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 flex items-center gap-1 shrink-0">
                            <Clock3 className="w-3 h-3" /> Chờ duyệt
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-100 text-red-800 flex items-center gap-1 shrink-0">
                            <XCircle className="w-3 h-3" /> Từ chối
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 truncate mt-0.5">{rest.address}</p>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        {rest.dishes?.length || 0} món • {rest.reviews?.length || 0} reviews
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Active Restaurant Details & Menu Management */}
        <div className="lg:col-span-8 space-y-6">
          {activeRestaurant ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-sm space-y-6">
              {/* Header card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-zinc-900">
                      {activeRestaurant.name}
                    </h2>
                    {activeRestaurant.status === 'APPROVED' && (
                      <Link
                        href={`/restaurants/${activeRestaurant.id}`}
                        className="text-xs font-bold text-brand-600 hover:underline"
                      >
                        (Xem trang công khai ↗)
                      </Link>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{activeRestaurant.address}, {activeRestaurant.city}</span>
                  </p>
                </div>

                <button
                  onClick={() => setShowAddDishModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Thêm Món Ăn Vào Menu</span>
                </button>
              </div>

              {/* Status Alert if Pending */}
              {activeRestaurant.status === 'PENDING' && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Clock3 className="w-4 h-4 text-amber-600" />
                    Quán đang trong hàng chờ phê duyệt của Ban Quản Trị
                  </p>
                  <p>
                    Admin sẽ kiểm tra tính xác thực của quán. Sau khi được duyệt, quán sẽ lập tức hiển thị công khai trên FoodVibe và tham gia vào vòng quay Roulette "Trưa Nay Ăn Gì"!
                  </p>
                </div>
              )}

              {/* Dishes list */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                    Thực Đơn Món Ăn ({activeRestaurant.dishes?.length || 0})
                  </h3>
                </div>

                {activeRestaurant.dishes?.length === 0 ? (
                  <div className="p-8 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 space-y-2">
                    <Utensils className="w-8 h-8 text-zinc-300 mx-auto" />
                    <p className="text-xs text-zinc-500">Quán chưa có món ăn nào trong thực đơn.</p>
                    <button
                      onClick={() => setShowAddDishModal(true)}
                      className="text-xs font-bold text-brand-600 hover:underline"
                    >
                      + Thêm món ăn đầu tiên ngay
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {activeRestaurant.dishes.map((dish: any) => (
                      <div
                        key={dish.id}
                        className="p-3.5 rounded-2xl border border-zinc-200 flex items-center justify-between gap-3 bg-zinc-50/50"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={dish.image || activeRestaurant.coverImage}
                            alt=""
                            className="w-14 h-14 rounded-xl object-cover shrink-0 border border-zinc-200"
                          />
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-brand-600 uppercase">
                              {dish.category}
                            </span>
                            <h5 className="text-xs font-bold text-zinc-900 truncate">
                              {dish.name}
                            </h5>
                            <p className="text-xs font-black text-amber-600">
                              {formatVND(dish.price)}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteDish(dish.id)}
                          title="Xoá món"
                          className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-zinc-400">
              Chọn quán để quản lý thông tin và thực đơn.
            </div>
          )}
        </div>
      </div>

      {/* CREATE RESTAURANT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-zinc-900">Đăng Ký Địa Điểm Quán Ăn Mới</h3>
                <p className="text-xs text-zinc-500">
                  Thông tin sau khi tạo sẽ được gửi đến Admin để kiểm duyệt
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-zinc-400 hover:text-zinc-600 rounded-full"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRestaurant} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Tên quán ăn *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ví dụ: Bún Chả Nướng Hàng Mành"
                  className="w-full text-sm border border-zinc-200 rounded-xl p-2.5 bg-zinc-50 focus:bg-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Mô tả về quán *</label>
                <textarea
                  rows={3}
                  required
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Giới thiệu về hương vị đặc trưng, không gian, lịch sử quán..."
                  className="w-full text-sm border border-zinc-200 rounded-xl p-2.5 bg-zinc-50 focus:bg-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Địa chỉ chi tiết *</label>
                  <input
                    type="text"
                    required
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="Số 12 ngõ 45 phố X, phường Y"
                    className="w-full text-sm border border-zinc-200 rounded-xl p-2.5 bg-zinc-50 focus:bg-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Tỉnh / Thành phố</label>
                  <select
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full text-sm border border-zinc-200 rounded-xl p-2.5 bg-zinc-50 focus:bg-white focus:outline-none focus:border-brand-500 font-medium"
                  >
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Hotline / SĐT</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full text-sm border border-zinc-200 rounded-xl p-2.5 bg-zinc-50 focus:bg-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Giờ mở cửa</label>
                  <input
                    type="text"
                    value={formHours}
                    onChange={(e) => setFormHours(e.target.value)}
                    placeholder="08:00 - 22:00"
                    className="w-full text-sm border border-zinc-200 rounded-xl p-2.5 bg-zinc-50 focus:bg-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Khoảng giá</label>
                  <select
                    value={formPriceRange}
                    onChange={(e) => setFormPriceRange(e.target.value)}
                    className="w-full text-sm border border-zinc-200 rounded-xl p-2.5 bg-zinc-50 focus:bg-white focus:outline-none focus:border-brand-500 font-medium"
                  >
                    <option value="$">Bình dân ($)</option>
                    <option value="$$">Vừa phải ($$)</option>
                    <option value="$$$">Cao cấp ($$$)</option>
                  </select>
                </div>
              </div>

              {/* Cover Image Upload */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Ảnh đại diện quán ăn
                </label>
                <div className="flex items-center gap-4">
                  {formCoverImage && (
                    <img
                      src={formCoverImage}
                      alt="Cover"
                      className="w-20 h-20 rounded-xl object-cover border border-zinc-200"
                    />
                  )}
                  <label className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-xs font-bold text-zinc-700 cursor-pointer flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>{formCoverImage ? 'Thay đổi ảnh' : 'Tải ảnh lên'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'cover')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {uploadingImage ? 'Đang tải ảnh...' : 'Hoàn tất & Gửi duyệt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD DISH MODAL */}
      {showAddDishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-zinc-900">
                Thêm Món Ăn Vào {activeRestaurant?.name}
              </h3>
              <button
                onClick={() => setShowAddDishModal(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-full"
              >
                ✕
              </button>
            </div>

            {dishMsg && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
                {dishMsg.text}
              </div>
            )}

            <form onSubmit={handleAddDish} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Tên món ăn *</label>
                <input
                  type="text"
                  required
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  placeholder="Ví dụ: Phở Bò Tái Nạm"
                  className="w-full text-sm border border-zinc-200 rounded-xl p-2.5 bg-zinc-50 focus:bg-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Giá tiền (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    value={dishPrice}
                    onChange={(e) => setDishPrice(e.target.value)}
                    placeholder="Ví dụ: 65000"
                    className="w-full text-sm border border-zinc-200 rounded-xl p-2.5 bg-zinc-50 focus:bg-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Danh mục</label>
                  <select
                    value={dishCategory}
                    onChange={(e) => setDishCategory(e.target.value)}
                    className="w-full text-sm border border-zinc-200 rounded-xl p-2.5 bg-zinc-50 focus:bg-white focus:outline-none focus:border-brand-500 font-medium"
                  >
                    <option value="Cơm">Cơm</option>
                    <option value="Bún/Phở">Bún/Phở</option>
                    <option value="Lẩu & Nướng">Lẩu & Nướng</option>
                    <option value="Đồ ăn vặt">Đồ ăn vặt</option>
                    <option value="Đồ uống/Trà sữa">Đồ uống/Trà sữa</option>
                    <option value="Đồ ăn kèm">Đồ ăn kèm</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Mô tả món ăn</label>
                <textarea
                  rows={2}
                  value={dishDesc}
                  onChange={(e) => setDishDesc(e.target.value)}
                  placeholder="Thành phần, hương vị đặc trưng..."
                  className="w-full text-sm border border-zinc-200 rounded-xl p-2.5 bg-zinc-50 focus:bg-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Ảnh món ăn</label>
                <div className="flex items-center gap-3">
                  {dishImage && (
                    <img
                      src={dishImage}
                      alt="Dish"
                      className="w-14 h-14 rounded-xl object-cover border border-zinc-200"
                    />
                  )}
                  <label className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-xs font-bold text-zinc-700 cursor-pointer flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải ảnh món</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'dish')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowAddDishModal(false)}
                  className="px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow transition"
                >
                  Thêm vào Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
