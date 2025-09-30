"use client";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function MessageComposer({
  newMessage,
  setNewMessage,
  sending,
  onSendMessage,
  textareaRef,
}) {
  return (
    <div className="border-t p-3 sm:p-4 bg-background">
      <div className="flex gap-2 sm:gap-3">
        <Textarea
          ref={textareaRef}
          placeholder="اكتب ردك..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="min-h-[80px] sm:min-h-[80px] resize-vertical text-base sm:text-sm"
          disabled={sending}
        />
        <Button
          onClick={onSendMessage}
          disabled={!newMessage.trim() || sending}
          className="px-3 sm:px-4 self-end cursor-pointer min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
          size="icon"
        >
          {sending ? (
            <Loader2 className="h-5 w-5 sm:h-4 sm:w-4 animate-spin" />
          ) : (
            <Send className="h-5 w-5 sm:h-4 sm:w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
