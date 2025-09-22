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

    const subject = "We received your event request";
    const html = buildBasicHtmlEmail("Event Request Submitted", [
      `Hello ${eventRequest.fullName || "there"},`,
      "",
      "Thanks for submitting your event request. We've shared it with the company.",
      "",
      "Here are the details you provided:",
      `• Service: ${eventRequest.serviceRequired}`,
      `• Date: ${new Date(eventRequest.eventDate).toLocaleDateString()}`,
      `• Time: ${formatTime(eventRequest.eventTime)}`,
      `• Guests: ${eventRequest.numberOfGuests}`,
      `• Location: ${eventRequest.eventLocation}`,
      "",
      "We'll notify you as soon as the company responds.",
      "",
      "Best regards,",
      "The OrbsAI Team",
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
    const entityLabel = entityType === "supplier" ? "Supplier" : "Company";

    const subject = `🎉 Your ${entityLabel} Registration Has Been Approved!`;
    const html = buildBasicHtmlEmail(`Welcome to Our Platform!`, [
      `Hi${reqDoc?.name ? ` ${reqDoc.name}` : ""},`,
      "",
      `Great news! Your ${entityLabel.toLowerCase()} registration request has been **approved** and processed.`,
      "",
      "**What happens next:**",
      `• Your ${entityLabel.toLowerCase()} profile has been created and is now live`,
      "• You can now access your dashboard to manage your profile",
      "• Start connecting with potential partners and customers",
      "• Update your business information anytime",
      "",
      "**Getting Started:**",
      "1. Log into your account to access your dashboard",
      "2. Complete your profile with additional details",
      "3. Browse and connect with other businesses",
      "",
      "Welcome aboard! We're excited to have you as part of our business community.",
      "",
      "Best regards,",
      "The OrbsAI Team",
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
    const entityLabel = entityType === "supplier" ? "Supplier" : "Company";

    const subject = `Update Required: Your ${entityLabel} Registration`;
    const html = buildBasicHtmlEmail(`Registration Update Needed`, [
      `Hi${reqDoc?.name ? ` ${reqDoc.name}` : ""},`,
      "",
      `Thank you for your interest in joining our platform as a ${entityLabel.toLowerCase()}.`,
      "",
      "After reviewing your registration, we need some additional information or corrections before we can approve your application.",
      "",
      "**Common reasons for review:**",
      "• Incomplete business information",
      "• Missing required documentation",
      "• Business details need verification",
      "• Contact information requires clarification",
      "",
      "**Next Steps:**",
      "1. Review your submitted information for completeness",
      "2. Ensure all required fields are properly filled",
      "3. Verify your business documentation is current",
      "4. Resubmit your application when ready",
      "",
      "If you have questions about the review process or need assistance, please don't hesitate to contact our support team.",
      "",
      "We look forward to welcoming you to our business community soon!",
      "",
      "Best regards,",
      "The OrbsAI Team",
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

    const subject = `New Event Request - ${eventRequest.serviceRequired}`;
    const html = buildBasicHtmlEmail(`New Event Request Received`, [
      `Hello ${company.name},`,
      "",
      `You have received a new event request from ${requesterName}.`,
      "",
      "**Event Details:**",
      `• Service Required: ${eventRequest.serviceRequired}`,
      `• Event Date: ${new Date(eventRequest.eventDate).toLocaleDateString()}`,
      `• Event Time: ${formatTime(eventRequest.eventTime)}`,
      `• Number of Guests: ${eventRequest.numberOfGuests}`,
      `• Location: ${eventRequest.eventLocation}`,
      "",
      "**Event Description:**",
      eventRequest.eventDescription,
      "",
      "**Contact Information:**",
      `• Name: ${eventRequest.fullName}`,
      "",
      "**Next Steps:**",
      "1. Log into your business dashboard to view the full request details",
      "2. Review the requirements and check your availability",
      "3. Accept or decline the request with your response",
      "4. If accepted, you'll be able to message the customer directly",
      "",
      "Don't keep your customers waiting - respond promptly to build trust and grow your business!",
      "",
      "Best regards,",
      "The OrbsAI Team",
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
      ? `Great News! Your Event Request Has Been Accepted`
      : `Update on Your Event Request`;

    const bodyLines = [
      `Hello ${eventRequest.fullName},`,
      "",
      `${companyName} has responded to your event request for "${eventRequest.serviceRequired}".`,
      "",
    ];

    if (isAccepted) {
      bodyLines.push(
        "🎉 **Good news - your request has been accepted!**",
        "",
        "**Event Details:**",
        `• Service: ${eventRequest.serviceRequired}`,
        `• Date: ${new Date(eventRequest.eventDate).toLocaleDateString()}`,
        `• Time: ${formatTime(eventRequest.eventTime)}`,
        `• Guests: ${eventRequest.numberOfGuests}`,
        `• Location: ${eventRequest.eventLocation}`,
        ""
      );

      if (response?.companyResponse) {
        bodyLines.push("**Company's Message:**", response.companyResponse, "");
      }

      bodyLines.push(
        "**Next Steps:**",
        "1. You can now message the company directly to discuss details",
        "2. Coordinate final arrangements and confirm all requirements",
        "3. Make any necessary payments or deposits as agreed",
        "",
        "We're excited to help make your event a success!",
        ""
      );
    } else {
      bodyLines.push(
        "Unfortunately, your request was not accepted at this time.",
        ""
      );

      if (response?.companyResponse) {
        bodyLines.push("**Company's Message:**", response.companyResponse, "");
      }

      bodyLines.push(
        "**What's Next:**",
        "• You can submit a new request with different dates or requirements",
        "• Browse other service providers who might be available",
        "• Contact the company directly if you have questions",
        "",
        "Don't give up - the perfect provider for your event is out there!",
        ""
      );
    }

    bodyLines.push("Best regards,", "The OrbsAI Team");

    const html = buildBasicHtmlEmail(
      isAccepted ? "Your Event Request Was Accepted!" : "Event Request Update",
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
