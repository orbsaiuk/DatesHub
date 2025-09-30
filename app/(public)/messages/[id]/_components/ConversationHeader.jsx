"use client";
import { ArrowRight, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";

export default function ConversationHeader({ otherParticipant, onBackClick }) {
  const otherDisplayName =
    otherParticipant?.displayName || otherParticipant?.name || "غير معروف";

  return (
    <div className="flex items-center gap-3 sm:gap-4 py-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onBackClick}
        className="hover:bg-muted/50 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
      >
        <ArrowRight className="h-5 w-5 sm:h-4 sm:w-4" />
      </Button>

      <div className="flex items-center gap-3">
        {otherParticipant?.avatar ? (
          <Image
            src={urlFor(otherParticipant.avatar).width(40).height(40).url()}
            alt={otherDisplayName || "Avatar"}
            width={40}
            height={40}
            className="rounded-full ring-2 ring-background shadow-sm w-10 h-10 sm:w-10 sm:h-10"
          />
        ) : (
          <div className="w-10 h-10 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center ring-2 ring-background shadow-sm">
            {otherParticipant?.kind === "company" ? (
              <Building2 className="h-5 w-5 text-muted-foreground" />
            ) : (
              <User className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl font-semibold truncate">
            {otherDisplayName}
          </h2>
        </div>
      </div>
    </div>
  );
}
