'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Store, ShieldCheck, Mail, Phone, Calendar, Heart, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="text-center py-20 text-zinc-400">Đang tải thông tin...</div>;

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-zinc-200 text-center space-y-4 shadow-sm">
        <User className="w-12 h-12 text-zinc-400 mx-auto" />
        <h2 className="text-xl font-bold text-zinc-900">Vui Lòng Đăng Nhập</h2>
        <Link href="/login" className="inline-block px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs">
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-zinc-100 text-center sm:text-left">
          <img
            src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
            alt=""
            className="w-24 h-24 rounded-2xl object-cover border-2 border-brand-200 shadow-sm"
          />
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl font-black text-zinc-900">{user.name}</h1>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-bold w-fit mx-auto sm:mx-0 ${
                  user.role === 'ADMIN'
                    ? 'bg-purple-100 text-purple-800'
                    : user.role === 'OWNER'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-brand-100 text-brand-800'
                }`}
              >
                {user.role === 'ADMIN' ? 'Quản trị viên' : user.role === 'OWNER' ? 'Chủ quán ăn' : 'Thực khách'}
              </span>
            </div>

            <p className="text-xs text-zinc-500">{user.bio || 'Chưa cập nhật tiểu sử'}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-zinc-500 pt-2">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                {user.email}
              </span>
              {user.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  {user.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/invitations"
            className="p-4 rounded-2xl bg-zinc-50 hover:bg-brand-50 border border-zinc-200 hover:border-brand-300 transition space-y-1 block"
          >
            <p className="text-xs font-bold text-zinc-800">Kèo Rủ Đi Ăn 🍜</p>
            <p className="text-[11px] text-zinc-400">Xem các lời mời hẹn hò ăn uống</p>
          </Link>

          <Link
            href="/friends"
            className="p-4 rounded-2xl bg-zinc-50 hover:bg-brand-50 border border-zinc-200 hover:border-brand-300 transition space-y-1 block"
          >
            <p className="text-xs font-bold text-zinc-800">Bạn Bè Ẩm Thực 👥</p>
            <p className="text-[11px] text-zinc-400">Quản lý danh sách kết bạn</p>
          </Link>

          {user.role === 'OWNER' && (
            <Link
              href="/owner"
              className="p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 transition space-y-1 block"
            >
              <p className="text-xs font-bold text-emerald-900">Quán Ăn Của Tôi 🏪</p>
              <p className="text-[11px] text-emerald-700">Quản lý thông tin và thực đơn</p>
            </Link>
          )}

          {user.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="p-4 rounded-2xl bg-purple-50 hover:bg-purple-100/70 border border-purple-200 transition space-y-1 block"
            >
              <p className="text-xs font-bold text-purple-900">Admin Hub 👑</p>
              <p className="text-[11px] text-purple-700">Kiểm duyệt quán và review</p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
