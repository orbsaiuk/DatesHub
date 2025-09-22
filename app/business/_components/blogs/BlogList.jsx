"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, Search, Filter, RefreshCw } from "lucide-react";
import BlogCard from "./BlogCard";

export default function BlogList({
  blogs = [],
  isLoading = false,
  onCreateNew,
  onEdit,
  onDelete,
  onSubmitForReview,
  onView,
  onRefresh,
  showCreateButton = true,
  title = "Blog Posts",
  emptyStateTitle = "No blog posts yet",
  emptyStateDescription = "Start sharing your expertise and company updates.",
}) {
  const [filteredBlogs, setFilteredBlogs] = useState(blogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    let filtered = [...blogs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (blog) =>
          blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((blog) => blog.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b._createdAt) - new Date(a._createdAt);
        case "oldest":
          return new Date(a._createdAt) - new Date(b._createdAt);
        case "title":
          return a.title.localeCompare(b.title);
        case "status":
          return a.status.localeCompare(b.status);
        case "views":
          return (b.views || 0) - (a.views || 0);
        default:
          return new Date(b._createdAt) - new Date(a._createdAt);
      }
    });

    setFilteredBlogs(filtered);
  }, [blogs, searchTerm, statusFilter, sortBy]);

  const getStatusCounts = () => {
    const counts = {
      all: blogs.length,
      pending: 0,
      published: 0,
      rejected: 0,
    };

    blogs.forEach((blog) => {
      if (counts.hasOwnProperty(blog.status)) {
        counts[blog.status]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your blog posts and share your expertise
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {onRefresh && (
            <Button
              variant="outline"
              onClick={onRefresh}
              disabled={isLoading}
              className="min-h-[44px] px-4 py-2 w-full sm:w-auto justify-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
          {showCreateButton && onCreateNew && (
            <Button
              onClick={onCreateNew}
              className="min-h-[44px] px-4 py-2 w-full sm:w-auto justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      {blogs.length > 0 && (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="text-lg sm:text-2xl font-bold">
                {statusCounts.all}
              </div>
              <p className="text-xs text-muted-foreground">Total Posts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="text-lg sm:text-2xl font-bold text-yellow-600">
                {statusCounts.pending}
              </div>
              <p className="text-xs text-muted-foreground">Pending Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="text-lg sm:text-2xl font-bold text-green-600">
                {statusCounts.published}
              </div>
              <p className="text-xs text-muted-foreground">Published</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="text-lg sm:text-2xl font-bold text-red-600">
                {statusCounts.rejected}
              </div>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      {blogs.length > 0 && (
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Search */}
              <div className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 min-h-[44px]"
                  />
                </div>
              </div>

              {/* Filters Row */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] min-h-[44px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Status ({statusCounts.all})
                    </SelectItem>
                    <SelectItem value="pending">
                      Pending ({statusCounts.pending})
                    </SelectItem>
                    <SelectItem value="published">
                      Published ({statusCounts.published})
                    </SelectItem>
                    <SelectItem value="rejected">
                      Rejected ({statusCounts.rejected})
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[180px] min-h-[44px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="title">Title A-Z</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="views">Most Views</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blog Grid */}
      {filteredBlogs.length > 0 ? (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBlogs.map((blog) => (
            <BlogCard
              key={blog._id}
              blog={blog}
              onEdit={onEdit}
              onDelete={onDelete}
              onSubmitForReview={onSubmitForReview}
              onView={onView}
            />
          ))}
        </div>
      ) : blogs.length === 0 ? (
        /* Empty State - No blogs at all */
        <div className="text-center py-12">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📝</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">{emptyStateTitle}</h3>
          <p className="text-muted-foreground mb-4">{emptyStateDescription}</p>
          {showCreateButton && onCreateNew && (
            <Button onClick={onCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Post
            </Button>
          )}
        </div>
      ) : (
        /* Empty State - No results from filters */
        <div className="text-center py-12">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No posts found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filter criteria.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setSortBy("newest");
            }}
            className="min-h-[44px] px-4 py-2"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
