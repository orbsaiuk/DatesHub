import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

export default function JoinSection() {
  return (
    <section className="w-full bg-white py-12 sm:py-16 md:py-20 [&_img]:max-w-full [&_img]:h-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-tight text-black mb-3 sm:mb-4">
        الانضمام إلى OrbsAI سريع وسهل
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-black leading-relaxed mb-2">
            كل يوم، نصل بين المستخدمين والشركات والموردين ضمن شبكة موثوقة واحدة.
          </p>
          <p className="text-base sm:text-lg md:text-xl text-black font-medium leading-relaxed">
            من أنت؟
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch">
          {/* User Card */}
          <Card className="border border-black rounded-xl p-4 sm:p-6 h-full flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl sm:text-2xl font-bold text-black leading-snug">
                أنا مستخدم
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-black leading-relaxed">
                تبحث عن خدمات موثوقة؟ استكشف الشركات ومقدمي الخدمات التي تناسب احتياجاتك.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-black ml-3 mt-0.5 flex-shrink-0" />
                  <span className="text-black text-sm sm:text-base leading-relaxed">
            اكتشف الشركات الموثوقة في مكان واحد
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-black ml-3 mt-0.5 flex-shrink-0" />
                  <span className="text-black text-sm sm:text-base leading-relaxed">
            قارن الخيارات والتقييمات بسهولة
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-black ml-3 mt-0.5 flex-shrink-0" />
                  <span className="text-black text-sm sm:text-base leading-relaxed">
                    احجز أو تواصل خلال بضع نقرات فقط
                  </span>
                </li>
              </ul>
              <div className="pt-4 mt-auto">
                <Button
                  size="lg"
                  className="w-full min-h-[44px] py-3 sm:py-4 text-base sm:text-lg bg-gray-800 hover:bg-gray-700 text-white rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                  asChild
                >
                  <Link href="/sign-up" aria-label="انضم إلى OrbsAI كمستخدم">
            انضم الآن
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Business Card */}
          <Card className="border border-black rounded-xl p-4 sm:p-6 h-full flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl sm:text-2xl font-bold text-black leading-snug">
                أنا شركة
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-black leading-relaxed">
                هل تريد النمو والوصول إلى المزيد من العملاء؟ تواصل مع المستخدمين والموردين عبر منصتنا.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-black ml-3 mt-0.5 flex-shrink-0" />
                  <span className="text-black text-sm sm:text-base leading-relaxed">
            تواصل مع مستخدمين يبحثون عن خدماتك
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-black ml-3 mt-0.5 flex-shrink-0" />
                  <span className="text-black text-sm sm:text-base leading-relaxed">
                    ابنِ شراكات مع موردين موثوقين
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-black ml-3 mt-0.5 flex-shrink-0" />
                  <span className="text-black text-sm sm:text-base leading-relaxed">
            إدارة ملفك واستعراض أعمالك
                  </span>
                </li>
              </ul>
              <div className="pt-4 mt-auto">
                <Button
                  size="lg"
                  className="w-full min-h-[44px] py-3 sm:py-4 text-base sm:text-lg bg-gray-800 hover:bg-gray-700 text-white rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                  asChild
                >
                  <Link href="/become" aria-label="انضم إلى OrbsAI كشركة">
            انضم كشركة
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
