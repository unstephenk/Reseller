export type LotStatus =
  | "lead"
  | "bought"
  | "sorted"
  | "listed"
  | "sold"
  | "shipped"
  | "done";

export type Lot = {
  id: string;
  user_id: string;
  status: LotStatus;
  source: string;
  source_url: string | null;
  title: string | null;
  asking_price_cents: number | null;
  purchase_price_cents: number | null;
  approx_total_books: number | null;
  approx_sellable_books: number | null;
  category_tags: string[];
  zip: string;
  radius_miles: number | null;
  est_net_per_book_cents: number | null;
  target_profit_cents: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};
