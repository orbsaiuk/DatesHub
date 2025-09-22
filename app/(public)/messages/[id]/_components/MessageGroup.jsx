"use client";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import MessageItem from "./MessageItem";

export default function MessageGroup({
  messages,
  date,
  otherDisplayName,
  formatMessageTime,
  getCategoryName,
  user,
  allMessages = [],
  currentGroupIndex = 0,
}) {
  const formatGroupDate = (dateString) => {
    if (!dateString) return "";

    try {
      const messageDate = new Date(dateString);
      const now = new Date();

      if (isToday(messageDate)) {
        return "Today";
      } else if (isYesterday(messageDate)) {
        return "Yesterday";
      } else {
        // Check if it's within the last 7 days
        const diffInDays = Math.floor(
          (now - messageDate) / (1000 * 60 * 60 * 24)
        );
        if (diffInDays <= 7) {
          return format(messageDate, "EEEE");
        } else {
          return format(messageDate, "MMM d, yyyy");
        }
      }
    } catch (error) {
      return "";
    }
  };

  return (
    <div className="space-y-3">
      {/* Date separator - mobile optimized */}
      <div className="flex items-center justify-center my-3 sm:my-4">
        <div className="flex items-center gap-2 sm:gap-3 max-w-full">
          <div className="h-px bg-muted-foreground/30 flex-1 w-8 sm:w-16" />
          <span className="text-xs font-medium text-muted-foreground bg-background px-2 sm:px-3 py-1 rounded-full border whitespace-nowrap">
            {formatGroupDate(date)}
          </span>
          <div className="h-px bg-muted-foreground/30 flex-1 w-8 sm:w-16" />
        </div>
      </div>

      {/* Messages for this date */}
      <div className="space-y-2 sm:space-y-3">
        {(() => {
          // Find decision follow-up index across ALL messages
          const decisionFollowUpIndex = allMessages.findIndex((m) => {
            const t = (m?.text || "").trim();
            return (
              m?.messageType === "text" &&
              (t.startsWith("✅ Event request accepted!") ||
                t.startsWith("❌ Event request declined."))
            );
          });

          // Find the current message's index in the full message list
          const getMessageIndex = (message) => {
            return allMessages.findIndex((m) => m._id === message._id);
          };

          return messages.map((message, idx) => {
            const isCurrentUser =
              message.sender?.kind === "user" &&
              message.sender?.clerkId === user?.id;
            const messageIndex = getMessageIndex(message);
            const isAfterDecision =
              decisionFollowUpIndex !== -1 &&
              messageIndex > decisionFollowUpIndex;

            return (
              <MessageItem
                key={message._id}
                message={message}
                isCurrentUser={isCurrentUser}
                otherDisplayName={otherDisplayName}
                isAfterDecision={isAfterDecision}
                formatMessageTime={formatMessageTime}
                getCategoryName={getCategoryName}
              />
            );
          });
        })()}
      </div>
    </div>
  );
}
