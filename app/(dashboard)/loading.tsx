export default function DashboardLoading() {
  return (
    <div className="space-y-8" data-testid="dashboard-loading">
      <div className="section-rule pb-6">
        <div className="route-skeleton-dark h-4 w-40 rounded-full" />
        <div className="mt-4 route-skeleton-dark h-14 w-full max-w-2xl rounded-[1.5rem]" />
        <div className="mt-4 route-skeleton-dark h-5 w-full max-w-3xl rounded-full" />
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="paper-panel route-skeleton h-40 rounded-[1.7rem]" />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="paper-panel route-skeleton h-[24rem] rounded-[1.7rem]" />
        <div className="space-y-6">
          <div className="paper-panel route-skeleton h-48 rounded-[1.7rem]" />
          <div className="paper-panel route-skeleton h-56 rounded-[1.7rem]" />
        </div>
      </section>
    </div>
  );
}
