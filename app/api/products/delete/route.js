import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteProduct } from "@/services/sanity/products";

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "معرف المنتج مطلوب" }, { status: 400 });
    }

    await deleteProduct(id);

    return NextResponse.json({
      ok: true,
      message: "تم حذف المنتج بنجاح",
    });
  } catch (error) {
    // Handle case where product doesn't exist
    if (error.message?.includes("not found")) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ error: "فشل في حذف المنتج" }, { status: 500 });
  }
}
