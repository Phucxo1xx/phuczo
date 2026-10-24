@echo on
chcp 65001 > nul
title FoodVibe - Review Quán Ăn & Trưa Nay Ăn Gì

echo ========================================================
echo         CHÀO MỪNG BẠN ĐẾN VỚI HỆ THỐNG FOODVIBE
echo   Website Review Quán Ăn - Trưa Nay Ăn Gì - Rủ Đi Ăn
echo ========================================================
echo.

:: 1. Kiểm tra Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [LỖI] Máy tính của bạn chưa cài đặt Node.js!
    echo Vui lòng tải và cài đặt Node.js LTS tại: https://nodejs.org
    echo Đang mở trình duyệt tải Node.js...
    start https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Đã tìm thấy Node.js:
node -v
echo.

:: 2. Cài đặt thư viện nếu chưa có node_modules
if not exist "node_modules\" (
    echo [1/3] Đang tiến hành cài đặt các thư viện cần thiết (npm install)...
    call npm install
    if %errorlevel% neq 0 (
        echo [LỖI] Không thể cài đặt thư viện! Vui lòng kiểm tra kết nối mạng.
        pause
        exit /b 1
    )
    echo [OK] Cài đặt thư viện thành công!
    echo.
) else (
    echo [1/3] Thư viện (node_modules) đã sẵn sàng.
)

:: 3. Kiểm tra và khởi tạo Database SQLite + Dữ liệu mẫu
if not exist "prisma\dev.db" (
    echo [2/3] Khởi tạo cơ sở dữ liệu SQLite và nạp dữ liệu mẫu...
    call npx prisma db push
    call node prisma/seed.js
    echo [OK] Đã nạp dữ liệu quán ăn, món ăn, tài khoản mẫu thành công!
    echo.
) else (
    echo [2/3] Cơ sở dữ liệu SQLite đã sẵn sàng.
)

:: 4. Khởi động máy chủ và tự động mở trình duyệt
echo [3/3] Đang khởi động máy chủ FoodVibe tại http://localhost:3000...
echo.
echo ========================================================
echo   TRÌNH DUYỆT SẼ TỰ ĐỘNG MỞ TRONG VÀI GIÂY NỮA...
echo   Nhấn Ctrl + C để dừng máy chủ khi không sử dụng.
echo ========================================================
echo.

:: Mở trình duyệt sau 3 giây
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"

:: Chạy server
call npm run dev
pause
