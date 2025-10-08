"use client";

import { Button } from "@/components/ui/button";

export default function OrderRequestActions({
    onCancel,
    isLoading,
    isValid,
    errors,
}) {
    const hasErrors = errors && Object.keys(errors).length > 0;

    return (
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="w-full sm:w-auto cursor-pointer"
            >
                الغاء
            </Button>
            <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white cursor-pointer disabled:opacity-50"
            >
                {isLoading ? "جارٍ التسليم..." : "تسليم"}
            </Button>
        </div>
    );
}
