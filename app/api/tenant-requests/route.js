import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/serverClient";
import { uuid } from "@sanity/uuid";
import { sendEmail, buildBasicHtmlEmail } from "@/lib/email";
import { getUserPendingTenantRequest } from "@/services/sanity/tenantRequest";

export const runtime = "nodejs";

export async function GET(request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const pendingRequest = await getUserPendingTenantRequest(userId);

    if (pendingRequest) {
      return NextResponse.json({
        hasPendingRequest: true,
        request: pendingRequest,
      });
    }

    return NextResponse.json({
      hasPendingRequest: false,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to check pending request" },
      { status: 500 }
    );
  }
}

async function parseMultipartAndUploadLogo(request) {
  const formData = await request.formData();
  const dataStr = formData.get("data") || formData.get("payload");
  const logoFile = formData.get("logo") || formData.get("file");
  let data = {};
  if (typeof dataStr === "string") {
    try {
      data = JSON.parse(dataStr);
    } catch {}
  }

  let logoImageRef = null;
  if (logoFile && typeof logoFile !== "string") {
    try {
      const arrayBuffer = await logoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const asset = await writeClient.assets.upload("image", buffer, {
        filename: logoFile.name || "logo.jpg",
        contentType: logoFile.type || "image/jpeg",
      });
      logoImageRef = {
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
      };
    } catch (e) {
      return { error: `logo_upload_failed:${String(e)}` };
    }
  }

  return { data, logoImageRef };
}

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });
  try {
    // Verify server can write to Sanity
    if (!process.env.SANITY_API_TOKEN && !process.env.SANITY_WRITE_TOKEN) {
      return NextResponse.json(
        { ok: false, error: "sanity_token_missing" },
        { status: 500 }
      );
    }
    const contentType = request.headers.get("content-type") || "";

    let body = null;
    let logoImageRef = null;

    if (contentType.includes("multipart/form-data")) {
      const parsed = await parseMultipartAndUploadLogo(request);
      if (parsed?.error) {
        return NextResponse.json(
          { ok: false, error: parsed.error },
          { status: 400 }
        );
      }
      body = parsed.data || {};
      logoImageRef = parsed.logoImageRef;
    } else {
      body = await request.json();
    }

    const {
      tenantType,
      name,
      website,
      email,
      description,
      totalEmployees,
      foundingYear,
      registrationNumber,
      companyType,
      categories,
      extraServices,
      socialLinks,
      contact,
      locations,
      openingHours,
    } = body || {};

    if (!tenantType) return new NextResponse("Missing fields", { status: 400 });

    const doc = {
      _type: "tenantRequest",
      tenantType,
      requestedBy: userId,
      status: "pending",
      name: name || null,
      website: website || null,
      email: email || null,
      description: description || null,
      totalEmployees: totalEmployees || null,
      foundingYear:
        typeof foundingYear === "number"
          ? foundingYear
          : foundingYear
            ? Number(foundingYear)
            : null,
      registrationNumber:
        typeof registrationNumber === "number"
          ? registrationNumber
          : registrationNumber
            ? Number(registrationNumber)
            : null,
      companyType: companyType || null,
      categories: categories,
      extraServices: extraServices,
      socialLinks: Array.isArray(socialLinks)
        ? socialLinks.filter(Boolean)
        : [],
      contact: contact || null,
      locations: Array.isArray(locations)
        ? locations.map((l) => ({
            _key: l?._key || uuid(),
            country: l?.country || null,
            city: l?.city || null,
            address: l?.address || null,
            region: l?.region || null,
            zipCode: l?.zipCode || null,
            geo:
              l?.geo &&
              typeof l.geo.lat === "number" &&
              typeof l.geo.lng === "number"
                ? { _type: "geopoint", lat: l.geo.lat, lng: l.geo.lng }
                : undefined,
          }))
        : [],
      openingHours: openingHours,
    };

    if (logoImageRef) {
      doc.logo = logoImageRef;
    }

    // Check if user already has a pending request
    const existing = await writeClient.fetch(
      `*[_type == "tenantRequest" && requestedBy == $uid && status == "pending"][0]{ _id, tenantType, name }`,
      { uid: userId }
    );

    if (existing?._id) {
      return NextResponse.json(
        {
          ok: false,
          error: "existing_pending_request",
          message:
            "لديك طلب قيد المراجعة بالفعل. يرجى انتظار مراجعة طلبك الحالي.",
          existingRequestId: existing._id,
        },
        { status: 409 }
      );
    }

    const created = await writeClient.create(doc, {
      autoGenerateArrayKeys: true,
    });

    // CRITICAL: Send emails BEFORE returning response (serverless requirement)
    const emailPromises = [];

    // Applicant confirmation email
    const toEmail = (email || doc?.contact?.email || "").trim();
    if (toEmail) {
      const subject = `تم استلام طلبك: ${name || "طلبك"}`;
      const html = buildBasicHtmlEmail("تم استلام الطلب", [
        `شكراً لتقديم طلب ${tenantType === "company" ? "الشركة" : "المورد"}${name ? ` لـ ${name}` : ""}.`,
        "سيقوم فريقنا بمراجعته وإشعارك عند الموافقة أو إذا كنا بحاجة إلى تفاصيل إضافية.",
      ]);
      emailPromises.push(sendEmail({ to: toEmail, subject, html }));
    }

    // Admin notification email
    const adminEmail = (process.env.ADMIN_NOTIFIER_EMAIL || "").trim();
    if (adminEmail) {
      const subject = `[طلب ${tenantType === "company" ? "شركة" : "مورد"} جديد] ${name || "بدون عنوان"}`;
      const html = buildBasicHtmlEmail("طلب جديد", [
        `النوع: ${tenantType === "company" ? "شركة" : "مورد"}`,
        `الاسم: ${name || "-"}`,
        `البريد الإلكتروني: ${toEmail || "-"}`,
      ]);
      emailPromises.push(sendEmail({ to: adminEmail, subject, html }));
    }

    // Wait for all emails to complete before returning response
    if (emailPromises.length > 0) {
      await Promise.allSettled(emailPromises);
    }

    return NextResponse.json({ ok: true, id: created?._id });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
