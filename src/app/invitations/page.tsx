'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  CalendarHeart,
  Utensils,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Clock3,
  Calendar,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { formatDateTime, formatVND } from '@/lib/utils';
import Link from 'next/link';

export default function InvitationsHubPage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [receivedList, setReceivedList] = useState<any[]>([]);
  const [sentList, setSentList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvitations = async () => {
    try {
      const res = await fetch('/api/invitations');
      const data = await res.json();
      if (res.ok) {
        setReceivedList(data.received || []);
        setSentList(data.sent || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchInvitations();
    }
  }, [user]);

  const handleRespond = async (invitationId: string, status: 'ACCEPTED' | 'DECLINED' | 'CANCELLED') => {
    try {
      const res = await fetch('/api/invitations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId, status }),
      });
      if (res.ok) fetchInvitations();
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) return <div className="text-center py-20 text-zinc-400">Đang tải...</div>;

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-zinc-200 text-center space-y-4 shadow-sm">
        <CalendarHeart className="w-12 h-12 text-zinc-400 mx-auto" />
        <h2 className="text-xl font-bold text-zinc-900">Tính Năng "Rủ Nhau Đi Ăn"</h2>
        <p className="text-xs text-zinc-500">
          Vui lòng đăng nhập để xem các lời mời đi ăn cùng bạn bè hoặc gửi lời mời mới.
        </p>
        <Link href="/login" className="inline-block px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs">
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  const pendingReceivedCount = receivedList.filter((inv) => inv.status === 'PENDING').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 flex items-center gap-2.5">
            <CalendarHeart className="w-8 h-8 text-brand-600" />
            <span>Kèo Ẩm Thực: Rủ Nhau Đi Ăn</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Quản lý các buổi hẹn hò ăn uống giữa bạn và những người bạn ẩm thực thân thiết.
          </p>
        </div>

        <Link
          href="/restaurants"
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-700 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-brand-500/20"
        >
          <Utensils className="w-4 h-4" />
          <span>Chọn Quán Để Rủ Kèo Mới</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 gap-2">
        <button
          onClick={() => setActiveTab('received')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'received'
              ? 'border-brand-600 text-brand-600 bg-brand-50/50'
              : 'border-transparent text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <span>Lời Mời Đã Nhận ({receivedList.length})</span>
          {pendingReceivedCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-500 text-white font-black animate-pulse">
              {pendingReceivedCount} mới
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'sent'
              ? 'border-brand-600 text-brand-600 bg-brand-50/50'
              : 'border-transparent text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <span>Lời Mời Bạn Đã Gửi ({sentList.length})</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-20 text-zinc-400">Đang tải danh sách...</div>
      ) : activeTab === 'received' ? (
        <div className="space-y-4">
          {receivedList.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-zinc-200 text-zinc-400 text-xs">
              Bạn chưa nhận được lời mời đi ăn nào. Hãy kết bạn và chia sẻ để bạn bè rủ bạn nhé!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {receivedList.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Sender and Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={inv.sender.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${inv.sender.name}`}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover border"
                        />
                        <div>
                          <p className="text-xs font-bold text-zinc-900">
                            <strong>{inv.sender.name}</strong> đã rủ bạn đi ăn
                          </p>
                          <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDateTime(inv.proposedTime)}
                          </p>
                        </div>
                      </div>

                      {/* Status */}
                      {inv.status === 'ACCEPTED' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Bạn đã đồng ý 🎉
                        </span>
                      ) : inv.status === 'DECLINED' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-600">
                          Đã từ chối
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                          <Clock3 className="w-3.5 h-3.5" /> Chờ bạn trả lời
                        </span>
                      )}
                    </div>

                    {/* Food & Restaurant Highlight Card */}
                    <div className="bg-brand-50/60 p-3.5 rounded-2xl border border-brand-200/60 flex items-center gap-3">
                      <img
                        src={inv.dish?.image || inv.restaurant.coverImage}
                        alt=""
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-brand-200"
                      />
                      <div className="min-w-0 flex-1">
                        {inv.dish ? (
                          <p className="text-xs font-bold text-zinc-900 truncate">
                            Món: <span className="text-brand-600">{inv.dish.name}</span>{' '}
                            ({formatVND(inv.dish.price)})
                          </p>
                        ) : null}
                        <Link
                          href={`/restaurants/${inv.restaurant.id}`}
                          className="text-xs font-semibold text-zinc-700 hover:text-brand-600 truncate block mt-0.5"
                        >
                          Tại: <strong>{inv.restaurant.name}</strong>
                        </Link>
                        <p className="text-[11px] text-zinc-400 truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>{inv.restaurant.address}</span>
                        </p>
                      </div>
                    </div>

                    {/* Invitation Note */}
                    {inv.note && (
                      <p className="text-xs text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-100 italic">
                        "{inv.note}"
                      </p>
                    )}
                  </div>

                  {/* Actions if pending */}
                  {inv.status === 'PENDING' && (
                    <div className="flex gap-2 pt-2 border-t border-zinc-100">
                      <button
                        onClick={() => handleRespond(inv.id, 'ACCEPTED')}
                        className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow transition"
                      >
                        Đồng ý đi ăn 🎉
                      </button>
                      <button
                        onClick={() => handleRespond(inv.id, 'DECLINED')}
                        className="flex-1 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-100 border border-zinc-200 rounded-xl transition"
                      >
                        Bận mất rồi
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* SENT INVITATIONS */
        <div className="space-y-4">
          {sentList.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-zinc-200 text-zinc-400 text-xs">
              Bạn chưa gửi lời mời đi ăn nào. Hãy chọn một món ăn ngon và rủ bạn bè ngay!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sentList.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={inv.receiver.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${inv.receiver.name}`}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover border"
                        />
                        <div>
                          <p className="text-xs font-bold text-zinc-900">
                            Bạn đã rủ <strong>{inv.receiver.name}</strong>
                          </p>
                          <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDateTime(inv.proposedTime)}
                          </p>
                        </div>
                      </div>

                      {/* Status */}
                      {inv.status === 'ACCEPTED' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Bạn đã nhận lời 🎉
                        </span>
                      ) : inv.status === 'DECLINED' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-600">
                          Bạn bận mất rồi
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                          <Clock3 className="w-3.5 h-3.5" /> Chờ bạn trả lời
                        </span>
                      )}
                    </div>

                    <div className="bg-brand-50/60 p-3.5 rounded-2xl border border-brand-200/60 flex items-center gap-3">
                      <img
                        src={inv.dish?.image || inv.restaurant.coverImage}
                        alt=""
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-brand-200"
                      />
                      <div className="min-w-0 flex-1">
                        {inv.dish ? (
                          <p className="text-xs font-bold text-zinc-900 truncate">
                            Món: <span className="text-brand-600">{inv.dish.name}</span>{' '}
                            ({formatVND(inv.dish.price)})
                          </p>
                        ) : null}
                        <p className="text-xs font-semibold text-zinc-700 truncate mt-0.5">
                          Quán: <strong>{inv.restaurant.name}</strong>
                        </p>
                      </div>
                    </div>

                    {inv.note && (
                      <p className="text-xs text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-100 italic">
                        Lời nhắn của bạn: "{inv.note}"
                      </p>
                    )}
                  </div>

                  {inv.status === 'PENDING' && (
                    <div className="pt-2 border-t border-zinc-100 flex justify-end">
                      <button
                        onClick={() => handleRespond(inv.id, 'CANCELLED')}
                        className="px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition"
                      >
                        Huỷ lời mời
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
