'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UtensilsCrossed, Lock, Mail, User, Store, AlertCircle } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') === 'OWNER' ? 'OWNER' : 'USER';

  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'OWNER'>(defaultRole);
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await register({
      name,
      email,
      password,
      role,
      bio,
      phone,
    });
    setLoading(false);

    if (result.success) {
      if (role === 'OWNER') router.push('/owner');
      else router.push('/');
    } else {
      setError(result.error || 'Đăng ký không thành công');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 border border-zinc-200/80 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 mx-auto flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-zinc-900">Tạo Tài Khoản FoodVibe</h1>
          <p className="text-xs text-zinc-500">
            Trải nghiệm nền tảng ẩm thực thế hệ mới tại Việt Nam
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-3 p-1 bg-zinc-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole('USER')}
            className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              role === 'USER'
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Thực khách</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('OWNER')}
            className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              role === 'OWNER'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Chủ Quán Ăn</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">Họ và tên *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full px-4 py-2.5 text-xs bg-zinc-50 rounded-xl border border-zinc-200 focus:bg-white focus:border-brand-500 focus:outline-none font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-2.5 text-xs bg-zinc-50 rounded-xl border border-zinc-200 focus:bg-white focus:border-brand-500 focus:outline-none font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">Mật khẩu *</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              className="w-full px-4 py-2.5 text-xs bg-zinc-50 rounded-xl border border-zinc-200 focus:bg-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Số điện thoại</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912 345 678"
                className="w-full px-4 py-2.5 text-xs bg-zinc-50 rounded-xl border border-zinc-200 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Giới thiệu bản thân</label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Đam mê bún chả, phở..."
                className="w-full px-4 py-2.5 text-xs bg-zinc-50 rounded-xl border border-zinc-200 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-700 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition disabled:opacity-50"
          >
            {loading ? 'Đang tạo tài khoản...' : 'Đăng Ký Tài Khoản'}
          </button>
        </form>

        <div className="text-center text-xs text-zinc-500 pt-2 border-t border-zinc-100">
          Đã có tài khoản?{' '}
          <Link href="/login" className="font-bold text-brand-600 hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-zinc-400">Đang tải trang đăng ký...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
