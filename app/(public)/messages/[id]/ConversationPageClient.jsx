"use client";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ConversationSkeleton,
  ConversationHeader,
  MessageComposer,
  MessageGroup,
  EmptyMessagesState,
} from "./_components";

export default function ConversationPageClient({ conversationId }) {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Load conversation and messages
  const loadConversation = async () => {
    if (!isSignedIn) return;

    setLoading(true);
    try {
      // Load categories first
      const categoriesResponse = await fetch("/api/categories");
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData || []);
      }

      // Load conversation details
      const conversationResponse = await fetch(
        `/api/messaging/user/conversations`
      );
      const conversationData = await conversationResponse.json();

      if (conversationData.ok) {
        const conv = conversationData.items?.find(
          (item) => item._id === conversationId
        );
        if (conv) {
          setConversation(conv);
          // Mark conversation as read
          await markAsRead();
        } else {
          setError("Conversation not found");
          return;
        }
      }

      // Load messages
      const messagesResponse = await fetch(
        `/api/messaging/conversations/${conversationId}/messages?limit=100`
      );
      const messagesData = await messagesResponse.json();

      if (messagesData.ok) {
        // Messages come newest first from API, reverse for chronological order
        setMessages((messagesData.items || []).reverse());
      } else {
        setError(messagesData.error || "Failed to load messages");
      }
    } catch (err) {
      setError("Failed to load conversation");
      console.error("Failed to load conversation:", err);
    } finally {
      setLoading(false);
    }
  };

  // Mark conversation as read
  const markAsRead = async () => {
    try {
      await fetch(`/api/messaging/conversations/${conversationId}/read`, {
        method: "POST",
      });

      // Dispatch event to update inbox count
      window.dispatchEvent(new CustomEvent("unreadCountUpdate"));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  // Send a message (email-style, no optimistic UI)
  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const messageText = newMessage.trim();

    try {
      const response = await fetch(
        `/api/messaging/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: messageText, messageType: "text" }),
        }
      );
      const data = await response.json();
      if (data.ok) {
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");

        // Dispatch event to update inbox count
        window.dispatchEvent(new CustomEvent("unreadCountUpdate"));
      } else {
        setError(data.error || "Failed to send message");
      }
    } catch (error) {
      setError("Failed to send message");
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  // Email-style view: no auto-scroll; user scrolls like a feed

  useEffect(() => {
    loadConversation();
  }, [conversationId, isSignedIn]);

  // Email-style: no Enter-to-send behavior; users click the Send button

  const getOtherParticipant = (conversation) => {
    if (!conversation) return null;
    const participants = conversation.participants || [];
    return participants.find((p) => p.kind !== "user");
  };

  const getCategoryName = (categoryId) => {
    if (!categoryId || !categories.length) return categoryId;
    const category = categories.find((cat) => cat._id === categoryId);
    return category ? category.title : categoryId;
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};

    messages.forEach((message) => {
      const date = new Date(message.createdAt);
      const dateKey = date.toDateString();

      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: message.createdAt,
          messages: [],
        };
      }

      groups[dateKey].messages.push(message);
    });

    // Sort groups by date (oldest first)
    return Object.values(groups).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  };

  const formatMessageTime = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "";
    }
  };

  if (loading) {
    return <ConversationSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 sm:p-8 text-center">
          <p className="text-muted-foreground mb-4 text-sm sm:text-base">
            {error}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:space-x-2 sm:gap-0 justify-center">
            <Button
              onClick={() => router.push("/messages")}
              variant="outline"
              className="min-h-[44px] w-full sm:w-auto"
            >
              Back to Messages
            </Button>
            <Button
              onClick={loadConversation}
              className="min-h-[44px] w-full sm:w-auto"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const otherParticipant = getOtherParticipant(conversation);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <ConversationHeader
        otherParticipant={otherParticipant}
        onBackClick={() => router.push("/messages")}
      />

      {/* Messages - mobile optimized height */}
      <Card
        className="flex flex-col py-0"
        style={{
          height: "calc(100vh - 200px)",
          minHeight: "400px",
          maxHeight: "600px",
        }}
      >
        <CardContent className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 sm:space-y-4">
          {messages.length === 0 ? (
            <EmptyMessagesState />
          ) : (
            groupMessagesByDate(messages).map((group, groupIndex) => (
              <MessageGroup
                key={group.date}
                messages={group.messages}
                date={group.date}
                otherDisplayName={
                  otherParticipant?.displayName ||
                  otherParticipant?.name ||
                  "Unknown"
                }
                formatMessageTime={formatMessageTime}
                getCategoryName={getCategoryName}
                user={user}
                allMessages={messages}
                currentGroupIndex={groupIndex}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </CardContent>
        {/* Email-style reply composer */}
        <MessageComposer
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sending={sending}
          onSendMessage={sendMessage}
          textareaRef={textareaRef}
        />
      </Card>
    </div>
  );
}
