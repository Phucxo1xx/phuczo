# 🍜 FoodVibe - Website Review Quán Ăn, Trưa Nay Ăn Gì & Rủ Bạn Đi Ăn

**FoodVibe** là nền tảng khám phá và đánh giá ẩm thực chân thực, tích hợp vòng quay ẩm thực phong cách mở hòm CS:GO (lấy cảm hứng từ [truanayangi](https://github.com/truanayangi-com/truanayangi)) cùng hệ thống mạng xã hội kết bạn và "rủ nhau đi ăn".

---

## 🚀 Cách Chạy Nhanh Trên Máy Local (1-Click)

### Dành cho Windows:
Chỉ cần **nhấp đúp chuột vào file `start.bat`**. 
Script sẽ tự động:
1. Kiểm tra Node.js.
2. Tự động cài đặt thư viện (`npm install`) nếu chưa có.
3. Tự động thiết lập cơ sở dữ liệu SQLite và nạp dữ liệu mẫu (`prisma db push & seed`).
4. Khởi chạy máy chủ và **tự động mở trình duyệt tại `http://localhost:3000`**!

### Dành cho macOS / Linux:
Mở Terminal tại thư mục dự án và chạy:
```bash
chmod +x start.sh
./start.sh
```

---

## 💻 Cách Chạy Thủ Công (Dòng Lệnh)

Nếu muốn tự chạy bằng dòng lệnh:

```bash
# 1. Cài đặt các gói phụ thuộc
npm install

# 2. Khởi tạo cơ sở dữ liệu SQLite & nạp dữ liệu quán ăn mẫu
npx prisma db push
node prisma/seed.js

# 3. Khởi động máy chủ ở chế độ Development
npm run dev

# Hoặc Build & chạy bản Production:
npm run build
npm start
```
Truy cập: **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Tài Khoản Trải Nghiệm Mẫu (Demo)

Tại trang Đăng nhập (`/login`), hệ thống có sẵn **4 nút bấm đăng nhập nhanh 1-click**:

| Vai Trò | Email | Mật Khẩu | Quyền Hạn & Tính Năng Nổi Bật |
| :--- | :--- | :--- | :--- |
| **👑 Quản trị viên (Admin)** | `admin@foodvibe.vn` | `admin123` | Phê duyệt quán ăn mới của chủ quán, xoá review sai sự thật/vu khống, xử lý báo xấu cộng đồng. |
| **🏪 Chủ quán (Owner)** | `owner.lan@foodvibe.vn` | `owner123` | Đăng ký địa điểm quán ăn mới, cập nhật hình ảnh không gian, thêm món ăn và đặt giá tiền vào Menu. |
| **🍜 Thực khách (User)** | `viet@foodvibe.vn` | `user123` | Viết bài review kèm nhiều ảnh chụp thật, quay roulette món ăn, kết bạn và nhận lời mời đi ăn. |
| **📸 Reviewer (User)** | `mai@foodvibe.vn` | `user123` | Thẩm định món ăn, tạo lời mời "Rủ bạn bè đi ăn món A tại quán B". |

---

## ✨ Các Tính Năng Chính Của Hệ Thống

1. **Người dùng đăng review & ảnh thực tế (`/restaurants/[id]`):** Tự do chia sẻ đánh giá 1–5 sao, tải lên ảnh thực tế lưu trữ trực tiếp trên server local (`/public/uploads`).
2. **Khu vực Chủ quán (`/owner`):** Tạo địa điểm quán, thông tin liên hệ, giờ mở cửa, thêm món ăn kèm giá tiền chi tiết.
3. **Quản trị viên Admin Hub (`/admin`):** Duyệt các quán ăn đang chờ duyệt (`PENDING`), kiểm duyệt gỡ bỏ các bài review sai sự thật, giải quyết hàng chờ báo xấu.
4. **Hệ thống Báo xấu (Report):** Toàn bộ người dùng đều có thể nhấn nút lá cờ 🚩 để báo cáo quán ăn hoặc review sai sự thật, spam, ngôn từ thô tục.
5. **Trưa nay ăn gì? - Roulette CS:GO (`/trua-nay-an-gi`):** Dải cuộn 60 thẻ món ăn phong cách mở hòm CS:GO, âm thanh tick-sound & fanfare kèn mừng chiến thắng, pháo hoa giấy confetti và nút "Rủ bạn đi ăn món này ngay".
6. **Hệ thống Bạn bè (`/friends`):** Tìm kiếm người dùng, gửi/nhận lời mời kết bạn.
7. **Tính năng "Rủ nhau đi ăn" (`/invitations`):** Mời bạn bè đi ăn món cụ thể tại quán cụ thể kèm ngày giờ và lời nhắn, hộp thư lời mời theo dõi trạng thái Đồng ý / Từ chối.

---

## 🛠️ Công Nghệ Sử Dụng

- **Framework:** Next.js 14 (App Router, React 18, TypeScript)
- **Styling & UI:** Tailwind CSS, Lucide Icons, Canvas Confetti
- **Audio:** Web Audio API (tổng hợp âm thanh không cần file ngoài)
- **Database & ORM:** Prisma ORM với SQLite (chạy local hoàn toàn không cần cài MySQL/Postgres)
- **Authentication:** JWT HTTP-only Cookies & bcryptjs
