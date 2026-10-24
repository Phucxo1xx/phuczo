#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================================"
echo "        CHÀO MỪNG BẠN ĐẾN VỚI HỆ THỐNG FOODVIBE"
echo "  Website Review Quán Ăn - Trưa Nay Ăn Gì - Rủ Đi Ăn"
echo "========================================================"
echo ""

# 1. Kiểm tra Node.js (hỗ trợ cả Windows + WSL)
if ! command -v node &> /dev/null; then
    WINDOWS_NODE_PATHS=(
        "/mnt/c/Program Files/nodejs/node.exe"
        "/c/Program Files/nodejs/node.exe"
        "/mnt/c/Program Files/nodejs/node"
        "/c/Program Files/nodejs/node"
    )

    for candidate in "${WINDOWS_NODE_PATHS[@]}"; do
        if [ -x "$candidate" ]; then
            export PATH="$(dirname "$candidate"):$PATH"
            break
        fi
    done
fi

if ! command -v node &> /dev/null; then
    echo "[LỖI] Máy tính của bạn chưa cài đặt Node.js!"
    echo "Vui lòng tải và cài đặt Node.js LTS tại: https://nodejs.org"
    exit 1
fi

# 2. Đảm bảo npm có sẵn (hỗ trợ cả Windows + WSL)
if ! command -v npm &> /dev/null; then
    WINDOWS_NPM_PATHS=(
        "/mnt/c/Program Files/nodejs/npm.cmd"
        "/c/Program Files/nodejs/npm.cmd"
        "/mnt/c/Program Files/nodejs/npm"
        "/c/Program Files/nodejs/npm"
    )

    for candidate in "${WINDOWS_NPM_PATHS[@]}"; do
        if [ -f "$candidate" ]; then
            export PATH="$(dirname "$candidate"):$PATH"
            break
        fi
    done
fi

if ! command -v npm &> /dev/null; then
    echo "[LỖI] Node.js đã có nhưng npm không được tìm thấy trong PATH."
    exit 1
fi

echo "[OK] Đã tìm thấy Node.js: $(node -v)"
echo ""

# 3. Cài đặt thư viện nếu chưa có node_modules
if [ ! -d "node_modules" ]; then
    echo "[1/3] Đang tiến hành cài đặt các thư viện cần thiết (npm install)..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[LỖI] Không thể cài đặt thư viện! Vui lòng kiểm tra kết nối mạng."
        exit 1
    fi
    echo "[OK] Cài đặt thư viện thành công!"
    echo ""
else
    echo "[1/3] Thư viện (node_modules) đã sẵn sàng."
fi

# 4. Kiểm tra và khởi tạo Database SQLite + Dữ liệu mẫu
if [ ! -f "prisma/dev.db" ]; then
    echo "[2/3] Khởi tạo cơ sở dữ liệu SQLite và nạp dữ liệu mẫu..."
    npx prisma db push
    node prisma/seed.js
    echo "[OK] Đã nạp dữ liệu quán ăn, món ăn, tài khoản mẫu thành công!"
    echo ""
else
    echo "[2/3] Cơ sở dữ liệu SQLite đã sẵn sàng."
fi

# 5. Khởi động máy chủ và mở trình duyệt
echo "[3/3] Đang khởi động máy chủ FoodVibe tại http://localhost:3000..."
echo ""
echo "========================================================"
echo "  Truy cập ngay: http://localhost:3000"
echo "  Nhấn Ctrl + C để dừng máy chủ khi không sử dụng."
echo "========================================================"
echo ""

# Mở trình duyệt tuỳ hệ điều hành
if command -v cmd.exe &> /dev/null; then
    (sleep 3 && cmd.exe /c start http://localhost:3000) &
elif command -v powershell.exe &> /dev/null; then
    (sleep 3 && powershell.exe -NoProfile -Command "Start-Process 'http://localhost:3000'") &
elif command -v xdg-open &> /dev/null; then
    (sleep 3 && xdg-open http://localhost:3000) &
elif command -v open &> /dev/null; then
    (sleep 3 && open http://localhost:3000) &
fi

npm run dev
