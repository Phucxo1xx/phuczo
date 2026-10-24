'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  Store,
  MessageSquare,
  Flag,
  CheckCircle2,
  XCircle,
  Trash2,
  AlertTriangle,
  Clock,
  Eye,
  Star,
  ExternalLink,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'restaurants' | 'reviews' | 'reports'>('restaurants');

  // Data states
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [targetRestId, setTargetRestId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchAllData = async () => {
    setLoadingData(true);
    try {
      const [restRes, revRes, repRes] = await Promise.all([
        fetch('/api/admin/restaurants?status=ALL'),
        fetch('/api/admin/reviews'),
        fetch('/api/admin/reports'),
      ]);

      const restData = await restRes.json();
      const revData = await revRes.json();
      const repData = await repRes.json();

      setRestaurants(restData.restaurants || []);
      setReviews(revData.reviews || []);
      setReports(repData.reports || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchAllData();
    }
  }, [user]);

  // Handle Approve/Reject Restaurant
  const handleModerateRestaurant = async (id: string, status: 'APPROVED' | 'REJECTED', reason?: string) => {
    try {
      const res = await fetch('/api/admin/restaurants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, rejectReason: reason }),
      });
      if (res.ok) {
        setRejectModalOpen(false);
        setRejectReason('');
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Delete Review
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Bạn có chắc muốn xoá bài review này khỏi hệ thống do thông tin sai sự thật hoặc phá hoại?')) return;
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' });
      if (res.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Report Action
  const handleResolveReport = async (reportId: string, action: 'DELETE_TARGET' | 'DISMISS') => {
    const confirmMsg =
      action === 'DELETE_TARGET'
        ? 'Bạn có chắc muốn xoá nội dung bị báo cáo và giải quyết vi phạm này?'
        : 'Bạn có chắc muốn bác bỏ báo cáo này?';
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reportId, action }),
      });
      if (res.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return <div className="text-center py-20 text-zinc-400">Đang tải xác thực...</div>;
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-zinc-200 text-center space-y-4 shadow-sm">
        <ShieldCheck className="w-12 h-12 text-purple-600 mx-auto" />
        <h2 className="text-xl font-bold text-zinc-900">Yêu Cầu Quyền Quản Trị Viên</h2>
        <p className="text-xs text-zinc-500">
          Chỉ có tài khoản Admin mới có quyền truy cập vào trung tâm kiểm duyệt hệ thống.
        </p>
        <Link
          href="/login"
          className="inline-block px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs"
        >
          Đăng nhập tài khoản Admin
        </Link>
      </div>
    );
  }

  const pendingRestaurants = restaurants.filter((r) => r.status === 'PENDING');
  const pendingReports = reports.filter((r) => r.status === 'PENDING');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 flex items-center gap-2.5">
            <ShieldCheck className="w-8 h-8 text-purple-600" />
            <span>Khu Vực Quản Trị Hệ Thống (Admin Hub)</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Kiểm soát, phê duyệt quán ăn từ chủ quán, gỡ bỏ review sai sự thật và xử lý báo xấu cộng đồng.
          </p>
        </div>

        {/* Stats Pill Badges */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>{pendingRestaurants.length} quán chờ duyệt</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-1.5">
            <Flag className="w-4 h-4 text-red-600" />
            <span>{pendingReports.length} báo xấu chờ xử lý</span>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-zinc-200 gap-2">
        <button
          onClick={() => setActiveTab('restaurants')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'restaurants'
              ? 'border-purple-600 text-purple-700 bg-purple-50/40'
              : 'border-transparent text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Phê Duyệt Quán Ăn ({restaurants.length})</span>
          {pendingRestaurants.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-black">
              {pendingRestaurants.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'reviews'
              ? 'border-purple-600 text-purple-700 bg-purple-50/40'
              : 'border-transparent text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Kiểm Duyệt Review ({reviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'reports'
              ? 'border-purple-600 text-purple-700 bg-purple-50/40'
              : 'border-transparent text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>Xử Lý Báo Xấu ({reports.length})</span>
          {pendingReports.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-500 text-white font-black">
              {pendingReports.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: RESTAURANT APPROVAL */}
      {activeTab === 'restaurants' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {restaurants.map((rest) => (
              <div
                key={rest.id}
                className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4 flex-1">
                  <img
                    src={rest.coverImage}
                    alt={rest.name}
                    className="w-24 h-24 rounded-2xl object-cover shrink-0 border border-zinc-200 shadow-sm"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-lg font-black text-zinc-900">{rest.name}</h3>
                      {rest.status === 'APPROVED' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đã phê duyệt
                        </span>
                      ) : rest.status === 'PENDING' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1 animate-pulse">
                          <Clock className="w-3.5 h-3.5" /> Chờ Admin duyệt
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Đã từ chối
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500">{rest.address}, {rest.city}</p>
                    <p className="text-xs text-zinc-600 line-clamp-1">{rest.description}</p>
                    <div className="text-[11px] text-zinc-400 pt-1 flex items-center gap-3">
                      <span>Chủ quán: <strong>{rest.owner?.name}</strong> ({rest.owner?.email})</span>
                      <span>Thực đơn: <strong>{rest.dishes?.length || 0} món</strong></span>
                    </div>
                  </div>
                </div>

                {/* Moderate Actions */}
                <div className="flex items-center gap-2.5 shrink-0 w-full lg:w-auto justify-end">
                  {rest.status === 'APPROVED' ? (
                    <button
                      onClick={() => handleModerateRestaurant(rest.id, 'REJECTED', 'Tạm ngừng hiển thị')}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition"
                    >
                      Khoá / Gỡ quán
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleModerateRestaurant(rest.id, 'APPROVED')}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Phê Duyệt Quán</span>
                      </button>

                      <button
                        onClick={() => {
                          setTargetRestId(rest.id);
                          setRejectModalOpen(true);
                        }}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Từ chối</span>
                      </button>
                    </>
                  )}

                  <Link
                    href={`/restaurants/${rest.id}`}
                    target="_blank"
                    className="p-2.5 text-zinc-500 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition"
                    title="Xem chi tiết trang quán"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: REVIEW MODERATION */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <p className="text-xs text-zinc-500 bg-purple-50 p-3 rounded-xl border border-purple-100 text-purple-900">
            Hệ thống cho phép thực khách tự do đăng tải cảm nhận. Quản trị viên chỉ xoá các review sai sự thật nhằm mục đích xấu, vu khống phá hoại quán hoặc vi phạm tiêu chuẩn cộng đồng.
          </p>

          <div className="grid grid-cols-1 gap-4">
            {reviews.map((rev) => {
              let images: string[] = [];
              try {
                images = JSON.parse(rev.images || '[]');
              } catch {
                images = [];
              }

              return (
                <div
                  key={rev.id}
                  className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${rev.user?.name}`}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover border"
                      />
                      <div>
                        <p className="text-xs font-bold text-zinc-900">
                          {rev.user?.name}{' '}
                          <span className="text-zinc-400 font-normal">đánh giá quán</span>{' '}
                          <strong className="text-brand-600">{rev.restaurant?.name}</strong>
                        </p>
                        <p className="text-[10px] text-zinc-400">{formatDate(rev.createdAt)}</p>
                      </div>

                      <div className="flex items-center gap-1 ml-auto md:ml-2">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold">{rev.rating} sao</span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-700 bg-zinc-50 p-3 rounded-xl border border-zinc-100 leading-relaxed italic">
                      "{rev.content}"
                    </p>

                    {images.length > 0 && (
                      <div className="flex gap-2 pt-1">
                        {images.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt="Ảnh đính kèm"
                            className="w-16 h-16 rounded-xl object-cover border border-zinc-200"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteReview(rev.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xoá Review Này</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: COMMUNITY REPORTS QUEUE */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <p className="text-xs text-zinc-500">
            Danh sách các báo cáo vi phạm do người dùng gửi lên. Hãy kiểm tra nội dung và xử lý tương ứng.
          </p>

          {reports.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-zinc-200 text-zinc-400 text-xs">
              Hiện không có báo cáo nào từ người dùng.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800 uppercase tracking-wider">
                        {rep.reason}
                      </span>
                      <span className="text-xs text-zinc-500">
                        Báo cáo {rep.targetType === 'REVIEW' ? 'bài review' : 'quán ăn'} • {formatDate(rep.createdAt)}
                      </span>
                      {rep.status === 'RESOLVED' && (
                        <span className="text-xs font-bold text-emerald-600 ml-auto">(Đã xử lý)</span>
                      )}
                      {rep.status === 'DISMISSED' && (
                        <span className="text-xs font-bold text-zinc-400 ml-auto">(Đã bác bỏ)</span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-800">
                      Người báo cáo: <strong>{rep.reporter?.name}</strong> ({rep.reporter?.email})
                    </p>

                    {rep.note && (
                      <p className="text-xs text-zinc-600 bg-red-50/50 p-2.5 rounded-xl border border-red-100">
                        Lý do cụ thể: <strong>"{rep.note}"</strong>
                      </p>
                    )}

                    {rep.review && (
                      <p className="text-xs text-zinc-500 bg-zinc-50 p-2 rounded-lg line-clamp-2">
                        Nội dung bị báo cáo: <em>"{rep.review.content}"</em> (Tại quán {rep.review.restaurant?.name})
                      </p>
                    )}
                  </div>

                  {rep.status === 'PENDING' && (
                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        onClick={() => handleResolveReport(rep.id, 'DELETE_TARGET')}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xoá Đối Tượng & Xử Lý</span>
                      </button>

                      <button
                        onClick={() => handleResolveReport(rep.id, 'DISMISS')}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 border border-zinc-200 transition"
                      >
                        Bác bỏ
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
            <h3 className="text-lg font-bold text-zinc-900">Từ chối phê duyệt quán ăn</h3>
            <p className="text-xs text-zinc-500">
              Vui lòng nhập lý do để chủ quán nắm được và chỉnh sửa bổ sung thông tin.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ví dụ: Hình ảnh chưa rõ ràng, thiếu địa chỉ số nhà cụ thể..."
              className="w-full text-sm border border-zinc-200 rounded-xl p-3 bg-zinc-50 focus:bg-white focus:outline-none focus:border-red-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl"
              >
                Huỷ
              </button>
              <button
                onClick={() => targetRestId && handleModerateRestaurant(targetRestId, 'REJECTED', rejectReason)}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
