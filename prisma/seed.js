const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with realistic Vietnamese food data...');

  // Clear existing
  await prisma.notification.deleteMany();
  await prisma.eatInvitation.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.report.deleteMany();
  await prisma.review.deleteMany();
  await prisma.dish.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();

  const hashedAdminPass = await bcrypt.hash('admin123', 10);
  const hashedOwnerPass = await bcrypt.hash('owner123', 10);
  const hashedUserPass = await bcrypt.hash('user123', 10);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      name: 'Quản Trị Viên (Admin)',
      email: 'admin@foodvibe.vn',
      password: hashedAdminPass,
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      bio: 'Quản trị viên FoodVibe - Kiểm duyệt nội dung & duy trì cộng đồng ẩm thực uy tín.',
    },
  });

  const owner1 = await prisma.user.create({
    data: {
      name: 'Cô Lan (Chủ Quán Phở Thìn)',
      email: 'owner.lan@foodvibe.vn',
      password: hashedOwnerPass,
      role: 'OWNER',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      phone: '0912345678',
      bio: 'Gia truyền hơn 40 năm phở bò tái lăn phố cổ Hà Nội.',
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      name: 'Anh Nam (Chủ Quán Hương Liên)',
      email: 'owner.nam@foodvibe.vn',
      password: hashedOwnerPass,
      role: 'OWNER',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      phone: '0988776655',
      bio: 'Bún chả nướng than hoa gia truyền chuẩn vị Hà Thành.',
    },
  });

  const owner3 = await prisma.user.create({
    data: {
      name: 'Chị Linh (Chủ Quán BBQ & Trà Sữa)',
      email: 'owner.linh@foodvibe.vn',
      password: hashedOwnerPass,
      role: 'OWNER',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      phone: '0933221100',
      bio: 'Không gian lẩu nướng trẻ trung, đồ uống thơm ngon.',
    },
  });

  const userViet = await prisma.user.create({
    data: {
      name: 'Nguyễn Quốc Việt',
      email: 'viet@foodvibe.vn',
      password: hashedUserPass,
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      bio: 'Đam mê ẩm thực đường phố Hà Nội và các món bún phở truyền thống.',
    },
  });

  const userMai = await prisma.user.create({
    data: {
      name: 'Trần Tuyết Mai',
      email: 'mai@foodvibe.vn',
      password: hashedUserPass,
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      bio: 'Food Reviewer kiêm chuyên gia thẩm định món ăn vặt & trà sữa.',
    },
  });

  const userHoang = await prisma.user.create({
    data: {
      name: 'Lê Huy Hoàng',
      email: 'hoang@foodvibe.vn',
      password: hashedUserPass,
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
      bio: 'Dân văn phòng mỗi trưa đều tự hỏi: Hôm nay ăn gì?',
    },
  });

  // 2. Create Restaurants
  const restPhoThin = await prisma.restaurant.create({
    data: {
      name: 'Phở Thìn Lò Đúc',
      description: 'Thương hiệu phở bò tái lăn trứ danh Hà Nội với nước dùng béo ngậy thơm lừng, hành lá ngập tràn bát phở truyền thống.',
      address: '13 Lò Đúc, Phạm Đình Hổ, Hai Bà Trưng',
      city: 'Hà Nội',
      district: 'Hai Bà Trưng',
      phone: '024 3821 2709',
      openingHours: '06:00 - 20:30',
      priceRange: '$$',
      coverImage: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800',
        'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=800',
        'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
      ]),
      status: 'APPROVED',
      ownerId: owner1.id,
      dishes: {
        create: [
          {
            name: 'Phở Tái Lăn Đặc Biệt',
            description: 'Thịt bò xào lăn lửa lớn với gừng tỏi thơm phức, ngập tràn hành hoa và nước dùng ngọt đậm đà.',
            price: 70000,
            image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600',
            category: 'Bún/Phở',
          },
          {
            name: 'Phở Tái Nạm Gầu Bò',
            description: 'Gầu giòn sần sật quyện nước phở bò gia truyền 40 năm.',
            price: 80000,
            image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600',
            category: 'Bún/Phở',
          },
          {
            name: 'Quẩy Giòn Phố Cổ',
            description: 'Đĩa quẩy vàng giòn rụm chấm nước phở nóng hổi.',
            price: 10000,
            image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600',
            category: 'Đồ ăn kèm',
          },
          {
            name: 'Trứng Gà Chần Nước Phở',
            description: 'Trứng gà ta lòng đào béo ngậy thơm ngon.',
            price: 15000,
            image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600',
            category: 'Đồ ăn kèm',
          },
        ],
      },
    },
  });

  const restBunCha = await prisma.restaurant.create({
    data: {
      name: 'Bún Chả Hương Liên (Obama)',
      description: 'Quán bún chả nổi tiếng từng đón tiếp cựu Tổng thống Mỹ Barack Obama và đầu bếp Anthony Bourdain năm 2016.',
      address: '24 Lê Văn Hưu, Phan Chu Trinh, Hoàn Kiếm',
      city: 'Hà Nội',
      district: 'Hoàn Kiếm',
      phone: '024 3943 4106',
      openingHours: '08:00 - 20:30',
      priceRange: '$$',
      coverImage: 'https://images.unsplash.com/photo-1569058242252-623df46b5025?w=800',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1569058242252-623df46b5025?w=800',
        'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800',
      ]),
      status: 'APPROVED',
      ownerId: owner2.id,
      dishes: {
        create: [
          {
            name: 'Combo Bún Chả Obama',
            description: '1 suất bún chả nướng đặc biệt + 1 nem hải sản + 1 chai bia Hà Nội.',
            price: 95000,
            image: 'https://images.unsplash.com/photo-1569058242252-623df46b5025?w=600',
            category: 'Bún/Phở',
          },
          {
            name: 'Bún Chả Nướng Than Hoa',
            description: 'Chả miếng và chả viên nướng xém cạnh thơm lừng, nước mắm pha chua ngọt vừa vặn cùng đu đủ cà rốt.',
            price: 60000,
            image: 'https://images.unsplash.com/photo-1569058242252-623df46b5025?w=600',
            category: 'Bún/Phở',
          },
          {
            name: 'Nem Cua Bể Giòn Tan',
            description: 'Nem cua bể vỏ giòn rụm, nhân thịt cua bể tươi đậm vị ngọt.',
            price: 35000,
            image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600',
            category: 'Đồ ăn kèm',
          },
        ],
      },
    },
  });

  const restKombo = await prisma.restaurant.create({
    data: {
      name: 'Cơm Niêu Singapore Kombo',
      description: 'Hệ thống cơm niêu phong cách Singapore với lớp cháy vàng giòn rụm 2 mặt và các loại sốt thơm đậm đà.',
      address: '60 Lê Văn Thiêm, Thanh Xuân',
      city: 'Hà Nội',
      district: 'Thanh Xuân',
      phone: '0971 615 775',
      openingHours: '10:00 - 21:30',
      priceRange: '$$',
      coverImage: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800',
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
      ]),
      status: 'APPROVED',
      ownerId: owner2.id,
      dishes: {
        create: [
          {
            name: 'Cơm Niêu Bò Sốt Tiêu Đen (Cháy 2 Mặt)',
            description: 'Cơm cháy giòn tan thơm bùi kết hợp thịt bò mềm ngọt ngập trong sốt tiêu đen cay nồng.',
            price: 79000,
            image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600',
            category: 'Cơm',
          },
          {
            name: 'Cơm Niêu Gà Sốt Nấm',
            description: 'Thịt gà xào nấm đông cô sốt sánh mịn, cơm niêu thơm dẻo.',
            price: 75000,
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
            category: 'Cơm',
          },
          {
            name: 'Canh Chua Thịt Bằm',
            description: 'Bát canh chua thanh mát ăn kèm cơm niêu.',
            price: 20000,
            image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600',
            category: 'Đồ ăn kèm',
          },
        ],
      },
    },
  });

  const restOc = await prisma.restaurant.create({
    data: {
      name: 'Ốc & Ăn Vặt Hà Trang Phố Cổ',
      description: 'Điểm hẹn hò ăn vặt quen thuộc của giới trẻ Hà Nội với các món ốc luộc mắm gừng, ốc hương sốt trứng muối béo ngậy.',
      address: '1 Đinh Liệt, Hàng Bạc, Hoàn Kiếm',
      city: 'Hà Nội',
      district: 'Hoàn Kiếm',
      phone: '0904 883 311',
      openingHours: '14:00 - 23:00',
      priceRange: '$',
      coverImage: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800',
      ]),
      status: 'APPROVED',
      ownerId: owner3.id,
      dishes: {
        create: [
          {
            name: 'Ốc Hương Sốt Trứng Muối',
            description: 'Ốc hương tươi giòn sần sật quyện sốt trứng muối béo ngậy chấm kèm bánh mì nóng giòn.',
            price: 90000,
            image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600',
            category: 'Đồ ăn vặt',
          },
          {
            name: 'Nem Chua Rán Phố Cổ',
            description: 'Đĩa nem chua rán nóng hổi, giòn ngoài mềm trong chấm tương ớt cay xè.',
            price: 45000,
            image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600',
            category: 'Đồ ăn vặt',
          },
          {
            name: 'Chân Gà Rút Xương Sả Tắc',
            description: 'Chân gà giòn sần sật ngâm sốt chua ngọt sả tắc thơm nức mũi.',
            price: 55000,
            image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600',
            category: 'Đồ ăn vặt',
          },
        ],
      },
    },
  });

  const restTea = await prisma.restaurant.create({
    data: {
      name: 'Boba Cheese Tea & Bakery',
      description: 'Thiên đường trà sữa trân châu phô mai nướng và bánh ngọt Pháp với view sống ảo tuyệt đẹp.',
      address: '152 Chùa Bộc, Đống Đa',
      city: 'Hà Nội',
      district: 'Đống Đa',
      phone: '0981 223 445',
      openingHours: '08:30 - 22:30',
      priceRange: '$',
      coverImage: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=800',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1558857563-b371033873b8?w=800',
      ]),
      status: 'APPROVED',
      ownerId: owner3.id,
      dishes: {
        create: [
          {
            name: 'Trà Sữa Nướng Trân Châu Đường Đen',
            description: 'Vị trà đậm đà, kem cheese nướng thơm béo và trân châu đường đen dẻo quánh.',
            price: 38000,
            image: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=600',
            category: 'Đồ uống/Trà sữa',
          },
          {
            name: 'Trà Đào Cam Sả Tươi Mát',
            description: 'Trà thanh mát với miếng đào giòn ngọt và tinh dầu sả cam sảng khoái.',
            price: 35000,
            image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600',
            category: 'Đồ uống/Trà sữa',
          },
        ],
      },
    },
  });

  // 3. Create Pending Restaurant (Waiting for Admin approval)
  const restPending = await prisma.restaurant.create({
    data: {
      name: 'Lẩu Nướng Ngói BBQ Sapa',
      description: 'Mô hình nướng trên ngói gốm không khói giữ trọn vị ngọt tự nhiên của thịt bò Ba Chỉ và hải sản ướp sốt Tây Bắc.',
      address: '88 Nguyễn Khang, Cầu Giấy',
      city: 'Hà Nội',
      district: 'Cầu Giấy',
      phone: '0944 556 778',
      openingHours: '16:00 - 23:30',
      priceRange: '$$$',
      coverImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
      ]),
      status: 'PENDING', // PENDING ADMIN APPROVAL!
      ownerId: owner3.id,
      dishes: {
        create: [
          {
            name: 'Set Nướng Bò Ba Chỉ Sốt Hạt Dổi',
            description: 'Ba chỉ bò Mỹ cuộn nấm kim châm ướp hạt dổi mắc khén thơm nức mũi.',
            price: 189000,
            image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600',
            category: 'Lẩu & Nướng',
          },
        ],
      },
    },
  });

  // 4. Create Reviews
  const rev1 = await prisma.review.create({
    data: {
      restaurantId: restPhoThin.id,
      userId: userViet.id,
      rating: 5,
      content: 'Phở Thìn ăn từ bé đến giờ vẫn chuẩn vị. Nước dùng ngập hành hoa, thịt bò xào lăn thơm phức ngập mồm. Thêm đĩa quẩy giòn và chút dấm ớt tỏi là đúng bài chuẩn Hà Nội!',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600',
        'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600',
      ]),
    },
  });

  const rev2 = await prisma.review.create({
    data: {
      restaurantId: restPhoThin.id,
      userId: userMai.id,
      rating: 4,
      content: 'Bát phở đầy đặn, bò mềm ngọt, nước dùng khá béo ngậy hợp với bạn nào thích phở đậm đà. Điểm trừ là quán hơi đông vào giờ cao điểm sáng cuối tuần.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600',
      ]),
    },
  });

  const rev3 = await prisma.review.create({
    data: {
      restaurantId: restBunCha.id,
      userId: userMai.id,
      rating: 5,
      content: 'Bún chả nướng than hoa thơm lừng cả con phố Lê Văn Hưu! Nước chấm cân bằng vị ngọt thanh chua dịu, nem cua bể siêu nhiều thịt cua, rất đáng thử!',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1569058242252-623df46b5025?w=600',
      ]),
    },
  });

  // Suspicious / Malicious review to demonstrate Admin moderation & Report feature
  const fakeReview = await prisma.review.create({
    data: {
      restaurantId: restKombo.id,
      userId: userHoang.id,
      rating: 1,
      content: 'Cơm ở đây dở tệ, phục vụ như đuổi khách! Mọi người qua quán đối diện bên đường ăn ngon hơn nhiều đừng vào đây!',
      images: JSON.stringify([]),
    },
  });

  // 5. Create Report on fake review
  await prisma.report.create({
    data: {
      reporterId: userViet.id,
      targetType: 'REVIEW',
      reviewId: fakeReview.id,
      reason: 'FAKE_REVIEW',
      note: 'Tài khoản này nghi vấn là đối thủ cạnh tranh cố tình đánh giá 1 sao và chèo kéo khách sang quán khác.',
      status: 'PENDING',
    },
  });

  // 6. Create Friendships
  // Viet and Mai are accepted friends
  await prisma.friendship.create({
    data: {
      requesterId: userViet.id,
      receiverId: userMai.id,
      status: 'ACCEPTED',
    },
  });

  // Hoang sent a friend request to Viet
  await prisma.friendship.create({
    data: {
      requesterId: userHoang.id,
      receiverId: userViet.id,
      status: 'PENDING',
    },
  });

  // 7. Create Eat Invitation
  const phoThinDish = await prisma.dish.findFirst({
    where: { restaurantId: restPhoThin.id },
  });

  const inviteDate = new Date();
  inviteDate.setHours(12, 0, 0, 0);

  await prisma.eatInvitation.create({
    data: {
      senderId: userMai.id,
      receiverId: userViet.id,
      restaurantId: restPhoThin.id,
      dishId: phoThinDish ? phoThinDish.id : null,
      proposedTime: inviteDate,
      note: 'Trưa nay rủ cậu đi ăn bát Phở Tái Lăn Lò Đúc nóng hổi nhé, tớ bao đĩa quẩy giòn!',
      status: 'PENDING',
    },
  });

  // 8. Notifications
  await prisma.notification.create({
    data: {
      userId: userViet.id,
      title: 'Lời mời đi ăn mới!',
      message: 'Trần Tuyết Mai đã rủ bạn đi ăn tại Phở Thìn Lò Đúc vào trưa nay.',
      type: 'INVITATION',
      link: '/invitations',
    },
  });

  await prisma.notification.create({
    data: {
      userId: userViet.id,
      title: 'Lời mời kết bạn',
      message: 'Lê Huy Hoàng đã gửi lời mời kết bạn đến bạn.',
      type: 'FRIEND_REQUEST',
      link: '/friends',
    },
  });

  await prisma.notification.create({
    data: {
      userId: admin.id,
      title: 'Quán mới chờ duyệt',
      message: 'Lẩu Nướng Ngói BBQ Sapa đang chờ được phê duyệt.',
      type: 'RESTAURANT_STATUS',
      link: '/admin?tab=restaurants',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
