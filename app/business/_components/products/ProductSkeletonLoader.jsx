"use client";

export default function ProductSkeletonLoader({ type = "card", count = 3 }) {
    if (type === "table") {
        return (
            <>
                {Array.from({ length: count }).map((_, i) => (
                    <tr key={i} className="border-t">
                        <td className="px-4 py-3">
                            <div className="h-12 w-12 rounded bg-gray-200 animate-pulse" />
                        </td>
                        <td className="px-4 py-3">
                            <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
                        </td>
                        <td className="px-4 py-3">
                            <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
                        </td>
                        <td className="px-4 py-3">
                            <div className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
                        </td>
                        <td className="px-4 py-3">
                            <div className="h-8 w-8 rounded bg-gray-200 animate-pulse" />
                        </td>
                    </tr>
                ))}
            </>
        );
    }

    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-xl border bg-card p-4 shadow-sm animate-pulse"
                >
                    <div className="flex items-start gap-4">
                        <div className="h-16 w-16 rounded-lg bg-gray-200" />
                        <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                                <div className="h-4 w-32 rounded bg-gray-200" />
                                <div className="h-8 w-8 rounded bg-gray-200" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex gap-4">
                                    <div className="h-4 w-20 rounded bg-gray-200" />
                                    <div className="h-4 w-16 rounded bg-gray-200" />
                                </div>
                                <div className="h-6 w-16 rounded-full bg-gray-200" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}