import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yêu cầu quyền Quản trị viên' }, { status: 403 });
    }

    const reports = await prisma.report.findMany({
      include: {
        reporter: {
          select: { id: true, name: true, email: true },
        },
        review: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            restaurant: { select: { id: true, name: true } },
          },
        },
        restaurant: {
          select: { id: true, name: true, address: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reports });
  } catch (error: any) {
    console.error('Lỗi lấy danh sách báo xấu:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yêu cầu quyền Quản trị viên' }, { status: 403 });
    }

    const body = await req.json();
    const { id, action, resolutionNote } = body;

    const report = await prisma.report.findUnique({
      where: { id },
      include: { review: true, restaurant: true },
    });

    if (!report) {
      return NextResponse.json({ error: 'Không tìm thấy báo cáo' }, { status: 404 });
    }

    if (action === 'DELETE_TARGET') {
      // If target is review, delete the review
      if (report.reviewId) {
        await prisma.review.delete({
          where: { id: report.reviewId },
        });
      } else if (report.restaurantId) {
        await prisma.restaurant.update({
          where: { id: report.restaurantId },
          data: { status: 'REJECTED', rejectReason: resolutionNote || 'Bị khoá do báo cáo vi phạm' },
        });
      }

      await prisma.report.update({
        where: { id },
        data: {
          status: 'RESOLVED',
          resolutionNote: resolutionNote || 'Đã xử lý và xoá bỏ nội dung vi phạm.',
        },
      });
    } else if (action === 'DISMISS') {
      await prisma.report.update({
        where: { id },
        data: {
          status: 'DISMISSED',
          resolutionNote: resolutionNote || 'Báo cáo không có căn cứ hoặc không vi phạm tiêu chuẩn.',
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Đã cập nhật báo cáo vi phạm' });
  } catch (error: any) {
    console.error('Lỗi xử lý báo cáo:', error);
    return NextResponse.json({ error: 'Không thể xử lý báo cáo' }, { status: 500 });
  }
}
