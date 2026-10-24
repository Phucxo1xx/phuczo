'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  UtensilsCrossed,
  Dice5,
  Users,
  CalendarHeart,
  Store,
  ShieldCheck,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  User,
  PlusCircle,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/restaurants?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { href: '/restaurants', label: 'Quán ăn', icon: UtensilsCrossed },
    {
      href: '/trua-nay-an-gi',
      label: 'Trưa nay ăn gì?',
      icon: Dice5,
      badge: 'HOT',
    },
    { href: '/invitations', label: 'Rủ đi ăn', icon: CalendarHeart },
    { href: '/friends', label: 'Bạn bè', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-orange-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black bg-gradient-to-r from-brand-600 via-orange-500 to-amber-600 bg-clip-text text-transparent tracking-tight">
                  FoodVibe
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 -mt-1">
                  Ẩm Thực & Kết Nối
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all relative ${
                      isActive
                        ? 'bg-brand-50 text-brand-600'
                        : 'text-zinc-600 hover:text-brand-600 hover:bg-zinc-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-black bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Search bar & User controls */}
          <div className="hidden lg:flex items-center gap-4 flex-1 max-w-xs mx-6">
            <form onSubmit={handleSearch} className="w-full relative">
              <input
                type="text"
                placeholder="Tìm món, bún bò, lẩu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-sm bg-zinc-100 hover:bg-zinc-50 focus:bg-white rounded-full border border-transparent focus:border-brand-500 focus:outline-none transition-all placeholder:text-zinc-400"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {/* Role Specific Shortcuts */}
                {user.role === 'OWNER' && (
                  <Link
                    href="/owner"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Quán của tôi</span>
                  </Link>
                )}

                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin Hub</span>
                  </Link>
                )}

                {/* Notifications Link */}
                <Link
                  href="/invitations"
                  title="Thông báo & Lời mời"
                  className="p-2 text-zinc-600 hover:text-brand-600 hover:bg-zinc-100 rounded-full relative transition"
                >
                  <Bell className="w-5 h-5" />
                  {user.unreadCount && user.unreadCount > 0 ? (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                  ) : null}
                </Link>

                {/* Profile menu */}
                <div className="flex items-center gap-2 pl-2 border-l border-zinc-200">
                  <Link href="/profile" className="flex items-center gap-2 hover:opacity-80">
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border border-orange-200 object-cover bg-amber-50"
                    />
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-zinc-800 leading-tight max-w-[100px] truncate">
                        {user.name}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-medium">
                        {user.role === 'ADMIN' ? 'Admin' : user.role === 'OWNER' ? 'Chủ quán' : 'Thực khách'}
                      </span>
                    </div>
                  </Link>

                  <button
                    onClick={logout}
                    title="Đăng xuất"
                    className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-sm font-semibold text-zinc-700 hover:text-brand-600 transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-1.5 text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-700 hover:to-amber-600 rounded-full shadow-sm hover:shadow transition"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-600 hover:text-zinc-900 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Tìm quán ăn, món ăn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-100 rounded-lg border border-transparent focus:border-brand-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-zinc-700 hover:bg-brand-50 hover:text-brand-600"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-black bg-red-500 text-white">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {user ? (
            <div className="pt-3 border-t border-zinc-100 space-y-2">
              <div className="flex items-center gap-3 px-3 py-2">
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-bold text-zinc-800">{user.name}</p>
                  <p className="text-xs text-zinc-400">{user.email}</p>
                </div>
              </div>

              {user.role === 'OWNER' && (
                <Link
                  href="/owner"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-lg"
                >
                  <Store className="w-4 h-4" />
                  <span>Quản lý Quán của tôi</span>
                </Link>
              )}

              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-purple-700 bg-purple-50 rounded-lg"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Khu vực Quản trị Admin</span>
                </Link>
              )}

              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 rounded-lg"
              >
                <User className="w-4 h-4" />
                <span>Trang cá nhân</span>
              </Link>

              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-zinc-100 grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-bold border border-zinc-300 rounded-lg text-zinc-700"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-bold bg-brand-600 text-white rounded-lg shadow-sm"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
