import { sendEmail, buildBasicHtmlEmail } from "@/lib/email";
import { writeClient } from "@/sanity/lib/serverClient";
import { currentUser } from "@clerk/nextjs/server";
import { formatTime } from "@/lib/dateUtils";

// Sends a confirmation email to the customer after submitting an order request
export async function sendOrderRequestConfirmationToCustomer(orderRequest) {
  try {
    // Try to get the email of the currently authenticated user (the requester)
    let customerEmail = null;
    try {
      const user = await currentUser();
      if (user?.id === orderRequest.requestedBy) {
        customerEmail =
          user?.primaryEmailAddress?.emailAddress ||
          user?.emailAddresses?.[0]?.emailAddress;
      }
    } catch (error) {
      // Silent fail - try alternative email sources
    }

    if (!customerEmail && orderRequest?.email) {
      customerEmail = orderRequest.email;
    }

    if (!customerEmail) {
      return { ok: false, reason: "no customer email" };
    }

    const subject = "✅ تم استلام طلبك بنجاح";
    const html = buildBasicHtmlEmail(
      "تم استلام طلبك بنجاح",
      [
        `عزيزي/عزيزتي ${orderRequest.fullName || "العميل الكريم"},`,
        "",
        "نشكرك على اختيار منصة OrbsAI لطلب التمور. يسعدنا إبلاغك بأننا استلمنا طلبك بنجاح وقمنا بإرساله فوراً إلى المورد المختص.",
        "",
        "**تفاصيل طلبك:**",
        `• نوع التمور: ${orderRequest.category}`,
        `• التغليف المطلوب: ${orderRequest.serviceRequired}`,
        `• تاريخ التوصيل: ${new Date(orderRequest.eventDate).toLocaleDateString("ar-SA")}`,
        `• وقت التوصيل: ${formatTime(orderRequest.eventTime)}`,
        `• الكمية المطلوبة: ${orderRequest.numberOfGuests} كيلو`,
        `• عنوان التوصيل: ${orderRequest.eventLocation}`,
        "",
        "**الخطوات القادمة:**",
        "1. سيقوم المورد بمراجعة طلبك خلال 24 ساعة",
        "2. ستصلك رسالة بريد إلكتروني فور الموافقة على الطلب أو الرد عليه",
        "3. يمكنك متابعة حالة طلبك من خلال لوحة التحكم الخاصة بك",
        "",
        "نحن هنا لضمان تجربة استثنائية لك. في حال وجود أي استفسار، فريق الدعم جاهز لمساعدتك.",
        "",
        "مع أطيب التمنيات،",
        "فريق OrbsAI",
      ],
      { primaryColor: "#10b981" }
    );

    const emailResult = await sendEmail({ to: customerEmail, subject, html });
    if (emailResult.ok) {
      return { ok: true, data: emailResult.data };
    }
    return { ok: false, error: emailResult.error || emailResult.reason };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}

export async function sendOrderRequestApprovalEmail(reqDoc) {
  try {
    const to = reqDoc.email || reqDoc.contact?.email;
    if (!to) return { ok: false, reason: "no email address" };

    const entityType = reqDoc.tenantType || "company";
    const entityLabel = entityType === "supplier" ? "موردك" : "شركتك";

    const subject = `🎉 مبارك! تم قبول انضمامك إلى منصة OrbsAI`;
    const html = buildBasicHtmlEmail(
      `أهلاً بك في عائلة OrbsAI`,
      [
        `عزيزي/عزيزتي ${reqDoc?.name || "الشريك الكريم"},`,
        "",
        `يسرنا أن نبلغك بأنه تم **قبول** طلب انضمام ${entityLabel} بنجاح! نحن متحمسون لوجودك معنا كجزء من مجتمع الأعمال المتنامي في منصتنا.`,
        "",
        "**تم إنجازه:**",
        `• تم إنشاء وتفعيل حساب ${entityLabel} بنجاح`,
        "• ملفك الشخصي أصبح مرئياً للعملاء المحتملين",
        "• لديك الآن وصول كامل إلى لوحة التحكم وجميع المزايا",
        "• يمكنك البدء باستقبال طلبات العملاء فوراً",
        "",
        "**خطواتك القادمة للنجاح:**",
        "1. قم بتسجيل الدخول وإكمال معلومات ملفك الشخصي بالكامل",
        "2. أضف صوراً احترافية ووصفاً جذاباً لخدماتك",
        "3. حدّث أسعارك وعروضك الخاصة",
        "4. ابدأ بالتواصل مع العملاء والشركاء في المنصة",
        "5. استفد من أدوات التحليل لتحسين أدائك",
        "",
        "نحن ملتزمون بدعم نجاحك. فريقنا متواجد دائماً لمساعدتك في أي وقت.",
        "",
        "مرحباً بك في رحلة النجاح معنا!",
        "",
        "مع خالص التقدير،",
        "فريق OrbsAI",
      ],
      { primaryColor: "#6366f1" }
    );

    const emailResult = await sendEmail({ to, subject, html });

    if (emailResult.ok) {
      return { ok: true, data: emailResult.data };
    } else {
      return { ok: false, error: emailResult.error || emailResult.reason };
    }
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export async function sendOrderRequestRejectionEmail(reqDoc) {
  try {
    const to = reqDoc.email || reqDoc.contact?.email;
    if (!to) {
      return { ok: false, reason: "no email address" };
    }

    const entityType = reqDoc.tenantType || "company";
    const entityLabel = entityType === "supplier" ? "موردك" : "شركتك";

    const subject = `📋 تحديث مطلوب: طلب انضمام ${entityLabel}`;
    const html = buildBasicHtmlEmail(
      `تحديث مطلوب لطلبك`,
      [
        `عزيزي/عزيزتي ${reqDoc?.name || "المتقدم الكريم"},`,
        "",
        `نشكرك على اهتمامك بالانضمام إلى منصة OrbsAI كـ${entityLabel}. بعد مراجعة دقيقة لطلبك، وجدنا أننا بحاجة إلى بعض التحسينات أو المعلومات الإضافية لإتمام عملية التسجيل بنجاح.`,
        "",
        "**الأسباب الشائعة التي قد تتطلب المراجعة:**",
        "• معلومات الشركة غير مكتملة أو تحتاج إلى توضيح إضافي",
        "• مستندات أو وثائق مطلوبة لم يتم إرفاقها",
        "• تفاصيل الاتصال تحتاج إلى تحديث أو تأكيد",
        "• بيانات الخدمات المقدمة تحتاج إلى مزيد من التفاصيل",
        "• الصور أو المحتوى المرئي يحتاج إلى تحسين جودته",
        "",
        "**خطوات بسيطة لإعادة التقديم:**",
        "1. راجع جميع المعلومات المقدمة وتأكد من دقتها واكتمالها",
        "2. تحقق من إرفاق جميع المستندات المطلوبة بصيغتها الصحيحة",
        "3. احرص على ملء جميع الحقول الإلزامية بشكل واضح ومفصل",
        "4. تأكد من جودة الصور والمحتوى المرئي المرفق",
        "5. أعد تقديم طلبك عندما تكون جاهزاً",
        "",
        "**نحن هنا لمساعدتك:**",
        "فريق الدعم لدينا مستعد للإجابة على أي استفسارات قد تكون لديك. لا تتردد في التواصل معنا عبر البريد الإلكتروني أو الهاتف.",
        "",
        "نتطلع لرؤيتك شريكاً ناجحاً في منصتنا قريباً!",
        "",
        "مع خالص التقدير،",
        "فريق OrbsAI",
      ],
      { primaryColor: "#f59e0b" }
    );

    const emailResult = await sendEmail({ to, subject, html });

    if (emailResult.ok) {
      return { ok: true, data: emailResult.data };
    } else {
      return { ok: false, error: emailResult.error || emailResult.reason };
    }
  } catch (emailError) {
    return { ok: false, error: String(emailError) };
  }
}

// Send notification to company when a new order request is received
export async function sendOrderRequestNotificationToCompany(orderRequest) {
  try {
    // Get company information
    const company = await writeClient.fetch(
      `*[_type == "company" && tenantId == $companyTenantId][0]{
        _id,
        name,
        contact
      }`,
      { companyTenantId: orderRequest.targetCompanyTenantId }
    );

    if (!company) {
      return { ok: false, reason: "company not found" };
    }

    const companyEmail = company.contact?.email;
    if (!companyEmail) {
      return { ok: false, reason: "no company email" };
    }

    // Get requester information
    let requesterName = orderRequest.fullName || "A customer";

    const subject = `🔔 طلب جديد - ${orderRequest.category}`;
    const html = buildBasicHtmlEmail(
      `لديك طلب جديد`,
      [
        `عزيزنا ${company.name},`,
        "",
        `يسعدنا إبلاغك بوصول طلب جديد من العميل ${requesterName}. هذه فرصة رائعة لتقديم منتجاتك المميزة وتوسيع نطاق أعمالك.`,
        "",
        "**تفاصيل الطلب:**",
        `• نوع التمور: ${orderRequest.category}`,
        `• التغليف المطلوب: ${orderRequest.serviceRequired}`,
        `• تاريخ التوصيل: ${new Date(orderRequest.eventDate).toLocaleDateString("ar-SA")}`,
        `• وقت التوصيل: ${formatTime(orderRequest.eventTime)}`,
        `• الكمية المطلوبة: ${orderRequest.numberOfGuests} كيلو`,
        `• عنوان التوصيل: ${orderRequest.eventLocation}`,
        "",
        "**ملاحظات العميل:**",
        orderRequest.eventDescription || "لم يتم تقديم ملاحظات إضافية",
        "",
        "**معلومات التواصل مع العميل:**",
        `• اسم العميل: ${orderRequest.fullName}`,
        `• الاتصال: متاح عبر منصة الرسائل بعد قبول الطلب`,
        "",
        "**خطواتك القادمة للرد:**",
        "1. قم بتسجيل الدخول إلى لوحة التحكم لعرض جميع تفاصيل الطلب",
        "2. راجع متطلبات العميل بعناية وتحقق من توفر المنتج",
        "3. قم بقبول أو رفض الطلب مع إضافة ردك وملاحظاتك",
        "4. عند القبول، يمكنك التواصل مباشرة مع العميل لترتيب التفاصيل",
        "",
        "💡 **نصيحة احترافية:** الرد السريع على طلبات العملاء يزيد من معدل التحويل ويبني سمعة ممتازة لعملك. حاول الرد خلال 24 ساعة لضمان أفضل تجربة للعميل.",
        "",
        "نتمنى لك صفقة ناجحة!",
        "",
        "مع خالص التقدير،",
        "فريق OrbsAI",
      ],
      { primaryColor: "#8b5cf6" }
    );

    const emailResult = await sendEmail({ to: companyEmail, subject, html });

    if (emailResult.ok) {
      return { ok: true, data: emailResult.data };
    } else {
      return { ok: false, error: emailResult.error || emailResult.reason };
    }
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}

// Send notification to customer when company responds to their order request
export async function sendOrderRequestResponseToCustomer(orderRequest) {
  try {
    // Get customer email using Clerk API
    let customerEmail = null;

    // Fetch user from Sanity to get clerkId
    const userDoc = await writeClient.fetch(
      `*[_type == "user" && clerkId == $clerkId][0]{clerkId}`,
      { clerkId: orderRequest.requestedBy }
    );

    if (userDoc?.clerkId) {
      try {
        // Import clerkClient dynamically to avoid issues
        const { clerkClient } = await import("@clerk/nextjs/server");
        const user = await clerkClient.users.getUser(userDoc.clerkId);
        customerEmail =
          user?.primaryEmailAddress?.emailAddress ||
          user?.emailAddresses?.[0]?.emailAddress;
      } catch (error) {
        console.error("Error fetching user from Clerk:", error);
      }
    }

    if (!customerEmail) {
      return { ok: false, reason: "no customer email" };
    }

    // Get company information
    const company = await writeClient.fetch(
      `*[_type == "company" && tenantId == $companyTenantId][0]{
        _id,
        name,
        contact
      }`,
      { companyTenantId: orderRequest.targetCompanyTenantId }
    );

    const companyName = company?.name || "الشركة";
    const isAccepted = orderRequest.status === "accepted";

    const subject = isAccepted
      ? `🎉 أخبار رائعة! تم قبول طلبك من ${companyName}`
      : `📢 تحديث حول طلبك من ${companyName}`;

    const bodyLines = [
      `عزيزي العميل،`,
      "",
      `تلقينا رداً من ${companyName} على طلبك.`,
      "",
    ];

    if (isAccepted) {
      bodyLines.push(
        "🎉 **أخبار سارة - تم قبول طلبك بنجاح!**",
        "",
        "نهنئك! لقد وافقت الشركة على طلبك وتسعد بخدمتك.",
        "",
        "**ملخص تفاصيل الطلب:**",
        `• الفئة: ${orderRequest.category || "غير محدد"}`,
        `• الخدمة المطلوبة: ${orderRequest.serviceRequired || "غير محدد"}`,
        `• تاريخ التوصيل: ${orderRequest.deliveryDate ? new Date(orderRequest.deliveryDate).toLocaleDateString("ar-SA") : "غير محدد"}`,
        `• الوقت: ${orderRequest.deliveryTime || "غير محدد"}`,
        `• الكمية: ${orderRequest.quantity || "غير محدد"}`,
        `• العنوان: ${orderRequest.deliveryAddress || "غير محدد"}`,
        ""
      );

      if (orderRequest.companyResponse) {
        bodyLines.push(
          "**رسالة من الشركة:**",
          `"${orderRequest.companyResponse}"`,
          ""
        );
      }

      bodyLines.push(
        "**خطواتك القادمة:**",
        "1. تواصل مع الشركة عبر الرسائل علي الموقع لمناقشة التفاصيل الدقيقة",
        "2. قم بمراجعة والاتفاق على الترتيبات النهائية (الأسعار، المتطلبات الخاصة، إلخ)",
        "3. أكد جميع التفاصيل وتأكد من فهم الطرفين للاتفاق",
        "4. أتمم أي دفعات أو عربون مطلوب حسب الاتفاق المتبادل",
        "",
        "نحن هنا لضمان نجاح طلبك! إذا واجهت أي مشكلة، فريق الدعم جاهز لمساعدتك.",
        ""
      );
    } else {
      bodyLines.push(
        "نأسف لإبلاغك بأن الشركة غير قادرة على قبول طلبك في الوقت الحالي.",
        ""
      );

      if (orderRequest.companyResponse) {
        bodyLines.push(
          "**رسالة من الشركة:**",
          `"${orderRequest.companyResponse}"`,
          ""
        );
      }

      bodyLines.push(
        "**خيارات بديلة متاحة لك:**",
        "• قدّم طلباً جديداً بتواريخ أو متطلبات مختلفة قد تناسب الشركة",
        "• تصفح قائمة الشركات الأخرى في منصتنا الذين قد يكونون متاحين",
        "• تواصل مباشرة مع الشركة للاستفسار عن مواعيد بديلة عبر الموقع",
        "• استخدم خاصية البحث المتقدم للعثور على شركات أخرى",
        "",
        "💡 لا تقلق - لدينا العديد من الشركات المميزة. الخيار المثالي لك بانتظارك!",
        ""
      );
    }

    bodyLines.push(
      "نشكرك على استخدام منصة OrbsAI ونتمنى لك تجربة رائعة.",
      "",
      "مع خالص التقدير،",
      "فريق OrbsAI"
    );

    const html = buildBasicHtmlEmail(
      isAccepted ? "تم قبول طلبك!" : "تحديث حالة طلبك",
      bodyLines,
      { primaryColor: isAccepted ? "#10b981" : "#f59e0b" }
    );

    const emailResult = await sendEmail({ to: customerEmail, subject, html });

    if (emailResult.ok) {
      return { ok: true, data: emailResult.data };
    } else {
      return { ok: false, error: emailResult.error || emailResult.reason };
    }
  } catch (error) {
    console.error("Error sending order request response email:", error);
    return { ok: false, error: String(error) };
  }
}
