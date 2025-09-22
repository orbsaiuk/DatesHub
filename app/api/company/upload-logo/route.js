import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { writeClient } from "@/sanity/lib/serverClient";

export const runtime = "nodejs";

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return new NextResponse("No file", { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const asset = await writeClient.assets.upload("image", buffer, {
      filename: file.name || "logo.jpg",
      contentType: file.type || "image/jpeg",
    });

    const imageRef = {
      _type: "image",
      asset: { _type: "reference", _ref: asset._id },
    };

    return NextResponse.json({ ok: true, image: imageRef });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
