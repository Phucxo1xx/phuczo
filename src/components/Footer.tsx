import React from 'react';
import Link from 'next/link';
import { UtensilsCrossed, Heart, Shield, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-zinc-900 text-zinc-300 mt-20 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="text-xl font-black text-white">FoodVibe</span>
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Nền tảng review ẩm thực chân thực, giới thiệu quán ăn uy tín và kết nối những tâm hồn yêu ăn uống khắp Việt Nam.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Khám Phá</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/restaurants" className="hover:text-brand-400 transition">Danh sách Quán Ăn</Link></li>
              <li><Link href="/trua-nay-an-gi" className="hover:text-brand-400 transition">🎲 Trưa nay ăn gì? (Roulette CS:GO)</Link></li>
              <li><Link href="/invitations" className="hover:text-brand-400 transition">Kèo đi ăn cùng bạn bè</Link></li>
              <li><Link href="/friends" className="hover:text-brand-400 transition">Kết nối bạn bè ẩm thực</Link></li>
            </ul>
          </div>

          {/* Dành cho chủ quán & Admin */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Đối Tác & Cộng Đồng</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/owner" className="hover:text-brand-400 transition">Đăng ký & Quản lý Quán ăn</Link></li>
              <li><Link href="/admin" className="hover:text-brand-400 transition">Khu vực Kiểm duyệt Admin</Link></li>
              <li><Link href="/register?role=OWNER" className="hover:text-brand-400 transition">Trở thành Đối tác Chủ quán</Link></li>
            </ul>
          </div>

          {/* Tiêu chuẩn cộng đồng */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Uy Tín & Cam Kết</h4>
            <div className="space-y-2 text-xs text-zinc-400 leading-relaxed">
              <p className="flex items-center gap-1.5 text-zinc-300">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                Kiểm duyệt thông tin quán ăn nghiêm ngặt
              </p>
              <p className="flex items-center gap-1.5 text-zinc-300">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                Đánh giá khách quan, loại bỏ review ảo
              </p>
              <p className="flex items-center gap-1.5 text-zinc-300">
                <Heart className="w-4 h-4 text-rose-400 shrink-0" />
                Hệ thống báo xấu 24/7 bảo vệ người dùng
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-zinc-800 text-center text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 FoodVibe - Nền tảng Đánh giá & Khám phá Ẩm thực.</p>
          <p className="flex items-center gap-1">
            Được phát triển với niềm đam mê ẩm thực Việt 🇻🇳
          </p>
        </div>
      </div>
    </footer>
  );
}
