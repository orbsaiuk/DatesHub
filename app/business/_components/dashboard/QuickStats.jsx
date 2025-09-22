import StatCard from "./StatCard";

export default function QuickStats({ entity, entityType }) {
  const rating = Number(entity?.rating || 0);
  const ratingCount = Number(entity?.ratingCount || 0);
  const totalViews = Number(entity?.totalViews || 0);
  const messagesCount = Number(entity?.messagesCount || 0);


  const stats = [
    {
      title: "Total Views",
      value: totalViews,
      icon: "📊",
      gradientFrom: "blue-50",
      gradientTo: "blue-100",
      iconBgColor: "bg-blue-500/10",
      iconColor: "text-blue-600",
    },
    ...(entityType !== "company"
      ? []
      : [
          {
            title: "Average Rating",
            value: rating ? rating.toFixed(1) : "0.0",
            subtitle: `${ratingCount} reviews`,
            icon: "⭐",
            gradientFrom: "green-50",
            gradientTo: "green-100",
            iconBgColor: "bg-green-500/10",
            iconColor: "text-green-600",
          },
        ]),
    {
      title: "Messages",
      value: messagesCount,
      icon: "💬",
      gradientFrom: "orange-50",
      gradientTo: "orange-100",
      iconBgColor: "bg-orange-500/10",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div
      className={`grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:gap-6 ${
        entityType === "supplier" ? "lg:grid-cols-2" : "lg:grid-cols-3"
      }`}
    >
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}
