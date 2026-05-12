import type { Metadata } from "next";
import {
  callsOverTime,
  directionRequests,
  insightCards,
  searchAppearance,
  viewsOverTime,
} from "../_data/mock";
import { PageHeader } from "../_components/page-header";
import { MetricTile } from "../_components/metric-tile";
import { SimpleBarChart } from "../_components/simple-bar-chart";
import { InsightCard } from "../_components/insight-card";

export const metadata: Metadata = {
  title: "Analytics",
};

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Analytics"
        description="Search visibility, engagement, and directional demand for your shop."
      />

      <section aria-label="Search appearance" className="grid gap-3 md:grid-cols-3">
        <MetricTile
          label="Impressions"
          value={searchAppearance.impressions}
          hint="Mock search & maps surfaces"
        />
        <MetricTile label="CTR" value={searchAppearance.ctr} hint="Click-through rate" />
        <MetricTile
          label="Avg. position"
          value={searchAppearance.avgPosition}
          hint="Lower is better"
        />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SimpleBarChart
          title="Views over time"
          subtitle="Last 7 days · profile & product views"
          data={viewsOverTime}
          accentClass="bg-primary"
        />
        <SimpleBarChart
          title="Calls made"
          subtitle="Tap-to-call from your listing"
          data={callsOverTime}
          accentClass="bg-secondary"
        />
      </div>

      <div className="mt-6">
        <SimpleBarChart
          title="Direction requests"
          subtitle="Turn-by-turn opens from maps"
          data={directionRequests}
          accentClass="bg-harvest"
        />
      </div>

      <section aria-label="Insights" className="mt-6">
        <h2 className="text-lg font-semibold text-on-surface">Insights</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Plain-language takeaways from your mock metrics
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {insightCards.map((i) => (
            <InsightCard key={i.id} title={i.title} body={i.body} />
          ))}
        </div>
      </section>
    </>
  );
}
