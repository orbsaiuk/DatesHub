"use client";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  SearchAndFilters,
  MessagesList,
  LoadingSkeleton,
} from "@/app/business/_components/messages";

export default function BusinessMessagesPageClient({ tenantType, tenantId }) {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Number of conversations per page
  const listTopRef = useRef(null);
  const previousPageRef = useRef(null);

  // Load conversations
  const loadConversations = async () => {
    if (!isSignedIn) return;

    setLoading(true);
    try {
      // Load more conversations to support pagination
      const response = await fetch(
        `/api/messaging/business/conversations?tenantType=${tenantType}&tenantId=${tenantId}&limit=200`
      );
      const data = await response.json();

      if (data.ok) {
        setConversations(data.items || []);
      } else {
        setError(data.error || "Failed to load conversations");
      }
    } catch (err) {
      setError("Failed to load conversations");
      console.error("Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [isSignedIn, tenantType, tenantId]);

  // Listen for unread count updates and refresh conversations
  useEffect(() => {
    const handleUnreadCountUpdate = () => {
      if (isSignedIn) {
        loadConversations();
      }
    };

    // Listen for custom unread count update events
    window.addEventListener("unreadCountUpdate", handleUnreadCountUpdate);

    return () => {
      window.removeEventListener("unreadCountUpdate", handleUnreadCountUpdate);
    };
  }, [isSignedIn]);

  // Filter conversations based on search and filter
  useEffect(() => {
    let filtered = [...conversations];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((conv) => {
        const otherParticipant = getOtherParticipant(conv);
        const participantName =
          otherParticipant?.displayName?.toLowerCase() ||
          otherParticipant?.name?.toLowerCase() ||
          "";
        const lastMessageText = conv.lastMessagePreview?.toLowerCase() || "";
        return (
          participantName.includes(query) || lastMessageText.includes(query)
        );
      });
    }

    // Apply status filter
    if (activeFilter !== "all") {
      filtered = filtered.filter((conv) => {
        const businessUnread = conv.unread?.find(
          (u) => u.participantKey === `${tenantType}:${tenantId}`
        );
        const isUnread = businessUnread?.count > 0;

        // Only support 'unread' filter; otherwise show all
        if (activeFilter === "unread") return isUnread;
        return true;
      });
    }

    setFilteredConversations(filtered);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [conversations, searchQuery, activeFilter, user?.id]);

  // Calculate pagination values
  const totalItems = filteredConversations.length;
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));

  // Reset current page if it exceeds total pages
  useEffect(() => {
    if (currentPage > pageCount) {
      setCurrentPage(pageCount);
    }
  }, [pageCount, currentPage]);

  // Smooth scroll to top when page changes
  useEffect(() => {
    if (previousPageRef.current == null) {
      previousPageRef.current = currentPage;
      return;
    }

    if (previousPageRef.current === currentPage) {
      return;
    }

    if (typeof window === "undefined") return;

    const headerEl = document.querySelector("header");
    const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 0;
    const extraSpacing = 100;

    if (listTopRef.current) {
      const targetTop =
        listTopRef.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: Math.max(0, targetTop - headerHeight - extraSpacing),
        behavior: "smooth",
      });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    previousPageRef.current = currentPage;
  }, [currentPage]);

  const getOtherParticipant = (conversation) => {
    const participants = conversation.participants || [];
    return participants.find((p) => p.kind !== tenantType);
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
          year:
            date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
        });
      }
    } catch (error) {
      return "";
    }
  };

  const handleConversationClick = (conversationId) => {
    router.push(`/business/${tenantType}/messages/${conversationId}`);
  };

  const getFilterCounts = () => {
    const unreadCount = conversations.filter((conv) => {
      const businessUnread = conv.unread?.find(
        (u) => u.participantKey === `${tenantType}:${tenantId}`
      );
      return businessUnread?.count > 0;
    }).length;

    return { unreadCount };
  };

  // Pagination functions
  const goToPage = (pageNumber) => {
    const next = Math.min(Math.max(1, pageNumber), pageCount);
    setCurrentPage(next);
  };

  const getPageNumbers = () => {
    const pages = [];
    if (pageCount <= 5) {
      for (let i = 1; i <= pageCount; i += 1) pages.push(i);
      return pages;
    }

    const showLeftEllipsis = currentPage > 3;
    const showRightEllipsis = currentPage < pageCount - 2;

    pages.push(1);
    if (showLeftEllipsis) pages.push("ellipsis-left");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(pageCount - 1, currentPage + 1);
    for (let i = start; i <= end; i += 1) pages.push(i);

    if (showRightEllipsis) pages.push("ellipsis-right");
    if (pageCount > 1) pages.push(pageCount);
    return pages;
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground mb-4">فشل في تحميل الرسائل</p>
          <Button onClick={loadConversations} variant="outline">
            حاول مرة أخرى
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { unreadCount } = getFilterCounts();

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <SearchAndFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        filteredConversations={filteredConversations}
        unreadCount={unreadCount}
      />

      {/* Messages List */}
      <div ref={listTopRef}>
        <MessagesList
          filteredConversations={filteredConversations}
          currentPage={currentPage}
          pageSize={pageSize}
          pageCount={pageCount}
          totalItems={totalItems}
          user={user}
          searchQuery={searchQuery}
          activeFilter={activeFilter}
          onConversationClick={handleConversationClick}
          formatTime={formatTime}
          getOtherParticipant={getOtherParticipant}
          goToPage={goToPage}
          getPageNumbers={getPageNumbers}
          tenantType={tenantType}
          tenantId={tenantId}
        />
      </div>
    </div>
  );
}
