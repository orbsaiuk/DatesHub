"use client";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import ConversationCard from "./ConversationCard";
import EmptyState from "./EmptyState";

export default function MessagesList({
  filteredConversations,
  currentPage,
  pageSize,
  pageCount,
  totalItems,
  user,
  searchQuery,
  activeFilter,
  onConversationClick,
  formatTime,
  getOtherParticipant,
  goToPage,
  getPageNumbers,
}) {
  // Get current page conversations
  const currentConversations = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredConversations.slice(startIndex, startIndex + pageSize);
  }, [filteredConversations, currentPage, pageSize]);

  if (filteredConversations.length === 0) {
    return <EmptyState searchQuery={searchQuery} activeFilter={activeFilter} />;
  }

  return (
    <div className="space-y-4">
      {/* Results summary - hide secondary info on mobile */}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center text-sm text-muted-foreground">
        <span className="order-2 sm:order-1">
          عرض {Math.min((currentPage - 1) * pageSize + 1, totalItems)} -{" "}
          {Math.min(currentPage * pageSize, totalItems)} من {totalItems} محادثة
        </span>
        {pageCount > 1 && (
          <span className="order-1 sm:order-2 text-xs sm:text-sm">
            صفحة {currentPage} من {pageCount}
          </span>
        )}
      </div>

      {/* Conversations List */}
      <div className="space-y-2 sm:space-y-3">
        {currentConversations.map((conversation) => (
          <ConversationCard
            key={conversation._id}
            conversation={conversation}
            user={user}
            onConversationClick={onConversationClick}
            formatTime={formatTime}
            getOtherParticipant={getOtherParticipant}
          />
        ))}
      </div>

      {/* Pagination - responsive */}
      {pageCount > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination className="mx-auto">
            <PaginationContent className="flex-wrap gap-1">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => goToPage(currentPage - 1)}
                  className={cn(
                    "min-h-[44px] px-3 sm:px-4",
                    currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                  )}
                />
              </PaginationItem>

              {getPageNumbers().map((page, index) => (
                <PaginationItem key={index}>
                  {page === "ellipsis-left" || page === "ellipsis-right" ? (
                    <PaginationEllipsis className="min-h-[44px]" />
                  ) : (
                    <PaginationLink
                      onClick={() => goToPage(page)}
                      isActive={currentPage === page}
                      className="min-h-[44px] px-3 sm:px-4"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => goToPage(currentPage + 1)}
                  className={cn(
                    "min-h-[44px] px-3 sm:px-4",
                    currentPage >= pageCount
                      ? "pointer-events-none opacity-50"
                      : ""
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
