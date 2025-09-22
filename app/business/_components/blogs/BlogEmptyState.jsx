"use client";
import { Button } from "@/components/ui/button";
import { FilePlus2 } from "lucide-react";

export default function BlogEmptyState({ query, onCreate, onClearQuery }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg">
      <div className="mb-3 text-muted-foreground">No blog posts found</div>
      <div className="flex gap-2">
        {query ? (
          <Button
            variant="outline"
            onClick={onClearQuery}
            className="cursor-pointer"
          >
            Clear search
          </Button>
        ) : (
          <Button onClick={onCreate} className="cursor-pointer">
            <FilePlus2 className="h-4 w-4 mr-2" /> Create your first post
          </Button>
        )}
      </div>
    </div>
  );
}
