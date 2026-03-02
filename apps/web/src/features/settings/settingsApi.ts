import { supabase } from "../../lib/supabase";

export type UserSettings = {
  user_id: string;
  zip: string;
  radius_miles: number | null;
  profit_floor_cents: number;
  profit_percent_of_buy: number;
  net_per_book_presets: Record<string, number>;
  created_at: string;
  updated_at: string;
};

const DEFAULTS = {
  zip: "75071",
  radius_miles: 25,
  profit_floor_cents: 1000,
  profit_percent_of_buy: 0.25,
  net_per_book_presets: {
    kids: 300,
    mixed: 400,
    manga: 600,
    textbooks: 800,
  },
};

export async function getOrCreateSettings(): Promise<UserSettings> {
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  if (!user) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  if (data) return data as UserSettings;

  const { data: created, error: insErr } = await supabase
    .from("user_settings")
    .insert({ user_id: user.id, ...DEFAULTS })
    .select("*")
    .single();

  if (insErr) throw insErr;
  return created as UserSettings;
}

export async function updateSettings(patch: Partial<UserSettings>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from("user_settings")
    .update(patch)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) throw error;
  return data as UserSettings;
}
