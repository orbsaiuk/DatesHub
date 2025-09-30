"use client";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SearchAndFilters({
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  filteredConversations,
  unreadCount,
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="البحت في الرسائل..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 sm:h-10 text-base sm:text-sm"
        />
      </div>

      {/* Filter tabs - full width on mobile */}
      <Tabs
        value={activeFilter}
        onValueChange={setActiveFilter}
        className="w-full sm:w-auto"
      >
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-2">
            الكل
            <Badge variant="secondary" className="text-xs ml-1">
              {filteredConversations.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="unread"
            className="flex items-center justify-center gap-2 text-sm sm:text-sm px-3 sm:px-4 py-2 min-h-[44px] sm:min-h-0"
          >
            غير مقروءة
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs ml-1">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
