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

export type CreateLotInput = {
  title?: string;
  source_url?: string;
  asking_price_cents?: number;
  approx_total_books?: number;
  approx_sellable_books?: number;
  category_tags?: string[];
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
      zip: "75071",
      ...input,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as Lot;
}

export async function updateLotStatus(lotId: string, status: LotStatus) {
  const { data, error } = await supabase
    .from("lots")
    .update({ status })
    .eq("id", lotId)
    .select("*")
    .single();

  if (error) throw error;
  return data as Lot;
}
