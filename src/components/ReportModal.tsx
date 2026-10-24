'use client';

import React, { useState } from 'react';
import { Flag, X, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'REVIEW' | 'RESTAURANT';
  targetId: string;
  targetTitle?: string;
}

export default function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
}: ReportModalProps) {
  const { user } = useAuth();
  const [reason, setReason] = useState('FAKE_REVIEW');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setMessage({ text: 'Vui lòng đăng nhập trước khi gửi báo cáo', isError: true });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType,
          targetId,
          reason,
          note,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ text: data.error || 'Có lỗi xảy ra', isError: true });
      } else {
        setMessage({ text: 'Báo cáo đã được gửi thành công đến Quản trị viên!' });
        setTimeout(() => {
          onClose();
          setMessage(null);
          setNote('');
        }, 1500);
      }
    } catch {
      setMessage({ text: 'Lỗi kết nối máy chủ', isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 text-red-600 mb-2">
          <div className="p-2 bg-red-50 rounded-xl">
            <Flag className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900">
            Báo xấu {targetType === 'REVIEW' ? 'bài đánh giá' : 'quán ăn'}
          </h3>
        </div>

        {targetTitle && (
          <p className="text-xs text-zinc-500 mb-4 bg-zinc-50 p-2.5 rounded-lg border border-zinc-100 line-clamp-2">
            Đối tượng: <strong className="text-zinc-700">{targetTitle}</strong>
          </p>
        )}

        {message && (
          <div
            className={`p-3 rounded-xl mb-4 text-xs font-semibold flex items-center gap-2 ${
              message.isError
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Lý do báo cáo vi phạm
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-sm border border-zinc-200 rounded-xl p-2.5 bg-zinc-50 focus:bg-white focus:outline-none focus:border-red-500 font-medium text-zinc-800"
            >
              <option value="FAKE_REVIEW">Đánh giá sai sự thật / Vu khống phá hoại</option>
              <option value="SPAM">Spam, quảng cáo không liên quan</option>
              <option value="OFFENSIVE">Ngôn từ khiếm nhã, thô tục, xúc phạm</option>
              <option value="WRONG_INFO">Thông tin sai lệch về quán / địa chỉ</option>
              <option value="OTHER">Lý do khác</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Chi tiết vi phạm (tuỳ chọn)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Vui lòng cung cấp thêm thông tin giúp admin dễ dàng kiểm tra..."
              className="w-full text-sm border border-zinc-200 rounded-xl p-3 bg-zinc-50 focus:bg-white focus:outline-none focus:border-red-500 text-zinc-800"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl transition"
            >
              Huỷ bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow transition disabled:opacity-50"
            >
              {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
