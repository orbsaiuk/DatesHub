"use client";
import { Building2, User, MailOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";

export default function ConversationCard({
  conversation,
  user,
  onConversationClick,
  formatTime,
  getOtherParticipant,
}) {
  const otherParticipant = getOtherParticipant(conversation);
  const userUnread = conversation.unread?.find(
    (u) => u.participantKey === `user:${user?.id}`
  );
  const isUnread = userUnread?.count > 0;
  const displayName = otherParticipant?.displayName;

  return (
    <Card
      key={conversation._id}
      className={cn(
        "cursor-pointer hover:bg-muted/50 transition-colors active:bg-muted/70 sm:active:bg-muted/50",
        isUnread && "border-blue-200 bg-blue-50/50"
      )}
      onClick={() => onConversationClick(conversation._id)}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Avatar - responsive sizing */}
          <div className="flex-shrink-0">
            {otherParticipant?.avatar ? (
              <Image
                src={urlFor(otherParticipant.avatar).width(48).height(48).url()}
                alt={displayName || "Avatar"}
                width={48}
                height={48}
                className="rounded-full w-10 h-10 sm:w-12 sm:h-12"
              />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center">
                {otherParticipant?.kind === "company" ? (
                  <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                ) : (
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                )}
              </div>
            )}
          </div>

          {/* Content - mobile optimized layout */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3
                className={cn(
                  "text-sm sm:text-base truncate leading-5 sm:leading-6",
                  isUnread ? "font-bold" : "font-semibold"
                )}
              >
                {displayName}
              </h3>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                {isUnread && (
                  <MailOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
                )}
                <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                  {formatTime(conversation.lastMessageAt)}
                </span>
              </div>
            </div>

            <p
              className={cn(
                "text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-4 sm:leading-5 mb-2",
                isUnread && "font-medium"
              )}
            >
              {conversation.lastMessagePreview || "No messages yet"}
            </p>

            {/* Badge row */}
            {isUnread && (
              <div className="flex items-center">
                <Badge variant="destructive" className="text-xs px-2 py-0.5">
                  {userUnread.count} new
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
