"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export default function MessageCompanyButton({
  companyTenantId,
  className = "",
  variant = "default",
  size = "sm",
}) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const start = async () => {
    if (!companyTenantId) return;
    setBusy(true);
    try {
      const res = await fetch("/api/messaging/user/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyTenantId }),
      });
      if (res.status === 401) {
        router.push("/sign-in");
        return;
      }
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "تعذر إنشاء المحادثة");

      const conversationId = data?.conversation?._id;
      if (conversationId) {
        // Navigate to conversation page instead of opening chat widget
        router.push(`/messages/${conversationId}`);
      }
    } catch (e) {
      alert("تعذر بدء المحادثة. يرجى المحاولة مرة أخرى.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      type="button"
      size={size}
      className={`cursor-pointer bg-button-1 hover:bg-button-1-hover text-white ${className}`}
      onClick={start}
      disabled={busy}
    >
      <MessageSquare className="size-4 ml-2" />
      {busy ? "جارٍ الفتح…" : "الرسائل"}
    </Button>
  );
}
