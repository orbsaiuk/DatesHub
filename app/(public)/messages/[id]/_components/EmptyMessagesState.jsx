"use client";
import { MessageCircle } from "lucide-react";

export default function EmptyMessagesState() {
  return (
    <div className="text-center text-muted-foreground py-8 sm:py-12 px-4">
      <MessageCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted-foreground/50" />
      <h3 className="text-base sm:text-lg font-semibold mb-2">
        No messages yet
      </h3>
      <p className="text-sm sm:text-base max-w-md mx-auto leading-relaxed">
        Start the conversation by sending your first message below.
      </p>
    </div>
  );
}
