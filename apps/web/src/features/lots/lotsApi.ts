import { supabase } from "../../lib/supabase";
import type { Lot, LotStatus } from "./types";

export async function listLots() {
  const { data, error } = await supabase
    .from("lots")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Lot[];
}

export async function getLot(lotId: string) {
  const { data, error } = await supabase
    .from("lots")
    .select("*")
    .eq("id", lotId)
    .single();

  if (error) throw error;
  return data as Lot;
}

export async function updateLot(lotId: string, patch: Partial<Lot>) {
  const { data, error } = await supabase
    .from("lots")
    .update(patch)
    .eq("id", lotId)
    .select("*")
    .single();

  if (error) throw error;
  return data as Lot;
}

export type CreateLotInput = {
  title?: string;
  source_url?: string;
  asking_price_cents?: number;
  approx_total_books?: number;
  approx_sellable_books?: number;
  category_tags?: string[];
  est_net_per_book_cents?: number;
  zip?: string;
  radius_miles?: number;
  notes?: string;
};

export async function createLead(input: CreateLotInput) {
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  if (!user) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from("lots")
    .insert({
      user_id: user.id,
      status: "lead",
      source: "facebook",
      zip: input.zip ?? "75071",
      radius_miles: input.radius_miles ?? null,
      ...input,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as Lot;
}

export async function updateLotStatusWithEvent(
  lotId: string,
  fromStatus: LotStatus,
  toStatus: LotStatus,
) {
  // 1) update lot
  const { data, error } = await supabase
    .from("lots")
    .update({ status: toStatus })
    .eq("id", lotId)
    .select("*")
    .single();

  if (error) throw error;

  // 2) write timeline event (best effort)
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("lot_events").insert({
        lot_id: lotId,
        user_id: user.id,
        kind: "status_change",
        from_status: fromStatus,
        to_status: toStatus,
      });
    }
  } catch {
    // ignore
  }

  return data as Lot;
}
