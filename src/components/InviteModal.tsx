'use client';

import React, { useState, useEffect } from 'react';
import { Utensils, X, Calendar, Clock, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatVND } from '@/lib/utils';
import Link from 'next/link';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: string;
  restaurantName: string;
  dishId?: string;
  dishName?: string;
  dishPrice?: number;
  dishImage?: string;
}

export default function InviteModal({
  isOpen,
  onClose,
  restaurantId,
  restaurantName,
  dishId,
  dishName,
  dishPrice,
  dishImage,
}: InviteModalProps) {
  const { user } = useAuth();
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriendId, setSelectedFriendId] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 2);
    return d.toISOString().slice(0, 16);
  });
  const [note, setNote] = useState(
    dishName
      ? `Đi ăn món "${dishName}" cùng mình nhé, bao ngon luôn!`
      : 'Đi ăn cùng mình nhé!'
  );
  const [loading, setLoading] = useState(false);
  const [fetchingFriends, setFetchingFriends] = useState(true);
  const [feedback, setFeedback] = useState<{ isError?: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      setFetchingFriends(true);
      fetch('/api/friends')
        .then((res) => res.json())
        .then((data) => {
          setFriends(data.friends || []);
          if (data.friends && data.friends.length > 0) {
            setSelectedFriendId(data.friends[0].user.id);
          }
        })
        .catch(console.error)
        .finally(() => setFetchingFriends(false));
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setFeedback({ isError: true, msg: 'Vui lòng đăng nhập để rủ bạn bè đi ăn' });
      return;
    }

    if (!selectedFriendId) {
      setFeedback({ isError: true, msg: 'Vui lòng chọn bạn bè để rủ đi ăn' });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedFriendId,
          restaurantId,
          dishId: dishId || null,
          proposedTime: new Date(date).toISOString(),
          note,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedback({ isError: true, msg: data.error || 'Có lỗi xảy ra' });
      } else {
        setFeedback({ isError: false, msg: 'Đã gửi lời mời đi ăn thành công! Bạn bè của bạn sẽ nhận được thông báo.' });
        setTimeout(() => {
          onClose();
          setFeedback(null);
        }, 1800);
      }
    } catch {
      setFeedback({ isError: true, msg: 'Không thể kết nối đến máy chủ' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-orange-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-zinc-900">Rủ Bạn Bè Đi Ăn</h3>
            <p className="text-xs text-zinc-500">Tạo kèo hẹn hò ăn uống vui vẻ và gửi lời mời</p>
          </div>
        </div>

        {/* Selected target preview */}
        <div className="p-3.5 bg-brand-50/60 border border-brand-200/60 rounded-2xl mb-4 flex items-center gap-3">
          {dishImage ? (
            <img
              src={dishImage}
              alt={dishName}
              className="w-14 h-14 rounded-xl object-cover shrink-0 border border-brand-200"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-orange-200 flex items-center justify-center text-orange-700 shrink-0">
              <Utensils className="w-6 h-6" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {dishName && (
              <p className="text-sm font-bold text-zinc-900 truncate">
                Món: <span className="text-brand-600">{dishName}</span>
                {dishPrice ? ` (${formatVND(dishPrice)})` : ''}
              </p>
            )}
            <p className="text-xs font-semibold text-zinc-600 truncate">
              Quán: <span className="text-zinc-800">{restaurantName}</span>
            </p>
          </div>
        </div>

        {feedback && (
          <div
            className={`p-3 rounded-xl mb-4 text-xs font-semibold flex items-center gap-2 ${
              feedback.isError
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {feedback.isError ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.msg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Select Friend */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Chọn người bạn muốn rủ
            </label>
            {fetchingFriends ? (
              <div className="text-xs text-zinc-400 py-2">Đang tải danh sách bạn bè...</div>
            ) : friends.length === 0 ? (
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-600 space-y-1">
                <p>Bạn chưa có bạn bè nào trong danh sách!</p>
                <Link
                  href="/friends"
                  onClick={onClose}
                  className="text-brand-600 font-bold hover:underline inline-block"
                >
                  👉 Đi đến trang Bạn bè để kết nối ngay
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1">
                {friends.map((item) => {
                  const f = item.user;
                  const isSelected = selectedFriendId === f.id;
                  return (
                    <button
                      type="button"
                      key={f.id}
                      onClick={() => setSelectedFriendId(f.id)}
                      className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/70 ring-2 ring-brand-500/20'
                          : 'border-zinc-200 hover:border-zinc-300 bg-white'
                      }`}
                    >
                      <img
                        src={f.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${f.name}`}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-xs font-bold text-zinc-800 truncate">
                        {f.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Time Picker */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              Thời gian hẹn gặp
            </label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-sm border border-zinc-200 rounded-xl p-2.5 bg-zinc-50 focus:bg-white focus:outline-none focus:border-brand-500 font-medium text-zinc-800"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
              Lời nhắn gửi bạn
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: Trưa nay 12h tớ qua đón nhé, bao trà sữa luôn!"
              className="w-full text-sm border border-zinc-200 rounded-xl p-2.5 bg-zinc-50 focus:bg-white focus:outline-none focus:border-brand-500 text-zinc-800"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl transition"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={loading || friends.length === 0}
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-700 hover:to-amber-600 rounded-xl shadow-md shadow-brand-500/20 transition disabled:opacity-50"
            >
              {loading ? 'Đang gửi...' : 'Gửi lời mời đi ăn 🍜'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
