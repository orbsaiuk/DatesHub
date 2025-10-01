"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";

export default function InboxDropdown() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load recent conversations when dropdown opens
  const loadRecentConversations = async () => {
    if (!isSignedIn || loading) return;

    setLoading(true);
    try {
      const response = await fetch(
        "/api/messaging/user/conversations?limit=10"
      );
      const data = await response.json();

      if (data.ok) {
        setConversations(data.items || []);
        // Count unread messages
        const unread =
          data.items?.reduce((count, conv) => {
            const userUnread = conv.unread?.find(
              (u) => u.participantKey === `user:${user?.id}`
            );
            return count + (userUnread?.count || 0);
          }, 0) || 0;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load unread count on mount
  useEffect(() => {
    if (isSignedIn) {
      loadRecentConversations();
    }
  }, [isSignedIn]);

  // Load conversations when dropdown opens
  useEffect(() => {
    if (isOpen && isSignedIn) {
      loadRecentConversations();
    }
  }, [isOpen, isSignedIn]);

  // Listen for unread count updates and refresh when page becomes visible
  useEffect(() => {
    const handleUnreadCountUpdate = () => {
      if (isSignedIn) {
        loadRecentConversations();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && isSignedIn) {
        loadRecentConversations();
      }
    };

    // Listen for custom unread count update events
    window.addEventListener("unreadCountUpdate", handleUnreadCountUpdate);

    // Listen for page visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("unreadCountUpdate", handleUnreadCountUpdate);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isSignedIn]);

  if (!isSignedIn) {
    return null;
  }

  const getOtherParticipant = (conversation) => {
    const participants = conversation.participants || [];
    return participants.find((p) => p.kind !== "user");
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return date.toLocaleTimeString("ar-EG", {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else if (diffInHours < 48) {
        return "أمس";
      } else {
        return date.toLocaleDateString("ar-EG", {
          month: "short",
          day: "numeric",
        });
      }
    } catch (error) {
      return "";
    }
  };

  const handleConversationClick = (conversationId) => {
    router.push(`/messages/${conversationId}`);
    setIsOpen(false);
  };

  const handleViewAllClick = () => {
    router.push("/messages");
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative cursor-pointer">
          <Mail className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-3 border-b">
          <h3 className="font-semibold text-sm">الرسائل</h3>
          {unreadCount > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {unreadCount > 1
                ? `رسائل غير مقروءة ${unreadCount}`
                : `رسالة غير مقروءة`}
            </p>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              جارٍ التحميل...
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              لا توجد رسائل بعد
            </div>
          ) : (
            conversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation);
              const userUnread = conversation.unread?.find(
                (u) => u.participantKey === `user:${user?.id}`
              );
              const isUnread = userUnread?.count > 0;
              const displayName =
                otherParticipant?.displayName ||
                otherParticipant?.name ||
                "غير معروف";

              return (
                <DropdownMenuItem
                  key={conversation._id}
                  className="p-0 cursor-pointer"
                  onSelect={() => handleConversationClick(conversation._id)}
                  dir="rtl"
                >
                  <div className="flex items-start gap-3 p-3 w-full hover:bg-muted/50">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {otherParticipant?.avatar ? (
                        <Image
                          src={urlFor(otherParticipant.avatar)
                            .width(32)
                            .height(32)
                            .url()}
                          alt={displayName || "Avatar"}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          {otherParticipant?.kind === "company" ? (
                            <Mail className="h-4 w-4" />
                          ) : (
                            <Mail className="h-4 w-4" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={cn(
                            "text-sm truncate",
                            isUnread ? "font-semibold" : "font-medium"
                          )}
                        >
                          {displayName}
                        </p>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-xs text-muted-foreground">
                            {formatTime(conversation.lastMessageAt)}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {conversation.lastMessagePreview || "لا توجد رسالة"}
                      </p>

                      {isUnread && (
                        <Badge
                          variant="secondary"
                          className="mt-1 text-xs px-1.5 py-0.5"
                        >
                          {userUnread.count} جديد
                        </Badge>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })
          )}
        </div>

        {conversations.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer justify-center"
              onSelect={handleViewAllClick}
            >
              <span className="text-sm font-medium">عرض كل الرسائل</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
