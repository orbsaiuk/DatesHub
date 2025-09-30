import { sendEmail, buildBasicHtmlEmail } from "@/lib/email";
import { writeClient } from "@/sanity/lib/serverClient";
import { currentUser } from "@clerk/nextjs/server";
import { formatTime } from "@/lib/dateUtils";

// Sends a confirmation email to the customer after submitting an event request
export async function sendEventRequestConfirmationToCustomer(eventRequest) {
  try {
    // Try to get the email of the currently authenticated user (the requester)
    let customerEmail = null;
    try {
      const user = await currentUser();
      if (user?.id === eventRequest.requestedBy) {
        customerEmail =
          user?.primaryEmailAddress?.emailAddress ||
          user?.emailAddresses?.[0]?.emailAddress;
      }
    } catch (error) {
      console.warn("Could not get customer email from Clerk:", error);
    }

    if (!customerEmail && eventRequest?.email) {
      customerEmail = eventRequest.email;
    }

    if (!customerEmail) {
      return { ok: false, reason: "no customer email" };
    }

    const subject = "تم استلام طلب الفعالية الخاص بك";
    const html = buildBasicHtmlEmail("تم تقديم طلب الفعالية", [
      `مرحباً ${eventRequest.fullName || "بك"},`,
      "",
      "شكراً لك لتقديم طلب الفعالية. لقد قمنا بمشاركته مع الشركة.",
      "",
      "إليك التفاصيل التي قدمتها:",
      `• الخدمة: ${eventRequest.serviceRequired}`,
      `• التاريخ: ${new Date(eventRequest.eventDate).toLocaleDateString("ar-SA")}`,
      `• الوقت: ${formatTime(eventRequest.eventTime)}`,
      `• عدد الضيوف: ${eventRequest.numberOfGuests}`,
      `• الموقع: ${eventRequest.eventLocation}`,
      "",
      "سنقوم بإشعارك فور رد الشركة.",
      "",
      "مع أطيب التحيات،",
      "فريق OrbsAI",
    ]);

    const emailResult = await sendEmail({ to: customerEmail, subject, html });
    if (emailResult.ok) {
      return { ok: true, data: emailResult.data };
    }
    return { ok: false, error: emailResult.error || emailResult.reason };
  } catch (error) {
    console.error(
      "Error sending event request confirmation to customer:",
      error
    );
    return { ok: false, error: String(error) };
  }
}

export async function sendApprovalEmail(reqDoc) {
  try {
    const to = reqDoc.email || reqDoc.contact?.email;
    if (!to) return { ok: false, reason: "no email address" };

    const entityType = reqDoc.tenantType || "company";
    const entityLabel = entityType === "supplier" ? "موردك" : "شركتك";

    const subject = `🎉 تم قبول تسجيل ${entityLabel}!`;
    const html = buildBasicHtmlEmail(`مرحباً بك في منصتنا!`, [
      `مرحباً${reqDoc?.name ? ` ${reqDoc.name}` : ""},`,
      "",
      `أخبار رائعة! تم **قبول** ومعالجة طلب تسجيل ${entityLabel}.`,
      "",
      "**ماذا يحدث بعد ذلك:**",
      `• تم إنشاء ملف ${entityLabel} الشخصي وهو متاح الآن`,
      "• يمكنك الآن الوصول إلى لوحة التحكم لإدارة ملفك الشخصي",
      "• ابدأ بالتواصل مع الشركاء والعملاء المحتملين",
      "• حديث معلومات شركتك في أي وقت",
      "",
      "**بدء العمل:**",
      "1. قم بتسجيل الدخول إلى حسابك للوصول إلى لوحة التحكم",
      "2. أكمل ملفك الشخصي بالتفاصيل الإضافية",
      "3. تصفح وتواصل مع الشركات الأخرى",
      "",
      "",
      "نتطلع إلى الترحيب بك في مجتمع الأعمال لدينا قريباً!",
      "",
      "مع أطيب التحيات،",
      "فريق OrbsAI",
    ]);

    console.log(`Sending approval email to ${to}`);
    const emailResult = await sendEmail({ to, subject, html });

    if (emailResult.ok) {
      console.log("Approval email sent:", emailResult.data);
      return { ok: true, data: emailResult.data };
    } else {
      console.error(
        "Approval email failed:",
        emailResult.error || emailResult.reason
      );
      return { ok: false, error: emailResult.error || emailResult.reason };
    }
  } catch (err) {
    console.error("Email send failed:", err);
    return { ok: false, error: String(err) };
  }
}

