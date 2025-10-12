export default function DirectoryHero({ title, subtitle }) {
  return (
    <section className="w-full bg-gray-100 py-10 sm:py-14 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="order-2 lg:order-1">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              {title}
            </h1>
            <h2 className="text-lg font-bold tracking-tight leading-tight mt-6">
              {subtitle}
            </h2>
          </div>
          <div className="order-1 lg:order-2">
            <div className="aspect-[1/1] w-full sm:aspect-[16/9] sm:w-3/4 mx-auto rounded-xl bg-gray-200" />
          </div>
        </div>
      </div>
    </section>
  );
}
