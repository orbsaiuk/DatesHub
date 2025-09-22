"use client";

import { Button } from "@/components/ui/button";

export default function EventRequestActions({ onCancel, isLoading, isValid }) {
  return (
    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isLoading}
        className="w-full sm:w-auto cursor-pointer"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={!isValid || isLoading}
        className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white cursor-pointer"
      >
        {isLoading ? "Submitting..." : "Submit"}
      </Button>
    </div>
  );
}
