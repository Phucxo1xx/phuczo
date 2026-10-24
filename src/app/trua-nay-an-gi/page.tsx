'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Dice5,
  RotateCw,
  Utensils,
  MapPin,
  Star,
  CalendarHeart,
  Volume2,
  VolumeX,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { formatVND } from '@/lib/utils';
import Link from 'next/link';
import InviteModal from '@/components/InviteModal';

interface DishItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  category: string;
  restaurantId: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantCity: string;
  restaurantRating: number;
}

export default function TruaNayAnGiPage() {
  const [dishes, setDishes] = useState<DishItem[]>([]);
  const [category, setCategory] = useState('Tất cả');
  const [maxPrice, setMaxPrice] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Sound toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Roulette reel state
  const [reelItems, setReelItems] = useState<DishItem[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonDish, setWonDish] = useState<DishItem | null>(null);
  const [showResultCard, setShowResultCard] = useState(false);

  // Invite modal state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const reelRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Web Audio synth for tick and win sounds
  const playTickSound = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      // Audio fallback
    }
  };

  const playWinFanfare = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.2, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.3);
      });
    } catch (e) {}
  };

  // Fetch dishes based on current filters
  const fetchDishes = async () => {
    setLoading(true);
    try {
      let url = '/api/random-dish?';
      if (category && category !== 'Tất cả') {
        url += `category=${encodeURIComponent(category)}&`;
      }
      if (maxPrice && maxPrice !== 'all') {
        url += `maxPrice=${maxPrice}&`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setDishes(data.dishes || []);

      // Build initial reel items
      if (data.dishes && data.dishes.length > 0) {
        generateReel(data.dishes);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDishes();
  }, [category, maxPrice]);

  // Generate 60 cards in reel to simulate CS:GO crate spinning
  const generateReel = (sourceDishes: DishItem[]) => {
    if (sourceDishes.length === 0) return;
    const items: DishItem[] = [];
    for (let i = 0; i < 60; i++) {
      const randomIdx = Math.floor(Math.random() * sourceDishes.length);
      items.push(sourceDishes[randomIdx]);
    }
    setReelItems(items);
    if (reelRef.current) {
      reelRef.current.style.transition = 'none';
      reelRef.current.style.transform = 'translateX(0px)';
    }
    setShowResultCard(false);
  };

  // Trigger spin animation
  const startSpin = () => {
    if (isSpinning || dishes.length === 0) return;

    setShowResultCard(false);
    setIsSpinning(true);

    // Re-generate reel so every spin is fresh
    const pool = [...dishes];
    const items: DishItem[] = [];
    for (let i = 0; i < 60; i++) {
      items.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    setReelItems(items);

    // Target index is typically near card 45-50
    const targetIndex = 45 + Math.floor(Math.random() * 5);
    const selectedWinner = items[targetIndex];
    setWonDish(selectedWinner);

    // Calculate exact pixel offset
    // Card width = 200px, gap = 16px -> step = 216px
    const cardStep = 216;
    // Add small random jitter inside card so it doesn't always land at dead-center
    const jitter = Math.floor(Math.random() * 80) - 40;
    
    // We want target card centered in container
    // Container width = 800px approx, center = 400px. Card center = 100px.
    const containerWidth = reelRef.current?.parentElement?.clientWidth || 800;
    const centerOffset = containerWidth / 2 - 100;
    const finalTranslate = -(targetIndex * cardStep - centerOffset + jitter);

    if (reelRef.current) {
      // Reset position first
      reelRef.current.style.transition = 'none';
      reelRef.current.style.transform = 'translateX(0px)';

      // Force layout reflow
      void reelRef.current.offsetWidth;

      // Start spinning with cubic-bezier easing like CS:GO
      const spinDuration = 5500; // 5.5 seconds
      reelRef.current.style.transition = `transform ${spinDuration}ms cubic-bezier(0.15, 0.9, 0.25, 1)`;
      reelRef.current.style.transform = `translateX(${finalTranslate}px)`;

      // Sound clicks during spin
      let elapsed = 0;
      let tickInterval = 60;
      const tickTimer = setInterval(() => {
        elapsed += tickInterval;
        playTickSound();
        // Slow down ticks as spin slows down
        if (elapsed > 3000) tickInterval = 180;
        if (elapsed > 4500) tickInterval = 350;
        if (elapsed >= spinDuration) {
          clearInterval(tickTimer);
        }
      }, tickInterval);

      // On finish
      setTimeout(() => {
        setIsSpinning(false);
        setShowResultCard(true);
        playWinFanfare();

        // Confetti burst
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f97316', '#fbbf24', '#ef4444', '#10b981'],
        });
      }, spinDuration);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 text-brand-800 text-xs font-bold shadow-sm">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span>Vòng Quay Ẩm Thực Phong Cách Truanayangi (CS:GO Case Opening)</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 tracking-tight">
          Trưa Nay Ăn Gì?{' '}
          <span className="bg-gradient-to-r from-brand-600 to-amber-500 bg-clip-text text-transparent">
            Mở Hòm May Mắn
          </span>
        </h1>
        <p className="text-sm text-zinc-600 max-w-xl mx-auto">
          Dành riêng cho những người trưa nào cũng đau đầu: "Không biết ăn gì!".
          Bấm nút để vòng quay CS:GO cuộn dải món ăn ngon từ các quán có thật!
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Categories */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider mr-1">
            Loại món:
          </span>
          {['Tất cả', 'Cơm', 'Bún/Phở', 'Lẩu & Nướng', 'Đồ ăn vặt', 'Đồ uống/Trà sữa'].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              disabled={isSpinning}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                category === c
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Budget filter & Sound */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-500">Mức giá:</span>
            <select
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              disabled={isSpinning}
              className="text-xs font-bold bg-zinc-100 border border-zinc-200 rounded-xl px-3 py-1.5 focus:outline-none"
            >
              <option value="all">Mọi mức giá</option>
              <option value="40000">Dưới 40k</option>
              <option value="75000">Dưới 75k</option>
              <option value="120000">Dưới 120k</option>
            </select>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            className="p-2 text-zinc-500 hover:text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-brand-600" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* CS:GO ROULETTE REEL CONTAINER */}
      <div className="relative bg-zinc-950 rounded-3xl p-4 sm:p-6 shadow-2xl border-2 border-zinc-800 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-600/10 via-transparent to-amber-500/10 pointer-events-none" />

        {/* Center Target Indicator Line (Red marker like CS:GO case opening) */}
        <div className="roulette-marker" />

        {/* Horizontal Reel Track */}
        <div className="overflow-hidden py-6 relative">
          <div
            ref={reelRef}
            className="flex gap-4 items-center will-change-transform"
            style={{ width: 'max-content' }}
          >
            {reelItems.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="w-48 h-64 shrink-0 rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-900 border border-zinc-700/80 p-3 flex flex-col justify-between shadow-lg relative group select-none"
              >
                {/* Dish Image */}
                <div className="w-full h-32 rounded-xl overflow-hidden bg-zinc-950 relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-400">
                    {formatVND(item.price)}
                  </div>
                </div>

                {/* Dish Info */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
                    {item.category}
                  </span>
                  <h4 className="text-xs font-bold text-white truncate" title={item.name}>
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-zinc-400 truncate flex items-center gap-1">
                    <Utensils className="w-3 h-3 text-zinc-500 shrink-0" />
                    <span>{item.restaurantName}</span>
                  </p>
                </div>

                {/* Bottom Card Bar */}
                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400">
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {item.restaurantRating}
                  </span>
                  <span className="truncate max-w-[80px]">{item.restaurantCity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spin Action Buttons */}
        <div className="mt-4 pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={startSpin}
            disabled={isSpinning || dishes.length === 0}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-brand-600 to-amber-500 hover:from-red-700 hover:via-brand-700 hover:to-amber-600 text-white font-black text-base shadow-xl shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 tracking-wide"
          >
            <Dice5 className={`w-6 h-6 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'ĐANG MỞ HÒM...' : 'MỞ HÒM NGAY (CS:GO)'}</span>
          </button>

          <button
            onClick={() => generateReel(dishes)}
            disabled={isSpinning}
            title="Xáo trộn lại dải thẻ"
            className="p-3 text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 rounded-2xl transition"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* WINNER SHOWCASE CARD */}
      {showResultCard && wonDish && (
        <div className="bg-gradient-to-b from-amber-50 via-white to-orange-50/50 rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-2xl animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-200/50 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-2 text-brand-600 text-xs font-black uppercase tracking-wider mb-4">
            <Sparkles className="w-4 h-4 text-amber-500 animate-spin-slow" />
            <span>Món Ăn Dành Riêng Cho Bữa Trưa Của Bạn!</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Dish Image */}
            <div className="md:col-span-4 h-56 rounded-2xl overflow-hidden shadow-lg border border-orange-200 relative">
              <img
                src={wonDish.image}
                alt={wonDish.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-zinc-900/90 backdrop-blur px-3 py-1 rounded-full text-xs font-black text-amber-400 shadow">
                {formatVND(wonDish.price)}
              </div>
            </div>

            {/* Dish & Restaurant info */}
            <div className="md:col-span-8 space-y-4">
              <div>
                <span className="text-xs font-bold text-brand-600 bg-brand-100 px-2.5 py-0.5 rounded-full">
                  {wonDish.category}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 mt-1">
                  {wonDish.name}
                </h3>
                {wonDish.description && (
                  <p className="text-xs text-zinc-600 mt-1 line-clamp-2">
                    {wonDish.description}
                  </p>
                )}
              </div>

              {/* Serving Restaurant */}
              <div className="bg-white p-4 rounded-2xl border border-orange-100 shadow-sm space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-zinc-800">
                    Phục vụ tại: <span className="text-brand-600">{wonDish.restaurantName}</span>
                  </h4>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{wonDish.restaurantRating}</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 flex items-center gap-1 truncate">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>{wonDish.restaurantAddress}</span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setInviteModalOpen(true)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-700 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center gap-2 hover:scale-105 transition"
                >
                  <CalendarHeart className="w-4 h-4" />
                  <span>Rủ Bạn Bè Đi Ăn Món Này Ngay! 🍜</span>
                </button>

                <Link
                  href={`/restaurants/${wonDish.restaurantId}`}
                  className="px-5 py-3 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 font-bold text-xs border border-zinc-300 flex items-center gap-1.5 transition"
                >
                  <span>Xem Chi Tiết Quán</span>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                </Link>

                <button
                  onClick={startSpin}
                  className="px-4 py-3 rounded-xl text-xs font-bold text-zinc-600 hover:text-zinc-900 transition flex items-center gap-1"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Quay món khác</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal for the won dish */}
      {wonDish && (
        <InviteModal
          isOpen={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          restaurantId={wonDish.restaurantId}
          restaurantName={wonDish.restaurantName}
          dishId={wonDish.id}
          dishName={wonDish.name}
          dishPrice={wonDish.price}
          dishImage={wonDish.image}
        />
      )}
    </div>
  );
}
