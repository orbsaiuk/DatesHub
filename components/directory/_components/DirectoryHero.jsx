export default function DirectoryHero({ title, subtitle }) {
  return (
    <section className="w-full bg-gray-100 py-10 sm:py-14 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="order-2 lg:order-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              {title || "اعثر على المثالية"}
              <br className="hidden sm:block" />
              {subtitle || "لخدمة فعاليتك"}
            </h1>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground">
              تصفح وتواصل مع مقدمي الخدمات عبر الفئات المختلفة.
            </p>
          </div>
          <div className="order-1 lg:order-2">
            <div className="aspect-[4/3] w-full rounded-xl bg-gray-200" />
          </div>
        </div>
      </div>
    </section>
  );
}
