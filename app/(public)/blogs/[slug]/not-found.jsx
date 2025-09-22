import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h2 className="text-2xl font-semibold mb-2">Blog not found</h2>
      <p className="text-muted-foreground mb-6">
        The blog post you're looking for doesn't exist or may have been removed.
      </p>
      <Link href="/" className="text-primary underline">
        Go back home
      </Link>
    </div>
  );
}
