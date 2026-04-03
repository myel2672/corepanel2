import prisma from "../prisma";

export const createNotification = async (data: {
  businessId: number;
  userId: number;
  title: string;
  message: string;
  type?: "info" | "warning" | "success" | "error";
  link?: string;
}) => {
  try {
    await prisma.notification.create({ data });
  } catch {
    // Don't block the main flow
  }
};

export const notifyLowStock = async (businessId: number, productName: string, stock: number) => {
  const users = await prisma.user.findMany({
    where: { businessId },
    select: { id: true },
  });

  for (const user of users) {
    await createNotification({
      businessId,
      userId: user.id,
      title: "Stok Uyarısı",
      message: `"${productName}" ürününün stoğu azaldı: ${stock} adet`,
      type: "warning",
      link: "/products",
    });
  }
};

export const notifyNewOrder = async (businessId: number, orderId: number, productName: string) => {
  const users = await prisma.user.findMany({
    where: { businessId },
    select: { id: true },
  });

  for (const user of users) {
    await createNotification({
      businessId,
      userId: user.id,
      title: "Yeni Sipariş",
      message: `"${productName}" için yeni sipariş oluşturuldu`,
      type: "info",
      link: `/orders`,
    });
  }
};

export const notifyNewSale = async (businessId: number, productName: string, total: number) => {
  const users = await prisma.user.findMany({
    where: { businessId },
    select: { id: true },
  });

  for (const user of users) {
    await createNotification({
      businessId,
      userId: user.id,
      title: "Yeni Satış",
      message: `"${productName}" satıldı: ${total.toFixed(2)} ₺`,
      type: "success",
      link: "/sales",
    });
  }
};