export async function sendRejectionEmail(reqDoc) {
  try {
    const to = reqDoc.email || reqDoc.contact?.email;
    if (!to) {
      console.warn(
        `No email address found for tenant request ${reqDoc._id} - cannot send rejection email`
      );
      return { ok: false, reason: "no email address" };
    }

    const entityType = reqDoc.tenantType || "company";
    const entityLabel = entityType === "supplier" ? "موردك" : "شركتك";

    const subject = `مطلوب تحديث: تسجيل ${entityLabel}`;
    const html = buildBasicHtmlEmail(`مطلوب تحديث التسجيل`, [
      `مرحباً${reqDoc?.name ? ` ${reqDoc.name}` : ""},`,
      "",
      `شكراً لك لاهتمامك بالانضمام إلى منصتنا كـ${entityLabel}.`,
      "",
      "بعد مراجعة تسجيلك، نحتاج إلى بعض المعلومات الإضافية أو التصحيحات قبل أن نتمكن من الموافقة على طلبك.",
      "",
      "**الأسباب الشائعة للمراجعة:**",
      "• معلومات الشركة غير مكتملة",
      "• وثائق مطلوبة مفقودة",
      "• تفاصيل الشركة تحتاج إلى تحقق",
      "• معلومات الاتصال تتطلب توضيح",
      "",
      "**الخطوات التالية:**",
      "1. راجع المعلومات المقدمة للتأكد من اكتمالها",
      "2. تأكد من ملء جميع الحقول المطلوبة بشكل صحيح",
      "3. تحقق من أن وثائق شركتك محدثة",
      "4. أعد تقديم طلبك عندما تكون جاهزاً",
      "",
      "إذا كان لديك أسئلة حول عملية المراجعة أو تحتاج إلى مساعدة، لا تتردد في الاتصال بفريق الدعم لدينا.",
      "",
      "نتطلع إلى الترحيب بك في مجتمع الأعمال لدينا قريباً!",
      "",
      "مع أطيب التحيات،",
      "فريق OrbsAI",
    ]);

    console.log(`Sending rejection email to: ${to}`);
    const emailResult = await sendEmail({ to, subject, html });

    if (emailResult.ok) {
      console.log(
        `Rejection email sent successfully to ${to}`,
        emailResult.data
      );
      return { ok: true, data: emailResult.data };
    } else {
      console.error(
        `Failed to send rejection email to ${to}:`,
        emailResult.error || emailResult.reason
      );
      return { ok: false, error: emailResult.error || emailResult.reason };
    }
  } catch (emailError) {
    console.error(
      `Error sending rejection email for request ${reqDoc._id}:`,
      emailError
    );
    return { ok: false, error: String(emailError) };
  }
}

// Send notification to company when a new event request is received
export async function sendEventRequestNotificationToCompany(eventRequest) {
  try {
    // Get company information
    const company = await writeClient.fetch(
      `*[_type == "company" && tenantId == $companyTenantId][0]{
        _id,
        name,
        contact
      }`,
      { companyTenantId: eventRequest.targetCompanyTenantId }
    );

    if (!company) {
      console.warn(
        `Company not found for tenant ID: ${eventRequest.targetCompanyTenantId}`
      );
      return { ok: false, reason: "company not found" };
    }

    const companyEmail = company.contact?.email;
    if (!companyEmail) {
      console.warn(`No email found for company: ${company.name}`);
      return { ok: false, reason: "no company email" };
    }

    // Get requester information
    let requesterName = eventRequest.fullName || "A customer";

    const subject = `طلب فعالية جديد - ${eventRequest.serviceRequired}`;
    const html = buildBasicHtmlEmail(`تم استلام طلب فعالية جديد`, [
      `مرحباً ${company.name},`,
      "",
      `لقد تلقيت طلب فعالية جديد من ${requesterName}.`,
      "",
      "**تفاصيل الفعالية:**",
      `• الخدمة المطلوبة: ${eventRequest.serviceRequired}`,
      `• تاريخ الفعالية: ${new Date(eventRequest.eventDate).toLocaleDateString("ar-SA")}`,
      `• وقت الفعالية: ${formatTime(eventRequest.eventTime)}`,
      `• عدد الضيوف: ${eventRequest.numberOfGuests}`,
      `• الموقع: ${eventRequest.eventLocation}`,
      "",
      "**وصف الفعالية:**",
      eventRequest.eventDescription,
      "",
      "**معلومات الاتصال:**",
      `• الاسم: ${eventRequest.fullName}`,
      "",
      "**الخطوات التالية:**",
      "1. قم بتسجيل الدخول إلى لوحة التحكم لعرض تفاصيل الطلب كاملة",
      "2. راجع المتطلبات وتحقق من توفرك",
      "3. اقبل أو ارفض الطلب مع ردك",
      "4. إذا تم القبول، ستتمكن من مراسلة العميل مباشرة",
      "",
      "لا تجعل عملائك ينتظرون - رد بسرعة لبناء الثقة وتنمية أعمالك!",
      "",
      "مع أطيب التحيات،",
      "فريق OrbsAI",
    ]);

    console.log(
      `Sending event request notification to company: ${companyEmail}`
    );
    const emailResult = await sendEmail({ to: companyEmail, subject, html });

    if (emailResult.ok) {
      console.log(
        "Event request notification sent to company:",
        emailResult.data
      );
      return { ok: true, data: emailResult.data };
    } else {
      console.error(
        "Event request notification to company failed:",
        emailResult.error || emailResult.reason
      );
      return { ok: false, error: emailResult.error || emailResult.reason };
    }
  } catch (error) {
    console.error(
      "Error sending event request notification to company:",
      error
    );
    return { ok: false, error: String(error) };
  }
}

