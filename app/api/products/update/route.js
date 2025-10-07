import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { updateProduct } from "@/services/sanity/products";

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type");
    let productData;
    let imageFile = null;

    if (contentType?.includes("multipart/form-data")) {
      const formData = await request.formData();
      const jsonData = formData.get("json");
      imageFile = formData.get("file");

      if (!jsonData) {
        return NextResponse.json(
          { error: "بيانات المنتج مطلوبة" },
          { status: 400 }
        );
      }

      productData = JSON.parse(jsonData);
    } else {
      productData = await request.json();
    }

    const { id, ...updateData } = productData;

    if (!id) {
      return NextResponse.json({ error: "معرف المنتج مطلوب" }, { status: 400 });
    }

    // Handle image upload if provided
    let imageAsset = null;
    if (imageFile) {
      const { writeClient } = await import("@/sanity/lib/serverClient");
      imageAsset = await writeClient.assets.upload("image", imageFile);
    }

    const updatedProduct = await updateProduct(id, {
      ...updateData,
      imageAsset,
    });

    return NextResponse.json({
      ok: true,
      message: "تم تحديث المنتج بنجاح",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);

    if (error.message?.includes("not found")) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ error: "فشل في تحديث المنتج" }, { status: 500 });
  }
}
