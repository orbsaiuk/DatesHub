import Link from "next/link";
import { CheckCircle2, ArrowRight, Home } from "lucide-react";

export const metadata = {
  title: "Application Submitted - OrbsAI Business Network",
  description: "Your business registration request has been submitted successfully. Our team will review your application and notify you once it's approved. Thank you for joining OrbsAI.",
  keywords: ["application submitted", "business registration", "pending approval", "OrbsAI"],
  robots: { index: false, follow: false },
};
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function SuccessPage() {
  return (
    <div className="relative min-h-[70vh] flex items-center justify-center px-4">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 mx-auto h-64 w-[36rem] rounded-full bg-gradient-to-b from-emerald-200/60 to-transparent blur-3xl dark:from-emerald-400/10" />
      </div>

      <Card className="max-w-lg w-full text-center">
        <CardHeader>
          <div className="mx-auto mb-2 size-14 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="size-7" />
          </div>
          <CardTitle className="text-2xl">Request submitted</CardTitle>
          <CardDescription>
            Thanks for submitting your company details. Our team will review
            your request shortly. You’ll be notified once it’s approved or
            rejected.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground">
            You can continue exploring companies while we review your request.
          </p>
        </CardContent>

        <CardFooter className="justify-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="size-4" />
              Go to homepage
            </Link>
          </Button>
          <Button asChild>
            <Link href="/companies">
              Explore companies
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