// Send notification to customer when company responds to their event request
export async function sendEventRequestResponseToCustomer(
  eventRequest,
  response
) {
  try {
    // Get customer email from Clerk
    let customerEmail = null;
    try {
      const user = await currentUser();
      if (user?.id === eventRequest.requestedBy) {
        customerEmail =
          user?.primaryEmailAddress?.emailAddress ||
          user?.emailAddresses?.[0]?.emailAddress;
      }
    } catch (error) {
      console.warn("Could not get customer email from Clerk:", error);
    }

    if (!customerEmail) {
      console.warn(
        `No email found for customer with ID: ${eventRequest.requestedBy}`
      );
      return { ok: false, reason: "no customer email" };
    }

    // Get company information
    const company = await writeClient.fetch(
      `*[_type == "company" && tenantId == $companyTenantId][0]{
        _id,
        name,
        contact
      }`,
      { companyTenantId: eventRequest.targetCompanyTenantId }
    );

    const companyName = company?.name || "The company";
    const isAccepted = eventRequest.status === "accepted";

    const subject = isAccepted
      ? `أخبار رائعة! تم قبول طلب الفعالية الخاص بك`
      : `تحديث حول طلب الفعالية الخاص بك`;

    const bodyLines = [
      `مرحباً ${eventRequest.fullName},`,
      "",
      `قام ${companyName} بالرد على طلب الفعالية الخاص بك لـ "${eventRequest.serviceRequired}".`,
      "",
    ];

    if (isAccepted) {
      bodyLines.push(
        "🎉 **أخبار جيدة - تم قبول طلبك!**",
        "",
        "**تفاصيل الفعالية:**",
        `• الخدمة: ${eventRequest.serviceRequired}`,
        `• التاريخ: ${new Date(eventRequest.eventDate).toLocaleDateString("ar-SA")}`,
        `• الوقت: ${formatTime(eventRequest.eventTime)}`,
        `• عدد الضيوف: ${eventRequest.numberOfGuests}`,
        `• الموقع: ${eventRequest.eventLocation}`,
        ""
      );

      if (response?.companyResponse) {
        bodyLines.push("**رسالة الشركة:**", response.companyResponse, "");
      }

      bodyLines.push(
        "**الخطوات التالية:**",
        "1. يمكنك الآن مراسلة الشركة مباشرة لمناقشة التفاصيل",
        "2. تنسيق الترتيبات النهائية وتأكيد جميع المتطلبات",
        "3. قم بالدفعات أو الودائع الضرورية حسب الاتفاق",
        "",
        "نحن متحمسون لمساعدتك في إنجاح فعاليتك!",
        ""
      );
    } else {
      bodyLines.push("لسوء الحظ، لم يتم قبول طلبك في هذا الوقت.", "");

      if (response?.companyResponse) {
        bodyLines.push("**رسالة الشركة:**", response.companyResponse, "");
      }

      bodyLines.push(
        "**ما التالي:**",
        "• يمكنك تقديم طلب جديد بتواريخ أو متطلبات مختلفة",
        "• تصفح مقدمي الخدمات الآخرين الذين قد يكونوا متاحين",
        "• تواصل مع الشركة مباشرة إذا كان لديك أسئلة",
        "",
        "لا تستسلم - المقدم المثالي لفعاليتك موجود!",
        ""
      );
    }

    bodyLines.push("مع أطيب التحيات،", "فريق OrbsAI");

    const html = buildBasicHtmlEmail(
      isAccepted ? "تم قبول طلب الفعالية الخاص بك!" : "تحديث طلب الفعالية",
      bodyLines
    );

    console.log(`Sending event request response to customer: ${customerEmail}`);
    const emailResult = await sendEmail({ to: customerEmail, subject, html });

    if (emailResult.ok) {
      console.log("Event request response sent to customer:", emailResult.data);
      return { ok: true, data: emailResult.data };
    } else {
      console.error(
        "Event request response to customer failed:",
        emailResult.error || emailResult.reason
      );
      return { ok: false, error: emailResult.error || emailResult.reason };
    }
  } catch (error) {
    console.error("Error sending event request response to customer:", error);
    return { ok: false, error: String(error) };
  }
}
