'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  UserPlus,
  Search,
  CheckCircle2,
  XCircle,
  CalendarHeart,
  UserMinus,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function FriendsPage() {
  const { user, isLoading } = useAuth();
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingReceived, setPendingReceived] = useState<any[]>([]);
  const [pendingSent, setPendingSent] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ isError?: boolean; msg: string } | null>(null);

  const fetchFriendsData = async (query = '') => {
    try {
      const url = query ? `/api/friends?q=${encodeURIComponent(query)}` : '/api/friends';
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setFriends(data.friends || []);
        setPendingReceived(data.pendingReceived || []);
        setPendingSent(data.pendingSent || []);
        setSearchResults(data.searchResults || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFriendsData();
    }
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchFriendsData(searchQuery.trim());
    }
  };

  // Send friend request
  const handleSendRequest = async (receiverId: string) => {
    setFeedback(null);
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ isError: true, msg: data.error || 'Có lỗi xảy ra' });
      } else {
        setFeedback({ isError: false, msg: 'Đã gửi lời mời kết bạn!' });
        fetchFriendsData(searchQuery);
      }
    } catch {
      setFeedback({ isError: true, msg: 'Lỗi kết nối máy chủ' });
    }
  };

  // Accept or Decline
  const handleRespond = async (friendshipId: string, action: 'ACCEPT' | 'DECLINE') => {
    try {
      const res = await fetch('/api/friends', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId, action }),
      });
      if (res.ok) fetchFriendsData(searchQuery);
    } catch (e) {
      console.error(e);
    }
  };

  // Unfriend
  const handleUnfriend = async (friendshipId: string) => {
    if (!confirm('Bạn có chắc muốn huỷ kết bạn?')) return;
    try {
      const res = await fetch(`/api/friends?id=${friendshipId}`, { method: 'DELETE' });
      if (res.ok) fetchFriendsData(searchQuery);
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) return <div className="text-center py-20 text-zinc-400">Đang tải...</div>;

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-zinc-200 text-center space-y-4 shadow-sm">
        <Users className="w-12 h-12 text-zinc-400 mx-auto" />
        <h2 className="text-xl font-bold text-zinc-900">Tính Năng Kết Bạn Ẩm Thực</h2>
        <p className="text-xs text-zinc-500">
          Vui lòng đăng nhập để kết bạn và tạo các kèo rủ nhau đi ăn.
        </p>
        <Link href="/login" className="inline-block px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs">
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-900 flex items-center gap-2.5">
          <Users className="w-8 h-8 text-brand-600" />
          <span>Bạn Bè Ẩm Thực & Kết Nối</span>
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Tìm kiếm bạn bè có chung sở thích ăn uống và cùng nhau lập hội đi ăn.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            feedback.isError ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          {feedback.isError ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Search for new friends */}
      <div className="bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-brand-600" />
          <span>Tìm Thêm Bạn Bè Mới</span>
        </h3>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập tên người dùng hoặc email..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-zinc-50 rounded-xl border border-zinc-200 focus:bg-white focus:border-brand-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
          >
            Tìm kiếm
          </button>
        </form>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {searchResults.map((person) => (
              <div
                key={person.id}
                className="p-3.5 rounded-2xl border border-zinc-200 flex items-center justify-between gap-3 bg-zinc-50/50"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={person.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${person.name}`}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-900 truncate">{person.name}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{person.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSendRequest(person.id)}
                  className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-[11px] shrink-0 shadow-sm"
                >
                  Kết bạn
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Pending Friend Requests Received */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider flex items-center justify-between">
            <span>Lời mời kết bạn đã nhận</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              {pendingReceived.length}
            </span>
          </h3>

          {pendingReceived.length === 0 ? (
            <div className="p-6 bg-white rounded-2xl border border-zinc-200 text-center text-xs text-zinc-400">
              Không có lời mời kết bạn nào đang chờ.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingReceived.map((req) => (
                <div
                  key={req.friendshipId}
                  className="p-4 bg-white rounded-2xl border border-zinc-200/80 shadow-sm flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={req.user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${req.user.name}`}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-900 truncate">{req.user.name}</p>
                      <p className="text-[10px] text-zinc-400 truncate">{req.user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleRespond(req.friendshipId, 'ACCEPT')}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl"
                      title="Đồng ý"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleRespond(req.friendshipId, 'DECLINE')}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                      title="Từ chối"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Accepted Friends List */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider flex items-center justify-between">
            <span>Danh sách bạn bè ({friends.length})</span>
          </h3>

          {friends.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-zinc-200 text-center text-xs text-zinc-400 space-y-2">
              <Users className="w-8 h-8 text-zinc-300 mx-auto" />
              <p>Bạn chưa kết bạn với ai. Hãy tìm kiếm ở trên để kết nối bạn bè ngay!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {friends.map((item) => (
                <div
                  key={item.friendshipId}
                  className="p-4 bg-white rounded-2xl border border-zinc-200/80 shadow-sm flex items-center justify-between gap-3 hover:border-brand-300 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${item.user.name}`}
                      alt=""
                      className="w-11 h-11 rounded-full object-cover border border-zinc-200"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-900 truncate">{item.user.name}</p>
                      <p className="text-[10px] text-zinc-400 truncate">{item.user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      href={`/restaurants`}
                      title="Chọn quán & Rủ đi ăn"
                      className="p-2 text-brand-600 hover:bg-brand-50 rounded-xl transition"
                    >
                      <CalendarHeart className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleUnfriend(item.friendshipId)}
                      title="Huỷ kết bạn"
                      className="p-2 text-zinc-300 hover:text-red-500 rounded-xl transition"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
