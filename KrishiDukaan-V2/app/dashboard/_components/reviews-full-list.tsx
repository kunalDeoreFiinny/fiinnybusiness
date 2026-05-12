import { Star } from "lucide-react";
import type { ReviewItem } from "../_data/mock";

const extended: ReviewItem[] = [
  {
    id: "r4",
    author: "Suresh P.",
    rating: 3,
    excerpt: "Stock was okay; pricing slightly higher than nearby.",
    date: "2026-05-04",
    product: "DAP Fertilizer",
  },
  {
    id: "r5",
    author: "Meena R.",
    rating: 5,
    excerpt: "Excellent guidance on dosage for my cotton crop.",
    date: "2026-05-02",
    product: "Micronutrient Mix",
  },
];

type ReviewsFullListProps = {
  seed: ReviewItem[];
};

export function ReviewsFullList({ seed }: ReviewsFullListProps) {
  const all = [...seed, ...extended];

  return (
    <ul className="divide-y divide-outline-variant/25 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-ambient">
      {all.map((r) => (
        <li key={r.id} className="flex flex-col gap-2 p-4 md:flex-row md:items-start md:justify-between md:p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-on-surface">{r.author}</span>
              <span className="inline-flex items-center gap-0.5 text-harvest">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < r.rating ? "fill-current" : "opacity-25"}`}
                  />
                ))}
              </span>
            </div>
            <p className="mt-2 max-w-prose text-sm text-on-surface-variant">{r.excerpt}</p>
            <p className="mt-2 text-xs font-medium text-primary">{r.product}</p>
          </div>
          <span className="shrink-0 text-xs text-on-surface-variant md:text-sm">{r.date}</span>
        </li>
      ))}
    </ul>
  );
}
