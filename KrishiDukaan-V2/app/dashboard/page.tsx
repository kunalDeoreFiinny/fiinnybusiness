import {
  dashboardStats,
  recentReviews,
} from "./_data/mock";
import { PageHeader } from "./_components/page-header";
import { StatCard } from "./_components/stat-card";
import { QuickActions } from "./_components/quick-actions";
import { RecentReviews } from "./_components/recent-reviews";
import { DashboardInventoryHealth } from "./_components/dashboard-inventory-health";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Overview"
        description="Performance snapshot for your storefront and operations."
      />

      <section aria-label="Key metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((m) => (
          <StatCard key={m.id} metric={m} />
        ))}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <DashboardInventoryHealth />
        <QuickActions />
      </div>

      <div className="mt-6">
        <RecentReviews reviews={recentReviews} />
      </div>
    </>
  );
}
