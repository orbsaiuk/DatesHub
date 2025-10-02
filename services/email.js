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
      // Silent fail - try alternative email sources
    }

    if (!customerEmail && eventRequest?.email) {
      customerEmail = eventRequest.email;
    }

    if (!customerEmail) {
      return { ok: false, reason: "no customer email" };
    }

    const subject = "✅ تم استلام طلب الفعالية الخاص بك بنجاح";
    const html = buildBasicHtmlEmail(
      "تم استلام طلبك بنجاح",
      [
        `عزيزي/عزيزتي ${eventRequest.fullName || "العميل الكريم"},`,
        "",
        "نشكرك على اختيار منصة OrbsAI لتنظيم فعاليتك المميزة. يسعدنا إبلاغك بأننا استلمنا طلبك بنجاح وقمنا بإرساله فوراً إلى مزود الخدمة المختص.",
        "",
        "**تفاصيل طلبك:**",
        `• الخدمة المطلوبة: ${eventRequest.serviceRequired}`,
        `• تاريخ الفعالية: ${new Date(eventRequest.eventDate).toLocaleDateString("ar-SA")}`,
        `• وقت الفعالية: ${formatTime(eventRequest.eventTime)}`,
        `• عدد الضيوف المتوقع: ${eventRequest.numberOfGuests} ضيف`,
        `• موقع الفعالية: ${eventRequest.eventLocation}`,
        "",
        "**الخطوات القادمة:**",
        "1. سيقوم مزود الخدمة بمراجعة طلبك خلال 24 ساعة",
        "2. ستصلك رسالة بريد إلكتروني فور الموافقة على الطلب أو الرد عليه",
        "3. يمكنك متابعة حالة طلبك من خلال لوحة التحكم الخاصة بك",
        "",
        "نحن هنا لضمان تجربة استثنائية لك. في حال وجود أي استفسار، فريق الدعم جاهز لمساعدتك.",
        "",
        "مع أطيب التمنيات بفعالية ناجحة،",
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

export async function sendApprovalEmail(reqDoc) {
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

export async function sendRejectionEmail(reqDoc) {
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
      return { ok: false, reason: "company not found" };
    }

    const companyEmail = company.contact?.email;
    if (!companyEmail) {
      return { ok: false, reason: "no company email" };
    }

    // Get requester information
    let requesterName = eventRequest.fullName || "A customer";

    const subject = `🔔 طلب فعالية جديد - ${eventRequest.serviceRequired}`;
    const html = buildBasicHtmlEmail(
      `لديك طلب فعالية جديد`,
      [
        `عزيزنا ${company.name},`,
        "",
        `يسعدنا إبلاغك بوصول طلب فعالية جديد من العميل ${requesterName}. هذه فرصة رائعة لتقديم خدماتك المميزة وتوسيع نطاق أعمالك.`,
        "",
        "**تفاصيل الفعالية المطلوبة:**",
        `• نوع الخدمة: ${eventRequest.serviceRequired}`,
        `• تاريخ الفعالية: ${new Date(eventRequest.eventDate).toLocaleDateString("ar-SA")}`,
        `• الوقت المحدد: ${formatTime(eventRequest.eventTime)}`,
        `• عدد الضيوف المتوقع: ${eventRequest.numberOfGuests} ضيف`,
        `• موقع الفعالية: ${eventRequest.eventLocation}`,
        "",
        "**وصف الفعالية:**",
        eventRequest.eventDescription || "لم يتم تقديم وصف إضافي",
        "",
        "**معلومات التواصل مع العميل:**",
        `• اسم العميل: ${eventRequest.fullName}`,
        `• الاتصال: متاح عبر منصة الرسائل بعد قبول الطلب`,
        "",
        "**خطواتك القادمة للرد:**",
        "1. قم بتسجيل الدخول إلى لوحة التحكم لعرض جميع تفاصيل الطلب",
        "2. راجع متطلبات العميل بعناية وتحقق من مدى توافرك",
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
      // Silent fail - try alternative email sources
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
      { companyTenantId: eventRequest.targetCompanyTenantId }
    );

    const companyName = company?.name || "The company";
    const isAccepted = eventRequest.status === "accepted";

    const subject = isAccepted
      ? `🎉 أخبار رائعة! تم قبول طلب الفعالية الخاص بك`
      : `📢 تحديث مهم حول طلب الفعالية الخاص بك`;

    const bodyLines = [
      `عزيزي/عزيزتي ${eventRequest.fullName},`,
      "",
      `تلقينا رداً من ${companyName} على طلب الفعالية الخاص بك لخدمة "${eventRequest.serviceRequired}".`,
      "",
    ];

    if (isAccepted) {
      bodyLines.push(
        "🎉 **أخبار سارة - تم قبول طلبك بنجاح!**",
        "",
        "نهنئك! لقد وافق مزود الخدمة على طلبك ويسعده تقديم خدماته لك. الآن يمكنك المضي قدماً في ترتيبات فعاليتك المميزة.",
        "",
        "**ملخص تفاصيل الفعالية:**",
        `• نوع الخدمة: ${eventRequest.serviceRequired}`,
        `• التاريخ المحدد: ${new Date(eventRequest.eventDate).toLocaleDateString("ar-SA")}`,
        `• الوقت: ${formatTime(eventRequest.eventTime)}`,
        `• عدد الضيوف: ${eventRequest.numberOfGuests} ضيف`,
        `• الموقع: ${eventRequest.eventLocation}`,
        ""
      );

      if (response?.companyResponse) {
        bodyLines.push(
          "**رسالة من مزود الخدمة:**",
          `"${response.companyResponse}"`,
          ""
        );
      }

      bodyLines.push(
        "**خطواتك القادمة:**",
        "1. تواصل مع مزود الخدمة عبر نظام الرسائل لمناقشة التفاصيل الدقيقة",
        "2. قم بمراجعة والاتفاق على الترتيبات النهائية (الأسعار، المتطلبات الخاصة، إلخ)",
        "3. أكد جميع التفاصيل وتأكد من فهم الطرفين للاتفاق",
        "4. أتمم أي دفعات أو عربون مطلوب حسب الاتفاق المتبادل",
        "",
        "نحن هنا لضمان نجاح فعاليتك! إذا واجهت أي مشكلة، فريق الدعم جاهز لمساعدتك.",
        ""
      );
    } else {
      bodyLines.push(
        "نأسف لإبلاغك بأن مزود الخدمة غير قادر على قبول طلبك في الوقت الحالي.",
        ""
      );

      if (response?.companyResponse) {
        bodyLines.push(
          "**رسالة من مزود الخدمة:**",
          `"${response.companyResponse}"`,
          ""
        );
      }

      bodyLines.push(
        "**خيارات بديلة متاحة لك:**",
        "• قدّم طلباً جديداً بتواريخ أو متطلبات مختلفة قد تناسب مزود الخدمة",
        "• تصفح قائمة مزودي الخدمات الآخرين في منصتنا الذين قد يكونون متاحين",
        "• تواصل مباشرة مع الشركة للاستفسار عن مواعيد بديلة",
        "• استخدم خاصية البحث المتقدم للعثور على مزودين متخصصين آخرين",
        "",
        "💡 لا تقلق - لدينا العديد من مزودي الخدمات المميزين. الخيار المثالي لفعاليتك بانتظارك!",
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
      isAccepted ? "تم قبول طلب الفعالية!" : "تحديث حالة طلب الفعالية",
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
    return { ok: false, error: String(error) };
  }
}
