import Link from "next/link";
import { CheckCircle2, ArrowLeft, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { notFound } from "next/navigation";
import { checkTenantRequestExists } from "@/services/sanity/tenantRequest";

export async function generateMetadata({ searchParams }) {
  // Get the id from searchParams
  const { id } = await searchParams;

  // Check if the request exists
  if (id) {
    try {
      const request = await checkTenantRequestExists(id);
      if (!request) {
        return {
          title: "الصفحة غير موجودة - شبكة OrbsAI التجارية",
          description: "عذرًا، لم نتمكن من العثور على الطلب المحدد.",
          robots: { index: false, follow: false },
        };
      }
    } catch (error) {
      return {
        title: "الصفحة غير موجودة - شبكة OrbsAI التجارية",
        description: "حدث خطأ أثناء البحث عن الطلب.",
        robots: { index: false, follow: false },
      };
    }
  }

  // Return success page metadata
  return {
    title: "تم إرسال الطلب - شبكة OrbsAI التجارية",
    description:
      "تم إرسال طلب تسجيل عملك التجاري بنجاح. سيقوم فريقنا بمراجعة طلبك وإخطارك عند الموافقة عليه. شكراً لانضمامك إلى OrbsAI.",
    keywords: [
      "تم إرسال الطلب",
      "تسجيل الأعمال",
      "في انتظار الموافقة",
      "OrbsAI",
    ],
    robots: { index: false, follow: false },
  };
}

export default async function SuccessPage({ searchParams }) {
  const { id } = await searchParams;
  const request = await checkTenantRequestExists(id);
  // Check if id exists before making the query
  if (!id || !request) {
    return notFound();
  }
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
          <CardTitle className="text-2xl">تم إرسال الطلب</CardTitle>
          <CardDescription>
            شكرًا لتقديم بيانات شركتك. سيقوم فريقنا بمراجعة طلبك قريبًا، وسيتم
            إخطارك عند الموافقة أو الرفض.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground">
            يمكنك متابعة استكشاف الشركات بينما نقوم بمراجعة طلبك.
          </p>
        </CardContent>

        <CardFooter className="justify-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="size-4" />
              الانتقال للصفحة الرئيسية
            </Link>
          </Button>
          <Button asChild>
            <Link href="/companies">
              استكشاف الشركات
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
