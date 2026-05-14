import Link from "next/link";
import { Star } from "lucide-react";
import type { ReviewItem } from "../_data/mock";

type RecentReviewsProps = {
  reviews: ReviewItem[];
};

export function RecentReviews({ reviews }: RecentReviewsProps) {
  return (
    <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-ambient md:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-on-surface">Recent reviews</h2>
          <p className="mt-1 text-sm text-on-surface-variant">Latest shopper feedback</p>
        </div>
        <Link
          href="/dashboard/reviews"
          className="text-sm font-medium text-primary hover:underline"
        >
          View all
        </Link>
      </div>
      <ul className="mt-4 divide-y divide-outline-variant/25">
        {reviews.map((r) => (
          <li key={r.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-on-surface">{r.author}</span>
              <span className="inline-flex items-center gap-0.5 text-harvest">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < r.rating ? "fill-current" : "opacity-25"}`}
                  />
                ))}
              </span>
              <span className="text-xs text-on-surface-variant">{r.date}</span>
            </div>
            <p className="text-sm text-on-surface-variant line-clamp-2">{r.excerpt}</p>
            <p className="text-xs font-medium text-primary/90">{r.product}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
