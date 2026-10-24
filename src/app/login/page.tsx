'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UtensilsCrossed, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Đăng nhập không thành công');
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-zinc-200/80 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 mx-auto flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-zinc-900">Đăng Nhập FoodVibe</h1>
          <p className="text-xs text-zinc-500">
            Khám phá quán ngon, quay roulette và rủ bạn bè đi ăn
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@foodvibe.vn"
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-zinc-50 rounded-xl border border-zinc-200 focus:bg-white focus:border-brand-500 focus:outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-zinc-50 rounded-xl border border-zinc-200 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-700 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition disabled:opacity-50"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>
        </form>

        {/* Quick Fill Demo Accounts */}
        <div className="pt-4 border-t border-zinc-100 space-y-2">
          <p className="text-[11px] font-bold text-zinc-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Đăng nhập nhanh tài khoản mẫu:</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@foodvibe.vn', 'admin123')}
              className="p-2 rounded-xl text-left bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 transition"
            >
              <p className="text-[11px] font-black">👑 Quản trị viên (Admin)</p>
              <p className="text-[10px] text-purple-600 truncate">admin@foodvibe.vn</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('owner.lan@foodvibe.vn', 'owner123')}
              className="p-2 rounded-xl text-left bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 transition"
            >
              <p className="text-[11px] font-black">🏪 Chủ quán (Phở Thìn)</p>
              <p className="text-[10px] text-emerald-600 truncate">owner.lan@foodvibe.vn</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('viet@foodvibe.vn', 'user123')}
              className="p-2 rounded-xl text-left bg-orange-50 hover:bg-orange-100 border border-orange-200 text-brand-900 transition"
            >
              <p className="text-[11px] font-black">🍜 Thực khách (Việt)</p>
              <p className="text-[10px] text-brand-600 truncate">viet@foodvibe.vn</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('mai@foodvibe.vn', 'user123')}
              className="p-2 rounded-xl text-left bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-900 transition"
            >
              <p className="text-[11px] font-black">📸 Reviewer (Mai)</p>
              <p className="text-[10px] text-rose-600 truncate">mai@foodvibe.vn</p>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-zinc-500 pt-2">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="font-bold text-brand-600 hover:underline">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
