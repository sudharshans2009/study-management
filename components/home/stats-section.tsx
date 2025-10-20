const stats = [
  {
    value: "10M+",
    label: "Study Hours",
    description: "Tracked by our users",
  },
  {
    value: "50K+",
    label: "Active Students",
    description: "Learning every day",
  },
  {
    value: "95%",
    label: "Success Rate",
    description: "Meet their goals",
  },
  {
    value: "4.9/5",
    label: "User Rating",
    description: "From satisfied users",
  },
];

export function StatsSection() {
  return (
    <section className="py-20 border-y">
      <div className="container px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="font-semibold mb-1">{stat.label}</div>
              <div className="text-sm text-muted-foreground">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
